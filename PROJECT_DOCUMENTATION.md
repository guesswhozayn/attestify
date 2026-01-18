# PROJECT DOCUMENTATION

## Chapter 1: Introduction of the Project

### 1.1. Introduction
Attestify is a cutting-edge, decentralized application (DApp) designed to revolutionize the way academic and professional credentials are issued, stored, and verified. By leveraging the power of blockchain technology, Attestify removes the need for centralized intermediaries, ensuring that credentials are tamper-proof, immutable, and easily verifiable globally. The platform allows institutions to issue digital certificates that are cryptographically secured on the Ethereum blockchain, while enabling third parties (employers, other institutions) to instantly verify their authenticity without manually contacting the issuer.

### 1.2. Scope
The scope of this project encompasses the development of a full-stack web application that serves three main user roles: **Admins (Issuers)**, **Students (Holders)**, and **Verifiers**. The system covers the entire lifecycle of a credential:
1.  **Issuance:** Generation of digital certificates and recording their unique cryptographic hash on the blockchain.
2.  **Storage:** Secure storage of certificate metadata and files (using decentralized storage like IPFS or secure cloud storage) references.
3.  **Verification:** A public interface for verifying the authenticity of a document by comparing its hash against the immutable record on the blockchain.
The project is designed to be scalable and can be adapted for various types of documentation beyond academic degrees, such as certifications, licenses, and legal documents.

### 1.3. Purpose
The basic purpose of Attestify is to combat credential fraud and streamline the background check process. Traditional methods of verifying documents are slow, expensive, and prone to error or forgery. Attestify aims to provide a "trustless" system—where trust is established by code and cryptography rather than reputation—to guarantee that a document presented by an individual was indeed issued by a legitimate entity and has not been altered since its issuance.

### 1.4. Objective
The key objectives of the project are:
*   To eliminate counterfeit academic degrees and professional certificates.
*   To provide an instant, real-time verification mechanism available 24/7.
*   To reduce the administrative burden and costs associated with manual verification for institutions.
*   To give individuals ownership and control over their digital credentials.
*   To demonstrate the practical application of blockchain technology in solving real-world data integrity problems.

### 1.5. Tools and Technologies
**Frontend:**
*   **React + Vite:** For building a fast, interactive user interface.
*   **TailwindCSS:** For modern, responsive styling.
*   **Ethers.js:** For interacting with the Ethereum blockchain and smart contracts from the browser.
*   **React Router:** For single-page application navigation.
*   **Axios:** For API communication with the backend.

**Backend:**
*   **Node.js:** Runtime environment for the server.
*   **Express.js:** Web framework for handling API requests.
*   **MongoDB & Mongoose:** NoSQL database for managing user profiles, off-chain metadata, and logs.
*   **Nodemailer:** For sending email notifications.
*   **Multer:** For handling file uploads.

**Blockchain & Smart Contracts:**
*   **Solidity:** Programming language for writing smart contracts.
*   **Hardhat:** Development environment for compiling, deploying, and testing smart contracts.
*   **Ethereum (Sepolia Testnet / Localhost):** The underlying blockchain network.
*   **OpenZeppelin:** Standard libraries for secure smart contract development.

**System Requirements:**
*   **OS:** Linux, Windows, or macOS.
*   **Runtime:** Node.js (v18+ recommended).
*   **Browser:** Modern web browser with MetaMask wallet extension installed.
*   **Network:** Stable internet connection for interacting with the blockchain.

---

## Chapter 2: Literature Review & Existing Systems

### 2.1. Literature Review
Reviewing existing systems reveals limitations in centralized trust models, vulnerability to data tampering, and reliance on manual verification processes. The project aims to overcome these challenges through advanced Blockchain techniques.

*   **Existing System 1: Blockcerts (MIT Media Lab).** An open standard for blockchain credentials. While pioneering, early implementations often suffered from complex user experience and high gas fees on the Bitcoin network, limiting widespread institutional adoption.
*   **Existing System 2: OpenCerts (Singapore Government).** A successful implementation on Ethereum, but primarily designed for government use cases with specific schema requirements that may be rigid for diverse educational institutions.
*   **Existing System 3: Traditional Digital Badges (e.g., Credly).** These rely on a centralized server. If the service provider goes down or changes policies, the verification link breaks. They do not offer true self-sovereignty to the user.

*(Note: The above review highlights the evolution from centralized to decentralized systems and the specific trade-offs of existing DApps that Attestify aims to address through a more user-friendly and gas-efficient approach.)*

### 2.2. Problem Statement
**What problem does your software solve?**
Credential fraud is a multi-billion dollar global issue. "Degree mills" sell fake diplomas, and individuals can easily forge paper documents using modern editing software. Employers and universities spend significant time and money verifying these documents manually, often waiting weeks for a response.

**Why are you developing this system?**
To create a standard for immutable digital records that protects the reputation of educational institutions and employers while empowering candidates.

**Does the same system already exist?**
Yes, solutions like Blockcerts exist.

**If yes, how will a re-implementation aid your learning?**
Re-implementing this system allows for deep understanding of DApp architecture, smart contract security, cryptographic hashing, and the integration of Web2 (traditional backend) with Web3 (blockchain) technologies. It builds full-stack skills crucial for the future internet.

**What skills do you expect to learn?**
Smart contract development (Solidity), blockchain interaction (Ethers.js), full-stack integration, cybersecurity best practices, and decentralized storage concepts.

### 2.3. Proposed Solution
The proposed solution is **Attestify**, a decentralized platform where the "source of truth" is the Ethereum blockchain.
1.  **Issuance:** When an institution issues a certificate, the system computes the SHA-256 hash of the document content. This hash, along with the recipient's details, is stored in a smart contract.
2.  **Immutability:** Once the hash is on the blockchain, it cannot be changed or deleted. Any alteration to the physical or digital copy of the document will result in a completely different hash effectively flagging it as invalid.
3.  **Verification:** A verifier uploads a copy of the document or scans a QR code. The system generates the hash of the provided file and queries the smart contract. If the hash exists and matches, the document is authentic.

### 2.4. Comparative Analysis between Existing and Proposed Solution

| Feature | Existing Solution (Manual/Centralized) | Proposed Solution (Attestify) |
| :--- | :--- | :--- |
| **Data Storage** | Centralized Databases (vulnerable to hacks/admins) | Decentralized Blockchain (Immutable/Distributed) |
| **Verification Speed** | Slow (Days to Weeks) | Instant (Real-time) |
| **Cost** | High (Admin fees, third-party services) | Low (Minimal transacti on gas fees) |
| **Security** | Low (prone to forgery, SQL injection) | High (Cryptographically secured) |
| **Access** | Restricted (Business hours, permissioned) | Publicly available 24/7 |
| **Single Point of Failure** | Yes | No |

---

## Chapter 3: Software Requirements Specification

### 3.1. Functional Requirements
1.  **User Authentication:**
    *   Admins/Issuers must be able to log in securely (e.g., using JWT or Wallet connection).
2.  **Dashboard:**
    *   Issuers should view a history of issued certificates.
3.  **Certificate Issuance (Admin):**
    *   The Admins shall input student data (or select registered students) to generate a digital certificate.
    *   The system shall calculate the hash and interact with the smart contract.
4.  **Student Features:**
    *   **Profile:** Students can register, login, and view their personal profile.
    *   **Dashboard:** Students can view a list of all certifications issued to them.
    *   Students can download or share their credentials.
5.  **Certificate Verification (Verifier):**
    *   The system shall provide a public verification portal.
    *   Users can upload a PDF or enter a Certificate ID.
6.  **Email Notification:**
    *   The system shall email the digital certificate to the Student upon issuance.

### 3.2. Non-Functional Requirements
1.  **Security:** Smart contracts must be free of critical vulnerabilities (e.g., reentrancy attacks). User passwords must be hashed.
2.  **Performance:** Verification queries should return results in under 3 seconds.
3.  **Availability:** The web interface should be available 99.9% of the time. The blockchain data is available 100%.
4.  **Usability:** The interface must be intuitive for non-technical users.
5.  **Scalability:** The backend handles metadata off-chain to keep gas costs predictable.

### 3.3. Methodology and Software Lifecycle for This Project
**Methodology: Agile Development**
We adopted the Agile methodology for this project.
**Reasons:**
1.  **Iterative Approach:** Blockchain development is complex; Agile allows building the core smart contract first, testing it, and then building the frontend around it incrementally.
2.  **Flexibility:** Requirements for DApps often evolve as gas optimization and security patterns change. Agile accommodates these changes.
3.  **Continuous Testing:** Regular testing of smart contracts on testnets (Sepolia) ensures reliability before mainnet deployment.

The lifecycle includes: Requirement Gathering -> Smart Contract Design -> Backend API Dev -> Frontend Integration -> Testing (Unit & Integration) -> Deployment.

---

## Chapter 4: Design and Architecture

*(Note: Copy/Paste these prompts into an AI diagram generator like ChatGPT, Claude, or specialized UML tools).*

### 4.1. Entity Relationship Diagram (ERD)
**Prompt:**
> Create an Entity Relationship Diagram (ERD) for a Credential Verification System.
> Entities:
> 1. **User** (UserID, Name, Email, PasswordHash, Role[Admin, Student], University, WalletAddress, StudentID)
> 2. **Credential** (CredentialID, StudentID, StudentName, University, IssueDate, IPFS_CID, CertificateHash, TransactionHash, IsRevoked, RevocationReason, IssuedBy)
> 3. **AuditLog** (LogID, Action, PerformedBy, TargetCredential, Details, Timestamp)
> Relationships:
> - One User (Admin) issues many Credentials (via IssuedBy).
> - One User (Student) owns many Credentials (via StudentID).
> - One User performs many AuditLogs.
> - One Credential has many AuditLogs (related to issuance/revocation).
> Show primary keys, foreign keys, and cardinality (1:N).

### 4.2. Sequence Diagrams
**Prompt:**
> Create a Sequence Diagram for the "Issue Certificate" process.
> Actors: Admin (Issuer), Web Frontend, Backend API, Smart Contract.
> Steps:
> 1. Admin fills certificate form on Frontend.
> 2. Frontend sends data to Backend API.
> 3. Backend generates SHA-256 hash and uploads metadata to IPFS.
> 4. Backend returns Hash and IPFS CID to Frontend.
> 5. Frontend requests wallet signature from Admin (MetaMask).
> 6. Admin approves transaction.
> 7. Frontend calls `issueCertificate(studentId, hash, ipfsCID)` on Smart Contract.
> 8. Smart Contract emits `CredentialIssued` event.
> 9. Frontend confirms success to Admin.

### 4.2.b. Sequence Diagram (Student Journey)
**Prompt:**
> Create a Sequence Diagram for "Student View & Download Certificate".
> Actors: Student, Web Frontend, Backend API, Smart Contract.
> Steps:
> 1. Student logs in to Frontend.
> 2. Frontend requests Student Profile & Credentials from Backend.
> 3. Backend queries Database for Student's Certificates.
> 4. Backend returns List of Certificates.
> 5. Student selects a Certificate to view.
> 6. Frontend calls `verifyCredential(hash)` on Smart Contract to check validity.
> 7. Smart Contract returns valid status.
> 8. Student clicks "Download".
> 9. Frontend retrieves file from IPFS Gateway using CID.

### 4.2.c. Sequence Diagram (Verifier Journey)
**Prompt:**
> Create a Sequence Diagram for "Verifier Checks Certificate".
> Actors: Verifier, Web Frontend, Backend API, Smart Contract.
> Steps:
> 1. Verifier uploads Certificate PDF or enters ID on Frontend.
> 2. Frontend computes SHA-256 hash of the file.
> 3. Frontend calls `verifyCredential(hash)` on Smart Contract.
> 4. Smart Contract checks if hash exists and is not revoked.
> 5. Smart Contract returns status (Valid/Revoked/Not Found).
> 6. Frontend displays result to Verifier.

### 4.3. Architecture Design Diagram
**Prompt:**
> Create a High-Level System Architecture Diagram for a DApp called "Attestify".
> Components:
> 1. **Client Layer:** Web Browser (React App)
>    - **Admin Portal:** Dashboard, Issuance, Stats.
>    - **Student Portal:** Profile, My Credentials.
>    - **Verifier Interface:** Public Verification.
>    - **Wallet:** MetaMask Extension.
> 2. **Server Layer:** Node.js/Express Server.
> 3. **Database Layer:** MongoDB (stores user profiles, off-chain logs).
> 4. **Blockchain Layer:** Ethereum Network (Stores Smart Contracts & Certificate Hashes).
> 5. **Storage Layer:** IPFS (Stores actual certificate files/PDFs).
> Arrows:
> - Client <--> Server (HTTP/REST)
> - Client <--> Blockchain (RPC/JSON-RPC)
> - Server <--> Database
> - Server <--> Storage (IPFS)

### 4.4. Class Diagram
**Prompt:**
> Create a UML Class Diagram for the system.
> Class 1: **Attestify (Smart Contract)**
> - Properties: mapping(string => Credential), mapping(address => bool)
> - Methods: issueCertificate(), verifyCredential(), revokeCertificate()
> Class 2: **CredentialController (Backend)**
> - Methods: issueCredential(req, res), getCredentials(req, res), revokeCredential(req, res)
> Class 3: **User (Model)**
> - Properties: name, email, role[Admin, Student], university, walletAddress, studentId
> - Methods: login(), getProfile(), getMyCredentials()
> Class 4: **Credential (Model)**
> - Properties: studentId, certificateHash, ipfsCID, isRevoked
> Relationships: CredentialController uses User and Credential models. Attestify contract stores Credential structs.

### 4.5. Use Case Diagram
**Prompt:**
> Create a Use Case Diagram for the Attestify system.
> Actors: Admin (Issuer), Student, Verifier.
> Use Cases:
> - **Admin:** Login, Dashboard View, Input Student Details, Issue Certificate (Trigger Blockchain Transaction), View History, Revoke Certificate.
> - **Student:** Register, Login, View Profile, Manage Profile, View My Credentials, Download Certificate.
> - **Verifier:** Scan QR Code, Upload Certificate File, View Verification Result.
> System Boundary includes the Web Application and Smart Contract interactions.

### 4.6. Database Design
**Prompt:**
> Create a Database Schema Diagram for a MongoDB setup.
> Collections:
> 1. **Users**: `_id`, `name`, `email`, `password`, `role`, `university`, `walletAddress`, `studentId`
> 2. **Credentials**: `_id`, `studentId`, `studentName`, `university`, `issueDate`, `ipfsCID`, `certificateHash`, `transactionHash`, `issuedBy` (Ref User), `isRevoked`, `revocationReason`
> 3. **AuditLogs**: `_id`, `action`, `performedBy` (Ref User), `targetCredential` (Ref Credential), `details`, `createdAt`
> Show the fields and types.

### 4.7. Smart Contract Design
**Prompt:**
> Create a Smart Contract Architecture Diagram for "Attestify".
> Contract Name: **Attestify**.
> State Variables:
> - `mapping(string => Credential) public credentials` (Key is StudentID)
> - `mapping(address => bool) public authorizedIssuers`
> Events:
> - `event CredentialIssued(string indexed studentId, bytes32 certificateHash, address indexed issuer)`
> - `event CredentialRevoked(string indexed studentId)`
> Functions:
> - `constructor()`: Sets owner and authorizes deployer.
> - `issueCertificate(string _studentId, bytes32 _certificateHash, string _ipfsCID)`: Stores struct, emits event.
> - `verifyCredential(string _studentId, bytes32 _hash)`: Returns bool.
> - `revokeCertificate(string _studentId)`: Updates revoked status.
> Show visibility (public/external) and modifiers (onlyAuthorized, credentialExists).

### 4.8. Activity Diagram (System Workflow)
**Prompt:**
> Create a Swimlane Activity Diagram for the entire Attestify system.
> Lanes: **Admin**, **Student**, **Verifier**, **System (Frontend/Blockchain)**.
> Workflow:
> 1. **Admin** logs in -> Issues Certificate (Input Data).
> 2. **System** hashes data, pins to IPFS, and records on Blockchain.
> 3. **Student** receives email notification -> Logs in -> Views Profile.
> 4. **Student** views Certificate -> Downloads it.
> 5. **Student** shares Certificate with Verifier.
> 6. **Verifier** accesses Verification Portal -> Uploads Certificate.
> 7. **System** verifies hash on Blockchain -> Returns Status.
> 8. **Verifier** views Valid/Invalid result.
> Show decision points (e.g., Is Certificate Revoked?) and parallel actions.

---

## Chapter 5: Implementation Details

### 5.1. Project Directory Structure
The project is organized into three main monorepo-style directories:

*   **`backend/`**: Node.js/Express application.
    *   `src/controllers/`: Logic for handling requests.
    *   `src/models/`: Mongoose schemas.
    *   `src/routes/`: API route definitions.
*   **`blockchain/`**: Hardhat development environment.
    *   `contracts/`: Solidity smart contracts (`Attestify.sol`).
    *   `scripts/`: Deployment scripts.
    *   `test/`: Contract unit tests.
*   **`frontend/`**: React application.
    *   `src/components/`: Reusable UI components.
    *   `src/pages/`: Main application views.
    *   `src/services/`: API and Blockchain interaction logic.

### 5.2. Smart Contract Specification [Attestify.sol]
The core logic resides in the `Attestify` contract.

**Key Data Structures:**
*   `struct Credential`: Stores `studentId`, `certificateHash`, `ipfsCID`, `issuedAt`, `isRevoked`, and `issuedBy`.

**Key Events:**
*   `CredentialIssued`: Emitted when a new certificate is stored.
*   `CredentialRevoked`: Emitted when a certificate is marked as void.

**Core Functions:**
*   `issueCertificate(...)`: Stores the hash and IPFS CID on-chain. Prevent duplicates for the same student ID.
*   `revokeCertificate(...)`: Marks a credential as revoked. Only authorized issuers can call this.
*   `verifyCredential(...)`: Public view function that checks if a hash matches the stored record and ensures it hasn't been revoked.

### 5.3. API Documentation
The Backend API acts as a gateway and manages off-chain data.

**Credential Routes (`/api/credentials`):**
*   `POST /issue`: Issues a new certificate (Uploads file, pins to IPFS, triggers blockchain tx).
*   `GET /`: Fetches all issued certificates (Admin only).
*   `POST /:id/revoke`: Revokes a specific certificate.
*   `GET /student/:studentId`: Retrieves credentials for a specific student.

**Verification Routes (`/api/verify`):**
*   `POST /certificate`: Verifies an uploaded file by computing its hash and querying the chain.
*   `POST /hash`: Verifies a manually entered hash.
*   `GET /:studentId`: Checks existence of a credential for a student ID.

### 5.4. Frontend Application
Built with React and TailwindCSS, featuring distinct flows for different users.

**Key Pages:**
*   **Landing Page (`Landing.jsx`)**: Public home page with project overview.
*   **Verification Portal (`Verify.jsx`)**: Public interface for drag-and-drop or QR code verification.
*   **Admin Dashboard (`AdminDashboard.jsx`)**: Secure area for issuers to generate certificates and view stats.
*   **Authentication (`Login.jsx`, `Register.jsx`)**: Secure access control.

---

## Chapter 6: Conclusion
The Attestify project successfully demonstrates the application of blockchain technology to solve the critical issue of credential fraud. By combining a user-friendly React frontend with a secure Ethereum backend, the system offers a complete lifecycle solution for issuing, storing, and verifying academic and professional documents. The architecture ensures data integrity through immutability while providing a seamless experience for all stakeholders. Future work could include expanding to a multi-tenant SaaS model for multiple universities and integration with digital identity standards (DID).
