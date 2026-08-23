const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  loginId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
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
  phone: {
    type: String,
  },
  zonecode: {
    type: String,
  },
  address: {
    type: String,
  },
  detailAddress: {
    type: String,
  },
  doorPassword: {
    type: String,
  },
  agreements: {
    privacy: { type: Boolean, default: false },
    sns: { type: Boolean, default: false }
  },
  isVerified: {
    type: Boolean,
    default: true // Set to true as email verification is removed
  },
  verificationToken: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
