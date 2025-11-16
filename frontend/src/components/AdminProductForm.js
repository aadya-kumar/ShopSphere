import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

export default function AdminProductForm({ editProduct, onSaved }) {
  const [form, setForm] = useState({ name:'', description:'', price:'', countInStock:'', image:'', category:'' });

  useEffect(() => {
    if (editProduct) setForm(editProduct);
  }, [editProduct]);

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async e => {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        price: parseFloat(form.price),
        countInStock: parseInt(form.countInStock) || 0
      };
      
      if (editProduct && editProduct._id) {
        await axios.put(`/api/products/${editProduct._id}`, submitData, { headers: getAuthHeaders() });
      } else {
        await axios.post('/api/products', submitData, { headers: getAuthHeaders() });
      }
      onSaved && onSaved();
      setForm({ name:'', description:'', price:'', countInStock:'', image:'', category:''});
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={submit} className="admin-form" style={{ marginBottom:20 }}>
      <input name="name" value={form.name} onChange={handle} placeholder="Product Name" required />
      <input name="price" type="number" step="0.01" value={form.price} onChange={handle} placeholder="Price (₹)" required />
      <input name="countInStock" type="number" value={form.countInStock} onChange={handle} placeholder="Stock Quantity" />
      <input name="category" value={form.category} onChange={handle} placeholder="Category (e.g., Clothing, Electronics)" />
      <input name="image" value={form.image} onChange={handle} placeholder="Image URL" />
      <textarea name="description" value={form.description} onChange={handle} placeholder="Description" rows="3" />
      <button type="submit" className="btn">{editProduct ? 'Update Product' : 'Add Product'}</button>
    </form>
  );
}
