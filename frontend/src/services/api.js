import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {

      const { status, data } = error.response;

      switch (status) {
        case 401:

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:

          console.error('Access forbidden:', data.error);
          break;

        case 404:

          console.error('Resource not found:', data.error);
          break;

        case 500:

          console.error('Server error:', data.error);
          break;
      }
    } else if (error.request) {

      console.error('Network error - no response from server');
    } else {

      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  refreshToken: async () => {
    return api.post('/auth/refresh');
  },

  logout: async () => {
    return api.post('/auth/logout');
  }
};

export const credentialAPI = {

  issue: async (formData) => {
    return api.post('/credentials/issue', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },

      timeout: 180000
    });
  },

  getAll: async (params = {}) => {
    return api.get('/credentials', { params });
  },

  getById: async (id) => {
    return api.get(`/credentials/${id}`);
  },

  getByWalletAddress: async (walletAddress) => {
    return api.get(`/credentials/student/${walletAddress}`);
  },

  revoke: async (id, reason) => {
    return api.post(`/credentials/${id}/revoke`, { reason });
  },

  batchUpload: async (formData) => {
    return api.post('/credentials/batch-issue', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    });
  },

  getStats: async () => {
    return api.get('/credentials/stats');
  }
};

export const verifyAPI = {

  verifyWithFile: async (formData) => {
    return api.post('/verify/certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  checkExists: async (walletAddress) => {
    return api.get(`/verify/${walletAddress}`);
  },

  verifyByHash: async (studentWalletAddress, hash) => {
    return api.post('/verify/hash', { studentWalletAddress, hash });
  }
};

export const networkAPI = {

  getStats: async () => {
    return api.get('/network/stats');
  }
};

export const userAPI = {

  getProfile: async () => {
    return api.get('/users/profile');
  },

  updateProfile: async (data) => {
    return api.put('/users/profile', data);
  },

  changePassword: async (data) => {
    return api.put('/users/password', data);
  },

  uploadAvatar: async (formData) => {
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const fileAPI = {

  downloadCertificate: async (id) => {
    return api.get(`/files/certificate/${id}`, {
      responseType: 'blob'
    });
  },

  getIPFSFile: async (cid) => {
    return api.get(`/files/ipfs/${cid}`, {
      responseType: 'blob'
    });
  }
};

export default api;

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
