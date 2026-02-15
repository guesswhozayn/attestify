const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }, // Only required if not Google login
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['ISSUER', 'STUDENT'],
    default: 'STUDENT'
  },
  university: {
    type: String,
    default: 'Not Specified'
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  about: {
    type: String,
    trim: true,
    maxlength: [500, 'About must be less than 500 characters'],
    default: ''
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
    select: false
  },
  avatar: {
    type: String
  },
  walletAddress: {
    type: String,
    trim: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address']
  },

  isActive: {
    type: Boolean,
    default: true
  },
  issuerDetails: {
    institutionName: { type: String, trim: true },
    registrationNumber: { type: String, trim: true, unique: true, sparse: true },
    authorizedWalletAddress: { type: String, trim: true },
    officialEmailDomain: { type: String, trim: true },
    branding: {
      logo: String,
      seal: String,
      signature: String,
      logoCID: String,
      sealCID: String,
      signatureCID: String
    },
    operationalMetrics: {
      lastActive: Date,
      currentGasBalance: String
    }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    visibility: { type: Boolean, default: true },
    tfa: { type: Boolean, default: false }
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
