const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/notifications/me
router.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { studentRollNo: req.user.rollNo },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    const n = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true },
    });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, requireRole('STUDENT'), async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { studentRollNo: req.user.rollNo, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
