# Attestify 🎓

> A blockchain-based academic credential verification platform that ensures the authenticity and immutability of educational certificates and transcripts.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Mobile App](#mobile-app)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Attestify is a comprehensive credential verification platform that leverages blockchain technology to provide tamper-proof, verifiable academic credentials. The system consists of four main components:

1. **Backend API** - RESTful API built with Node.js and Express
2. **Frontend Web Application** - React-based admin and verification portal
3. **Smart Contract** - Ethereum-based credential storage with Soulbound Token (SBT) functionality
4. **Mobile Application** - React Native app for credential verification via QR codes

## ✨ Features

### For Educational Institutions
- 🏛️ **Credential Issuance**: Issue both certificates and transcripts with blockchain verification
- 📊 **Bulk Upload**: CSV-based batch credential issuance
- 🎨 **Custom Branding**: Upload institution logos, seals, and signatures
- 📈 **Analytics Dashboard**: Track issuance metrics, gas costs, and verification statistics
- 🔐 **Secure Authentication**: JWT-based authentication with optional Google OAuth
- 👥 **Multi-User Support**: Create and manage multiple issuer accounts

### For Students
- 📱 **Digital Credentials**: Receive blockchain-verified credentials
- 🔍 **Self-Verification**: View and verify own credentials via wallet address
- 📄 **PDF Certificates**: Download professionally formatted PDF certificates
- 🌐 **Public Verification**: Share credentials with QR codes for instant verification

### For Verifiers
- ✅ **Instant Verification**: Verify credentials using wallet address or credential ID
- 📸 **QR Code Scanning**: Mobile app for quick credential verification
- 🔗 **Blockchain Proof**: Direct verification against Ethereum blockchain
- 📋 **Detailed Information**: View complete credential details and metadata

### Blockchain Features
- 🔒 **Soulbound Tokens (SBT)**: Non-transferable NFT credentials
- 🌐 **IPFS Storage**: Decentralized storage for credential documents
- ⛓️ **Ethereum Integration**: Deployed on Sepolia testnet (production-ready for mainnet)
- 🔄 **Revocation Support**: Ability to revoke compromised credentials
- 💰 **Gas Tracking**: Monitor transaction costs for issuance and revocation

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Frontend Web   │◄───────►│   Backend API   │
│   (React +      │         │  (Node.js +     │
│   Vite)         │         │   Express)      │
└─────────────────┘         └────────┬────────┘
                                     │
                            ┌────────┴────────┐
                            │                 │
                    ┌───────▼──────┐  ┌──────▼──────┐
                    │   MongoDB    │  │  Ethereum   │
                    │   Database   │  │  Blockchain │
                    └──────────────┘  └──────┬──────┘
                                             │
┌─────────────────┐                  ┌───────▼──────┐
│  Mobile App     │◄────────────────►│     IPFS     │
│ (React Native)  │                  │   Storage    │
└─────────────────┘                  └──────────────┘
```

### Data Flow

1. **Credential Issuance**:
   - Institution uploads student data (CSV or manual entry)
   - Backend generates PDF certificate with QR code
   - PDF uploaded to IPFS, hash stored
   - Smart contract mints Soulbound Token to student's wallet
   - Transaction details stored in MongoDB

2. **Verification**:
   - Verifier scans QR code or enters wallet address
   - System queries blockchain for credential data
   - Retrieves PDF from IPFS using stored CID
   - Displays credential details and verification status

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt, Google OAuth 2.0
- **Blockchain**: ethers.js v6
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode library
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Blockchain**: ethers.js v6
- **QR Codes**: qrcode.react, html5-qrcode
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **PDF Handling**: pdf-lib

### Blockchain
- **Smart Contract**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Standards**: ERC-721 (NFT), Soulbound Token pattern
- **Libraries**: OpenZeppelin Contracts v5
- **Network**: Ethereum Sepolia Testnet

### Mobile
- **Framework**: React Native 0.81 with Expo
- **Navigation**: React Navigation v7
- **Camera**: expo-camera (QR scanning)
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Icons**: Lucide React Native

## 📁 Project Structure

```
attestify/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database and blockchain config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Entry point
│   ├── uploads/            # Uploaded files (logos, images)
│   └── package.json
│
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Blockchain)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   └── package.json
│
├── blockchain/             # Smart contracts
│   ├── contracts/
│   │   └── Attestify.sol   # Main credential contract
│   ├── scripts/
│   │   ├── deploy.js       # Deployment script
│   │   └── verify.js       # Contract verification
│   ├── hardhat.config.js   # Hardhat configuration
│   └── package.json
│
└── mobile/                 # React Native app
    ├── app/                # Expo Router pages
    ├── components/         # Mobile UI components
    ├── services/           # API integration
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.11.0
- MongoDB (local or Atlas)
- MetaMask or compatible Web3 wallet
- Ethereum Sepolia testnet ETH (for deployment)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/attestify.git
   cd attestify
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration (see Backend Configuration below)
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file if needed
   # VITE_API_URL=http://localhost:5000
   
   npm run dev
   ```

4. **Blockchain Setup**
   ```bash
   cd blockchain
   npm install
   
   # Create .env file
   # SEPOLIA_RPC_URL=your_alchemy_or_infura_url
   # PRIVATE_KEY=your_wallet_private_key
   # ETHERSCAN_API_KEY=your_etherscan_key
   
   # Compile contracts
   npm run compile
   
   # Deploy to Sepolia
   npm run deploy:sepolia
   ```

5. **Mobile Setup**
   ```bash
   cd mobile
   npm install
   
   # Start Expo
   npm start
   ```

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/attestify

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Blockchain
BLOCKCHAIN_NETWORK=sepolia
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://sepolia.infura.io/v3/your_project_id

# IPFS (Optional - using Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 💻 Usage

### For Institutions

1. **Register an Account**
   - Navigate to `/register`
   - Select "Institute" role
   - Provide institution details and wallet address

2. **Setup Branding**
   - Go to Settings → Branding
   - Upload institution logo, seal, and authorized signature
   - These will appear on all issued credentials

3. **Issue Credentials**
   
   **Single Issuance:**
   - Navigate to "Issue Credential"
   - Fill in student details
   - Select credential type (Certificate or Transcript)
   - Upload student photo (optional)
   - Click "Issue Credential"
   
   **Bulk Issuance:**
   - Navigate to "Bulk Issue"
   - Download CSV template
   - Fill in student data
   - Upload CSV file
   - Review and confirm issuance

4. **Manage Credentials**
   - View all issued credentials in dashboard
   - Search by student name or wallet address
   - Revoke credentials if needed
   - Track verification statistics

### For Students

1. **Receive Credentials**
   - Provide wallet address to institution
   - Receive notification when credential is issued
   - View credential in verification portal using wallet address

2. **Verify Your Credentials**
   - Navigate to verification portal
   - Enter your wallet address
   - View all your credentials
   - Download PDF certificates

### For Verifiers

1. **Web Verification**
   - Go to verification portal
   - Enter student wallet address or credential ID
   - View credential details and blockchain proof

2. **Mobile Verification**
   - Open Attestify mobile app
   - Tap "Scan QR Code"
   - Scan credential QR code
   - View verification results

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "securePassword123",
  "role": "INSTITUTE",
  "university": "Example University",
  "walletAddress": "0x..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@university.edu",
  "password": "securePassword123"
}
```

#### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google_oauth_token"
}
```

### Credential Endpoints

#### Issue Credential
```http
POST /api/credentials/issue
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "studentWalletAddress": "0x...",
  "studentName": "Jane Smith",
  "university": "Example University",
  "issueDate": "2024-01-15",
  "type": "CERTIFICATION",
  "certificationData": {
    "title": "Blockchain Development",
    "description": "Advanced blockchain course",
    "level": "Advanced",
    "duration": "6 months"
  }
}
```

#### Get All Credentials
```http
GET /api/credentials
Authorization: Bearer <token>
```

#### Get Credential by ID
```http
GET /api/credentials/:id
Authorization: Bearer <token>
```

#### Revoke Credential
```http
POST /api/credentials/:id/revoke
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Credential compromised"
}
```

### Verification Endpoints

#### Verify by Wallet Address
```http
GET /api/verify/wallet/:walletAddress
```

#### Verify by Credential ID
```http
GET /api/credentials/verify/:id
```

### User Endpoints

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "title": "Dean of Students"
}
```

#### Upload Branding
```http
POST /api/user/branding
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "logo": <file>,
  "seal": <file>,
  "signature": <file>
}
```

### Audit Endpoints

#### Get Audit Logs
```http
GET /api/audit/logs
Authorization: Bearer <token>
```

#### Get Dashboard Metrics
```http
GET /api/audit/metrics
Authorization: Bearer <token>
```

## 🔗 Smart Contract

### Contract Address
- **Sepolia Testnet**: `0xYourContractAddress`

### Key Functions

#### Issue Credential (Legacy)
```solidity
function issueCertificate(
    string memory _studentId,
    bytes32 _certificateHash,
    string memory _ipfsCID
) public onlyAuthorized
```

#### Mint Soulbound Token
```solidity
function safeMint(
    address to,
    string memory uri
) public onlyAuthorized returns (uint256)
```

#### Revoke Credential
```solidity
function revokeCertificate(
    string memory _studentId
) public onlyAuthorized
```

#### Verify Credential
```solidity
function verifyCredential(
    string memory _studentId,
    bytes32 _hash
) public view returns (bool)
```

### Soulbound Token Features

The Attestify contract implements Soulbound Tokens (SBT), which are:
- **Non-transferable**: Cannot be sold or transferred between wallets
- **Permanently bound**: Tied to the recipient's wallet address
- **Revocable**: Can be burned by authorized issuers if needed
- **ERC-721 compliant**: Compatible with NFT infrastructure

## 📱 Mobile App

The mobile application provides QR code scanning for quick credential verification.

### Features
- QR code scanner using device camera
- Instant credential verification
- Offline credential viewing (cached)
- Clean, intuitive interface

### Running the Mobile App

```bash
cd mobile
npm start

# For iOS
npm run ios

# For Android
npm run android
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys or sensitive credentials
- **Environment Variables**: Use `.env` files (gitignored) for sensitive data
- **JWT Secrets**: Use strong, randomly generated secrets
- **Wallet Security**: Institutions should use hardware wallets for production
- **HTTPS**: Always use HTTPS in production
- **Input Validation**: All inputs are validated on both client and server
- **Rate Limiting**: Implement rate limiting for API endpoints in production

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
```bash
cd backend
heroku create attestify-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other environment variables
git push heroku main
```

### Frontend Deployment (Example: Vercel)
```bash
cd frontend
vercel --prod
```

### Smart Contract Deployment
```bash
cd blockchain
npm run deploy:sepolia
npm run verify
```

## 📊 Database Schema

### User Model
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: Enum ['INSTITUTE', 'STUDENT']
- `walletAddress`: String (Ethereum address)
- `instituteDetails`: Object (for institutions)
  - `institutionName`
  - `registrationNumber`
  - `branding` (logo, seal, signature)

### Credential Model
- `studentWalletAddress`: String (indexed)
- `studentName`: String
- `university`: String
- `issueDate`: Date
- `type`: Enum ['TRANSCRIPT', 'CERTIFICATION']
- `certificateHash`: String (unique)
- `ipfsCID`: String
- `transactionHash`: String
- `tokenId`: String
- `isRevoked`: Boolean
- `issuedBy`: ObjectId (ref: User)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Attestify Team - Building the future of credential verification

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Ethereum Foundation for blockchain infrastructure
- IPFS for decentralized storage
- The open-source community

## 📞 Support

For support, email attestifyteam@gmail.com or open an issue in the GitHub repository.

---

**Built with ❤️ using Blockchain Technology**
