// frontend/src/components/ProductList.js
import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import { loadCart, saveCart } from '../utils/cart';
import { Link } from 'react-router-dom';

export default function ProductList(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(loadCart().reduce((s,i)=>s+i.qty,0));
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    api.get('/api/products')
      .then(res => {
        // Ensure res.data is an array
        const productsData = Array.isArray(res.data) ? res.data : [];
        console.log('Products loaded:', productsData.length, 'products');
        setProducts(productsData);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        console.error('Error details:', err.response?.data || err.message);
        console.error('Error code:', err.code);
        console.error('Request URL:', err.config?.url);
        console.error('Base URL:', err.config?.baseURL);
        // Set empty array on error to prevent .map() crashes
        setProducts([]);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error') || err.message.includes('CORS')) {
          const apiUrl = process.env.REACT_APP_API_URL || 'not set';
          alert(`Cannot connect to backend server.\n\nAPI URL: ${apiUrl}\n\nPlease check:\n1. Backend server is running and accessible\n2. CORS is configured correctly on backend\n3. REACT_APP_API_URL environment variable is set correctly\n4. Check browser console for more details`);
        } else if (err.response?.status === 404) {
          alert('Backend endpoint not found. Please check the API URL configuration.');
        } else {
          alert(`Failed to load products: ${err.response?.data?.message || err.message}\n\nCheck browser console for details.`);
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

  // Ensure products is always an array before using .map()
  const safeProducts = Array.isArray(products) ? products : [];
  const categories = ['All', ...new Set(safeProducts.map(p => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory === 'All' 
    ? safeProducts 
    : safeProducts.filter(p => p.category === selectedCategory);

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
