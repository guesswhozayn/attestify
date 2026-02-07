import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const GoogleLoginButton = ({ text }) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const { showNotification } = useNotification();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const result = await googleLogin(credential);

      if (result.success) {
         showNotification('Login successful', 'success');
         navigate('/dashboard'); 
      } else {
         showNotification(result.error || 'Google login failed', 'error');
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      showNotification('Google login failed', 'error');
    }
  };

  return (
    <div className="w-full flex justify-center py-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => showNotification('Google login failed', 'error')}
        text={text || "signin_with"}
        shape="pill"
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;
