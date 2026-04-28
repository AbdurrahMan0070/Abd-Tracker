const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      rollNo, name, phone, email, password,
      collegeName,
      studentType,
      juniorStd, juniorStream,
      degreeYear, degreeStream, semester,
      division,
    } = req.body;

    // Validate required fields
    if (!rollNo || !name || !phone || !password || !collegeName || !studentType || !division) {
      return res.status(400).json({ error: 'Missing required fields: rollNo, name, phone, password, collegeName, studentType, division' });
    }

    if (studentType === 'JUNIOR' && (!juniorStd || !juniorStream)) {
      return res.status(400).json({ error: 'Junior students must provide juniorStd and juniorStream' });
    }

    if (studentType === 'DEGREE' && (!degreeYear || !degreeStream || !semester)) {
      return res.status(400).json({ error: 'Degree students must provide degreeYear, degreeStream, and semester' });
    }

    // Check duplicates first (before any DB writes)
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) return res.status(409).json({ error: 'Phone number already registered' });

    // Check if email is already registered (if provided)
    if (email && email.trim()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existingEmail) return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if roll number is already taken
    const existingStudent = await prisma.student.findUnique({ where: { rollNo } });
    if (existingStudent) return res.status(409).json({ error: 'Roll number already registered' });

    // Upsert college
    const college = await prisma.college.upsert({
      where: { name: collegeName },
      update: {},
      create: { name: collegeName },
    });

    // Build class filter
    const classFilter = {
      collegeId: college.id,
      studentType,
      division,
    };

    if (studentType === 'JUNIOR') {
      classFilter.juniorStd = juniorStd;
      classFilter.juniorStream = juniorStream;
    } else {
      classFilter.degreeYear = degreeYear;
      classFilter.degreeStream = degreeStream;
      classFilter.semester = semester;
    }

    // Find or create class
    let cls = await prisma.class.findFirst({ where: classFilter });
    if (!cls) {
      cls = await prisma.class.create({ data: classFilter });
    }

    // Hash password and create user + student atomically
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        email: (email && email.trim()) ? email.trim() : null,
        passwordHash,
        role: 'STUDENT',
        collegeId: college.id,
        student: {
          create: {
            rollNo,
            name,
            classId: cls.id,
          },
        },
      },
      include: { student: true },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, rollNo: user.student.rollNo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: user.id, name, rollNo, role: user.role },
    });
  } catch (err) {
    console.error('Registration error:', err);
    // Send back the actual error message so we can debug
    return res.status(500).json({
      error: 'Registration failed',
      detail: err.message,
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { rollNo, phone, password } = req.body;

    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (!rollNo && !phone) return res.status(400).json({ error: 'Roll number or phone is required' });

    let user;
    if (rollNo) {
      const student = await prisma.student.findUnique({
        where: { rollNo },
        include: { user: true },
      });
      user = student?.user;
    } else {
      user = await prisma.user.findUnique({ where: { phone } });
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const [student, teacher] = await Promise.all([
      prisma.student.findUnique({ where: { userId: user.id } }),
      prisma.teacher.findUnique({ where: { userId: user.id } }),
    ]);

    const token = jwt.sign(
      { userId: user.id, role: user.role, rollNo: student?.rollNo, teacherId: teacher?.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: student?.name || teacher?.name || user.name || 'Admin',
        rollNo: student?.rollNo,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// POST /api/auth/teacher-register
router.post('/teacher-register', async (req, res) => {
  try {
    const { name, phone, email, password, collegeName, teacherCode } = req.body;
    if (!name || !phone || !password || !collegeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate teacher code
    const validCode = process.env.TEACHER_CODE || 'TEACH2024';
    if (!teacherCode || teacherCode.trim() !== validCode) {
      return res.status(403).json({ error: 'Invalid teacher code. Contact your admin.' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'Phone already registered' });

    // Check if email is already registered (if provided)
    if (email && email.trim()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existingEmail) return res.status(409).json({ error: 'Email already registered' });
    }

    const college = await prisma.college.upsert({
      where: { name: collegeName },
      update: {},
      create: { name: collegeName },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone, 
        email: (email && email.trim()) ? email.trim() : null, 
        passwordHash,
        name,
        role: 'TEACHER', 
        collegeId: college.id,
        teacher: { create: { name } },
      },
      include: { teacher: true },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, teacherId: user.teacher.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user: { id: user.id, name, role: user.role } });
  } catch (err) {
    console.error('Teacher register error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/admin-register
router.post('/admin-register', async (req, res) => {
  try {
    const { name, phone, email, password, collegeName, adminCode } = req.body;
    if (!name || !phone || !password || !collegeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate admin code
    const validCode = process.env.ADMIN_CODE || 'ADMIN2024';
    if (!adminCode || adminCode.trim() !== validCode) {
      return res.status(403).json({ error: 'Invalid admin code. Contact your system administrator.' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'Phone already registered' });

    // Check if email is already registered (if provided)
    if (email && email.trim()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (existingEmail) return res.status(409).json({ error: 'Email already registered' });
    }

    const college = await prisma.college.upsert({
      where: { name: collegeName },
      update: {},
      create: { name: collegeName },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone, 
        email: (email && email.trim()) ? email.trim() : null, 
        passwordHash,
        name,
        role: 'ADMIN', 
        collegeId: college.id,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user: { id: user.id, name, role: user.role } });
  } catch (err) {
    console.error('Admin register error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
