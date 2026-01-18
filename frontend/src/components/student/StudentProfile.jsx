import React from 'react';
import { User, Mail, Building, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-900 rounded-xl p-8">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm">
            Student
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-300">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <Building className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">University</p>
              <p className="font-medium">{user?.university}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-300">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Student ID</p>
              <p className="font-medium">{user?.studentId || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="font-medium">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
