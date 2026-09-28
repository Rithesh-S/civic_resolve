const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin'],
    required: true
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  upvotedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  officerProfile: {
    officerCode: String,
    ulbId: mongoose.Schema.Types.ObjectId,
    wardId: mongoose.Schema.Types.ObjectId,
    department: {
      type: String,
      enum: ['Public Works', 'Sanitation', 'Horticulture', 'Electrical'],
      required: function () {
        return this.role === 'officer';
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return this.role === 'officer';
        }
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.role === 'officer';
        }
      }
    },
    roleTitle: {
      type: String,
      enum: ['JE', 'SI', 'AE', 'CSI', 'EE'],
      required: function () {
        return this.role === 'officer';
      }
    },
    supervisorId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: undefined
    }
  }
}, {
  timestamps: true
});

userSchema.index({ 'officerProfile.location': '2dsphere' });

module.exports = mongoose.model('User', userSchema);