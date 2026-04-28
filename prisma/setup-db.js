/**
 * Creates all tables directly via the Prisma adapter (bypasses migration engine)
 * Run this instead of `prisma db push` when using PGlite
 */
const prisma = require('../src/lib/prisma');

async function setupDb() {
  console.log('🔧 Setting up database tables...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Create enums
    const enums = [
      `DO $$ BEGIN CREATE TYPE "StudentType" AS ENUM ('JUNIOR', 'DEGREE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "JuniorStd" AS ENUM ('STD_11', 'STD_12'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "JuniorStream" AS ENUM ('SCIENCE', 'COMMERCE', 'ARTS'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "DegreeYear" AS ENUM ('FY', 'SY', 'TY'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "DegreeStream" AS ENUM ('CS', 'BAF', 'BCOM', 'BMS', 'BCA', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "Semester" AS ENUM ('SEM1', 'SEM2', 'SEM3', 'SEM4', 'SEM5', 'SEM6'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "Division" AS ENUM ('A', 'B', 'C', 'D'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    ];

    for (const sql of enums) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ Enums created');

    // Create tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS "College" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Class" (
        "id" SERIAL PRIMARY KEY,
        "collegeId" INTEGER NOT NULL,
        "studentType" "StudentType" NOT NULL,
        "juniorStd" "JuniorStd",
        "juniorStream" "JuniorStream",
        "degreeYear" "DegreeYear",
        "degreeStream" "DegreeStream",
        "semester" "Semester",
        "division" "Division" NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Subject" (
        "id" SERIAL PRIMARY KEY,
        "classId" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT UNIQUE,
        "phone" TEXT UNIQUE NOT NULL,
        "name" TEXT,
        "passwordHash" TEXT NOT NULL,
        "role" "Role" DEFAULT 'STUDENT',
        "collegeId" INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Student" (
        "rollNo" TEXT PRIMARY KEY,
        "userId" INTEGER UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "classId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Teacher" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" SERIAL PRIMARY KEY,
        "studentRollNo" TEXT NOT NULL,
        "subjectId" INTEGER NOT NULL,
        "attended" INTEGER DEFAULT 0,
        "total" INTEGER DEFAULT 0,
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("studentRollNo", "subjectId")
      )`,
      `CREATE TABLE IF NOT EXISTS "Assignment" (
        "id" SERIAL PRIMARY KEY,
        "classId" INTEGER NOT NULL,
        "subjectId" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "deadline" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "StudentAssignment" (
        "id" SERIAL PRIMARY KEY,
        "studentRollNo" TEXT NOT NULL,
        "assignmentId" INTEGER NOT NULL,
        "status" "AssignmentStatus" DEFAULT 'PENDING',
        "completedAt" TIMESTAMP,
        UNIQUE("studentRollNo", "assignmentId")
      )`,
      `CREATE TABLE IF NOT EXISTS "Timetable" (
        "id" SERIAL PRIMARY KEY,
        "classId" INTEGER NOT NULL,
        "subjectId" INTEGER NOT NULL,
        "day" "Day" NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS "Notification" (
        "id" SERIAL PRIMARY KEY,
        "studentRollNo" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "read" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS "Event" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "venue" TEXT NOT NULL,
        "eventDate" TIMESTAMP NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT,
        "organizer" TEXT NOT NULL,
        "organizerRole" TEXT DEFAULT 'STUDENT',
        "collegeId" INTEGER,
        "createdBy" INTEGER NOT NULL,
        "whatsappLink" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
    ];

    for (const sql of tables) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ Tables created');

    // Add name column to User if missing (migration for existing DBs)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT`
    ).catch(() => {});

    // Add foreign keys (ignore if already exist)
    const fks = [
      `ALTER TABLE "Class" ADD CONSTRAINT IF NOT EXISTS "Class_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id")`,
      `ALTER TABLE "Subject" ADD CONSTRAINT IF NOT EXISTS "Subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id")`,
      `ALTER TABLE "User" ADD CONSTRAINT IF NOT EXISTS "User_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id")`,
      `ALTER TABLE "Student" ADD CONSTRAINT IF NOT EXISTS "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")`,
      `ALTER TABLE "Student" ADD CONSTRAINT IF NOT EXISTS "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id")`,
      `ALTER TABLE "Teacher" ADD CONSTRAINT IF NOT EXISTS "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")`,
      `ALTER TABLE "Attendance" ADD CONSTRAINT IF NOT EXISTS "Attendance_studentRollNo_fkey" FOREIGN KEY ("studentRollNo") REFERENCES "Student"("rollNo")`,
      `ALTER TABLE "Attendance" ADD CONSTRAINT IF NOT EXISTS "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")`,
      `ALTER TABLE "Assignment" ADD CONSTRAINT IF NOT EXISTS "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id")`,
      `ALTER TABLE "Assignment" ADD CONSTRAINT IF NOT EXISTS "Assignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")`,
      `ALTER TABLE "StudentAssignment" ADD CONSTRAINT IF NOT EXISTS "StudentAssignment_studentRollNo_fkey" FOREIGN KEY ("studentRollNo") REFERENCES "Student"("rollNo")`,
      `ALTER TABLE "StudentAssignment" ADD CONSTRAINT IF NOT EXISTS "StudentAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id")`,
      `ALTER TABLE "Timetable" ADD CONSTRAINT IF NOT EXISTS "Timetable_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id")`,
      `ALTER TABLE "Timetable" ADD CONSTRAINT IF NOT EXISTS "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")`,
      `ALTER TABLE "Notification" ADD CONSTRAINT IF NOT EXISTS "Notification_studentRollNo_fkey" FOREIGN KEY ("studentRollNo") REFERENCES "Student"("rollNo")`,
      `ALTER TABLE "Event" ADD CONSTRAINT IF NOT EXISTS "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id")`,
      `ALTER TABLE "Event" ADD CONSTRAINT IF NOT EXISTS "Event_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id")`,
    ];

    for (const sql of fks) {
      await prisma.$executeRawUnsafe(sql).catch(() => {}); // ignore if already exists
    }
    console.log('✅ Foreign keys added');

    console.log('\n🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDb();
