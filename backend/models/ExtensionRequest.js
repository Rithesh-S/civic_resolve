const mongoose = require('mongoose');

const extensionRequestSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  ulbId: mongoose.Schema.Types.ObjectId,
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedUntil: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  reviewedBy: mongoose.Schema.Types.ObjectId,
  reviewedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('ExtensionRequest', extensionRequestSchema);