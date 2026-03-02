import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { authAPI, setAuthToken, clearAuth } from '../services/api';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle logout cleanup
  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear axios auth header
    clearAuth();

    // Update state
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Consolidate initialization and verification
  const isInitialized = React.useRef(false);

  // Initialize authentication
  const initializeAuth = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        // Set token in axios headers
        setAuthToken(token);

        // Parse user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Verify token with backend
        try {
          const response = await authAPI.getCurrentUser();
          const currentUser = response.data.user;
          
          // Update user data if changed
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

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Register new user
  const register = useCallback(async (userData) => {
    try {
      await authAPI.register(userData);
      // Do not auto-login
      return { success: true };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password, role) => {
    try {
      const response = await authAPI.login({ email, password, selectedRole: role });
      const { token, user: loggedInUser } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Set token in axios headers
      setAuthToken(token);

      // Update state
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

  // Logout user
  const logout = useCallback(async () => {
    try {
      // Optional: Call backend logout endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      handleLogout();
    }
  }, [handleLogout]);

  // Update user profile
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Refresh user data
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

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  // Check if user is issuer
  const isIssuer = useCallback(() => {
    return hasRole('ISSUER');
  }, [hasRole]);

  // Check if user is student
  const isStudent = useCallback(() => {
    return hasRole('STUDENT');
  }, [hasRole]);

  // Context value
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