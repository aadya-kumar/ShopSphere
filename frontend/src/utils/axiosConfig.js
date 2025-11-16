// frontend/src/utils/axiosConfig.js
import axios from 'axios';
import { getToken } from './auth';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true // Important for cookie-based and server-side sessions
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('shop_sphere_token');
      localStorage.removeItem('shop_sphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

