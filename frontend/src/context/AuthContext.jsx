import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authAPI, clearAuth } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = useCallback(() => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    clearAuth();

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const isInitialized = React.useRef(false);

  const initializeAuth = useCallback(async () => {
    if (isInitialized.current) return;

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        try {
          const response = await authAPI.getCurrentUser();
          const currentUser = response.data.user;

          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Token verification failed:', error);
          if (error.response?.status === 401) {
            handleLogout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      handleLogout();
    } finally {
      setLoading(false);
      isInitialized.current = true;
    }
  }, [handleLogout]);

  useEffect(() => {
    initializeAuth();

  }, []);

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
      setIsAuthenticated(true);

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
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
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
      if (error.response?.status === 401) {
        handleLogout();
      }
      return { success: false, error: error.message };
    }
  }, [handleLogout]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const isIssuer = useCallback(() => {
    return hasRole('ISSUER');
  }, [hasRole]);

  const isStudent = useCallback(() => {
    return hasRole('STUDENT');
  }, [hasRole]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    hasRole,
    isIssuer,
    isStudent
  }), [
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    hasRole,
    isIssuer,
    isStudent
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
