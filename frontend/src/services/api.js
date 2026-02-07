import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden:', data.error);
          break;
        
        case 404:
          // Not found
          console.error('Resource not found:', data.error);
          break;
        
        case 500:
          // Server error
          console.error('Server error:', data.error);
          break;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication APIs
// ============================================
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Google Login
  googleLogin: async (token) => {
    return api.post('/auth/google', { token });
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return api.post('/auth/refresh');
  },

  // Logout
  logout: async () => {
    return api.post('/auth/logout');
  }
};

// ============================================
// Credential APIs
// ============================================
export const credentialAPI = {
  // Issue new credential
  issue: async (formData) => {
    return api.post('/credentials/issue', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds for file upload
    });
  },

  // Get all credentials
  getAll: async (params = {}) => {
    return api.get('/credentials', { params });
  },

  // Get credential by ID
  getById: async (id) => {
    return api.get(`/credentials/${id}`);
  },

  // Get credential by student ID
  getByStudentId: async (studentId) => {
    return api.get(`/credentials/student/${studentId}`);
  },

  // Revoke credential
  revoke: async (id, reason) => {
    return api.post(`/credentials/${id}/revoke`, { reason });
  },

  // Update credential
  update: async (id, data) => {
    return api.put(`/credentials/${id}`, data);
  },

  // Delete credential
  delete: async (id) => {
    return api.delete(`/credentials/${id}`);
  },

  // Batch upload
  batchUpload: async (formData) => {
    return api.post('/credentials/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000 // 2 minutes for batch upload
    });
  },

  // Get statistics
  getStats: async () => {
    return api.get('/credentials/stats');
  }
};

// ============================================
// Verification APIs
// ============================================
export const verifyAPI = {
  // Verify certificate with file upload
  verifyWithFile: async (formData) => {
    return api.post('/verify/certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Check if credential exists
  checkExists: async (studentId) => {
    return api.get(`/verify/${studentId}`);
  },

  // Verify by hash
  verifyByHash: async (studentId, hash) => {
    return api.post('/verify/hash', { studentId, hash });
  },

  // Get verification history
  getHistory: async (params = {}) => {
    return api.get('/verify/history', { params });
  }
};

// ============================================
// Admin APIs
// ============================================
export const adminAPI = {
  // Create new admin
  create: async (adminData) => {
    return api.post('/admin/create', adminData);
  },

  // Get all admins
  getAll: async () => {
    return api.get('/admin/list');
  },

  // Get admin by ID
  getById: async (id) => {
    return api.get(`/admin/${id}`);
  },

  // Update admin
  update: async (id, data) => {
    return api.put(`/admin/${id}`, data);
  },

  // Delete admin
  delete: async (id) => {
    return api.delete(`/admin/${id}`);
  },

  // Toggle admin status
  toggleStatus: async (id) => {
    return api.post(`/admin/${id}/toggle-status`);
  }
};

// ============================================
// Audit Log APIs
// ============================================
export const auditAPI = {
  // Get all logs
  getLogs: async (params = {}) => {
    return api.get('/audit/logs', { params });
  },

  // Get logs by user
  getByUser: async (userId, params = {}) => {
    return api.get(`/audit/user/${userId}`, { params });
  },

  // Get logs by credential
  getByCredential: async (credentialId, params = {}) => {
    return api.get(`/audit/credential/${credentialId}`, { params });
  },

  // Get logs by action
  getByAction: async (action, params = {}) => {
    return api.get(`/audit/action/${action}`, { params });
  },

  // Get dashboard stats
  getDashboardStats: async (params = {}) => {
    return api.get('/audit/dashboard-stats', { params });
  }
};

// ============================================
// User APIs
// ============================================
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return api.get('/user/profile');
  },

  // Update profile
  updateProfile: async (data) => {
    return api.put('/user/profile', data);
  },

  // Change password
  changePassword: async (data) => {
    return api.put('/user/password', data);
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get notifications
  getNotifications: async () => {
    return api.get('/user/notifications');
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    return api.put(`/user/notifications/${id}/read`);
  }
};

// ============================================
// Statistics APIs
// ============================================
export const statsAPI = {
  // Get dashboard stats (Using audit controller)
  getDashboard: async () => {
    return api.get('/audit/dashboard-stats');
  },

  // Other stats endpoints not yet implemented in backend
  /*
  getCertificates: async (params = {}) => {
    return api.get('/stats/certificates', { params });
  },
  getUsers: async () => {
    return api.get('/stats/users');
  },
  getBlockchain: async () => {
    return api.get('/stats/blockchain');
  },
  getGasMetrics: async (params = {}) => {
    return api.get('/stats/gas', { params });
  }
  */
};

// ============================================
// File APIs
// ============================================
export const fileAPI = {
  // Download certificate
  downloadCertificate: async (id) => {
    return api.get(`/files/certificate/${id}`, {
      responseType: 'blob'
    });
  },

  // Get IPFS file
  getIPFSFile: async (cid) => {
    return api.get(`/files/ipfs/${cid}`, {
      responseType: 'blob'
    });
  },

  // Generate QR code
  generateQR: async (data) => {
    return api.post('/files/qr', data, {
      responseType: 'blob'
    });
  }
};

// ============================================
// Export default api instance
// ============================================
export default api;

// ============================================
// Helper functions
// ============================================

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Clear auth
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Check if authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};
