// frontend/src/utils/axiosConfig.js
import axios from 'axios';
import { getToken } from './auth';

// Detect backend API URL from environment
// Auto-detect local development: if running on localhost, always use local backend
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

let API_BASE_URL;
if (isLocalhost) {
  // When running locally, always use local backend (ignore production env vars)
  // .env.local file will set this, but we default to localhost:5001
  API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  // Force localhost if somehow a production URL got set
  if (API_BASE_URL.includes('render.com') || API_BASE_URL.includes('vercel.app')) {
    console.warn('⚠️ Production API URL detected in localhost. Using local backend instead.');
    API_BASE_URL = 'http://localhost:5001';
  }
} else {
  // In production (Vercel), use the environment variable
  API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
}

// Clean up the URL: remove any leading @ symbols and trailing slashes
API_BASE_URL = API_BASE_URL.replace(/^@+/, '').replace(/\/+$/, '');

// Log the API URL in development (will be removed in production build)
if (process.env.NODE_ENV === 'development') {
  console.log('🌐 Running on:', window.location.hostname);
  console.log('🔗 API Base URL:', API_BASE_URL);
}

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
