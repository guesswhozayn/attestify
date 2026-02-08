import React from 'react';
import { User, Mail, Building, Calendar, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors">
      <div className="p-2 bg-gray-700/50 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
        <p className="text-gray-200 font-medium break-all">{value || 'Not set'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
        {/* Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900 relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl">
              <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white max-w-full truncate px-2">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gray-900 p-1 rounded-full">
              <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-gray-900"></div>
            </div>
          </div>

          {/* Name & Role */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileField 
          icon={Building} 
          label="Institution / University" 
          value={user?.university} 
        />
        <ProfileField 
          icon={User} 
          label="Registration Number" 
          value={user?.registrationNumber} 
        />
        <ProfileField 
          icon={Wallet} 
          label="Wallet Address" 
          value={user?.walletAddress} 
        />
        <ProfileField 
          icon={Calendar} 
          label="Member Since" 
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A'} 
        />
      </div>

      {/* Security/Trust Badge */}
      <div className="bg-indigo-900/10 rounded-xl p-4 border border-indigo-500/20 flex items-center gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-full">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-indigo-200 font-medium">Verified Account</h4>
          <p className="text-sm text-indigo-400/70">Your identity and credentials are secured on the blockchain.</p>
        </div>
      </div>
    </div>
  );
};

