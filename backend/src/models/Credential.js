const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  studentWalletAddress: {
    type: String,
    required: [true, 'Student Wallet Address is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  university: {
    type: String,
    required: [true, 'University is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  type: {
    type: String,
    enum: ['TRANSCRIPT', 'CERTIFICATION'],
    default: 'CERTIFICATION'
  },
  transcriptData: {
    program: String,
    department: String,
    admissionYear: String,
    graduationYear: String,
    cgpa: String,
    courses: [{
      code: String,
      name: String,
      grade: String,
      credits: String
    }]
  },
  certificationData: {
    title: String,
    description: String,
    level: String,
    duration: String,
    expiryDate: Date,
    score: String
  },
  studentImage: {
    type: String,
    trim: true
  },
  certificateHash: {
    type: String,
    required: [true, 'Certificate hash is required'],
    unique: true,
    index: true
  },
  ipfsCID: {
    type: String,
    required: [true, 'IPFS CID is required'],
    trim: true
  },
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    trim: true
  },
  blockNumber: {
    type: Number
  },
  tokenId: {
    type: String,
    index: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revocationReason: {
    type: String
  },
  gasUsed: {
    type: String
  },
  gasPrice: {
    type: String
  },
  totalCost: {
    type: String
  },
  revocationGasUsed: {
    type: String
  },
  revocationGasPrice: {
    type: String
  },
  revocationTotalCost: {
    type: String
  },
  metadata: {
    fileSize: Number,
    fileType: String,
    originalFileName: String
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

credentialSchema.index({ studentWalletAddress: 1, isRevoked: 1 });
credentialSchema.index({ issuedBy: 1, createdAt: -1 });
credentialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Credential', credentialSchema);
