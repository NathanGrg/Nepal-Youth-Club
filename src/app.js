require('dotenv').config();
const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const eventsRouter = require('./routes/event');
const playersRouter = require('./routes/players');
const trialRequestsRouter = require('./routes/trialRequests');
const authRouter = require('./routes/auth');
const matchReportsRouter = require('./routes/matchReports');
const potmRouter = require('./routes/playerOfTheMonth');
const adminRouter = require('./routes/admin');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/events', eventsRouter);
app.use('/api/players', playersRouter);
app.use('/api/trial-requests', trialRequestsRouter);
app.use('/api/auth', authRouter);
app.use('/api/match-reports', matchReportsRouter);
app.use('/api/player-of-the-month', potmRouter);
app.use('/api/admin', adminRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));