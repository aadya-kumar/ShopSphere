import React from 'react';
import ProductList from '../components/ProductList';

export default function Home(){
  return (
    <div className="page container">
      <header className="page-header">
        <h1>ShopSphere</h1>
        <p className="lead">A minimal MERN e-commerce demo — homepage and navigation.</p>
      </header>

      <section>
        <h3>Products</h3>
        <ProductList />
      </section>
    </div>
  );
}
