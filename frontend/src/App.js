import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AdminProductsPage from './pages/AdminProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorDashboard from './pages/VendorDashboard';
import SessionTestPage from './pages/SessionTestPage';
import { AdminRoute, VendorRoute, ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/session-test" element={<SessionTestPage />} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/offers" element={<AdminRoute><AdminOffersPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


// import React from 'react';
// import ProductList from './components/ProductList';

// function App() {
//   return (
//     <div style={styles.container}>
//       <header style={styles.header}>
//         <h1 style={styles.title}>Experiment-1</h1>
//         <h2 style={styles.subtitle}>ShopSphere</h2>
//       </header>

//       <main style={styles.main}>
//         <ProductList />
//       </main>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     fontFamily: 'Arial, sans-serif',
//     padding: '40px',
//     backgroundColor: '#f9fafb',
//     minHeight: '100vh',
//   },
//   header: {
//     marginBottom: '30px',
//     textAlign: 'center',
//   },
//   title: {
//     fontSize: '42px',
//     fontWeight: '700',
//     margin: '0',
//     color: '#111827',
//   },
//   subtitle: {
//     fontSize: '28px',
//     color: '#4b5563',
//     marginTop: '10px',
//   },
//   main: {
//     maxWidth: '700px',
//     margin: '0 auto',
//     backgroundColor: '#ffffff',
//     padding: '30px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
//   }
// };

// export default App;


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
