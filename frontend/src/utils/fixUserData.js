// Utility to fix user data in localStorage
// Run this in browser console if user data is missing role

export function fixUserData() {
  const token = localStorage.getItem('shop_sphere_token');
  const userStr = localStorage.getItem('shop_sphere_user');
  
  if (!token) {
    console.log('No token found. Please login again.');
    return;
  }
  
  if (!userStr) {
    console.log('No user data found. Please login again.');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    console.log('Current user data:', user);
    
    if (!user.role) {
      console.log('User data missing role. Clearing localStorage. Please login again.');
      localStorage.removeItem('shop_sphere_token');
      localStorage.removeItem('shop_sphere_user');
      window.location.href = '/login';
    } else {
      console.log('User data looks good:', user);
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
    localStorage.removeItem('shop_sphere_token');
    localStorage.removeItem('shop_sphere_user');
    window.location.href = '/login';
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.fixUserData = fixUserData;
}

