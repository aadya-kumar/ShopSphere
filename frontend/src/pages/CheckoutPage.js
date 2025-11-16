// frontend/src/pages/CheckoutPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loadCart, saveCart, clearCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';

export default function CheckoutPage(){
  const [cart, setCart] = useState(loadCart());
  const [shipping, setShipping] = useState({ address:'', city:'', postalCode:'', country:'' });
  const [coupon, setCoupon] = useState('');
  const [offerResult, setOfferResult] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> setCart(loadCart()), []);

  const itemsPrice = cart.reduce((s, it) => s + (it.price * it.qty), 0);
  const tax = +(itemsPrice * 0.05).toFixed(2);
  const shippingPrice = itemsPrice > 1000 ? 0 : 50;
  const subtotal = +(itemsPrice + tax + shippingPrice).toFixed(2);
  const totalAfterCoupon = offerResult ? offerResult.newTotal + tax + shippingPrice : subtotal;

  async function applyCoupon() {
    if (!coupon.trim()) return alert('Enter coupon code');
    try {
      const res = await axios.post('/api/offers/apply', { 
        code: coupon.trim().toUpperCase(), 
        itemsPrice 
      });
      setOfferResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply coupon');
      setOfferResult(null);
    }
  }

  async function placeOrder() {
    if (cart.length === 0) return alert('Cart is empty');
    if (!shipping.address || !shipping.city || !shipping.postalCode || !shipping.country) {
      return alert('Please fill in all shipping details');
    }
    
    setIsPlacingOrder(true);
    const orderItems = cart.map(i => ({ product: i.productId, name: i.name, price: i.price, qty: i.qty }));
    const itemsPrice = cart.reduce((s, it) => s + (it.price * it.qty), 0);
    const discounts = offerResult ? offerResult.discount : 0;
    const finalItemsPrice = +(itemsPrice - discounts).toFixed(2);
    const taxPrice = +(finalItemsPrice * 0.05).toFixed(2);
    const shippingPrice = finalItemsPrice > 1000 ? 0 : 50;
    const totalPrice = +(finalItemsPrice + taxPrice + shippingPrice).toFixed(2);

    try {
      const payload = { orderItems, shippingAddress: shipping, paymentMethod: 'COD', itemsPrice: finalItemsPrice, taxPrice, shippingPrice, totalPrice };
      const res = await axios.post('/api/orders', payload, { headers: getAuthHeaders() });
      clearCart();
      alert('Order placed successfully! Order ID: ' + res.data._id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
      setIsPlacingOrder(false);
    }
  }

  function updateQty(idx, delta) {
    const newCart = [...cart];
    newCart[idx].qty = Math.max(1, newCart[idx].qty + delta);
    saveCart(newCart);
    setCart(newCart);
  }

  function removeItem(idx) {
    if (!window.confirm('Remove this item from cart?')) return;
    const newCart = [...cart];
    newCart.splice(idx,1);
    saveCart(newCart);
    setCart(newCart);
    if (newCart.length === 0) {
      setOfferResult(null);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-page-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to continue shopping.</p>
            <Link to="/products" className="btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page-container">
        <h1 className="checkout-title">Checkout</h1>
        
        <div className="checkout-grid">
          {/* Left Column - Cart Items */}
          <div className="checkout-left">
            <div className="cart-items-section">
              <h2 className="section-title">Cart Items ({cart.length})</h2>
              <div className="cart-items-list">
                {cart.map((it, idx) => (
                  <div key={it.productId || idx} className="cart-item">
                    <div className="cart-item-image">
                      {it.image ? (
                        <img 
                          src={it.image} 
                          alt={it.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="cart-item-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{it.name}</h3>
                      <div className="cart-item-price">₹{it.price.toLocaleString()}</div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls-small">
                          <button 
                            className="qty-btn-small"
                            onClick={() => updateQty(idx, -1)}
                            disabled={it.qty <= 1}
                          >
                            −
                          </button>
                          <span className="qty-display">{it.qty}</span>
                          <button 
                            className="qty-btn-small"
                            onClick={() => updateQty(idx, +1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-item-btn"
                          onClick={() => removeItem(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      ₹{(it.price * it.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Forms */}
          <div className="checkout-right">
            {/* Coupon Section */}
            <div className="checkout-section">
              <h2 className="section-title">Apply Coupon</h2>
              <div className="coupon-input-group">
                <input 
                  type="text"
                  className="coupon-input"
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && applyCoupon()}
                />
                <button className="coupon-btn" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {offerResult && (
                <div className="coupon-success">
                  <span className="coupon-success-icon">✓</span>
                  <div>
                    <strong>{offerResult.offer.code}</strong> applied
                    <div className="coupon-discount">-₹{offerResult.discount.toLocaleString()} ({offerResult.offer.discountPercent}% off)</div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Section */}
            <div className="checkout-section">
              <h2 className="section-title">Shipping Address</h2>
              <div className="shipping-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Street Address"
                  value={shipping.address}
                  onChange={e => setShipping({...shipping, address: e.target.value})}
                />
                <div className="form-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City"
                    value={shipping.city}
                    onChange={e => setShipping({...shipping, city: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Postal Code"
                    value={shipping.postalCode}
                    onChange={e => setShipping({...shipping, postalCode: e.target.value})}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Country"
                  value={shipping.country}
                  onChange={e => setShipping({...shipping, country: e.target.value})}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="checkout-section order-summary">
              <h2 className="section-title">Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({cart.reduce((s, it) => s + it.qty, 0)} items)</span>
                <span>₹{itemsPrice.toLocaleString()}</span>
              </div>
              {offerResult && (
                <div className="summary-row discount-row">
                  <span>Coupon Discount</span>
                  <span>-₹{offerResult.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{totalAfterCoupon.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button 
              className="place-order-btn"
              onClick={placeOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
            </button>

            <Link to="/products" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
