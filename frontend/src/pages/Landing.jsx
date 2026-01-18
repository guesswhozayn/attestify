import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileCheck, Users, CheckCircle, Upload, Search, QrCode } from 'lucide-react';
import Button from '../components/shared/Button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Attestify
              </span>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/login')} variant="ghost">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} variant="primary">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Academic Credentials
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              on the Blockchain
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Attestify uses blockchain technology and IPFS to create tamper-proof, 
            instantly verifiable academic certificates. Say goodbye to credential fraud.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/register')} size="lg">
              Issue Credentials
            </Button>
            <Button onClick={() => navigate('/verify')} variant="outline" size="lg">
              Verify Certificate
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Lock}
            title="Immutable & Secure"
            description="Credentials stored on Ethereum blockchain with SHA-256 hashing ensure tamper-proof verification."
            color="blue"
          />
          <FeatureCard
            icon={FileCheck}
            title="Instant Verification"
            description="Verify credentials in seconds through QR codes or file upload. No manual checks needed."
            color="purple"
          />
          <FeatureCard
            icon={Users}
            title="Decentralized Storage"
            description="Certificate files stored on IPFS ensure data resilience and protection against censorship."
            color="green"
          />
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Issue Credential"
              description="Institution uploads certificate, system generates hash and stores on blockchain"
              icon={Upload}
            />
            <StepCard
              number={2}
              title="Store on IPFS"
              description="Certificate file uploaded to IPFS with unique CID for decentralized storage"
              icon={FileCheck}
            />
            <StepCard
              number={3}
              title="Verify Instantly"
              description="Anyone can verify authenticity by comparing file hash with blockchain record"
              icon={CheckCircle}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2024 Attestify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const StepCard = ({ number, title, description, icon: Icon }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
      {number}
    </div>
    <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Landing;
