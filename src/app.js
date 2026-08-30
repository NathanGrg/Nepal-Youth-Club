require('dotenv').config();
const dns = require('dns');
// Use Cloudflare DNS as fallback for SRV lookups
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ---- Import routes ----
const eventsRouter = require('./routes/event');
const playersRouter = require('./routes/players');
const trialRequestsRouter = require('./routes/trialRequests');
const authRouter = require('./routes/auth');

// ---- NEW: Match Reports & Player of the Month ----
const matchReportsRouter = require('./routes/matchReports');
const potmRouter = require('./routes/playerOfTheMonth');

// ---- NEW: Admin routes (optional, but recommended) ----
const adminRouter = require('./routes/admin'); // we'll create this

const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- API routes ----
app.use('/api/events', eventsRouter);
app.use('/api/players', playersRouter);
app.use('/api/trial-requests', trialRequestsRouter);
app.use('/api/auth', authRouter);

// ---- NEW: Match Reports and POTM API routes ----
app.use('/api/match-reports', matchReportsRouter);
app.use('/api/player-of-the-month', potmRouter);

// ---- NEW: Admin API (for CRUD operations) ----
app.use('/api/admin', adminRouter);

// ---- Fallback for client-side routing ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));