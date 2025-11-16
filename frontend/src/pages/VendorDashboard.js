import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import AdminProductForm from '../components/AdminProductForm';

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = getToken();
      const res = await axios.get('/api/products/vendor/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    alert('Only administrators can delete products. Please contact an admin.');
  };

  if (loading) {
    return <div className="container page">Loading...</div>;
  }

  return (
    <div className="container page">
      <h1>Vendor Dashboard</h1>
      <p>Manage your products</p>

      <AdminProductForm 
        editProduct={editing} 
        onSaved={() => { 
          setEditing(null); 
          loadProducts(); 
        }} 
      />

      <div className="vendor-products">
        <h2>My Products ({products.length})</h2>
        {products.length === 0 ? (
          <p>No products yet. Create your first product above.</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                {product.image && (
                  <img src={product.image} alt={product.name} className="product-image" />
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>₹{product.price.toLocaleString()}</p>
                  <p>Stock: {product.countInStock}</p>
                  <div className="product-actions">
                    <button onClick={() => setEditing(product)} className="btn">Edit</button>
                    <button disabled className="btn-secondary" title="Only admins can delete products">Delete (Admin Only)</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

