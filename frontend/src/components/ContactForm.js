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
      <div className="section-header">
        <h2>Contactez-nous</h2>
        <p>Envoyez-nous un message, demandez conseil ou partagez votre idée déco. Nous répondons généralement sous 24 heures.</p>
      </div>
      <div className="contact-grid">
        <div className="contact-info-card">
          <h3>Besoin d'aide ?</h3>
          <p>Notre équipe douce et réactive est prête à vous aider à trouver le cadeau parfait ou à finaliser votre commande.</p>

          <div className="contact-detail-row">
            <span>📍</span>
            <div>
              <strong>Adresse</strong>
              <p>20 rue de la Création, 75001 Paris</p>
            </div>
          </div>

          <div className="contact-detail-row">
            <span>📞</span>
            <div>
              <strong>Téléphone</strong>
              <p>+33 1 23 45 67 89</p>
            </div>
          </div>

          <div className="contact-detail-row">
            <span>📧</span>
            <div>
              <strong>Email</strong>
              <p>hello@goldenhouse.shop</p>
            </div>
          </div>

          <div className="contact-pill-list">
            <span>Support 7j/7</span>
            <span>Réponse sous 24h</span>
            <span>Service personnalisé</span>
          </div>
        </div>

        <form className="form-card contact-form-card" onSubmit={handleSubmit}>
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
            placeholder="Dites-nous comment nous pouvons vous aider..."
            required
          ></textarea>
          <button type="submit" disabled={loading} className="primary">
            {loading ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </section>
  );
}
