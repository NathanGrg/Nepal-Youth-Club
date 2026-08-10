const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    photoUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);