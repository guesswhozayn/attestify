import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
// For Android Emulator, localhost is 10.0.2.2.
// IMPORTANT: Use your machine's local IP for physical devices (e.g., iPhone with Expo Go)
const MACHINE_IP = '192.168.200.10'; 

const API_BASE_URL = Platform.OS === 'android' 
  ? `http://${MACHINE_IP}:5000/api` 
  : `http://${MACHINE_IP}:5000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        await AsyncStorage.multiRemove(['token', 'user']);
        // Here you might want to trigger a navigation to Login
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: async (formData) => {
    return api.post('/auth/register', formData);
  },
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
  logout: async () => {
    return api.post('/auth/logout');
  }
};

export const credentialAPI = {
  getAll: async (params = {}) => {
    return api.get('/credentials', { params });
  },
  getById: async (id) => {
    return api.get(`/credentials/${id}`);
  },
  getStats: async () => {
    return api.get('/credentials/stats');
  }
};

export const auditAPI = {
  getLogs: async (params = {}) => {
    return api.get('/audit/logs', { params });
  }
};

export default api;
