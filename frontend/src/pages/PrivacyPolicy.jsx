import React from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { Lock } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative">
      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-400 text-lg">Last updated: May 15, 2026</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl space-y-12">
            
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="text-gray-400 leading-relaxed">
                    Attestify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our decentralized credential verification platform. By using Attestify, you agree to the collection and use of information in accordance with this policy.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                    <p>
                        <strong>Blockchain Data:</strong> Due to the nature of blockchain technology, transactions executed on the Ethereum network are public, irreversible, and permanent. This includes wallet addresses, transaction hashes, and metadata associated with Soulbound Tokens (SBTs).
                    </p>
                    <p>
                        <strong>User Account Data:</strong> We collect information you provide directly to us when creating an account, such as your name, email address, and institutional affiliation.
                    </p>
                    <p>
                        <strong>Usage Data:</strong> We may collect information on how the Service is accessed and used, including your browser type, time of visit, and pages viewed.
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Decentralized Storage (IPFS)</h2>
                <p className="text-gray-400 leading-relaxed">
                    Credential documents (PDFs) are stored on the InterPlanetary File System (IPFS). While IPFS is a public network, files are content-addressed. We generally do not encrypt public transcripts by default to allow for public verification, but sensitive documents can be encrypted if the issuing institution chooses to do so. Please be aware that data on IPFS may be replicated across multiple nodes.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Your Rights</h2>
                <p className="text-gray-400 leading-relaxed">
                    Under GDPR and CCPA, you serve the right to access, update, or delete your personal information held in our centralized databases (e.g., user profiles). However, please note that <strong>we cannot delete or alter data that has been written to the Ethereum blockchain</strong>, as immutability is a core feature of the technology.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                <p className="text-gray-400 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at: <br/>
                    <a href="mailto:privacy@attestify.io" className="text-indigo-400 hover:text-indigo-300 transition-colors">privacy@attestify.io</a>
                </p>
            </section>

        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
