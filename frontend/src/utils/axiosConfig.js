// frontend/src/utils/axiosConfig.js
import axios from 'axios';
import { getToken } from './auth';

// Detect backend API URL from environment
// (Vercel will inject REACT_APP_API_URL during build)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // needed only if you use cookies (sessions/JWT-in-cookie)
});

// Add token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shop_sphere_token');
      localStorage.removeItem('shop_sphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
