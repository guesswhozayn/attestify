import React from 'react';
import { User, Mail, Building, MapPin, Award, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UniversityProfile = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-900 rounded-xl p-8">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          <Building className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.university || 'University Name'}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm flex items-center w-fit">
            <Shield className="w-3 h-3 mr-1" />
            Verified Issuer
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-300">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Admin Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Contact Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-300">
            <Building className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Organization Type</p>
              <p className="font-medium">Academic Institution</p>
            </div>
          </div>
           {user?.walletAddress && (
            <div className="flex items-center space-x-3 text-gray-300">
              <Award className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Issuer Wallet</p>
                <p className="font-medium break-all text-xs font-mono">{user.walletAddress}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityProfile;
