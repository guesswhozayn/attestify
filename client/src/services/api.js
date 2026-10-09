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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.dispatchEvent(new Event('auth-unauthorized'));
        }
      } else if (status === 403) {
        console.error('Access forbidden:', data.error);
      } else if (status === 404) {
        console.error('Resource not found:', data.error);
      } else if (status === 500) {
        console.error('Server error:', data.error);
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
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const credentialAPI = {
  issue: (formData) => api.post('/credentials/issue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000
  }),
  getAll: (params = {}) => api.get('/credentials', { params }),
  getById: (id) => api.get(`/credentials/${id}`),
  getByWalletAddress: (walletAddress) => api.get(`/credentials/student/${walletAddress}`),
  revoke: (id, reason) => api.post(`/credentials/${id}/revoke`, { reason }),
  batchUpload: (formData) => api.post('/credentials/batch-issue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  getStatus: (id) => api.get(`/credentials/status/${id}`),
  getStats: () => api.get('/credentials/stats')
};

export const verifyAPI = {
  verifyWithFile: (formData) => api.post('/verify/certificate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  checkExists: (walletAddress) => api.get(`/verify/${walletAddress}`),
  verifyByHash: (studentWalletAddress, hash) => api.post('/verify/hash', { studentWalletAddress, hash })
};

export const networkAPI = {
  getStats: () => api.get('/network/stats')
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const fileAPI = {
  downloadCertificate: (id) => api.get(`/files/certificate/${id}`, { responseType: 'blob' })
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export default api;
