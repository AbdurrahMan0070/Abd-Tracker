const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { buildPrediction } = require('../utils/attendance');

// GET /api/admin/stats — dashboard overview
router.get('/stats', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count();
    const totalColleges = await prisma.college.count();

    const allAttendance = await prisma.attendance.findMany();
    const totalAttended = allAttendance.reduce((s, a) => s + a.attended, 0);
    const totalClasses = allAttendance.reduce((s, a) => s + a.total, 0);
    const avgPercent = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;

    // Risk distribution
    const studentRisks = await prisma.student.findMany({
      include: { attendance: true },
    });

    let safe = 0, warning = 0, danger = 0;
    for (const s of studentRisks) {
      const att = s.attendance.reduce((sum, a) => sum + a.attended, 0);
      const tot = s.attendance.reduce((sum, a) => sum + a.total, 0);
      const p = tot > 0 ? (att / tot) * 100 : 0;
      if (p >= 80) safe++;
      else if (p >= 75) warning++;
      else danger++;
    }

    res.json({
      totalStudents, totalTeachers, totalColleges,
      avgAttendance: parseFloat(avgPercent),
      riskDistribution: { safe, warning, danger },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/students — list all students with filters
router.get('/students', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { search, classId, stream, collegeId } = req.query;
    const where = {};
    if (search) where.OR = [
      { rollNo: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
    if (classId) where.classId = parseInt(classId);

    const students = await prisma.student.findMany({
      where,
      include: {
        class: { include: { college: true } },
        attendance: true,
      },
      orderBy: { name: 'asc' },
    });

    const result = students.map((s) => {
      const att = s.attendance.reduce((sum, a) => sum + a.attended, 0);
      const tot = s.attendance.reduce((sum, a) => sum + a.total, 0);
      return {
        rollNo: s.rollNo,
        name: s.name,
        class: s.class,
        overall: buildPrediction(att, tot),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/classes
router.get('/classes', authenticate, requireRole('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        college: true,
        subjects: true,
        _count: { select: { students: true } },
      },
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subjects — add subject to class
router.post('/subjects', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { classId, name, code } = req.body;
    if (!classId || !name) return res.status(400).json({ error: 'classId and name required' });
    const subject = await prisma.subject.create({ data: { classId, name, code } });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/subjects/:id
router.delete('/subjects/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/colleges
router.get('/colleges', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: { _count: { select: { classes: true, users: true } } },
    });
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/make-admin — promote user to admin
router.post('/make-admin', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
