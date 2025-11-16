// frontend/src/pages/SessionTestPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser, isAuthenticated } from '../utils/auth';

export default function SessionTestPage() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComparison();
    if (isAuthenticated()) {
      loadSessionInfo();
    }
  }, []);

  const loadSessionInfo = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get('/api/session/info', {
        headers,
        withCredentials: true // Important for cookies
      });
      setSessionInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session info');
    }
  };

  const loadComparison = async () => {
    try {
      const res = await axios.get('/api/session/compare');
      setComparison(res.data);
    } catch (err) {
      console.error('Failed to load comparison:', err);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post('/api/session/logout', {}, {
        headers,
        withCredentials: true
      });
      
      // Clear client-side storage
      localStorage.removeItem('shop_sphere_token');
      localStorage.removeItem('shop_sphere_user');
      
      setSessionInfo(null);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const user = getUser();

  return (
    <div className="container page">
      <h1>Session Management Testing</h1>
      
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {/* Current Session Info */}
      <section style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Current Session Information</h2>
        {isAuthenticated() ? (
          <>
            <div style={{ marginBottom: '15px' }}>
              <strong>User:</strong> {user?.name} ({user?.email}) - Role: {user?.role}
            </div>
            {sessionInfo ? (
              <div>
                <h3>Session Details:</h3>
                <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
                <button 
                  onClick={handleLogout} 
                  disabled={loading}
                  style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {loading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <button onClick={loadSessionInfo} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Load Session Info
              </button>
            )}
          </>
        ) : (
          <p>Please <a href="/login">login</a> to view session information.</p>
        )}
      </section>

      {/* Comparison Table */}
      {comparison && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Session Management Methods Comparison</h2>
          <div style={{ marginBottom: '20px' }}>
            <strong>Current Method:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{comparison.currentMethod.toUpperCase()}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
            {Object.entries(comparison.comparison).map(([key, method]) => (
              <div key={key} style={{ 
                padding: '20px', 
                border: '2px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: comparison.currentMethod === key ? '#e7f3ff' : 'white'
              }}>
                <h3 style={{ marginTop: 0, color: comparison.currentMethod === key ? '#007bff' : '#333' }}>
                  {method.name}
                  {comparison.currentMethod === key && <span style={{ marginLeft: '10px', color: '#28a745' }}>✓ Active</span>}
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Pros:</strong>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    {method.pros.map((pro, i) => (
                      <li key={i} style={{ color: '#28a745' }}>{pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Cons:</strong>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    {method.cons.map((con, i) => (
                      <li key={i} style={{ color: '#dc3545' }}>{con}</li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9em' }}>
                  {method.useCase}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Instructions */}
      <section style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>How to Switch Session Types</h2>
        <p>To test different session management methods, update your <code>.env</code> file in the backend:</p>
        <pre style={{ background: '#fff', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`# Options: 'jwt', 'cookie', or 'server-side'
SESSION_TYPE=jwt

# For cookie-based sessions
COOKIE_SECRET=your-cookie-secret-key

# For server-side sessions
SESSION_SECRET=your-session-secret-key`}
        </pre>
        <p style={{ marginTop: '15px' }}>
          After changing the <code>SESSION_TYPE</code>, restart your backend server and login again.
        </p>
      </section>
    </div>
  );
}

