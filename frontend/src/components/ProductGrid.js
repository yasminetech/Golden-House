import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAddToCart }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Nos produits</h2>
        <p>Choisissez vos articles favoris, ajoutez-les au panier et passez commande.</p>
      </div>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
