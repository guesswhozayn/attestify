import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';
import { 
  Shield, ChevronRight, BookOpen, Blocks, Fingerprint, 
  HardDrive, Lock, Server, ShieldCheck, HelpCircle,
  Menu, X, ArrowLeft, ExternalLink, Search
} from 'lucide-react';

const sections = [
  { id: 'introduction', label: 'Introduction', icon: BookOpen },
  { id: 'blockchain', label: 'Blockchain Technology', icon: Blocks },
  { id: 'soulbound', label: 'Soulbound Tokens', icon: Lock },
  { id: 'identity', label: 'Decentralized Identity', icon: Fingerprint },
  { id: 'ipfs', label: 'IPFS & Storage', icon: HardDrive },
  { id: 'cryptography', label: 'Cryptographic Verification', icon: ShieldCheck },
  { id: 'architecture', label: 'System Architecture', icon: Server },
  { id: 'security', label: 'Security Model', icon: Shield },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introduction');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, el } = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
          <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navbar - Floating Island Design */}
      <nav className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 ${isScrolled ? 'top-0 px-0' : 'top-6 px-2 sm:px-4'}`}>
        <div className={`w-full transition-all duration-300 flex items-center justify-between border-white/10 backdrop-blur-2xl ${
          isScrolled 
            ? 'max-w-full rounded-none border-b bg-black/80 px-6 py-3 shadow-lg' 
            : 'max-w-5xl rounded-full border bg-[#030014]/60 pl-6 pr-2 py-2 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:border-indigo-500/30'
        }`}>
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black p-[1px] border border-white/10 group-hover:scale-110 transition-transform duration-300">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                 </div>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors hidden sm:block">
              Attestify
            </span>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate('/')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full relative group">
               Home
            </button>
            <button onClick={() => navigate('/search')} className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full flex items-center gap-2 group">
               <Search className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
               Find Student
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate('/login')} 
                className="hidden sm:block px-5 py-2.5 text-sm font-bold text-white hover:text-indigo-300 transition-colors"
            >
                Sign In
            </button>
            <Button 
                onClick={() => navigate('/register')} 
                className="hidden sm:flex bg-white text-black hover:bg-indigo-50 hover:text-indigo-950 border-0 rounded-full px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] transition-all group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <span className="relative z-10">Get Started</span>
            </Button>
            
            {/* Mobile Menu Toggle */}
             <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors ml-2"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-20 bottom-0 w-72 bg-black border-l border-white/10 p-6 overflow-y-auto">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">Sections</p>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all ${
                  activeSection === s.id
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-20 flex max-w-[1400px] mx-auto relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="fixed w-72 top-20 bottom-0 overflow-y-auto border-r border-white/5 p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">Documentation</p>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all duration-200 ${
                  activeSection === s.id
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium border-l-2 border-indigo-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
                }`}
              >
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 lg:px-16 py-12 pb-32">

          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Theoretical Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              Understanding{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Attestify
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              A deep-dive into the theoretical foundations powering decentralized academic credential verification, 
              from blockchain immutability to Soulbound Tokens and cryptographic proof.
            </p>
          </div>

          {/* Introduction */}
          <Section id="introduction" title="Introduction" icon={BookOpen}>
            <SectionCard title="The Problem: Credential Fraud">
              <p>
                Academic credential fraud is a global epidemic. Studies estimate that millions of fraudulent 
                degrees are in circulation worldwide, costing institutions, employers, and legitimate graduates 
                billions of dollars annually. Traditional verification methods like phone calls, postal mail, and 
                centralized databases are slow, error-prone, and susceptible to manipulation.
              </p>
              <p className="mt-4">
                The core issue lies in the <Highlight>centralized trust model</Highlight>. When a single institution 
                is the sole custodian of credential records, that institution becomes a single point of failure. 
                Records can be lost, altered, or forged. Verification depends entirely on the institution's 
                continued existence and cooperation.
              </p>
            </SectionCard>
            <SectionCard title="The Solution: Decentralized Verification">
              <p>
                Attestify reimagines credential verification from first principles. Instead of trusting a single 
                institution to maintain records, we distribute trust across a decentralized network. By recording 
                credential data on a public blockchain and storing documents on a peer-to-peer file system, 
                Attestify creates a verification framework that is:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Tamper-Proof" text="Once recorded, credential data cannot be altered or deleted by any single party." />
                <InfoItem label="Universally Accessible" text="Anyone with an internet connection can verify a credential, anywhere in the world, at any time." />
                <InfoItem label="Institution-Independent" text="Credentials remain verifiable even if the issuing institution ceases to exist." />
                <InfoItem label="Student-Owned" text="Graduates maintain sovereignty over their own academic records." />
              </ul>
            </SectionCard>
          </Section>

          {/* Blockchain Technology */}
          <Section id="blockchain" title="Blockchain Technology" icon={Blocks}>
            <SectionCard title="What is a Blockchain?">
              <p>
                A blockchain is a <Highlight>distributed, append-only ledger</Highlight> maintained by a network 
                of independent nodes. Each block in the chain contains a cryptographic hash of the previous block, 
                a timestamp, and a set of transactions. Together, these form an unbreakable chain of records that extends 
                back to the genesis block.
              </p>
              <p className="mt-4">
                The fundamental properties that make blockchain suitable for credential verification are:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Immutability" text="Once a transaction is confirmed and included in a block, it becomes computationally infeasible to alter. Changing any historical data would require re-computing every subsequent block, a task that demands more computational power than the entire network combined." />
                <InfoItem label="Transparency" text="All transactions on a public blockchain are visible to anyone. This means credential records can be independently audited by any third party without requiring permission from a gatekeeper." />
                <InfoItem label="Decentralization" text="No single entity controls the network. Consensus mechanisms (such as Proof of Stake) ensure that all participants agree on the state of the ledger without needing a central authority." />
              </ul>
            </SectionCard>
            <SectionCard title="Why Ethereum?">
              <p>
                Attestify is deployed on the <Highlight>Ethereum network</Highlight>, specifically the Sepolia 
                testnet for development, with production-readiness for mainnet deployment. Ethereum was chosen 
                for several key reasons:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Smart Contracts" text="Ethereum natively supports Turing-complete smart contracts, which are self-executing programs that enforce business logic on-chain without intermediaries. These contracts govern all credential issuance, verification, and revocation logic." />
                <InfoItem label="ERC-721 Standard" text="The ERC-721 standard provides a well-established framework for non-fungible tokens (NFTs), which Attestify extends with Soulbound properties for credential representation." />
                <InfoItem label="Ecosystem Maturity" text="Ethereum has the largest smart contract developer ecosystem, the most battle-tested security tooling (OpenZeppelin), and the widest adoption among institutions exploring blockchain use cases." />
                <InfoItem label="Proof of Stake" text="Since The Merge (September 2022), Ethereum uses Proof of Stake consensus, reducing energy consumption by over 99.95% and addressing environmental concerns with blockchain technology." />
              </ul>
            </SectionCard>
            <SectionCard title="Gas & Transaction Costs">
              <p>
                Every operation on Ethereum requires <Highlight>gas</Highlight>, a unit measuring the 
                computational effort needed to execute a transaction. Gas costs are paid in ETH and vary 
                based on network congestion and the complexity of the operation.
              </p>
              <p className="mt-4">
                In Attestify, gas is consumed during three primary operations: <strong>credential issuance</strong> (minting 
                a Soulbound Token), <strong>credential revocation</strong> (burning a token), and <strong>issuer 
                authorization</strong> management. Read operations, such as verifying a credential, are free 
                because they don't modify the blockchain state.
              </p>
              <p className="mt-4">
                Attestify tracks gas consumption per transaction, providing institutions with real-time 
                cost analytics through the audit dashboard.
              </p>
            </SectionCard>
          </Section>

          {/* Soulbound Tokens */}
          <Section id="soulbound" title="Soulbound Tokens (SBTs)" icon={Lock}>
            <SectionCard title="The Concept">
              <p>
                Soulbound Tokens were first proposed by Ethereum co-founder <Highlight>Vitalik Buterin</Highlight> in 
                his 2022 paper <em>"Decentralized Society: Finding Web3's Soul"</em> (co-authored with E. Glen Weyl 
                and Puja Ohlhaver). SBTs are non-transferable tokens that represent commitments, credentials, 
                and affiliations. These are items inherently tied to an individual's identity that should not be 
                bought, sold, or traded.
              </p>
              <p className="mt-4">
                Traditional NFTs (like digital art or collectibles) derive value from their transferability. 
                Academic credentials are the opposite. A degree has meaning precisely <em>because</em> it cannot 
                be transferred from one person to another. This makes the Soulbound pattern a natural fit for 
                credential verification.
              </p>
            </SectionCard>
            <SectionCard title="How Attestify Implements SBTs">
              <p>
                Attestify implements Soulbound Tokens by extending the <Highlight>ERC-721 standard</Highlight> with 
                transfer restrictions at the smart contract level. The key mechanism is an override of the 
                internal <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">_update</code> function:
              </p>
              <CodeBlock language="solidity">{`function _update(
    address to, 
    uint256 tokenId, 
    address auth
) internal override returns (address) {
    address from = _ownerOf(tokenId);
    
    // Allow minting (from == 0) and burning (to == 0)
    // Disallow transfers between users
    if (from != address(0) && to != address(0)) {
        revert("Soulbound: Transfer not allowed");
    }
    
    return super._update(to, tokenId, auth);
}`}</CodeBlock>
              <p className="mt-4">
                This ensures that tokens can only be <strong>minted</strong> (issued to a student's wallet) or <strong>burned</strong> (revoked 
                by an authorized issuer). Any attempt to transfer a credential between wallets is rejected at 
                the protocol level. The credential is permanently "bound to the soul" of its recipient.
              </p>
            </SectionCard>
            <SectionCard title="Properties of Attestify SBTs">
              <ul className="space-y-3">
                <InfoItem label="Non-Transferable" text="Credentials cannot be sold, traded, or transferred to another wallet address, ensuring they always represent the original recipient." />
                <InfoItem label="Publicly Verifiable" text="Anyone can query the blockchain to confirm that a specific wallet holds a certain credential token." />
                <InfoItem label="Revocable" text="Authorized issuers can burn (revoke) a token if a credential is found to be fraudulent, awarded in error, or if other circumstances require it." />
                <InfoItem label="Metadata-Rich" text="Each SBT points to a token URI (stored on IPFS) containing detailed metadata about the credential, including institution, student, degree, date, and more." />
              </ul>
            </SectionCard>
          </Section>

          {/* Decentralized Identity */}
          <Section id="identity" title="Decentralized Identity" icon={Fingerprint}>
            <SectionCard title="Self-Sovereign Identity (SSI)">
              <p>
                Self-Sovereign Identity is a paradigm in which individuals <Highlight>own and control their own 
                identity data</Highlight> without depending on any central authority. In the traditional model, 
                your identity is verified by institutions like banks, governments, and universities, and you depend 
                on them to attest to who you are.
              </p>
              <p className="mt-4">
                Attestify aligns with SSI principles by eliminating the need for the issuing institution 
                to be actively involved in every verification. Once a credential is issued on-chain, the 
                student possesses a permanent, independently verifiable proof of their achievement.
              </p>
            </SectionCard>
            <SectionCard title="Wallet Addresses as Identifiers">
              <p>
                In Attestify, a student's <Highlight>Ethereum wallet address</Highlight> serves as their 
                decentralized identifier (DID). This address is a cryptographically derived pseudonym that 
                uniquely identifies the student within the system without revealing their real-world identity 
                by default.
              </p>
              <p className="mt-4">
                The wallet address provides several advantages as an identifier:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Globally Unique" text="Each Ethereum address is derived from a unique private key, making collisions statistically impossible." />
                <InfoItem label="Self-Generated" text="Students can generate their own addresses without requesting one from a central authority." />
                <InfoItem label="Cryptographically Secure" text="Ownership of an address can be proven by signing a message with the corresponding private key, without revealing the key itself." />
                <InfoItem label="Privacy-Preserving" text="Wallet addresses are pseudonymous. Real-world identity is only linked when voluntarily disclosed." />
              </ul>
            </SectionCard>
            <SectionCard title="The Role of MetaMask">
              <p>
                MetaMask and similar Web3 wallets serve as the bridge between users and the Ethereum network. 
                They securely manage private keys, sign transactions, and interact with smart contracts, all 
                within the user's browser. In the Attestify workflow, institutions connect their wallet 
                to authorize credential issuance, and students provide their wallet address to receive 
                Soulbound Tokens.
              </p>
            </SectionCard>
          </Section>

          {/* IPFS */}
          <Section id="ipfs" title="IPFS & Decentralized Storage" icon={HardDrive}>
            <SectionCard title="Content-Addressable Storage">
              <p>
                The <Highlight>InterPlanetary File System (IPFS)</Highlight> is a peer-to-peer protocol 
                for storing and sharing data in a distributed file system. Unlike traditional HTTP, where 
                content is located by <em>where</em> it lives (a URL pointing to a specific server), IPFS 
                locates content by <em>what</em> it is, using a cryptographic hash of the content itself.
              </p>
              <p className="mt-4">
                When a credential PDF is uploaded to IPFS, the protocol generates a unique <Highlight>Content 
                Identifier (CID)</Highlight>, a hash that is mathematically derived from the file's contents. 
                This means:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Integrity Guarantee" text="If even a single byte of the file is changed, the CID changes. The CID stored on-chain acts as a fingerprint. If the file retrieved from IPFS produces the same CID, the document is guaranteed to be authentic and unaltered." />
                <InfoItem label="Deduplication" text="Identical files always produce the same CID, preventing redundant storage across the network." />
                <InfoItem label="Persistence" text="Files on IPFS are stored across multiple nodes. As long as at least one node pins the file, it remains available, even if the original uploader goes offline." />
              </ul>
            </SectionCard>
            <SectionCard title="Why Not Store Documents On-Chain?">
              <p>
                Storing full documents directly on the Ethereum blockchain would be prohibitively expensive. 
                Blockchain storage costs are measured per byte, and a single PDF certificate could cost 
                hundreds of dollars in gas fees to store on-chain.
              </p>
              <p className="mt-4">
                Attestify uses a <Highlight>hybrid storage model</Highlight>: the credential's <strong>hash and 
                metadata</strong> are stored on the Ethereum blockchain (small, fixed-cost), while the <strong>full 
                document</strong> is stored on IPFS (cheap, scalable). The on-chain hash serves as an 
                anchor of truth. Anyone can retrieve the document from IPFS and verify its integrity 
                against the hash stored on the immutable ledger.
              </p>
            </SectionCard>
            <SectionCard title="Pinning with Pinata">
              <p>
                While IPFS is decentralized, files are only available while at least one node hosts them. 
                Attestify uses <Highlight>Pinata</Highlight>, a professional IPFS pinning service, to 
                ensure that credential documents remain persistently available. Pinning guarantees that 
                the credential PDF is always hosted on reliable infrastructure, even if the issuing 
                institution's own nodes go offline.
              </p>
            </SectionCard>
          </Section>

          {/* Cryptographic Verification */}
          <Section id="cryptography" title="Cryptographic Verification" icon={ShieldCheck}>
            <SectionCard title="SHA-256 Hashing">
              <p>
                At the core of credential verification is <Highlight>cryptographic hashing</Highlight>. 
                Attestify uses the SHA-256 algorithm to create a unique, fixed-length digest (hash) of 
                every credential document. This hash has several critical properties:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Deterministic" text="The same input always produces the exact same hash. This allows anyone to independently reproduce and verify the hash." />
                <InfoItem label="One-Way" text="It is computationally infeasible to reconstruct the original document from its hash. This protects the credential's content from being reverse-engineered." />
                <InfoItem label="Collision-Resistant" text="The probability of two different documents producing the same hash is astronomically low (1 in 2^256), meaning each credential has a unique fingerprint." />
                <InfoItem label="Avalanche Effect" text="Changing even a single character in the input produces a completely different hash, making any tampering immediately detectable." />
              </ul>
            </SectionCard>
            <SectionCard title="The Verification Process">
              <p>
                When a verifier wants to confirm a credential's authenticity, the following process occurs:
              </p>
              <div className="mt-4 space-y-4">
                <VerifyStep number="1" title="Query the Blockchain">
                  The verifier provides a wallet address or credential ID. The system queries the Attestify 
                  smart contract to retrieve the stored certificate hash and IPFS CID.
                </VerifyStep>
                <VerifyStep number="2" title="Retrieve the Document">
                  Using the IPFS CID from the blockchain record, the system fetches the original credential 
                  PDF from the decentralized storage network.
                </VerifyStep>
                <VerifyStep number="3" title="Recompute the Hash">
                  The retrieved document is hashed using SHA-256, producing a fresh digest.
                </VerifyStep>
                <VerifyStep number="4" title="Compare Hashes">
                  The freshly computed hash is compared against the hash stored on the blockchain. If they 
                  match, the credential is verified as authentic and unaltered. If they differ, the document 
                  has been tampered with.
                </VerifyStep>
              </div>
              <p className="mt-4">
                This process is <strong>trustless</strong>. The verifier does not need to contact or trust the 
                issuing institution. The mathematics of cryptographic hashing provide the proof.
              </p>
            </SectionCard>
            <SectionCard title="Digital Signatures">
              <p>
                Every credential issuance transaction is <Highlight>digitally signed</Highlight> by the 
                issuing institution's Ethereum wallet. This signature is based on <strong>Elliptic Curve 
                Digital Signature Algorithm (ECDSA)</strong> and proves that:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Authenticity" text="The transaction was created by the holder of the private key associated with the institution's wallet address." />
                <InfoItem label="Non-Repudiation" text="The institution cannot deny having issued the credential because the signature is permanently recorded on the blockchain." />
                <InfoItem label="Integrity" text="If the transaction data is altered after signing, the signature becomes invalid, preventing post-issuance tampering." />
              </ul>
            </SectionCard>
          </Section>

          {/* System Architecture */}
          <Section id="architecture" title="System Architecture" icon={Server}>
            <SectionCard title="Component Overview">
              <p>
                Attestify is composed of four interconnected systems, each serving a distinct role in the 
                credential lifecycle:
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <ArchCard
                  title="Backend API"
                  tech="Node.js + Express"
                  description="The orchestration layer. Handles authentication, business logic, PDF generation, and coordinates between the database, blockchain, and IPFS."
                />
                <ArchCard
                  title="Frontend Web App"
                  tech="React + Vite"
                  description="The user interface for institutions (issuance dashboard) and public verifiers (verification portal). Communicates with the backend via REST API."
                />
                <ArchCard
                  title="Smart Contract"
                  tech="Solidity on Ethereum"
                  description="On-chain credential registry. Manages Soulbound Token minting, revocation, issuer authorization, and hash-based verification."
                />
                <ArchCard
                  title="Mobile App"
                  tech="React Native + Expo"
                  description="QR code-based credential verification for mobile users. Scans credential QR codes and displays verification results in real-time."
                />
              </div>
            </SectionCard>
            <SectionCard title="Data Flow: Credential Issuance">
              <div className="space-y-4">
                <FlowStep number="1" title="Data Submission">
                  An institution submits student data (name, wallet address, degree details) through the 
                  web dashboard. The data is sent to the Backend API via an authenticated REST request.
                </FlowStep>
                <FlowStep number="2" title="PDF Generation">
                  The backend generates a professional PDF certificate using PDFKit, incorporating the 
                  institution's branding (logo, seal, signature) and a QR code linking to the verification portal.
                </FlowStep>
                <FlowStep number="3" title="IPFS Upload">
                  The PDF is uploaded to IPFS via Pinata, returning a Content Identifier (CID) that 
                  uniquely addresses the document on the decentralized storage network.
                </FlowStep>
                <FlowStep number="4" title="Blockchain Recording">
                  The backend calls the Attestify smart contract, minting a Soulbound Token to the 
                  student's wallet. The credential hash and IPFS CID are stored on-chain as part of the 
                  token metadata.
                </FlowStep>
                <FlowStep number="5" title="Database Record">
                  A record is created in MongoDB containing credential metadata, transaction hashes, 
                  and references. This provides fast queries for the dashboard and audit trail.
                </FlowStep>
              </div>
            </SectionCard>
            <SectionCard title="Data Flow: Credential Verification">
              <div className="space-y-4">
                <FlowStep number="1" title="Verification Request">
                  A verifier submits a wallet address or credential ID through the web portal, mobile app, 
                  or QR code scan.
                </FlowStep>
                <FlowStep number="2" title="Blockchain Query">
                  The system queries the smart contract (a read-only, gas-free operation) to retrieve the 
                  credential record, including hash and revocation status.
                </FlowStep>
                <FlowStep number="3" title="Document Retrieval">
                  The credential PDF is fetched from IPFS using the stored CID.
                </FlowStep>
                <FlowStep number="4" title="Verification Result">
                  The cryptographic hash is verified, and the result (valid, revoked, or not found) is 
                  displayed alongside the full credential details.
                </FlowStep>
              </div>
            </SectionCard>
          </Section>

          {/* Security Model */}
          <Section id="security" title="Security Model" icon={Shield}>
            <SectionCard title="Threat Model">
              <p>
                Attestify is designed to defend against a range of adversarial scenarios:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Credential Forgery" text="Addressed by storing cryptographic hashes on an immutable blockchain. A forged credential will not produce the same hash as the on-chain record." />
                <InfoItem label="Unauthorized Issuance" text="Prevented by the onlyAuthorized modifier in the smart contract. Only whitelisted issuer addresses can mint credentials." />
                <InfoItem label="Credential Transfer" text="The Soulbound mechanism prevents credential tokens from being transferred between wallets, ensuring degrees cannot be sold or reassigned." />
                <InfoItem label="Data Tampering" text="Both blockchain immutability and IPFS content-addressing make post-issuance modification of credential data detectable and futile." />
                <InfoItem label="Single Point of Failure" text="Eliminated by decentralized storage (IPFS) and decentralized consensus (Ethereum). No single server outage can destroy credential records." />
              </ul>
            </SectionCard>
            <SectionCard title="Smart Contract Security Patterns">
              <p>
                The Attestify smart contract employs industry-standard security patterns from the <Highlight>OpenZeppelin</Highlight> library:
              </p>
              <ul className="mt-4 space-y-3">
                <InfoItem label="Ownable" text="Restricts administrative functions (such as authorizing new issuers) to the contract owner, preventing unauthorized privilege escalation." />
                <InfoItem label="ReentrancyGuard" text="Protects against reentrancy attacks, a class of exploits where a malicious contract calls back into the victim contract before the first invocation completes." />
                <InfoItem label="Access Control Modifiers" text="Custom modifiers (onlyAuthorized, credentialExists) enforce preconditions before any state-changing operation, following the checks-effects-interactions pattern." />
                <InfoItem label="Input Validation" text="All contract functions validate inputs (non-zero hashes, non-empty CIDs, valid addresses) before execution, preventing garbage data from entering the on-chain registry." />
              </ul>
            </SectionCard>
            <SectionCard title="Application-Level Security">
              <ul className="space-y-3">
                <InfoItem label="JWT Authentication" text="All API routes are protected by JSON Web Token authentication, ensuring that only verified users can access sensitive endpoints." />
                <InfoItem label="Password Hashing" text="User passwords are hashed using bcrypt with salt rounds, preventing plaintext exposure even if the database is compromised." />
                <InfoItem label="Role-Based Access Control" text="The system enforces distinct roles (INSTITUTE, STUDENT) with different permission sets, preventing students from accessing issuance functions." />
                <InfoItem label="Input Sanitization" text="All user inputs are validated and sanitized on both client and server sides, mitigating injection attacks." />
                <InfoItem label="Audit Logging" text="Every credential operation (issuance, revocation, verification) is logged in the audit trail, providing complete accountability." />
              </ul>
            </SectionCard>
          </Section>

          {/* FAQ */}
          <Section id="faq" title="Frequently Asked Questions" icon={HelpCircle}>
            <FAQItem question="What happens if the issuing institution shuts down?">
              Because credentials are stored on the Ethereum blockchain and IPFS, they remain fully 
              verifiable regardless of the issuing institution's status. The blockchain is maintained 
              by thousands of independent nodes worldwide, and IPFS ensures the credential document 
              persists as long as it is pinned by at least one node.
            </FAQItem>
            <FAQItem question="Can a degree be faked by minting a token from a different wallet?">
              No. Each issuing institution's wallet address is registered as an authorized issuer in the 
              smart contract. Only whitelisted addresses can mint credentials. A verifier can check the 
              issuer's on-chain address to confirm it belongs to a legitimate institution.
            </FAQItem>
            <FAQItem question="Why are Soulbound Tokens better than regular NFTs for credentials?">
              Regular NFTs can be freely transferred, sold, or traded, which would allow someone to buy 
              a degree they didn't earn. Soulbound Tokens are permanently bound to the recipient's wallet, 
              reflecting the real-world property that academic achievements are personal and non-transferable.
            </FAQItem>
            <FAQItem question="Is verification truly free?">
              Yes. Blockchain read operations (queries) do not consume gas and are completely free. Only 
              write operations (issuance, revocation) require gas fees, which are paid by the issuing 
              institution.
            </FAQItem>
            <FAQItem question="How does Attestify handle student privacy?">
              Wallet addresses are pseudonymous and don't inherently reveal a student's real-world 
              identity. Students choose what information to share and with whom. The on-chain record 
              contains hashes and CIDs, not plaintext personal data.
            </FAQItem>
            <FAQItem question="What blockchain network does Attestify use?">
              Attestify is currently deployed on the Ethereum Sepolia testnet for development and 
              demonstration purposes. The smart contract is designed for seamless deployment to 
              Ethereum mainnet or compatible Layer 2 networks for production use.
            </FAQItem>
          </Section>

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span className="text-lg font-bold text-white">Attestify</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2026 Attestify. Building the trust layer for credential verification.
          </p>
        </div>
      </footer>
    </div>
  );
};

/* ========== Reusable Sub-Components ========== */

const Section = ({ id, title, icon: Icon, children }) => (
  <section id={id} className="mb-20 scroll-mt-28">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-6">{children}</div>
  </section>
);

const SectionCard = ({ title, children }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 hover:border-white/10 transition-colors duration-300">
    {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
    <div className="text-gray-400 leading-relaxed">{children}</div>
  </div>
);

const Highlight = ({ children }) => (
  <span className="text-indigo-300 font-medium">{children}</span>
);

const InfoItem = ({ label, text }) => (
  <li className="flex items-start gap-3">
    <ChevronRight className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
    <span>
      <strong className="text-white">{label}:</strong>{' '}
      <span className="text-gray-400">{text}</span>
    </span>
  </li>
);

const CodeBlock = ({ language, children }) => (
  <div className="mt-4 rounded-xl bg-black border border-white/10 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
      <span className="ml-2 text-xs text-gray-500 font-mono">{language}</span>
    </div>
    <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
      <code>{children}</code>
    </pre>
  </div>
);

const VerifyStep = ({ number, title, children }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-indigo-500/20 text-sm font-bold text-indigo-400">
      {number}
    </div>
    <div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  </div>
);

const FlowStep = ({ number, title, children }) => (
  <div className="relative flex gap-4 pl-2">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 text-xs font-bold text-indigo-400 flex-shrink-0">
        {number}
      </div>
      <div className="w-px h-full bg-gradient-to-b from-gray-700 to-transparent mt-2" />
    </div>
    <div className="pb-6">
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  </div>
);

const ArchCard = ({ title, tech, description }) => (
  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-indigo-500/30 transition-colors duration-300">
    <h4 className="text-white font-semibold mb-1">{title}</h4>
    <p className="text-indigo-400 text-xs font-mono mb-2">{tech}</p>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const FAQItem = ({ question, children }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 hover:border-white/10 transition-colors duration-300">
    <h3 className="text-white font-semibold mb-3 flex items-start gap-3">
      <HelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
      {question}
    </h3>
    <p className="text-gray-400 leading-relaxed pl-8">{children}</p>
  </div>
);

export default Documentation;
