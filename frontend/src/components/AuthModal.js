import React, { useState } from 'react';

export default function AuthModal({ tab, onTabChange, onLogin, onSignup, onClose }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(loginEmail, loginPassword);
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    onSignup(signupUsername, signupEmail, signupPassword);
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
  };

  return (
    <section className="auth-modal">
      <div className="auth-card">
        <div className="auth-header">
          <div>
            <span>Connexion rapide</span>
            <h2>{tab === 'login' ? 'Bienvenue à Golden House' : 'Rejoignez notre communauté'}</h2>
          </div>
          <button className="auth-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button
            className={tab === 'login' ? 'active' : ''}
            onClick={() => onTabChange('login')}
          >
            Connexion
          </button>
          <button
            className={tab === 'signup' ? 'active' : ''}
            onClick={() => onTabChange('signup')}
          >
            Inscription
          </button>
        </div>

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
            <label htmlFor="loginPassword">Mot de passe</label>
            <input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="submit">Se connecter</button>
            <p className="auth-note">Vous n'avez pas encore de compte ? Passez à l'onglet Inscription.</p>
          </form>
        )}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <label htmlFor="signupUsername">Nom d'utilisateur</label>
            <input
              id="signupUsername"
              type="text"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              placeholder="Ex : GoldenFan"
              required
            />
            <label htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
            <label htmlFor="signupPassword">Mot de passe</label>
            <input
              id="signupPassword"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="submit">S'inscrire</button>
            <p className="auth-note">Rejoignez-nous pour recevoir des offres exclusives et suivre vos commandes facilement.</p>
          </form>
        )}
      </div>
    </section>
  );
}
