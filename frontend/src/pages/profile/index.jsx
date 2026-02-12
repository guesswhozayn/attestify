import React from 'react';
import { useAuth } from '../../context/AuthContext';
import InstituteProfile from './InstituteProfile';
import StudentProfile from './StudentProfile';

const Profile = () => {
  const { user } = useAuth();
  const isInstitute = user?.role === 'INSTITUTE';

  return isInstitute ? <InstituteProfile /> : <StudentProfile />;
};

export default Profile;
