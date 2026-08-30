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
      default: null // e.g., "5'11\""
    },
    age: {
      type: Number,
      default: null
    },
    experience: {
      type: String,
      default: null // e.g., "5 years"
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

// Virtual: full name with number
playerSchema.virtual('displayName').get(function() {
  return `#${this.number} ${this.name}`;
});

// Virtual: short bio for cards
playerSchema.virtual('shortBio').get(function() {
  return `${this.position} • ${this.experience || 'New player'}`;
});

// Ensure virtuals are included in JSON output
playerSchema.set('toJSON', { virtuals: true });
playerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Player', playerSchema);