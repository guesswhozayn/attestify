# Attestify

Attestify is a decentralized academic and professional credential issuance and verification platform. It combines Ethereum smart contracts, IPFS distributed storage, and cryptographic hashing to issue tamper-proof certificates, automate bulk distribution, and provide instant public verification.

## Table of Contents

- Overview
- System Architecture
- Key Features
- Technology Stack
- Project Structure
- Environment Configuration
- Getting Started
- API Reference
- Background Workers and Queues
- Verification Workflow
- License

## Overview

Traditional credentials and academic certificates are prone to forgery, slow verification processes, and centralized points of failure. Attestify addresses these challenges by:
- Storing immutable proof of credentials on the Ethereum Sepolia blockchain.
- Storing full credential metadata and assets on IPFS via Pinata.
- Generating tamper-evident PDF certificates embedded with unique cryptographic hashes and verification QR codes.
- Managing asynchronous, high-volume issuance through background queues powered by Redis and BullMQ.
- Offering public verification tools where any third party can validate credentials without requiring an account.

## System Architecture

Attestify is organized as an npm workspace monorepo consisting of two primary packages:
- client: Single-page React application providing dedicated interfaces for students, institutional issuers, and third-party verifiers.
- server: Express backend handling authentication, database persistence, PDF rendering, IPFS pinning, Ethereum transaction signing, and queue workers.

```
[ Institutional Issuer ]          [ Public Verifier / Student ]
          |                                     |
          v                                     v
+---------------------------------------------------------------+
|                      React 19 Frontend                        |
|        (Vite, Tailwind CSS, Framer Motion, Ethers.js)         |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                       Express REST API                        |
|  - Auth & Role Middleware    - Credential Controller          |
|  - PDF Generation Service    - IPFS Service (Pinata)          |
|  - Blockchain Service        - Email Notification Service     |
+---------------+-------------------------------+---------------+
                |                               |
                v                               v
    +-----------------------+       +-----------------------+
    |     MongoDB Store     |       |    Redis + BullMQ     |
    |  - Users & Roles      |       |  - Issuance Queue     |
    |  - Credential Records |       |  - Async Workers      |
    +-----------------------+       +-----------+-----------+
                                                |
                                                v
    +-----------------------+       +-----------------------+
    |      Pinata IPFS      |       |   Ethereum Sepolia    |
    |  - Metadata JSON      |       |  - Smart Contract     |
    |  - Certificate Assets |       |  - On-chain Registry  |
    +-----------------------+       +-----------------------+
```

## Key Features

### Role-Based Portals
- Institutional Issuers: Issue individual or batch credentials, inspect issuance analytics, manage revoked certificates, and monitor transaction statuses.
- Students and Recipients: View personal credential vaults, download signed PDFs, inspect on-chain transaction details, and share verification links.
- Public Verifiers: Search by unique credential ID or upload an existing certificate PDF to inspect cryptographic authenticity in real time.

### Credential Issuance Pipeline
- Single Issuance: Direct form submission creating credential records, compiling PDF certificates, pinning to IPFS, and executing the smart contract attestation transaction.
- Bulk Issuance: CSV upload parsing that enqueues issuance jobs into BullMQ workers, ensuring non-blocking operations and rate limit compliance.
- Cryptographic Proofs: SHA-256 payload hashing linking the student identity, institution identity, issue date, and certificate metadata directly to the on-chain record.

### Document Generation and Storage
- Dynamic PDF Generation: Built with PDFKit, injecting official signatures, institutional badges, cryptographic hashes, and verification QR codes.
- IPFS Storage: Certificate artifacts and standardized metadata schemas pinned to IPFS through Pinata.
- Automated Email Dispatch: Recipients receive an automated notification with their certificate and verification link via Nodemailer.

### Smart Contract Integration
- Deployed on Ethereum Sepolia testnet.
- Supports immutable credential registration, ownership validation, and certificate revocation by authorized issuer addresses.

## Technology Stack

### Client Workspace
- Runtime and Framework: React 19, Vite 7
- Routing: React Router v7
- Styling: Tailwind CSS v4, Framer Motion
- Web3 Integration: Ethers.js v6
- Utilities: PDF-lib, QR Code React, Lucide React, Axios

### Server Workspace
- Runtime: Node.js, Express 4
- Database: MongoDB with Mongoose 8
- Caching and Job Queues: Redis, BullMQ 5
- Blockchain: Ethers.js v6, Ethereum Sepolia RPC
- Decentralized Storage: Pinata IPFS API
- Document Generation: PDFKit, node-qrcode
- Security: JSON Web Tokens (JWT), Bcryptjs, Helmet, Express-Rate-Limit, CORS
- File Handling: Multer, CSV-Parser
- Email: Nodemailer

## Project Structure

```
attestify/
├── package.json               # Root workspace manifest
├── package-lock.json
├── client/                    # React frontend workspace
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx            # Application routing and layout wrapper
│   │   ├── main.jsx           # Client entry point
│   │   ├── context/           # Auth and Notification contexts
│   │   ├── components/        # Reusable UI, credential, and verification components
│   │   ├── pages/             # Route views (Dashboard, Verify, Archive, etc.)
│   │   ├── services/          # API client and blockchain utility functions
│   │   └── utils/             # Hashing, PDF, and avatar helpers
│   └── public/                # Static brand assets
└── server/                    # Express backend workspace
    ├── package.json
    ├── src/
    │   ├── server.js          # Server entry point and middleware configuration
    │   ├── config/            # Database, constants, and contract ABI
    │   ├── controllers/       # Auth, credential, verification, and network controllers
    │   ├── middleware/        # JWT auth, role validation, file upload, error handling
    │   ├── models/            # Mongoose schemas (User, Credential)
    │   ├── routes/            # Express route declarations
    │   ├── services/          # Blockchain, IPFS, PDF, email, and queue handlers
    │   ├── utils/             # Mutex and cryptographic helpers
    │   └── workers/           # BullMQ issuance background worker
    └── uploads/               # Temporary directory for processed files
```

## Environment Configuration

### Server Configuration (`server/.env`)

Create a `.env` file in the `server` directory with the following variables:

| Variable | Description | Example / Default |
| --- | --- | --- |
| PORT | Port on which the Express server listens | 5000 |
| MONGODB_URI | MongoDB connection URI | mongodb://localhost:27017/attestify |
| JWT_SECRET | Secret key for signing JSON Web Tokens | your-jwt-secret-string |
| SEPOLIA_RPC_URL | Ethereum Sepolia JSON-RPC endpoint | https://eth-sepolia.g.alchemy.com/v2/... |
| ADMIN_PRIVATE_KEY | Private key for the contract admin account | 0x... |
| CONTRACT_ADDRESS | Address of the deployed smart contract | 0xce209eD4923DA8FDbf6C5a942245210a9Bc0809a |
| PINATA_API_KEY | Pinata API Key for IPFS uploads | your-pinata-api-key |
| PINATA_SECRET_KEY | Pinata Secret API Key for IPFS uploads | your-pinata-secret-key |
| EMAIL_USER | SMTP email address for notifications | your-email@example.com |
| EMAIL_PASS | SMTP email application password | your-app-password |
| FRONTEND_URL | URL of the frontend application | http://localhost:5173 |
| NODE_ENV | Node environment mode | development |
| REDIS_HOST | Redis server hostname | 127.0.0.1 |
| REDIS_PORT | Redis server port | 6379 |

### Client Configuration (`client/.env`)

Create a `.env` file in the `client` directory with the following variables:

| Variable | Description | Example / Default |
| --- | --- | --- |
| VITE_API_URL | Full base URL for the backend API | http://localhost:5000/api |
| VITE_CONTRACT_ADDRESS | Attestify contract address | 0xce209eD4923DA8FDbf6C5a942245210a9Bc0809a |
| VITE_SEPOLIA_RPC_URL | Ethereum Sepolia JSON-RPC endpoint | https://eth-sepolia.g.alchemy.com/v2/... |

## Getting Started

### Prerequisites
- Node.js version 18.x or higher
- npm version 9.x or higher
- Running MongoDB instance (local or MongoDB Atlas)
- Running Redis instance (local or hosted)

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   git clone <repository-url>
   cd attestify
   ```

2. Install all dependencies across all workspaces:
   ```bash
   npm install
   ```

3. Configure environment files in both `server/.env` and `client/.env` as described above.

### Running the Application

To run both backend and frontend concurrently from the root directory:
```bash
npm run dev
```

To run individual workspaces independently:
- Run backend server only:
  ```bash
  npm run dev:server
  ```
- Run frontend client only:
  ```bash
  npm run dev:client
  ```

Access the client at `http://localhost:5173` and the server API at `http://localhost:5000`.

### Production Build

To compile the frontend application:
```bash
npm run build
```

To run the production backend server:
```bash
cd server
npm start
```

## API Reference

### Authentication (`/api/auth`)
- `POST /register`: Register a new user (Student or Issuer).
- `POST /login`: Authenticate existing user and return JWT.
- `GET /me`: Retrieve profile of currently authenticated user.

### Credentials (`/api/credentials`)
- `POST /`: Issue a single credential (requires Issuer role).
- `POST /bulk`: Upload a CSV file for batch credential processing.
- `GET /`: List credentials with optional status, pagination, and filter queries.
- `GET /:id`: Retrieve detailed credential metadata.
- `POST /:id/revoke`: Mark a credential as revoked on-chain and in the database.
- `GET /:id/download`: Download the signed certificate PDF.

### Verification (`/api/verify`)
- `GET /:id`: Public verification endpoint by credential ID or on-chain transaction hash.
- `POST /file`: Public verification endpoint by uploading a certificate PDF file.

### Network and Health (`/api/network`)
- `GET /status`: Sepolia network status, current gas price, and contract health.

## Background Workers and Queues

Attestify uses BullMQ backed by Redis to manage credential issuance asynchronously:
1. When bulk CSV files or individual credentials are submitted, jobs are pushed to the `issuanceQueue`.
2. The issuance worker (`server/src/workers/issuanceWorker.js`) picks up jobs and sequentially:
   - Validates student and course metadata.
   - Generates the certificate PDF with PDFKit.
   - Uploads certificate and metadata to IPFS via Pinata.
   - Signs and submits the Ethereum Sepolia contract transaction using the institutional wallet.
   - Saves the transaction hash and token details to MongoDB.
   - Dispatches confirmation emails to recipients via Nodemailer.
3. If an on-chain transaction fails or RPC rate limits are encountered, BullMQ handles exponential backoff and retries automatically.

## Verification Workflow

1. Document Hash Matching: The verifier uploads a PDF or supplies a credential ID.
2. IPFS Lookup: The system fetches the corresponding metadata schema from IPFS.
3. Blockchain Attestation Check: The contract method is invoked using Sepolia RPC to confirm that the hash matches the on-chain register and has not been revoked.
4. Cryptographic Validation: A real-time status card displays issuer authenticity, recipient details, timestamps, and on-chain explorer links.

## License

This project is licensed under the MIT License.
