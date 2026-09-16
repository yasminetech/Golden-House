import React, { useState } from 'react';
import { getFullImageUrl } from '../api';
import { HeartIcon, CartIcon, CheckIcon } from './Icons';

export default function ProductCard({ product, onAddToCart }) {
  const [isLiked, setIsLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="product-card">
      <div className="product-card-header">
        <img src={getFullImageUrl(product.image_url)} alt={product.name} loading="lazy" />
        {product.category && (
          <span className="category-badge">{product.category}</span>
        )}
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          style={{
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-gold)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'grid',
            placeItems: 'center',
            color: isLiked ? '#ef4444' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.1)'
          }}
          title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <HeartIcon filled={isLiked} />
        </button>
      </div>

      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      
      <div className="product-meta">
        <div>
          <span className="price">{Number(product.price).toFixed(2)} DH</span>
          {product.stock !== undefined && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: product.stock < 10 ? 'var(--warning)' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: '600' }}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
            </span>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {added ? (
            <>
              <CheckIcon /> Ajouté
            </>
          ) : (
            <>
              <CartIcon /> Ajouter
            </>
          )}
        </button>
      </div>
    </article>
  );
}
