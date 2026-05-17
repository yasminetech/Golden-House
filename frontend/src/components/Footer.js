import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <a className="brand" href="#/">Golden House ✨</a>
          <p>Votre boutique toute douce pour des trouvailles uniques et élégantes.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Boutique</h4>
            <ul>
              <li><a href="#/">Produits</a></li>
              <li><a href="#/">Nouveautés</a></li>
              <li><a href="#/">Promotions</a></li>
            </ul>
          </div>
          <div>
            <h4>Aide</h4>
            <ul>
              <li><a href="#/">FAQ</a></li>
              <li><a href="#/">Livraison</a></li>
              <li><a href="#/">Retours</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Email: hello@goldenhouse.shop</li>
              <li>Tél: +33 1 23 45 67 89</li>
              <li>Suivez-nous: ❤️ ✨ 📸</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Golden House. Fait avec amour et tendresse. 🌸</p>
      </div>
    </footer>
  );
}
