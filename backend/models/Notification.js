const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ulbId: mongoose.Schema.Types.ObjectId,
  channel: {
    type: String,
    enum: ['push', 'sms', 'email', 'whatsapp'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedIssueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);