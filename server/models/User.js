const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    // Password is not required for social logins
  },
  name: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['local', 'kakao', 'naver', 'google'],
    default: 'local'
  },
  snsId: {
    type: String,
    // ID from social login provider
  },
  isVerified: {
    type: Boolean,
    default: false // Set to true after email verification or if social login
  },
  verificationToken: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
