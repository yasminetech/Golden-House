import React, { useState } from 'react';
import { LogoIcon, GalleryIcon, ContactIcon, OrdersIcon, AdminIcon, CartIcon } from './Icons';

export default function Header({
  currentView,
  onProductsClick,
  onContactClick,
  onOrdersClick,
  onAdminClick,
  onCartClick,
  onLoginClick,
  onSignupClick,
  onLogoutClick,
  isLoggedIn,
  isAdmin,
  cartCount
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (callback) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a 
          className="brand" 
          href="#/" 
          onClick={(e) => {
            e.preventDefault();
            onProductsClick();
          }}
          title="Golden House - Accueil"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <LogoIcon size={52} />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className={currentView === 'products' ? 'active' : ''} 
            onClick={() => handleNavClick(onProductsClick)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <GalleryIcon /> Galerie
          </button>
          <button 
            className={currentView === 'contact' ? 'active' : ''} 
            onClick={() => handleNavClick(onContactClick)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <ContactIcon /> Contact
          </button>
          <button 
            className={currentView === 'orders' ? 'active' : ''} 
            onClick={() => handleNavClick(onOrdersClick)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <OrdersIcon /> Commandes
          </button>
          {isAdmin && (
            <button 
              className={`admin-nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick(onAdminClick)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <AdminIcon /> Admin
            </button>
          )}
          
          <div className="mobile-only-actions">
            {!isLoggedIn ? (
              <>
                <button className="btn-secondary" onClick={() => handleNavClick(onLoginClick)}>Connexion</button>
                <button className="btn-primary" onClick={() => handleNavClick(onSignupClick)}>Inscription</button>
              </>
            ) : (
              <button className="btn-secondary" onClick={() => handleNavClick(onLogoutClick)}>Déconnexion</button>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <div className="auth-buttons-desktop">
            {!isLoggedIn ? (
              <>
                <button className="btn-secondary" onClick={onLoginClick}>Connexion</button>
                <button className="btn-primary" onClick={onSignupClick}>Inscription</button>
              </>
            ) : (
              <button className="btn-secondary" onClick={onLogoutClick}>Déconnexion</button>
            )}
          </div>

          <button
            className="btn-primary cart-btn-action"
            onClick={onCartClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            aria-label="Voir le panier"
          >
            <CartIcon /> <span className="cart-btn-text">Panier</span>
            {cartCount > 0 && (
              <span className="cart-badge-count">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
