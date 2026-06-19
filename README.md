# Attestify

Attestify is a decentralized, secure, and instant academic credential verification platform. By leveraging blockchain technology (Ethereum/Sepolia) and IPFS, Attestify provides immutable proof of academic achievements, eliminating certificate fraud and streamlining the verification process for students, universities, and employers.

---

## Key Features

- **On-Chain Verification**: Credentials are cryptographically hashed and verified against records on the Ethereum blockchain.
- **Soulbound Tokens (SBTs)**: Support for ERC-721 Soulbound Tokens representing non-transferable, permanent academic credentials.
- **Instant Verification Portal**: Public interface for verifying certificates via on-chain hash checks or PDF file uploads.
- **Dynamic PDF Generation**: Automatic generation of official certificates and transcripts with secure embedded QR codes.
- **Multi-Role System**:
  - **Issuers (Universities)**: Dashboard to manage authorized signers, issue single/batch credentials, and revoke records.
  - **Students (Recipients)**: Portal to view credentials, manage profiles, track activity, and export PDFs.
  - **Verifiers (Employers)**: Interface to instantly verify validity without requiring database access.
- **Decentralized Storage**: Document metadata and assets are secured via IPFS.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS
- **State & Routing**: React Context API, React Router DOM
- **Interactions**: Framer Motion
- **Web3 Integration**: Ethers.js (v6)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **File Processing**: PDFKit, Multer, CSV Parser
- **Integrations**: Nodemailer, Pinata IPFS SDK

### Blockchain
- **Smart Contracts**: Solidity (v0.8.20)
- **Development Environment**: Hardhat
- **Base Standards**: OpenZeppelin (ERC721URIStorage, Ownable, ReentrancyGuard)

---

## Directory Structure

```text
attestify/
├── backend/            # Express API, PDF generation, email services
├── blockchain/         # Hardhat project, Solidity contracts, and deployment scripts
├── frontend/           # React application & dashboard interfaces
└── scripts/            # Repository mapping and sync tools
```

---

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/)
- [MetaMask](https://metamask.io/) browser extension

---

### Setup Instructions

#### 1. Smart Contracts
Navigate to the `blockchain` directory, install dependencies, and compile contracts:
```bash
cd blockchain
npm install
npm run compile
```

To run a local blockchain node for testing:
```bash
npx hardhat node
```

To deploy the contracts (e.g., to Sepolia testnet):
```bash
npm run deploy:sepolia
```

#### 2. Backend API Server
Navigate to the `backend` directory, install dependencies, and start the development server:
```bash
cd ../backend
npm install
```

Configure your environment variables by creating a `.env` file in the `backend/` root:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SEPOLIA_RPC_URL=your_infura_or_alchemy_url
ADMIN_PRIVATE_KEY=your_wallet_private_key
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

Start the server:
```bash
npm run dev
```

#### 3. Frontend Client
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server:
```bash
cd ../frontend
npm install
```

Configure your environment variables by creating a `.env` file in the `frontend/` root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

Start the client:
```bash
npm run dev
```

---

## License

This project is licensed under the MIT License.
