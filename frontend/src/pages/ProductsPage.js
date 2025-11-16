import React from 'react';
import ProductList from '../components/ProductList';

export default function ProductsPage(){
  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1 className="products-page-title">Shop Our Collection</h1>
        <p className="products-page-subtitle">Discover amazing products at great prices</p>
      </div>

      <section className="products-section">
        <ProductList />
      </section>
    </div>
  );
}
