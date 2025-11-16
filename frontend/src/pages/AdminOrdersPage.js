import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

export default function AdminOrdersPage(){
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const res = await axios.get('/api/orders', { headers: getAuthHeaders() });
      setOrders(res.data);
    } catch (err) {
      console.error('Error loading orders:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('You are not authorized to access this page. Admin access required.');
      }
    }
  };

  useEffect(()=>{load()},[]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}/status`, { status }, { headers: getAuthHeaders() });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="container page">
      <h1>Orders</h1>
      <ul>
        {orders.map(o => (
          <li key={o._id}>
            <div><strong>{o._id}</strong> — ₹{o.totalPrice} — {o.status}</div>
            <div>
              <button onClick={() => updateStatus(o._id, 'confirmed')}>Confirm</button>
              <button onClick={() => updateStatus(o._id, 'shipped')}>Ship</button>
              <button onClick={() => updateStatus(o._id, 'delivered')}>Deliver</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
