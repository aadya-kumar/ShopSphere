import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';
import AdminProductForm from '../components/AdminProductForm';

export default function AdminProductsPage(){
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await axios.get('/api/products', { headers: getAuthHeaders() });
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('You are not authorized to access this page. Admin access required.');
      }
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: getAuthHeaders() });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="container page">
      <h1>Manage Products</h1>
      <AdminProductForm editProduct={editing} onSaved={() => { setEditing(null); load(); }} />

      <ul>
        {products.map(p => (
          <li key={p._id}>
            <strong>{p.name}</strong> — ₹{p.price} — {p.countInStock} in stock
            <button onClick={() => setEditing(p)}>Edit</button>
            <button onClick={() => del(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
