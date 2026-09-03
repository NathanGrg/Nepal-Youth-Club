const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  opponent: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  homeTeam: { type: String, default: 'Nepal Youth Club' },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING'
  },
  matchType: { type: String, default: 'League' },
  isHomeMatch: { type: Boolean, default: true }
}, { timestamps: true });

matchSchema.virtual('result').get(function() {
  if (this.status === 'COMPLETED' && this.homeScore !== null && this.awayScore !== null) {
    if (this.homeScore > this.awayScore) return 'Win';
    if (this.homeScore < this.awayScore) return 'Loss';
    return 'Draw';
  }
  return 'N/A';
});

matchSchema.virtual('resultBadge').get(function() {
  const r = this.result;
  if (r === 'Win') return 'win';
  if (r === 'Loss') return 'loss';
  if (r === 'Draw') return 'draw';
  return 'upcoming';
});

matchSchema.set('toJSON', { virtuals: true });
matchSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Match', matchSchema);