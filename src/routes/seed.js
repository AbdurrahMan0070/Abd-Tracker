const router = require('express').Router();
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const DEGREE_SUBJECTS = {
  CS: ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Web Technology', 'Mathematics', 'English'],
  BAF: ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation', 'Business Law', 'Economics', 'Mathematics', 'English'],
  BCOM: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Commerce', 'Business Law'],
  BMS: ['Management Principles', 'Marketing', 'Finance', 'Human Resources', 'Business Communication', 'Economics', 'English'],
  BCA: ['Programming in C', 'Data Structures', 'Database', 'Web Development', 'Mathematics', 'English', 'Networking'],
  OTHER: ['Subject 1', 'Subject 2', 'Subject 3'],
};

const JUNIOR_SUBJECTS = {
  SCIENCE: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Hindi', 'Computer Science', 'Physical Education', 'EVS'],
  COMMERCE: ['Accounts', 'Economics', 'Business Studies', 'Mathematics', 'English', 'Hindi', 'IT', 'Physical Education'],
  ARTS: ['History', 'Geography', 'Political Science', 'Sociology', 'English', 'Hindi', 'Psychology', 'Physical Education'],
};

// GET /api/seed - Seeds the database (one-time use)
router.get('/', async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');

    // Check if already seeded
    const existingCollege = await prisma.college.findFirst();
    if (existingCollege) {
      return res.json({
        success: true,
        message: '✅ Database already seeded!',
        note: 'Admin: 9999999999/admin123, Teacher: 8888888888/teacher123',
      });
    }

    // Create college
    const college = await prisma.college.create({
      data: { name: 'Royal College' },
    });
    console.log('✅ College created');

    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        phone: '9999999999',
        email: 'admin@campussync.com',
        name: 'Admin',
        passwordHash: adminHash,
        role: 'ADMIN',
        collegeId: college.id,
      },
    });
    console.log('✅ Admin created');

    // Create teacher
    const teacherHash = await bcrypt.hash('teacher123', 10);
    const teacherUser = await prisma.user.create({
      data: {
        phone: '8888888888',
        email: 'teacher@campussync.com',
        name: 'Demo Teacher',
        passwordHash: teacherHash,
        role: 'TEACHER',
        collegeId: college.id,
      },
    });

    await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        name: 'Demo Teacher',
      },
    });
    console.log('✅ Teacher created');

    // Create degree classes with subjects
    const degreeStreams = ['CS', 'BAF', 'BCOM', 'BMS', 'BCA'];
    const degreeYears = ['FY', 'SY', 'TY'];
    const semMap = { FY: ['SEM1', 'SEM2'], SY: ['SEM3', 'SEM4'], TY: ['SEM5', 'SEM6'] };

    for (const stream of degreeStreams) {
      for (const year of degreeYears) {
        for (const sem of semMap[year]) {
          const cls = await prisma.class.create({
            data: {
              collegeId: college.id,
              studentType: 'DEGREE',
              degreeYear: year,
              degreeStream: stream,
              semester: sem,
              division: 'A',
            },
          });

          const subjects = DEGREE_SUBJECTS[stream] || DEGREE_SUBJECTS.OTHER;
          for (const subName of subjects) {
            await prisma.subject.create({
              data: { classId: cls.id, name: subName },
            });
          }
        }
      }
    }

    // Create junior classes
    const juniorStds = ['STD_11', 'STD_12'];
    const juniorStreams = ['SCIENCE', 'COMMERCE', 'ARTS'];

    for (const std of juniorStds) {
      for (const stream of juniorStreams) {
        const cls = await prisma.class.create({
          data: {
            collegeId: college.id,
            studentType: 'JUNIOR',
            juniorStd: std,
            juniorStream: stream,
            division: 'A',
          },
        });

        const subjects = JUNIOR_SUBJECTS[stream] || [];
        for (const subName of subjects) {
          await prisma.subject.create({
            data: { classId: cls.id, name: subName },
          });
        }
      }
    }

    console.log('✅ Classes and subjects seeded');

    return res.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      accounts: {
        admin: { phone: '9999999999', password: 'admin123' },
        teacher: { phone: '8888888888', password: 'teacher123' },
      },
      note: 'You can now register students and use all features!',
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: err.message,
    });
  }
});

module.exports = router;
