const mongoose = require('mongoose');

const trialRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    contact: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrialRequest', trialRequestSchema);