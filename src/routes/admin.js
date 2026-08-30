const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Match = require('../models/Match');          // ← Ensure file is named Match.js
const MatchReport = require('../models/MatchReport');
const Player = require('../models/Player');
const PlayerOfTheMonth = require('../models/PlayerOfTheMonth');

// -------- Middleware: verify JWT token --------
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // optional: attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// =============================================
// 1. MATCH REPORTS CRUD
// =============================================

// GET all match reports (with populated fields)
router.get('/match-reports', requireAuth, async (req, res) => {
  try {
    const reports = await MatchReport.find()
      .populate('match')
      .populate('bestPlayer')
      .populate('keyPlayers')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new match report
router.post('/match-reports', requireAuth, async (req, res) => {
  try {
    const report = new MatchReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE a match report
router.put('/match-reports/:id', requireAuth, async (req, res) => {
  try {
    const report = await MatchReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a match report
router.delete('/match-reports/:id', requireAuth, async (req, res) => {
  try {
    const report = await MatchReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Match report deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// 2. PLAYER OF THE MONTH CRUD
// =============================================

// GET all POTM (populated)
router.get('/player-of-the-month', requireAuth, async (req, res) => {
  try {
    const potm = await PlayerOfTheMonth.find()
      .populate('player')
      .sort({ year: -1, month: -1 });
    res.json(potm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new POTM
router.post('/player-of-the-month', requireAuth, async (req, res) => {
  try {
    const potm = new PlayerOfTheMonth(req.body);
    await potm.save();
    res.status(201).json(potm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE a POTM
router.put('/player-of-the-month/:id', requireAuth, async (req, res) => {
  try {
    const potm = await PlayerOfTheMonth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!potm) return res.status(404).json({ error: 'POTM not found' });
    res.json(potm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a POTM
router.delete('/player-of-the-month/:id', requireAuth, async (req, res) => {
  try {
    const potm = await PlayerOfTheMonth.findByIdAndDelete(req.params.id);
    if (!potm) return res.status(404).json({ error: 'POTM not found' });
    res.json({ message: 'Player of the Month deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// 3. HELPER ENDPOINTS (for dropdowns)
// =============================================

// GET all matches (for selecting in admin forms)
router.get('/matches', requireAuth, async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all players (for selecting best player / key players)
router.get('/players', requireAuth, async (req, res) => {
  try {
    const players = await Player.find().sort({ name: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;