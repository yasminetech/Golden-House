import React from 'react';
import { LogoIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <a className="brand" href="#/" title="Golden House" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <LogoIcon size={54} />
          </a>
          <p>
            Maison d'édition et galerie en ligne d'objets de décoration d'intérieur, mobilier d'artisanat et luminaires d'exception.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Collections</h4>
            <ul>
              <li><a href="#/">Mobilier d'Art</a></li>
              <li><a href="#/">Vases & Sculptures</a></li>
              <li><a href="#/">Luminaires</a></li>
              <li><a href="#/">Horloges de Luxe</a></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><a href="#/">Conseil en Conciergerie</a></li>
              <li><a href="#/">Livraison Privilège</a></li>
              <li><a href="#/">Garantie Authenticité</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact Privé</h4>
            <ul>
              <li>hello@goldenhouse.shop</li>
              <li>+33 1 23 45 67 89</li>
              <li>Paris • Place Vendôme</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Golden House. Tous droits réservés. Maison de Haute Décoration.</p>
      </div>
    </footer>
  );
}
