const express = require('express');
const router = express.Router();
const MatchReport = require('../models/MatchReport');
const Match = require('../models/Match');
const Player = require('../models/Player');
router.get('/', async (req, res) => {
  try {
    const reports = await MatchReport.find()
      .populate('match')
      .populate('bestPlayer')
      .populate('keyPlayers')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching match reports:', error);
    res.status(500).json({ 
      error: 'Could not load match reports',
      details: error.message 
    });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const report = await MatchReport.findById(req.params.id)
      .populate('match')
      .populate('bestPlayer')
      .populate('keyPlayers');

    if (!report) {
      return res.status(404).json({ error: 'Match report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching match report:', error);
    res.status(500).json({ 
      error: 'Could not load match report',
      details: error.message 
    });
  }
});

module.exports = router;