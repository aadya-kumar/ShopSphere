import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

// Protected route component - requires authentication
export function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Admin only route
export function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const user = getUser();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Vendor only route
export function VendorRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const user = getUser();
  if (user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Admin or Vendor route
export function AdminOrVendorRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const user = getUser();
  if (user?.role !== 'admin' && user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

