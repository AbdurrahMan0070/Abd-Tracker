const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/health/db - Check database status
router.get('/db', async (req, res) => {
  try {
    // Try to query the database
    const collegeCount = await prisma.college.count();
    const userCount = await prisma.user.count();
    const classCount = await prisma.class.count();
    
    // Check if LostAndFound table exists
    let lostFoundExists = false;
    try {
      await prisma.lostAndFound.count();
      lostFoundExists = true;
    } catch (e) {
      lostFoundExists = false;
    }

    return res.json({
      status: 'ok',
      database: 'connected',
      migrations: {
        basic_tables: true,
        lost_found_table: lostFoundExists,
      },
      data: {
        colleges: collegeCount,
        users: userCount,
        classes: classCount,
      },
      message: collegeCount === 0 
        ? '⚠️ Database is empty! Visit /api/seed to seed it.'
        : '✅ Database is ready!',
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      database: 'error',
      error: err.message,
      hint: 'Migrations may not have run. Check build logs on Render.',
    });
  }
});

module.exports = router;
