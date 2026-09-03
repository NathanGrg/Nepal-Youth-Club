const mongoose = require('mongoose');

const playerOfTheMonthSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  achievement: {
    type: String,
    default: null
  },
  stats: {
    type: String,
    default: null
  },
  quote: {
    type: String,
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
playerOfTheMonthSchema.index({ month: 1, year: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('PlayerOfTheMonth', playerOfTheMonthSchema);