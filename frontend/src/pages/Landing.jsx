import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Users, CheckCircle, Upload } from 'lucide-react';
import Button from '../components/shared/Button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                 <Shield className="w-6 h-6 text-white text-bold" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Attestify
              </span>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/docs')} variant="ghost" className="text-gray-300 hover:text-white">
                Docs
              </Button>
              <Button onClick={() => navigate('/login')} variant="ghost" className="text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} variant="primary" className="shadow-lg shadow-indigo-500/20">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Live on Sepolia Testnet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Secure Credentials <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              on the Blockchain
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Attestify is the standard for decentralized academic verification. 
            Issue tamper-proof certificates, verified instantly anywhere in the world.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button onClick={() => navigate('/register')} size="lg" className="px-8 py-6 text-lg shadow-xl shadow-indigo-500/25 border-t border-white/10">
              Issue Credentials <span className="ml-2">→</span>
            </Button>
            <Button onClick={() => navigate('/verify')} variant="outline" size="lg" className="px-8 py-6 text-lg border-gray-700 hover:bg-gray-800 hover:text-white">
              Verify Certificate
            </Button>
          </div>

          {/* Abstract Dashboard Preview or 3D Element Placeholder */}
          <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-500">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10"></div>
              {/* Mock UI Header */}
             <div className="h-12 border-b border-gray-800 bg-gray-950 flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
             </div>
             {/* Mock UI Content */}
             <div className="p-8 grid md:grid-cols-3 gap-6 opacity-80">
                <div className="h-40 bg-gray-800/50 rounded-xl border border-gray-700/50 animate-pulse delay-75"></div>
                <div className="h-40 bg-gray-800/50 rounded-xl border border-gray-700/50 animate-pulse delay-150"></div>
                <div className="h-40 bg-gray-800/50 rounded-xl border border-gray-700/50 animate-pulse delay-300"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-32 bg-gray-950 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Attestify?</h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                  Traditional verification is slow and insecure. We built a platform that brings trust and speed to credential management.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <FeatureCard
                  icon={Lock}
                  title="Immutable Security"
                  description="Credentials are hashed and stored on the Ethereum blockchain, making them mathematically impossible to forge or alter."
                  gradient="from-blue-500/20 to-blue-600/5"
                  iconColor="text-blue-400"
               />
               <FeatureCard
                  icon={FileCheck}
                  title="Instant Verification"
                  description="Verify any certificate in seconds. No more phone tag with universities or waiting weeks for background checks."
                  gradient="from-purple-500/20 to-purple-600/5"
                  iconColor="text-purple-400"
               />
               <FeatureCard
                  icon={Users}
                  title="Decentralized Ownership"
                  description="Students own their data. Certificates are stored on IPFS, ensuring availability even if an institution closes."
                  gradient="from-emerald-500/20 to-emerald-600/5"
                  iconColor="text-emerald-400"
               />
            </div>
         </div>
      </div>

      {/* How It Works */}
      <div className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connector Line */}
             <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-800 via-indigo-500/50 to-gray-800 z-0 scale-x-75"></div>

            <StepCard
              number="01"
              title="Issue"
              description="University uploads the transcript. A unique hash is generated and signed with their digital key."
              icon={Upload}
            />
            <StepCard
              number="02"
              title="Secure"
              description="The hash is stored on the Ethereum blockchain, while the file lives securely on IPFS."
              icon={FileCheck}
            />
            <StepCard
              number="03"
              title="Verify"
              description="Employers or students can instantly verify the certificate's authenticity against the blockchain record."
              icon={CheckCircle}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-2 mb-6">
                   <Shield className="w-6 h-6 text-indigo-500" />
                   <span className="text-xl font-bold text-white">Attestify</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                   Building the trust layer for the internet. Empowering students and institutions with blockchain-verified credentials.
                </p>
             </div>
             
             <div>
                <h4 className="text-white font-semibold mb-6">Platform</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                   <li><button onClick={() => navigate('/login')} className="hover:text-indigo-400 transition-colors">Portal</button></li>
                   <li><button onClick={() => navigate('/verify')} className="hover:text-indigo-400 transition-colors">Verification</button></li>
                   <li><button onClick={() => navigate('/docs')} className="hover:text-indigo-400 transition-colors">Documentation</button></li>
                </ul>
             </div>

             <div>
                <h4 className="text-white font-semibold mb-6">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500">
                   <li><span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
                   <li><span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
                </ul>
             </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Connect</h4>
                <div className="flex space-x-4">
                   {/* Social placeholders */}
                   <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors cursor-pointer"></div>
                   <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors cursor-pointer"></div>
                   <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors cursor-pointer"></div>
                </div>
             </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
             <p>&copy; 2026 Attestify. All rights reserved.</p>
             <p className="mt-4 md:mt-0 flex items-center gap-2">
                Made with <span className="text-red-500">♥</span> for Web3
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient, iconColor }) => {
  return (
    <div className={`group relative p-8 rounded-3xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1 hover:border-gray-700/80`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500`}></div>
      <div className="relative z-10">
         <div className={`w-14 h-14 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 border border-gray-700 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
           <Icon className="w-7 h-7" />
         </div>
         <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">{title}</h3>
         <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, description, icon: Icon }) => (
  <div className="relative z-10 bg-gray-950 border border-gray-800 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-colors duration-300">
    <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-xl border border-gray-700">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-950 px-4 py-1 rounded-full border border-gray-800 text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">
       Step {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
