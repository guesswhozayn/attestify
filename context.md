# Attestify — Project Context Ledger

> **Last Updated:** 2026-05-03
> **Purpose:** Single source of truth for AI assistants and developers. Load this file at session start to skip onboarding.

---

## 1. Project Essence

**What it is:** Attestify is a blockchain-based academic credential verification platform. Institutions (Issuers) issue tamper-proof digital certificates and transcripts. Students receive Soulbound Tokens (SBTs) in their wallets. Third parties (employers, other universities) verify credentials trustlessly via on-chain proof, IPFS-stored PDFs, and SHA-256 hash matching.

**Target Audience:**
- **Issuers** — Universities / certification bodies that issue credentials.
- **Students** — Recipients whose credentials are stored on-chain and verifiable.
- **Verifiers** — Anyone (public, no auth required) who needs to confirm a credential's authenticity.

**Core Tech Stack:**

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite 7 | SPA, TailwindCSS v4, Framer Motion, Lucide icons |
| Backend | Node.js + Express 4 | REST API, CommonJS modules |
| Database | MongoDB (Mongoose 8) | Atlas in prod |
| Blockchain | Solidity 0.8.20 + Hardhat | ERC-721 (SBT) via OpenZeppelin v5, deployed on **Sepolia testnet** |
| Storage | IPFS via Pinata | Certificate PDFs + SBT metadata JSON |
| Auth | JWT (1h expiry) + bcryptjs | Google OAuth support (partial) |
| Email | Nodemailer | Transactional emails on credential issuance |
| PDF Gen | PDFKit + QRCode | Server-side certificate generation |
| Deployment | Vercel (frontend), PaaS (backend) | SPA rewrites via `vercel.json` |

**Contract Address (Sepolia):** `0x42A657509Bbf3a0F470E77b7cdFF1C71Da2E7864`
**Deployer:** `0x8c3D7485B0748cd5188117fa4556dbCeD36E6e7f`

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React SPA)                    │
│  AuthContext ─► api.js (axios) ─► Backend REST API              │
│  blockchain.js (ethers.js) ─► Smart Contract (read-only)        │
│  Pages: Landing, Login, Register, Dashboards, Verify, etc.      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (JWT Bearer)
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Express API :5000)                  │
│  Routes → Controllers → Services → External Systems             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  MongoDB     │  │  Blockchain Svc  │  │  IPFS Service     │  │
│  │  (User,Cred) │  │  (ethers.js →    │  │  (Pinata API →    │  │
│  │              │  │   Sepolia RPC)   │  │   pin/unpin)      │  │
│  └──────────────┘  └──────────────────┘  └───────────────────┘  │
│                           │                       │              │
│  ┌──────────────┐  ┌──────┴───────┐  ┌────────────┴──────────┐  │
│  │ Email Svc    │  │  PDF Service │  │  Hash Service         │  │
│  │ (Nodemailer) │  │  (PDFKit)    │  │  (SHA-256 of files)   │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ ethers.js (admin wallet)
┌──────────────────────────▼──────────────────────────────────────┐
│               SMART CONTRACT (Attestify.sol)                     │
│  ERC721URIStorage + Ownable + ReentrancyGuard                    │
│  • issueCertificate / issueCertificateBatch                      │
│  • safeMint / safeMintBatch  (Soulbound — non-transferable)      │
│  • revokeCertificate / revokeToken                               │
│  • verifyCredential (pure on-chain hash comparison)              │
│  • authorizeIssuer / revokeIssuer (owner only)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Credential Issuance Flow (Single)

1. Issuer submits form → backend `POST /api/credentials/issue`
2. Backend generates PDF (PDFKit with QR code)
3. SHA-256 hash of PDF computed → `certificateHash`
4. PDF uploaded to IPFS (Pinata) → `ipfsCID`
5. **Two parallel blockchain txns:**
   - `issueCertificate(credentialId, hash, cid)` — on-chain credential record
   - `safeMint(studentWallet, metadataURI)` — SBT minted to student
6. Credential doc saved to MongoDB with all txn data
7. Email notification sent to student (fire-and-forget)

### Verification Flow

- **With File:** Upload PDF → hash it → find matching credential in DB → verify hash on-chain
- **With Hash:** Provide wallet/ID + hash → DB lookup → on-chain verification
- **Public:** `GET /api/verify/:walletAddress` — check if credentials exist (respects privacy settings)

---

## 3. Current File Structure

```
attestify/
├── .gitignore
├── context.md                          ← YOU ARE HERE
│
├── backend/
│   ├── package.json                    # Express, Mongoose, ethers, PDFKit, etc.
│   ├── .env                           # MONGO_URI, JWT_SECRET, SEPOLIA_RPC_URL, PINATA keys, etc.
│   └── src/
│       ├── server.js                  # Entry point — Express app, CORS, rate limiting, routes
│       ├── config/
│       │   ├── database.js            # Mongoose connection
│       │   ├── constants.js           # ROLES, AUDIT_ACTIONS, FILE_LIMITS, JWT_EXPIRY, PAGINATION
│       │   └── contractABI.json       # Compiled Attestify contract ABI
│       ├── controllers/
│       │   ├── authController.js      # register, login, getMe, logout, googleLogin
│       │   ├── credentialController.js # issue, batchIssue, get, getById, revoke, stats, verify
│       │   ├── fileController.js      # downloadCertificate, getIPFSFile, generateQR
│       │   ├── networkController.js   # getNetworkStats (blockchain + IPFS connectivity)
│       │   ├── userController.js      # getProfile, updateProfile, changePassword, uploadAvatar
│       │   └── verifyController.js    # verifyWithFile, checkExists, verifyByHash
│       ├── middleware/
│       │   ├── asyncHandler.js        # try/catch wrapper for async route handlers
│       │   ├── auth.js                # JWT verification middleware (protect)
│       │   ├── errorHandler.js        # Global error handler (dev vs prod responses)
│       │   ├── roleCheck.js           # Role-based access control (requireRole)
│       │   └── upload.js              # Multer config (certificates, avatars, CSV files)
│       ├── models/
│       │   ├── User.js                # Mongoose schema: name, email, role, wallet, issuerDetails, prefs
│       │   └── Credential.js          # Mongoose schema: hash, CID, txHash, type, revocation, gas data
│       ├── routes/
│       │   ├── auth.js                # /api/auth/*
│       │   ├── credentials.js         # /api/credentials/*
│       │   ├── files.js               # /api/files/*
│       │   ├── network.js             # /api/network/*
│       │   ├── user.js                # /api/users/*
│       │   └── verify.js              # /api/verify/*
│       ├── services/
│       │   ├── blockchainService.js   # Singleton: ethers.js provider/wallet/contract, nonce mutex
│       │   ├── emailService.js        # Nodemailer templates for issuance, revocation, etc.
│       │   ├── hashService.js         # SHA-256 file hashing
│       │   ├── ipfsService.js         # Pinata upload/unpin/JSON, gateway URL builder
│       │   └── pdfService.js          # PDFKit-based certificate/transcript PDF generation
│       └── utils/
│           └── mutex.js               # Simple async mutex for nonce management
│
├── blockchain/
│   ├── package.json                   # Hardhat, OpenZeppelin, dotenv
│   ├── hardhat.config.js              # Solidity 0.8.20, optimizer on, Sepolia + localhost networks
│   ├── deployment-info.json           # Live contract address, deployer, txHash, timestamp
│   ├── contracts/
│   │   └── Attestify.sol              # Main contract: ERC721 SBT + credential registry
│   ├── scripts/
│   │   └── deploy.js                  # Hardhat deployment script
│   └── test/
│       └── Attestify.test.js          # Hardhat test suite
│
├── frontend/
│   ├── package.json                   # React 19, Vite 7, TailwindCSS v4, ethers, framer-motion
│   ├── vite.config.js                 # Plugins: react, tailwindcss
│   ├── vercel.json                    # SPA catch-all rewrite
│   ├── index.html                     # HTML shell
│   ├── .env                           # VITE_API_URL, VITE_CONTRACT_ADDRESS
│   └── src/
│       ├── main.jsx                   # ReactDOM root, BrowserRouter, AuthProvider, NotificationProvider
│       ├── App.jsx                    # Route definitions (public + protected), lazy loading, Layout
│       ├── index.css                  # Global styles, Tailwind imports
│       ├── context/
│       │   ├── AuthContext.jsx        # Auth state, login/register/logout, role helpers, token verification
│       │   └── NotificationContext.jsx # Toast notification system
│       ├── hooks/
│       │   ├── useAuth.js             # ⚠️ BROKEN — wrong import (see Known Issues)
│       │   └── useNotification.js     # Shorthand for NotificationContext
│       ├── services/
│       │   ├── api.js                 # Axios instance, interceptors, all API modules (auth, credential, verify, etc.)
│       │   ├── blockchain.js          # Frontend ethers.js: MetaMask connection, read contract state
│       │   └── ipfs.js                # IPFS gateway URL helper
│       ├── utils/
│       │   ├── avatarUtils.js         # Avatar URL builder
│       │   ├── hash.js                # Client-side SHA-256 (js-sha256)
│       │   └── pdf.js                 # Client-side PDF utilities (pdf-lib)
│       ├── components/
│       │   ├── credential/            # IssueCredentialModal, BulkIssueModal, CredentialTable, CredentialDetails,
│       │   │                          # CredentialRow, CredentialBadge, CredentialsFilter, CredentialsStats,
│       │   │                          # DetailedCredentialCard, QRCodeDisplay, RevokeCredentialModal,
│       │   │                          # SBTDetailsModal, StudentStats, TypeSelectionCard
│       │   ├── dashboard/             # RecentActivityList, UpgradePlanModal
│       │   ├── landing/               # PilotIntegrationHub
│       │   ├── layout/                # Layout, Header, Sidebar, AccountLayout, Notification
│       │   ├── shared/                # Avatar, BackButton, BackgroundEffects, BrandLogo, Button, EmptyState,
│       │   │                          # Footer, GradientBackground, Input, LoadingSpinner, Modal, Navbar,
│       │   │                          # PoweredBy, PrivateRoute, RefreshButton, ScrollToTop, SectionHeader,
│       │   │                          # ShieldLogo, StatCard, StatusBadge, Toggle, WelcomeHeroCard
│       │   └── verification/          # VerificationPortal, VerificationResult, VerificationSection
│       └── pages/
│           ├── Landing.jsx            # Public landing page
│           ├── Login.jsx              # Login form (email + password + role selector)
│           ├── Register.jsx           # Registration (Issuer with institution details, or Student)
│           ├── IssuerDashboard.jsx    # Stats, recent activity, quick actions
│           ├── StudentDashboard.jsx   # Student's credential overview
│           ├── CredentialArchive.jsx  # Issuer's full credential list with filters
│           ├── StudentCredentials.jsx # Student's credential list
│           ├── Verify.jsx             # Public verification page
│           ├── Profile.jsx            # User profile management
│           ├── Settings.jsx           # Account settings
│           ├── NetworkStatus.jsx      # Blockchain network health (Issuer only)
│           ├── RevokedCredentials.jsx # Revoked credentials list (Issuer only)
│           ├── Documentation.jsx      # Platform documentation
│           ├── About.jsx              # About page
│           ├── PrivacyPolicy.jsx      # Privacy policy
│           ├── TermsOfService.jsx     # Terms of service
│           ├── PartnershipGuide.jsx   # Institutional partnership info
│           ├── Pricing.jsx            # Plan tiers (Starter/Pro/Enterprise)
│           └── NotFound.jsx           # 404 page
```

---

## 4. Module Map

### Backend

| Module | Why It Exists |
|--------|--------------|
| `server.js` | Bootstraps Express, applies security (Helmet, rate limiting, CORS), mounts all route groups, starts the HTTP listener. |
| `config/database.js` | Encapsulates the Mongoose `connect()` call with connection string from `.env`. |
| `config/constants.js` | Centralizes magic strings: role names, audit action labels, file upload limits, JWT TTL, pagination defaults. |
| `config/contractABI.json` | ABI artifact for the deployed Attestify contract — consumed by `blockchainService`. |
| `middleware/auth.js` | `protect` middleware: extracts JWT from `Authorization: Bearer`, verifies, attaches `req.user`. |
| `middleware/roleCheck.js` | `requireRole(roles)` — blocks request if `req.user.role` is not in allowed list. |
| `middleware/upload.js` | Multer disk storage configs for certificate PDFs, student images, avatars, and CSV batch files. |
| `middleware/asyncHandler.js` | Wraps async route handlers so thrown errors automatically reach `errorHandler`. |
| `middleware/errorHandler.js` | Global Express error handler — structured JSON error responses, stack traces in dev only. |
| `services/blockchainService.js` | **Singleton**. Manages ethers.js `JsonRpcProvider` + admin `Wallet` + `Contract`. Handles nonce sequencing via a mutex to prevent nonce collisions under concurrent requests. All write operations estimate gas + add 20% buffer. |
| `services/ipfsService.js` | **Singleton**. Wraps Pinata REST API for file upload, JSON upload, unpin, and gateway URL resolution. |
| `services/hashService.js` | Computes SHA-256 hash of a file on disk (used for certificate integrity proofs). |
| `services/pdfService.js` | Generates professional PDF certificates/transcripts with QR codes, institutional branding, and credential metadata using PDFKit. |
| `services/emailService.js` | Nodemailer transactional email templates (certificate issued, revoked, etc.). Fire-and-forget pattern. |
| `utils/mutex.js` | Lightweight async mutex — critical for `blockchainService.getNonce()` to avoid nonce race conditions in batch operations. |
| `controllers/authController.js` | Handles registration (with issuer detail validation), login (with role matching), `getMe`, logout, Google OAuth. |
| `controllers/credentialController.js` | **Heaviest controller.** Orchestrates the full issuance pipeline (PDF → hash → IPFS → blockchain → SBT → DB → email). Also handles batch issuance via CSV, revocation, stats aggregation, and single-credential verification. |
| `controllers/verifyController.js` | Public verification endpoints. Supports verification by file upload (hash comparison) or by pre-computed hash. Includes legacy wallet-address-based lookup fallback. Respects student privacy preferences. |
| `controllers/fileController.js` | Proxies certificate downloads from IPFS, generates QR codes on-the-fly. |
| `controllers/networkController.js` | Returns blockchain network stats (block height, gas price, connectivity) and IPFS connection test results. |
| `controllers/userController.js` | Profile CRUD, password change, avatar upload. |
| `models/User.js` | Mongoose schema: two roles (`ISSUER`, `STUDENT`), nested `issuerDetails` for institution metadata, `walletAddress`, bcrypt password hashing, `tokenVersion` for JWT invalidation. |
| `models/Credential.js` | Mongoose schema: supports two types (`TRANSCRIPT`, `CERTIFICATION`) with distinct sub-schemas, stores all blockchain proof data (txHash, blockNumber, gas costs), revocation metadata, and verification analytics. Compound indexes for performance. |

### Blockchain

| Module | Why It Exists |
|--------|--------------|
| `Attestify.sol` | Core smart contract. Dual-purpose: (1) credential registry mapping `studentId → Credential` struct with hash + CID + revocation status, and (2) ERC-721 Soulbound Token with transfer lock (`_update` override rejects non-mint/burn). Uses OpenZeppelin v5 `Ownable`, `ReentrancyGuard`. Supports both single and batch operations for certificates and SBTs. |
| `deploy.js` | Hardhat deployment script — deploys contract, saves deployment info (address, deployer, txHash) to `deployment-info.json`. |
| `Attestify.test.js` | Hardhat test suite covering issuance, verification, revocation, SBT minting, and access control. |

### Frontend

| Module | Why It Exists |
|--------|--------------|
| `App.jsx` | Top-level router. Lazy-loads all pages. Splits `/dashboard` and `/credentials` views by user role. Protected routes via `PrivateRoute`. |
| `AuthContext.jsx` | Central auth state management. Handles login, register, logout, token verification on mount (with `isInitialized` ref guard to prevent dependency loops), and role-check helpers (`isIssuer`, `isStudent`, `hasRole`). |
| `NotificationContext.jsx` | Global toast notification system. |
| `api.js` | Axios instance with base URL config, auth interceptor (reads token from `localStorage`), 401 auto-redirect, and all API module exports: `authAPI`, `credentialAPI`, `verifyAPI`, `networkAPI`, `userAPI`, `fileAPI`, `statsAPI`. |
| `blockchain.js` | Frontend ethers.js integration — connects to MetaMask, reads contract state (credential lookup, verification). Write operations are backend-only (admin wallet). |
| `ipfs.js` | Utility to build Pinata gateway URLs from CIDs. |
| `utils/hash.js` | Client-side SHA-256 computation using `js-sha256` — used for client-side pre-verification. |
| `utils/pdf.js` | Client-side PDF manipulation via `pdf-lib` (e.g., embedding metadata). |
| `utils/avatarUtils.js` | Constructs avatar URLs from backend-stored paths. |
| `components/shared/*` | Reusable UI primitives: `Button`, `Input`, `Modal`, `LoadingSpinner`, `Navbar`, `Footer`, `Avatar`, `PrivateRoute`, `StatCard`, `StatusBadge`, etc. |
| `components/layout/*` | App shell: `Layout` (conditional Navbar vs Sidebar), `Header`, `Sidebar` (issuer nav), `AccountLayout`. |
| `components/credential/*` | All credential-related UI: issuance modals (single + bulk CSV), credential table/cards, filters, stats, QR display, revocation modal, SBT details modal. |
| `components/verification/*` | Public verification UI: `VerificationPortal` (file upload + hash input), `VerificationResult` (success/fail/revoked display), `VerificationSection` (landing page embed). |

---

## 5. Active State

**Phase:** Post-MVP Development / Production-Ready Demo.
**Architecture:** Distributed Full-Stack System (MERN + Solidity + IPFS).
**Deployment:** Vercel (Frontend), PaaS (Backend), Sepolia Testnet (Smart Contracts).

---

---

## 6. Conventions

### Code Style
- **Backend:** CommonJS (`require`/`module.exports`). No TypeScript.
- **Frontend:** ES Modules (`import`/`export`). JSX (not TSX). No TypeScript.
- **Formatting:** No enforced prettier config. 2-space indentation throughout.

### Naming Patterns
- **Files:** PascalCase for React components (`IssuerDashboard.jsx`), camelCase for everything else (`credentialController.js`).
- **Models:** PascalCase singular (`User.js`, `Credential.js`).
- **Routes:** Lowercase, map 1:1 with controllers (`auth.js` → `authController.js`).
- **Services:** camelCase + `Service` suffix (`blockchainService.js`). Exported as **singletons** (`module.exports = new BlockchainService()`).
- **CSS:** TailwindCSS utility classes inline, no CSS modules or styled-components.

### Architecture Rules
- **Services are singletons.** `blockchainService`, `ipfsService` are instantiated once at module load. This matters for the nonce mutex.
- **Controllers use `asyncHandler` wrapper.** Never write raw try/catch in route handlers — let the wrapper forward to `errorHandler`.
- **All blockchain write operations go through the backend** (admin wallet signs). Frontend only reads from the contract via MetaMask/ethers.
- **File uploads are temporary.** Generated PDFs and uploaded files are deleted after processing (IPFS is the permanent store).
- **Email sending is fire-and-forget.** `.catch()` logs errors but never blocks the response.
- **Role-based routing:** `/dashboard` and `/credentials` dynamically render different components based on `user.role` (ISSUER vs STUDENT) rather than separate routes.

### API Conventions
- All responses follow `{ success: true, ...data }` or `{ error: "message" }` pattern.
- Pagination: `{ pagination: { total, totalPages, currentPage, perPage } }`.
- Auth: `Authorization: Bearer <JWT>` header on all protected routes.

### Issuer Plan Limits
| Plan | Credential Limit |
|------|-----------------|
| STARTER | 5 |
| PRO | 500 |
| ENTERPRISE | Unlimited |

### Environment Variables

**Backend (`.env`):**
- `PORT`, `MONGO_URI`, `JWT_SECRET`
- `SEPOLIA_RPC_URL`, `ADMIN_PRIVATE_KEY`, `CONTRACT_ADDRESS`
- `PINATA_API_KEY`, `PINATA_SECRET_KEY`
- `FRONTEND_URL`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

**Frontend (`.env`):**
- `VITE_API_URL` — backend API base URL
- `VITE_CONTRACT_ADDRESS` — for frontend ethers.js reads

**Blockchain (`.env`):**
- `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY`

---

## 7. Update Protocol

> **For the AI assistant:** Follow these rules when working on this project.

1. **Context-First Thinking:** Before suggesting code, check this document for existing patterns, singletons, naming conventions, and known issues.
2. **Automatic Maintenance:** Every time the project structure changes (new file, renamed module, new feature, bug fix, or architectural decision), provide an updated markdown block targeting the specific section of this file.
3. **Delta Updates:** Do not rewrite the entire file. Specify the section header and the replacement markdown block.
4. **Consistency:** New services must be singletons. New controllers must use `asyncHandler`. New routes must follow the existing REST pattern.
5. **Known Issues:** When a bug is fixed, remove it from the Known Bugs table. When a new bug is discovered, add it.
