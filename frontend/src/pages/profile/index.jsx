import React from 'react';
import { useAuth } from '../../context/AuthContext';
import IssuerProfileEditor from './IssuerProfileEditor';
import StudentProfileEditor from './StudentProfileEditor';

const Profile = () => {
  const { user } = useAuth();
  const isIssuer = user?.role === 'ISSUER';

  return isIssuer ? <IssuerProfileEditor /> : <StudentProfileEditor />;
};

export default Profile;
