const express = require('express');
const Player = require('../models/Player');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: 1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});
router.post('/', requireAdmin, async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;