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
    enum: ['INSTITUTE', 'STUDENT'],
    default: 'STUDENT'
  },
  university: {
    type: String,
    default: 'Not Specified' // Default for OAuth users
  },
  title: {
    type: String,
    trim: true,
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
  registrationNumber: {
    type: String, // Formal Registration Number (e.g., 2024-CS-001)
    sparse: true,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instituteDetails: {
    institutionName: { type: String, trim: true },
    registrationNumber: { type: String, trim: true, unique: true, sparse: true },
    authorizedWalletAddress: { type: String, trim: true },
    officialEmailDomain: { type: String, trim: true },
    branding: {
      logoCID: String,
      sealCID: String,
      signatureCID: String
    },
    operationalMetrics: {
      lastActive: Date,
      currentGasBalance: String
    }
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

// Hash password before saving

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
