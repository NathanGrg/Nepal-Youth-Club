const express = require('express');
const TrialRequest = require('../models/TrialRequest');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// POST /api/trial-requests — public, this is what the recruit form submits to
router.post('/', async (req, res) => {
  try {
    await TrialRequest.create(req.body);
    res.status(201).json({ message: "Thanks — we'll be in touch." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/trial-requests — admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const requests = await TrialRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;