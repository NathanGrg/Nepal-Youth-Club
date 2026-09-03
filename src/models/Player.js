const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      enum: ['Setter', 'Outside Hitter', 'Libero', 'Middle Blocker', 'Opposite']
    },
    number: {
      type: Number,
      required: true,
      unique: true
    },
    photoUrl: {
      type: String,
      default: null
    },
    height: {
      type: String,
      default: null
    },
    age: {
      type: Number,
      default: null
    },
    experience: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    stats: {
      assists: { type: Number, default: 0 },
      kills: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      digs: { type: Number, default: 0 },
      aces: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);
playerSchema.virtual('displayName').get(function() {
  return `#${this.number} ${this.name}`;
});
playerSchema.virtual('shortBio').get(function() {
  return `${this.position} • ${this.experience || 'New player'}`;
});
playerSchema.set('toJSON', { virtuals: true });
playerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Player', playerSchema);