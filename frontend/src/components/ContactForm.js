import React, { useState } from 'react';
import { apiCall } from '../api';

export default function ContactForm({ onMessageSent }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message })
      });

      setName('');
      setEmail('');
      setMessage('');
      onMessageSent();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section contact-section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="hero-badge">Conciergerie & Conseil</span>
        <h2>Contactez la Maison</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.75rem auto 0' }}>
          Notre équipe de conseillers en décoration vous accompagne dans le choix de vos pièces d'exception.
        </p>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        <div className="form-card" style={{ background: '#faf8f5' }}>
          <h3 style={{ color: 'var(--royal-navy)' }}>Service Concierge</h3>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.75rem', lineHeight: '1.7' }}>
            Pour toute demande d'informations, commande sur mesure ou rendez-vous en galerie, nous vous répondons sous 24h.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <strong style={{ display: 'block', color: 'var(--royal-navy)', marginBottom: '0.2rem' }}>Adresse Galerie</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Place Vendôme, 75001 Paris</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <strong style={{ display: 'block', color: 'var(--royal-navy)', marginBottom: '0.2rem' }}>Téléphone Privé</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>+33 1 23 45 67 89</p>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <strong style={{ display: 'block', color: 'var(--royal-navy)', marginBottom: '0.2rem' }}>Email Conciergerie</strong>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>hello@goldenhouse.shop</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="category-badge" style={{ position: 'static' }}>Support 7j/7</span>
            <span className="category-badge" style={{ position: 'static' }}>Conseil Personnalisé</span>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <label htmlFor="contactName">Nom complet</label>
          <input
            id="contactName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            required
          />
          <label htmlFor="contactEmail">Adresse email</label>
          <input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />
          <label htmlFor="contactMessage">Votre message</label>
          <textarea
            id="contactMessage"
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Précisez votre demande ou votre projet d'aménagement..."
            required
          ></textarea>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
            {loading ? 'Envoi en cours...' : 'Transmettre le Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
