const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: String,
  type: {
    type: String,
    enum: ['image', 'audio']
  },
  role: {
    type: String,
    enum: ['evidence', 'before', 'after']
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  updatedBy: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const verificationSchema = new mongoose.Schema({
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  checks: {
    exif: {
      adjustment: Number,
      reasons: [String]
    },
    aiGenerated: {
      confidence: Number
    },
    apiAnalysis: mongoose.Schema.Types.Mixed, // flexible structure (can refine later)
    relevance: mongoose.Schema.Types.Mixed    // flexible structure (depends on your output)
  }
});

const citizenFeedbackSchema = new mongoose.Schema({
  rating: Number,
  comment: String
});

const issueSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ulbId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  channel: {
    type: String,
    enum: ['app', 'whatsapp', 'ivr', 'web'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Roads', 'Sanitation', 'Streetlight', 'Waterleakage', 'Parks'],
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'verified', 'rejected','flagged', 'acknowledged', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  wardId: mongoose.Schema.Types.ObjectId,
  priority: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 5
  },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  media: [mediaSchema],
  verification: verificationSchema,
  slaDueDate: Date,
  statusHistory: [statusHistorySchema],
  citizenFeedback: citizenFeedbackSchema,
  upvote: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ reporterId: 1, createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);