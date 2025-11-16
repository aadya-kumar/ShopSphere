// frontend/src/components/ProductList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { loadCart, saveCart } from '../utils/cart';
import { Link } from 'react-router-dom';

export default function ProductList(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(loadCart().reduce((s,i)=>s+i.qty,0));
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        console.log('Products loaded:', res.data.length, 'products');
        setProducts(res.data);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        console.error('Error details:', err.response?.data || err.message);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          alert('Cannot connect to backend server. Please make sure:\n1. Backend server is running (npm run dev in backend folder)\n2. Backend is running on port 5000\n3. Check browser console for details');
        } else {
          alert('Failed to load products. Check console for details.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find(i => i.productId === product._id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, qty: 1, image: product.image });
    }
    saveCart(cart);
    setCartCount(cart.reduce((s,i)=>s+i.qty,0));
    alert(`${product.name} added to cart`);
  }

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if(loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="cart-info">
          <span className="cart-badge">{cartCount}</span>
          <Link to="/checkout" className="checkout-link">View Cart →</Link>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <Link to={`/products/${product._id}`} className="product-link">
                <div className="product-image-container">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  {product.countInStock === 0 && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                  )}
                </div>
                <div className="product-info">
                  {product.category && (
                    <span className="product-category">{product.category}</span>
                  )}
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">
                    {product.description ? 
                      (product.description.length > 80 
                        ? product.description.substring(0, 80) + '...' 
                        : product.description) 
                      : 'No description available'}
                  </p>
                  <div className="product-footer">
                    <div className="product-price">₹{product.price.toLocaleString()}</div>
                    <div className="product-stock">
                      {product.countInStock > 0 
                        ? `${product.countInStock} in stock` 
                        : 'Out of stock'}
                    </div>
                  </div>
                </div>
              </Link>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
                disabled={product.countInStock === 0}
              >
                {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
