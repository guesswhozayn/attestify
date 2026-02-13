import React from 'react';
import { useAuth } from '../../context/AuthContext';
import InstituteProfileEditor from './InstituteProfileEditor';
import StudentProfileEditor from './StudentProfileEditor';

const Profile = () => {
  const { user } = useAuth();
  const isInstitute = user?.role === 'INSTITUTE';

  return isInstitute ? <InstituteProfileEditor /> : <StudentProfileEditor />;
};

export default Profile;
