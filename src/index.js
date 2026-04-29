require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/api/events', require('./routes/events'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/seed', require('./routes/seed'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Abd Tracker' }));
app.get('/', (_req, res) => res.json({ status: 'ok', message: 'Abd Tracker API is running' }));

// Export for Vercel
module.exports = app;

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Abd Tracker API running on port ${PORT}`));
