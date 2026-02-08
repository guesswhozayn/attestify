import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminProfile from './AdminProfile';
import StudentProfile from './StudentProfile';

const Profile = () => {
  const { user } = useAuth();
  const isInstitute = user?.role === 'INSTITUTE';

  return isInstitute ? <AdminProfile /> : <StudentProfile />;
};

export default Profile;
