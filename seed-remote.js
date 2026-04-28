// Run this to seed your Render database from your local computer
// Usage: node seed-remote.js YOUR_RENDER_DATABASE_URL

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const databaseUrl = process.argv[2];

if (!databaseUrl) {
  console.error('❌ Please provide database URL as argument');
  console.log('Usage: node seed-remote.js "postgresql://user:pass@host/db"');
  process.exit(1);
}

const adapter = new PrismaPg(databaseUrl);
const prisma = new PrismaClient({ adapter });

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
  console.log('🌱 Seeding remote database...');

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
    update: {},
    create: {
      phone: '9999999999',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
      collegeId: college.id,
    },
  });
  console.log('✅ Admin created: phone=9999999999, password=admin123');

  // Create teacher user
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const teacherUser = await prisma.user.upsert({
    where: { phone: '8888888888' },
    update: {},
    create: {
      phone: '8888888888',
      passwordHash: teacherHash,
      name: 'Demo Teacher',
      role: 'TEACHER',
      collegeId: college.id,
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      name: 'Demo Teacher',
    },
  });
  console.log('✅ Teacher created: phone=8888888888, password=teacher123');

  // Create classes and subjects
  const degreeYears = ['FY', 'SY', 'TY'];
  const degreeStreams = Object.keys(DEGREE_SUBJECTS);
  const semesters = ['SEM1', 'SEM2', 'SEM3', 'SEM4', 'SEM5', 'SEM6'];
  const divisions = ['A', 'B'];

  for (const year of degreeYears) {
    for (const stream of degreeStreams) {
      for (const division of divisions) {
        const semester = year === 'FY' ? 'SEM1' : year === 'SY' ? 'SEM3' : 'SEM5';
        
        const cls = await prisma.class.upsert({
          where: {
            collegeId_studentType_degreeYear_degreeStream_semester_division: {
              collegeId: college.id,
              studentType: 'DEGREE',
              degreeYear: year,
              degreeStream: stream,
              semester: semester,
              division: division,
            },
          },
          update: {},
          create: {
            collegeId: college.id,
            studentType: 'DEGREE',
            degreeYear: year,
            degreeStream: stream,
            semester: semester,
            division: division,
          },
        });

        // Add subjects
        for (const subjectName of DEGREE_SUBJECTS[stream]) {
          await prisma.subject.upsert({
            where: {
              classId_name: {
                classId: cls.id,
                name: subjectName,
              },
            },
            update: {},
            create: {
              classId: cls.id,
              name: subjectName,
              code: `${stream}${year}${subjectName.substring(0, 3).toUpperCase()}`,
            },
          });
        }
      }
    }
  }

  console.log('✅ Classes and subjects seeded');
  console.log('\n🎉 Seed complete!');
  console.log('Admin login: phone=9999999999, password=admin123');
  console.log('Teacher login: phone=8888888888, password=teacher123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
