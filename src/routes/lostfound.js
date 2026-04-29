const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/lostfound - Get all active lost & found items
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, category, search } = req.query;
    
    const where = {
      collegeId: req.user.collegeId,
      status: 'ACTIVE',
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.lostAndFound.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(items);
  } catch (err) {
    console.error('Get lost & found error:', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/lostfound/my-posts - Get user's posts
router.get('/my-posts', authenticate, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const items = await prisma.lostAndFound.findMany({
      where: { studentRollNo: student.rollNo },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(items);
  } catch (err) {
    console.error('Get my posts error:', err);
    return res.status(500).json({ error: 'Failed to fetch your posts' });
  }
});

// POST /api/lostfound - Create new lost/found post
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, itemName, description, category, location, date, imageUrl } = req.body;

    if (!type || !itemName || !description || !category || !location || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { class: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Build class info string
    let classInfo = '';
    if (student.class.studentType === 'JUNIOR') {
      classInfo = `${student.class.juniorStd?.replace('STD_', '')}th ${student.class.juniorStream} ${student.class.division}`;
    } else {
      classInfo = `${student.class.degreeYear} ${student.class.degreeStream} ${student.class.division}`;
    }

    const item = await prisma.lostAndFound.create({
      data: {
        type,
        itemName,
        description,
        category,
        location,
        date: new Date(date),
        studentRollNo: student.rollNo,
        studentName: student.name,
        phone: req.user.phone,
        classInfo,
        imageUrl: imageUrl || null,
        collegeId: req.user.collegeId,
      },
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error('Create lost & found error:', err);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/lostfound/:id/resolve - Mark item as resolved
router.put('/:id/resolve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const item = await prisma.lostAndFound.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.studentRollNo !== student.rollNo) {
      return res.status(403).json({ error: 'You can only resolve your own posts' });
    }

    const updated = await prisma.lostAndFound.update({
      where: { id: parseInt(id) },
      data: { status: 'RESOLVED' },
    });

    return res.json(updated);
  } catch (err) {
    console.error('Resolve item error:', err);
    return res.status(500).json({ error: 'Failed to resolve item' });
  }
});

// DELETE /api/lostfound/:id - Delete post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const item = await prisma.lostAndFound.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.studentRollNo !== student.rollNo && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await prisma.lostAndFound.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
