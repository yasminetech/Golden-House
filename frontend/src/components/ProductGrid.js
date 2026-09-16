import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SearchIcon, SparklesIcon } from './Icons';

export default function ProductGrid({ products, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <section className="section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <SparklesIcon /> Collection Exclusive
        </span>
        <h2>Explorez la Galerie d'Exception</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
          Sélection curatée d'objets rares, pièces de créateur et ameublement d'artisanat d'art.
        </p>
      </div>

      <div className="controls-bar">
        <div className="search-sort-row">
          <div className="search-box">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Rechercher une pièce d'exception (ex: Vase, Miroir, Table)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Tri par Défaut</option>
            <option value="price-asc">Prix : Croissant</option>
            <option value="price-desc">Prix : Décroissant</option>
            <option value="name">Nom (A-Z)</option>
          </select>
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'Toutes les collections' : cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--gold-dark)', fontWeight: '600' }}>
        {filteredProducts.length} pièce{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="form-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ color: 'var(--gold-primary)', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
            <SearchIcon />
          </div>
          <h3 style={{ color: 'var(--text-main)' }}>Aucun produit ne correspond à votre recherche</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Essayez d'effacer les filtres ou de modifier votre terme de recherche.</p>
          <button
            className="btn-secondary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSortBy('default'); }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </section>
  );
}
