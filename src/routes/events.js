const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/events — all events (any logged-in user)
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
      include: {
        creator: {
          select: { role: true, student: { select: { name: true } }, teacher: { select: { name: true } } },
        },
      },
    });

    const result = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      venue: e.venue,
      eventDate: e.eventDate,
      startTime: e.startTime,
      endTime: e.endTime,
      organizer: e.organizer,
      organizerRole: e.organizerRole,
      whatsappLink: e.whatsappLink,
      createdAt: e.createdAt,
      isPast: new Date(e.eventDate) < new Date(),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events — create event (any logged-in user)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, venue, eventDate, startTime, endTime, organizer, whatsappLink } = req.body;

    if (!title || !venue || !eventDate || !startTime || !organizer) {
      return res.status(400).json({ error: 'title, venue, eventDate, startTime, organizer are required' });
    }

    // Get college from user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { collegeId: true, role: true },
    });

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        venue: venue.trim(),
        eventDate: new Date(eventDate),
        startTime,
        endTime: endTime || null,
        organizer: organizer.trim(),
        organizerRole: user.role,
        collegeId: user.collegeId || null,
        createdBy: req.user.userId,
        whatsappLink: whatsappLink?.trim() || null,
      },
    });

    // Notify all students about the new event
    try {
      const students = await prisma.student.findMany({ select: { rollNo: true } });
      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map((s) => ({
            studentRollNo: s.rollNo,
            message: `📅 New Event: "${title}" on ${new Date(eventDate).toLocaleDateString('en-IN')} at ${venue}`,
            type: 'event',
          })),
          skipDuplicates: true,
        });
      }
    } catch (_) {
      // notifications are non-critical
    }

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id — creator or admin can delete
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.createdBy !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await prisma.event.delete({ where: { id: event.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
