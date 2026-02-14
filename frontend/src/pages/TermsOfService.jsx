import React from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative">
      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-gray-400 text-lg">Last updated: May 15, 2026</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl space-y-12">
            
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-400 leading-relaxed">
                    By accessing or using the Attestify Protocol, website, and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Blockchain Transactions</h2>
                <p className="text-gray-400 leading-relaxed">
                    Attestify interacts with the Ethereum blockchain. You acknowledge that:
                </p>
                <ul className="list-disc pl-5 mt-4 text-gray-400 space-y-2">
                    <li>Transactions on the blockchain are irreversible.</li>
                    <li>You are responsible for the security of your private keys and wallet access.</li>
                    <li>Gas fees are required for write operations (issuance/revocation) and are paid by the user to the network, not to Attestify.</li>
                    <li>We have no control over the Ethereum network and cannot reverse or refund transactions.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
                <p className="text-gray-400 leading-relaxed">
                    Institutions warrant that all credentials issued via the protocol are accurate and authorized. Students warrant that they will not attempt to fraudulently claim credentials or manipulate the verification system. Any attempt to exploit the smart contracts or API will result in immediate termination of access.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
                <p className="text-gray-400 leading-relaxed">
                    To the maximum extent permitted by law, Attestify shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the Service or the blockchain network.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Governing Law</h2>
                <p className="text-gray-400 leading-relaxed">
                    These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
                </p>
            </section>

        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
