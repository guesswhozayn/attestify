import React from 'react';
import Header from '../components/layout/Header';
import StudentProfile from '../components/student/StudentProfile';
import UniversityProfile from '../components/admin/UniversityProfile';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);

  return (
    <div className="min-h-screen">
      <Header title={isAdmin ? "University Profile" : "My Profile"} showSearch={false} />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {isAdmin ? <UniversityProfile /> : <StudentProfile />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
