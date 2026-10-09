import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authAPI, clearAuth } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

  const handleLogout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');
    if (!token) return;
    authAPI.getCurrentUser()
      .then(response => {
        if (!active) return;
        const currentUser = response.data.user;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        if (active && error.response?.status === 401) handleLogout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [handleLogout]);

  useEffect(() => {
    const handleUnauthorized = () => handleLogout();
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [handleLogout]);

  const register = useCallback(async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const response = await authAPI.login({ email, password, selectedRole: role });
      const { token, user: loggedInUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      handleLogout();
    }
  }, [handleLogout]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const currentUser = response.data.user;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Refresh user error:', error);
      if (error.response?.status === 401) handleLogout();
      return { success: false, error: error.message };
    }
  }, [handleLogout]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
    refreshUser
  }), [user, loading, register, login, logout, updateUser, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
