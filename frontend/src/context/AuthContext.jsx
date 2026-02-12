import React, { createContext, useState, useEffect, useContext } from 'react';
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

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
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

        // Optionally verify token with backend
        await verifyToken();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid data
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Verify token with backend
  const verifyToken = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const currentUser = response.data.user;
      
      // Update user data if changed
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token is invalid, logout
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Register new user
  const register = async (userData) => {
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
  };

  // Login user
  const login = async (email, password, role) => {
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
  };

  // Logout user
  const logout = async () => {
    try {
      // Optional: Call backend logout endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      handleLogout();
    }
  };

  // Google Login
  const googleLogin = async (token) => {
    try {
      // We need to call the API manually as it might not be in authAPI yet, 
      // OR we update api.js as well. Let's assume we update api.js first or use direct axios here.
      // But to keep it consistent, let's use a direct axios call if authAPI isn't updated, 
      // or update api.js. Updating api.js is better.
      // I will assume authAPI.googleLogin exists (I will add it).
      const response = await authAPI.googleLogin(token);
      const { token: authToken, user: loggedInUser } = response.data;

      // Save to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Set token in axios headers
      setAuthToken(authToken);

      // Update state
      setUser(loggedInUser);
      setIsAuthenticated(true);

      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Google Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed.'
      };
    }
  };

  // Handle logout cleanup
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear axios auth header
    clearAuth();

    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const currentUser = response.data.user;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Check if user is institute
  const isInstitute = () => {
    return hasRole('INSTITUTE');
  };

  // Check if user is student
  const isStudent = () => {
    return hasRole('STUDENT');
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
    hasRole,
    isInstitute,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;