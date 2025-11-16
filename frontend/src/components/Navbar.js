// frontend/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser, removeToken } from '../utils/auth';

export default function Navbar() {
  const [user, setUserState] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh user data when route changes (e.g., after login)
  useEffect(() => {
    const loadUser = () => {
      if (isAuthenticated()) {
        const userData = getUser();
        console.log('Navbar - Loaded user data:', userData); // Debug log
        console.log('Navbar - User role:', userData?.role); // Debug log
        console.log('Navbar - User name:', userData?.name); // Debug log
        
        // If user data exists but missing role, try to fetch from API
        if (userData && !userData.role) {
          console.warn('User data missing role, fetching from API...');
          // We'll handle this by forcing a re-login
        }
        
        setUserState(userData);
      } else {
        setUserState(null);
      }
    };
    
    loadUser();
    
    // Also listen for storage changes (when login happens in another tab/window)
    const handleStorageChange = () => {
      loadUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check user on every route change
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    setUserState(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <NavLink to="/" className="brand-link">ShopSphere</NavLink>
        </div>

        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "link active" : "link"} end>Home</NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? "link active" : "link"}>Products</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? "link active" : "link"}>About</NavLink>
          <NavLink to="/checkout" className={({isActive}) => isActive ? "link active" : "link"}>Cart</NavLink>
          <NavLink to="/session-test" className={({isActive}) => isActive ? "link active" : "link"}>Session Test</NavLink>
          
          {user ? (
            <>
              <span className="user-name">Hi, {user.name || 'User'} ({user.role || 'no role'})</span>
              {user.role === 'admin' && (
                <>
                  <NavLink to="/admin/products" className={({isActive}) => isActive ? "link active" : "link"}>Admin</NavLink>
                </>
              )}
              {user.role === 'vendor' && (
                <NavLink to="/vendor/dashboard" className={({isActive}) => isActive ? "link active" : "link"}>Vendor</NavLink>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({isActive}) => isActive ? "link active" : "link"}>Login</NavLink>
              <NavLink to="/register" className={({isActive}) => isActive ? "link active" : "link"}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

