const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/student/me — profile
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { rollNo: req.user.rollNo },
      include: {
        class: { include: { college: true } },
        user: { select: { email: true, phone: true } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/subjects — subjects for student's class
router.get('/subjects', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { rollNo: req.user.rollNo },
      select: { classId: true },
    });
    const subjects = await prisma.subject.findMany({
      where: { classId: student.classId },
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
