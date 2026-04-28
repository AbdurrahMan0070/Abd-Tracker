const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/timetable/me — student's timetable
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { rollNo: req.user.rollNo },
      select: { classId: true },
    });

    const timetable = await prisma.timetable.findMany({
      where: { classId: student.classId },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });

    // Group by day
    const grouped = {};
    for (const entry of timetable) {
      if (!grouped[entry.day]) grouped[entry.day] = [];
      grouped[entry.day].push({
        id: entry.id,
        subject: entry.subject.name,
        subjectCode: entry.subject.code,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    }

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/timetable — admin/teacher adds entry
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { classId, subjectId, day, startTime, endTime } = req.body;
    if (!classId || !subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const entry = await prisma.timetable.create({
      data: { classId, subjectId, day, startTime, endTime },
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.timetable.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
