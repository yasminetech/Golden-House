import React, { useState } from 'react';

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
        <a className="brand" href="#/" onClick={(e) => {
          e.preventDefault();
          onProductsClick();
        }}>
          Golden House ✨
        </a>

        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className={currentView === 'products' ? 'active' : ''} 
            onClick={() => handleNavClick(onProductsClick)}
          >
            Produits
          </button>
          <button 
            className={currentView === 'contact' ? 'active' : ''} 
            onClick={() => handleNavClick(onContactClick)}
          >
            Contact
          </button>
          <button 
            className={currentView === 'orders' ? 'active' : ''} 
            onClick={() => handleNavClick(onOrdersClick)}
          >
            Mes commandes
          </button>
          {isAdmin && (
            <button 
              className={`admin-btn ${currentView === 'admin' ? 'active' : ''}`} 
              onClick={() => handleNavClick(onAdminClick)}
            >
              Admin 🛠️
            </button>
          )}
          
          <div className="mobile-only-actions">
            {!isLoggedIn ? (
              <>
                <button onClick={() => handleNavClick(onLoginClick)}>Connexion</button>
                <button className="btn-primary" onClick={() => handleNavClick(onSignupClick)}>Inscription</button>
              </>
            ) : (
              <button onClick={() => handleNavClick(onLogoutClick)}>Déconnexion</button>
            )}
          </div>
        </nav>

        <div className="header-actions desktop-only">
          {!isLoggedIn ? (
            <>
              <button onClick={onLoginClick}>Connexion</button>
              <button className="btn-primary" onClick={onSignupClick}>Inscription</button>
            </>
          ) : (
            <button onClick={onLogoutClick}>Déconnexion</button>
          )}
          <button className={`cart-button ${cartCount > 0 ? 'btn-primary' : ''}`} onClick={onCartClick}>
            Panier ({cartCount})
          </button>
        </div>

        <button className={`cart-button mobile-cart ${cartCount > 0 ? 'btn-primary' : ''}`} onClick={onCartClick}>
          🛒 ({cartCount})
        </button>
      </div>
    </header>
  );
}
