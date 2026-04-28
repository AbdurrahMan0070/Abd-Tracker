const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/assignments/me — student's assignments
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { rollNo: req.user.rollNo },
      select: { classId: true },
    });

    const assignments = await prisma.assignment.findMany({
      where: { classId: student.classId },
      include: {
        subject: { select: { name: true } },
        studentAssignments: {
          where: { studentRollNo: req.user.rollNo },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    const now = new Date();
    const result = assignments.map((a) => {
      const sa = a.studentAssignments[0];
      let status = sa?.status || 'PENDING';
      if (status === 'PENDING' && new Date(a.deadline) < now) status = 'OVERDUE';
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject.name,
        deadline: a.deadline,
        status,
        completedAt: sa?.completedAt || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/assignments/:id/complete — student marks complete
router.patch('/:id/complete', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const sa = await prisma.studentAssignment.upsert({
      where: {
        studentRollNo_assignmentId: {
          studentRollNo: req.user.rollNo,
          assignmentId,
        },
      },
      update: { status: 'COMPLETED', completedAt: new Date() },
      create: {
        studentRollNo: req.user.rollNo,
        assignmentId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    res.json(sa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments — teacher/admin creates assignment
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { classId, subjectId, title, description, deadline } = req.body;
    if (!classId || !subjectId || !title || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assignment = await prisma.assignment.create({
      data: { classId, subjectId, title, description, deadline: new Date(deadline) },
    });

    // Create pending records for all students in class
    const students = await prisma.student.findMany({ where: { classId } });
    await prisma.studentAssignment.createMany({
      data: students.map((s) => ({
        studentRollNo: s.rollNo,
        assignmentId: assignment.id,
        status: 'PENDING',
      })),
      skipDuplicates: true,
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assignments/class/:classId — teacher views class assignments
router.get('/class/:classId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { classId: parseInt(req.params.classId) },
      include: {
        subject: { select: { name: true } },
        studentAssignments: true,
      },
      orderBy: { deadline: 'asc' },
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
