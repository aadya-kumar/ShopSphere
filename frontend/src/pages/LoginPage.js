import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setToken, setUser, isAuthenticated, getAuthHeaders } from '../utils/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/users/login', formData, {
        withCredentials: true // Important for cookie-based and server-side sessions
      });
      console.log('Full login response:', res);
      console.log('Login response data:', res.data);
      console.log('res.data.token:', res.data.token);
      console.log('res.data.user:', res.data.user);
      console.log('res.data.user?.token:', res.data.user?.token);
      
      // Handle different response formats
      // Format 1: { _id, name, email, role, token }
      // Format 2: { message: 'Login successful', user: { _id, name, email, role }, token }
      let responseData = res.data;
      let token = res.data.token || res.data.user?.token;
      
      if (res.data.user && !res.data._id) {
        // Response is wrapped in { message, user: {...} }
        // Token might be at top level or we need to get it from somewhere else
        token = res.data.token || res.data.user.token || token;
        responseData = {
          ...res.data.user,
          token: token
        };
        console.log('Unwrapped response data:', responseData);
        console.log('Token extracted:', token ? 'YES - ' + token.substring(0, 20) + '...' : 'NO');
      }
      
      // Get session type from response
      const sessionType = responseData.sessionType || 'jwt';
      console.log('Session type:', sessionType);
      
      // Use data from login response
      let userData = { 
        _id: responseData._id, 
        name: responseData.name, 
        email: responseData.email, 
        role: responseData.role || 'customer'
      };
      
      // Handle different session types
      if (sessionType === 'jwt' && token) {
        // JWT: Save token in localStorage
        setToken(token);
        console.log('✅ JWT: Token saved to localStorage');
        
        // Fetch user profile to get the latest role
        try {
          const profileRes = await axios.get('/api/users/profile', { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          console.log('Profile response:', profileRes.data);
          
          if (profileRes.data) {
            userData = {
              _id: profileRes.data._id || userData._id,
              name: profileRes.data.name || userData.name,
              email: profileRes.data.email || userData.email,
              role: profileRes.data.role || userData.role || 'customer'
            };
          }
        } catch (profileErr) {
          console.warn('Could not fetch profile, using login response data:', profileErr);
        }
      } else if (sessionType === 'cookie') {
        // Cookie: Token is in HTTP-only cookie, no need to save
        console.log('✅ Cookie: Token stored in HTTP-only cookie');
        // Create a marker token so isAuthenticated() works
        setToken('cookie_session');
      } else if (sessionType === 'server-side') {
        // Server-side: Session stored on server, no token needed
        console.log('✅ Server-side: Session stored on server');
        // Create a marker token so isAuthenticated() works
        setToken('server_session');
      } else {
        // Fallback: Try to use token if available
        if (token) {
          setToken(token);
        } else {
          console.warn('No token and unknown session type');
          setToken('temp_token_' + Date.now());
        }
      }
      
      console.log('Final user data to save:', userData);
      console.log('User role:', userData.role);
      
      // Save user data
      setUser(userData);
      
      // Verify it was saved
      const savedUser = JSON.parse(localStorage.getItem('shop_sphere_user'));
      console.log('Saved user in localStorage:', savedUser); // Debug log
      console.log('Saved role:', savedUser?.role); // Debug log
      
      navigate('/');
      // Force a small delay to ensure state updates
      setTimeout(() => {
        window.location.reload(); // Refresh to update navbar
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Welcome back! Please login to your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

