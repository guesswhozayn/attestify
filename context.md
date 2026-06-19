# Attestify - Project Context & Architecture Map

> [!NOTE]
> This file serves as the single source of truth for the project's structure, tech stack, and workflows. **AI Coding Assistants should read this file first** to avoid scanning the entire project, which conserves token usage.

*Last Refactored / Updated:* 2026-06-19 11:10:56 UTC
*Automated Update Script:* Run `node scripts/update-context.js` to refresh the directory map and timestamp.

---

## 1. System Overview
**Attestify** is a blockchain-based academic credential and transcript verification platform. It allows universities and educational institutions (authorized as **Issuers**) to issue tamper-proof certificates (transcripts or certifications) to students.
Key capabilities include:
1. **Decentralized Integrity**: Credentials are hashed (SHA-256) and verified on-chain via an Ethereum smart contract.
2. **Soulbound Tokens (SBT)**: Certificates can be minted as non-transferable ERC-721 tokens (SBTs) directly to student wallets.
3. **Decentralized Storage**: PDF certificates and metadata are uploaded to IPFS (via Pinata) for long-term decentralized availability.
4. **Automated Verification**: Anyone can verify a credential by uploading the PDF file or inputting its hash and the student's wallet address.
5. **Batch Issuance**: Supports CSV-based bulk uploading to issue multiple credentials in a single gas-efficient transaction.

---

## 2. Tech Stack

### Backend
- **Core:** Node.js (CommonJS modules - `require()`), Express
- **Database:** MongoDB via Mongoose
- **Blockchain Interface:** Ethers.js v6
- **PDF Generation:** PDFKit
- **Mailing:** Nodemailer
- **File Uploads:** Multer
- **IPFS Storage:** Pinata API via Axios & FormData

### Frontend
- **Core:** React 19 (Vite, ES Modules), React Router DOM v7
- **Styling:** TailwindCSS v4 (integrated with `@tailwindcss/vite`)
- **Animation:** Framer Motion
- **Blockchain Connectivity:** Ethers.js v6
- **Utilities:** pdf-lib (PDF reading/writing), html2canvas, html-to-image, js-sha256

### Blockchain & Smart Contracts
- **Core:** Solidity ^0.8.20
- **Framework:** Hardhat
- **Base Implementations:** OpenZeppelin Contracts (ERC721URIStorage, Ownable, ReentrancyGuard)

---

## 3. Directory Structure
Below is the directory map. This tree is automatically generated and updated.

<!-- DIRECTORY_TREE_START -->
.
├── backend
│   ├── logs
│   ├── scripts
│   │   └── drain_stuck_nonces.js
│   ├── src
│   │   ├── config
│   │   │   ├── constants.js
│   │   │   ├── contractABI.json
│   │   │   └── database.js
│   │   ├── controllers
│   │   │   ├── authController.js
│   │   │   ├── credentialController.js
│   │   │   ├── fileController.js
│   │   │   ├── networkController.js
│   │   │   ├── userController.js
│   │   │   └── verifyController.js
│   │   ├── middleware
│   │   │   ├── asyncHandler.js
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── roleCheck.js
│   │   │   └── upload.js
│   │   ├── models
│   │   │   ├── Credential.js
│   │   │   └── User.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── credentials.js
│   │   │   ├── files.js
│   │   │   ├── network.js
│   │   │   ├── user.js
│   │   │   └── verify.js
│   │   ├── services
│   │   │   ├── blockchainService.js
│   │   │   ├── emailService.js
│   │   │   ├── hashService.js
│   │   │   ├── ipfsService.js
│   │   │   └── pdfService.js
│   │   ├── utils
│   │   │   └── mutex.js
│   │   └── server.js
│   └── package.json
├── blockchain
│   ├── contracts
│   │   └── Attestify.sol
│   ├── scripts
│   │   └── deploy.js
│   ├── deployment-info.json
│   ├── hardhat.config.js
│   └── package.json
├── frontend
│   ├── public
│   │   ├── attestify-black.png
│   │   ├── attestify-white.png
│   │   ├── favicon.svg
│   │   └── shield-logo.png
│   ├── src
│   │   ├── components
│   │   │   ├── credential
│   │   │   │   ├── BulkIssueModal.jsx
│   │   │   │   ├── CredentialBadge.jsx
│   │   │   │   ├── CredentialDetails.jsx
│   │   │   │   ├── CredentialRow.jsx
│   │   │   │   ├── CredentialsFilter.jsx
│   │   │   │   ├── CredentialsStats.jsx
│   │   │   │   ├── CredentialTable.jsx
│   │   │   │   ├── DetailedCredentialCard.jsx
│   │   │   │   ├── IssueCredentialModal.jsx
│   │   │   │   ├── QRCodeDisplay.jsx
│   │   │   │   ├── RevokeCredentialModal.jsx
│   │   │   │   ├── SBTDetailsModal.jsx
│   │   │   │   ├── StudentStats.jsx
│   │   │   │   └── TypeSelectionCard.jsx
│   │   │   ├── dashboard
│   │   │   │   └── RecentActivityList.jsx
│   │   │   ├── landing
│   │   │   │   └── PilotIntegrationHub.jsx
│   │   │   ├── layout
│   │   │   │   ├── AccountLayout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Notification.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── shared
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── BackButton.jsx
│   │   │   │   ├── BackgroundEffects.jsx
│   │   │   │   ├── BrandLogo.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── GradientBackground.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── PoweredBy.jsx
│   │   │   │   ├── PrivateRoute.jsx
│   │   │   │   ├── RefreshButton.jsx
│   │   │   │   ├── ScrollToTop.jsx
│   │   │   │   ├── SectionHeader.jsx
│   │   │   │   ├── ShieldLogo.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── Toggle.jsx
│   │   │   │   └── WelcomeHeroCard.jsx
│   │   │   └── verification
│   │   │       ├── VerificationPortal.jsx
│   │   │       ├── VerificationResult.jsx
│   │   │       └── VerificationSection.jsx
│   │   ├── context
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks
│   │   │   ├── useAuth.js
│   │   │   └── useNotification.js
│   │   ├── pages
│   │   │   ├── About.jsx
│   │   │   ├── CredentialArchive.jsx
│   │   │   ├── Documentation.jsx
│   │   │   ├── IssuerDashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NetworkStatus.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PartnershipGuide.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RevokedCredentials.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── StudentCredentials.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── Verify.jsx
│   │   ├── services
│   │   │   ├── api.js
│   │   │   ├── blockchain.js
│   │   │   └── ipfs.js
│   │   ├── utils
│   │   │   ├── avatarUtils.js
│   │   │   ├── hash.js
│   │   │   └── pdf.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── scripts
│   └── update-context.js
├── context.md
└── README.md
<!-- DIRECTORY_TREE_END -->

---

## 4. Key Workflows & Data Pipelines

### A. Credential Generation & Issuance
1. **Request:** The Issuer submits student details (e.g. transcript courses, grades, or certification level) along with an optional avatar/image to `/api/credentials/issue` or `/api/credentials/batch-issue`.
2. **PDF Generation:** The backend uses `pdfService` to construct a beautifully formatted A4 PDF. A custom verification QR code is embedded.
3. **IPFS Upload:** The PDF file is uploaded to IPFS via Pinata. A JSON metadata file containing the credential details and IPFS hash is also optionally pinned.
4. **On-Chain Registration:** 
   - For standard credentials, the backend calculates the SHA-256 hash of the certificate data/file. It calls `issueCertificate` on the `Attestify.sol` smart contract using the admin private key.
   - For Soulbound Credentials, it calls `safeMint` or `safeMintBatch` to mint the non-transferable token to the student's wallet address.
5. **Database Sync:** The transaction hash, block number, token ID (if SBT), IPFS CID, and gas costs are saved to MongoDB.

### B. Verification Flow
1. **File Hashing:** A verifier uploads a PDF certificate on the `/verify` portal. The frontend computes its SHA-256 hash locally.
2. **Smart Contract Lookup:** The portal queries `verifyCredential(studentWalletAddress, hash)` on the smart contract.
3. **Validation:** If the hash matches the on-chain record and is not flagged as revoked, the system displays the credential's details, issuer, and block validation confirmation.

### C. Revocation Flow
1. **Issuer Request:** The Issuer inputs a revocation reason and triggers revocation for a specific student ID or token ID.
2. **On-Chain Burn/Flag:** The backend submits a transaction to call `revokeCertificate` or `revokeToken` (burning the SBT).
3. **Database Update:** Once confirmed, the document is flagged `isRevoked: true` in MongoDB with the timestamp and reason.

---

## 5. Coding & Style Conventions

1. **CommonJS Backend:** The backend uses standard Node.js module exports (`module.exports`) and imports (`require`). Do not use ES modules syntax in backend files.
2. **ESM Frontend:** The frontend uses ES Modules (`import`/`export`).
3. **Solidity & Hardhat:** Keep Solidity contracts in `blockchain/contracts` and deployment scripts in `blockchain/scripts`. Contract compilation artifacts are git-ignored.
4. **Secure File Access:** Uploaded student avatars are served statically. However, certificates/PDFs must be checked and downloaded through `fileController`/`fileAPI` to prevent unauthorized document exposure.
5. **Error Handling:** All Express routes must use `asyncHandler` or proper try/catch blocks to delegate failures to the central `errorHandler` middleware.

---

## 6. How to Update This Context File

Whenever a **refactor**, **database schema modification**, **new dependency addition**, or **architectural change** occurs, you MUST:
1. Update sections 1, 2, 4, or 5 if there are structural changes.
2. Run the update script to refresh the file tree and timestamp:
   ```bash
   node scripts/update-context.js
   ```
3. Commit the updated `context.md` along with your code changes.
