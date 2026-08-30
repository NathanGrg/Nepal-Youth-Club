const mongoose = require('mongoose');

const matchReportSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  highlights: {
    type: String,
    default: null
  },
  keyPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  bestPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  featuredImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});
