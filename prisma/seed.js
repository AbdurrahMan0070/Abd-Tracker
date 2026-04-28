require('dotenv').config();
const prisma = require('../src/lib/prisma');
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

async function main() {
  console.log('🌱 Seeding database...');

  // Create college
  const college = await prisma.college.upsert({
    where: { name: 'Royal College' },
    update: {},
    create: { name: 'Royal College' },
  });

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: { name: 'Admin', passwordHash: adminHash },
    create: {
      phone: '9999999999',
      email: 'admin@campussync.com',
      name: 'Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      collegeId: college.id,
    },
  });
  console.log('✅ Admin created: phone=9999999999, password=admin123');

  // Create teacher
  const teacherHash = await bcrypt.hash('teacher123', 10);
  await prisma.user.upsert({
    where: { phone: '8888888888' },
    update: { name: 'Demo Teacher' },
    create: {
      phone: '8888888888',
      email: 'teacher@campussync.com',
      name: 'Demo Teacher',
      passwordHash: teacherHash,
      role: 'TEACHER',
      collegeId: college.id,
      teacher: { create: { name: 'Demo Teacher' } },
    },
  });
  console.log('✅ Teacher created: phone=8888888888, password=teacher123');

  // Create degree classes with subjects
  const degreeStreams = ['CS', 'BAF', 'BCOM', 'BMS', 'BCA'];
  const degreeYears = ['FY', 'SY', 'TY'];
  const semMap = { FY: ['SEM1', 'SEM2'], SY: ['SEM3', 'SEM4'], TY: ['SEM5', 'SEM6'] };

  for (const stream of degreeStreams) {
    for (const year of degreeYears) {
      for (const sem of semMap[year]) {
        const cls = await prisma.class.upsert({
          where: { id: (await prisma.class.findFirst({
            where: { collegeId: college.id, studentType: 'DEGREE', degreeYear: year, degreeStream: stream, semester: sem, division: 'A' }
          }))?.id || 0 },
          update: {},
          create: {
            collegeId: college.id, studentType: 'DEGREE',
            degreeYear: year, degreeStream: stream, semester: sem, division: 'A',
          },
        }).catch(() => prisma.class.create({
          data: { collegeId: college.id, studentType: 'DEGREE', degreeYear: year, degreeStream: stream, semester: sem, division: 'A' },
        }));

        const subjects = DEGREE_SUBJECTS[stream] || DEGREE_SUBJECTS.OTHER;
        for (const subName of subjects) {
          await prisma.subject.upsert({
            where: { id: (await prisma.subject.findFirst({ where: { classId: cls.id, name: subName } }))?.id || 0 },
            update: {},
            create: { classId: cls.id, name: subName },
          }).catch(() => {});
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
        data: { collegeId: college.id, studentType: 'JUNIOR', juniorStd: std, juniorStream: stream, division: 'A' },
      }).catch(() => null);

      if (cls) {
        const subjects = JUNIOR_SUBJECTS[stream] || [];
        for (const subName of subjects) {
          await prisma.subject.create({ data: { classId: cls.id, name: subName } }).catch(() => {});
        }
      }
    }
  }

  console.log('✅ Classes and subjects seeded');
  console.log('\n🎉 Seed complete!');
  console.log('Admin login: phone=9999999999, password=admin123');
  console.log('Teacher login: phone=8888888888, password=teacher123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
