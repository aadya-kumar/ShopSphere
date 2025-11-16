import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="page container">
      <h1>404 — Page not found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}
