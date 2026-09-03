const express = require('express');
const router = express.Router();
const PlayerOfTheMonth = require('../models/PlayerOfTheMonth');
router.get('/', async (req, res) => {
  try {
    const currentPOTM = await PlayerOfTheMonth.findOne({ isFeatured: true })
      .populate('player')
      .sort({ year: -1, month: -1 });

    const pastPOTM = await PlayerOfTheMonth.find({ isFeatured: false })
      .populate('player')
      .sort({ year: -1, month: -1 })
      .limit(6);

    res.render('player_of_the_month', { 
      currentPOTM,
      pastPOTM,
      title: 'Player of the Month'
    });
  } catch (error) {
    console.error('Error fetching player of the month:', error);
    res.status(500).render('error', { 
      message: 'Could not load player of the month',
      error
    });
  }
});

module.exports = router;