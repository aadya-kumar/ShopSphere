import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

export default function AdminOffersPage(){
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title:'', code:'', discountPercent:0 });

  const load = async () => {
    try {
      const res = await axios.get('/api/offers');
      setOffers(res.data);
    } catch (err) {
      console.error('Error loading offers:', err);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/offers', form, { headers: getAuthHeaders() });
      setForm({ title:'', code:'', discountPercent:0 });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const del = async id => {
    if (!window.confirm('Delete offer?')) return;
    try {
      await axios.delete(`/api/offers/${id}`, { headers: getAuthHeaders() });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="container page">
      <h1>Offers</h1>
      <form onSubmit={save}>
        <input name="title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" required />
        <input name="code" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="Code" required />
        <input name="discountPercent" type="number" value={form.discountPercent} onChange={e=>setForm({...form, discountPercent:+e.target.value})} placeholder="Discount %" required />
        <button type="submit">Create Offer</button>
      </form>

      <ul>
        {offers.map(o => (
          <li key={o._id}>
            {o.title} — {o.code} — {o.discountPercent}% <button onClick={() => del(o._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
