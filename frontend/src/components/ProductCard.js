import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <img src={product.image_url} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-meta">
        <span className="price">{Number(product.price).toFixed(2)} DH</span>
        <button className="btn-primary" onClick={() => onAddToCart(product)}>
          Ajouter 🛍️
        </button>
      </div>
    </article>
  );
}
