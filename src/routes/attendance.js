const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { buildPrediction, calcPercent } = require('../utils/attendance');

// GET /api/attendance/me — student's full attendance dashboard
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentRollNo: req.user.rollNo },
      include: { subject: true },
    });

    const subjects = records.map((r) => ({
      subjectId: r.subjectId,
      subjectName: r.subject.name,
      subjectCode: r.subject.code,
      ...buildPrediction(r.attended, r.total),
    }));

    const totalAttended = records.reduce((s, r) => s + r.attended, 0);
    const totalClasses = records.reduce((s, r) => s + r.total, 0);
    const overall = buildPrediction(totalAttended, totalClasses);

    res.json({ overall, subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/simulate/:subjectId?action=attend|miss
router.get('/simulate/:subjectId', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const record = await prisma.attendance.findUnique({
      where: {
        studentRollNo_subjectId: {
          studentRollNo: req.user.rollNo,
          subjectId: parseInt(req.params.subjectId),
        },
      },
    });
    if (!record) return res.status(404).json({ error: 'No attendance record found' });

    const { action } = req.query;
    const { attended, total } = record;

    if (action === 'attend') {
      const newPercent = calcPercent(attended + 1, total + 1);
      return res.json({ action: 'attend', newPercent, attended: attended + 1, total: total + 1 });
    } else if (action === 'miss') {
      const newPercent = calcPercent(attended, total + 1);
      return res.json({ action: 'miss', newPercent, attended, total: total + 1 });
    }

    res.status(400).json({ error: 'action must be attend or miss' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/mark — teacher marks attendance
router.post('/mark', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { subjectId, records } = req.body;
    // records: [{ rollNo, attended: true/false }]

    const updates = await Promise.all(
      records.map(({ rollNo, attended }) =>
        prisma.attendance.upsert({
          where: { studentRollNo_subjectId: { studentRollNo: rollNo, subjectId } },
          update: {
            total: { increment: 1 },
            attended: attended ? { increment: 1 } : undefined,
          },
          create: {
            studentRollNo: rollNo,
            subjectId,
            total: 1,
            attended: attended ? 1 : 0,
          },
        })
      )
    );

    res.json({ marked: updates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/class/:classId — teacher views class attendance
router.get('/class/:classId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        attendance: { include: { subject: true } },
      },
    });

    const result = students.map((s) => {
      const totalAttended = s.attendance.reduce((sum, a) => sum + a.attended, 0);
      const totalClasses = s.attendance.reduce((sum, a) => sum + a.total, 0);
      return {
        rollNo: s.rollNo,
        name: s.name,
        overall: buildPrediction(totalAttended, totalClasses),
        subjects: s.attendance.map((a) => ({
          subjectId: a.subjectId,
          subjectName: a.subject.name,
          ...buildPrediction(a.attended, a.total),
        })),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
