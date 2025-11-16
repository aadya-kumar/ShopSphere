import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { loadCart, saveCart } from '../utils/cart';

export default function ProductPage(){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load product');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.countInStock === 0) return;
    
    const cart = loadCart();
    const existing = cart.find(item => item.productId === product._id);
    
    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: product.image
      });
    }
    
    saveCart(cart);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (loading) {
    return (
      <div className="product-page-loading">
        <div className="loading-spinner">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-error">
        <h2>Product not found</h2>
        <Link to="/products" className="btn">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-page-container">
        <Link to="/products" className="back-link">
          ← Back to Products
        </Link>

        <div className="product-detail-grid">
          {/* Product Image */}
          <div className="product-image-section">
            {product.image ? (
              <div className="product-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-main-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                  }}
                />
              </div>
            ) : (
              <div className="product-image-placeholder-large">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            {product.category && (
              <span className="product-category-badge">{product.category}</span>
            )}
            
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price-section">
              <span className="product-price-large">₹{product.price.toLocaleString()}</span>
            </div>

            <div className="product-stock-info">
              {product.countInStock > 0 ? (
                <span className="in-stock">✓ {product.countInStock} in stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of stock</span>
              )}
            </div>

            {product.description && (
              <div className="product-description-section">
                <h3>Description</h3>
                <p className="product-description-text">{product.description}</p>
              </div>
            )}

            <div className="product-actions">
              {product.countInStock > 0 ? (
                <>
                  <div className="quantity-selector">
                    <label htmlFor="quantity">Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={product.countInStock}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(Math.max(1, val), product.countInStock));
                        }}
                        className="quantity-input"
                      />
                      <button 
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                        disabled={quantity >= product.countInStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button 
                    className="add-to-cart-btn-large"
                    onClick={handleAddToCart}
                  >
                    {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                  </button>

                  <Link to="/checkout" className="buy-now-btn">
                    Buy Now
                  </Link>
                </>
              ) : (
                <button className="add-to-cart-btn-large" disabled>
                  Out of Stock
                </button>
              )}
            </div>

            {addedToCart && (
              <div className="cart-success-message">
                ✓ Added {quantity} {quantity === 1 ? 'item' : 'items'} to cart!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
