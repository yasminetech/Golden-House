import React, { useState } from 'react';

export default function Cart({ items, onDecrease, onIncrease, onDelete, onCheckout, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const total = items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <div>
          <h3>Panier</h3>
          <p className="cart-status">{items.length} article{items.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={onClose}>Fermer</button>
      </div>
      <div className="cart-items">
        {items.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-item">
              <div>
                <h4>{item.name}</h4>
                <p className="cart-summary">
                  {Number(item.price).toFixed(2)} € • {item.quantity} unité{item.quantity > 1 ? 's' : ''}
                </p>
                <div className="cart-controls">
                  <button className="secondary" onClick={() => onDecrease(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="secondary" onClick={() => onIncrease(item.id)}>+</button>
                </div>
              </div>
              <button className="secondary danger-text" onClick={() => onDelete(item.id)}>
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>

      <div className="payment-section">
        <h4>Méthode de paiement</h4>
        <div className="payment-options">
          <button
            type="button"
            className={paymentMethod === 'card' ? 'payment-option active' : 'payment-option'}
            onClick={() => setPaymentMethod('card')}
          >
            💳 Carte bancaire
          </button>
          <button
            type="button"
            className={paymentMethod === 'paypal' ? 'payment-option active' : 'payment-option'}
            onClick={() => setPaymentMethod('paypal')}
          >
            🅿️ PayPal
          </button>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-info-form">
            <div className="form-group">
              <label>Nom sur la carte</label>
              <input type="text" placeholder="Mériam ..." />
            </div>
            <div className="form-group">
              <label>Numéro de carte</label>
              <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date d'expiration</label>
                <input type="text" placeholder="MM/YY" maxLength="5" />
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input type="text" placeholder="123" maxLength="3" />
              </div>
            </div>
          </div>
        )}

        <div className="payment-trust">
          <span>🔒 Paiement 100% sécurisé</span>
          <span>Visa, Mastercard, Maestro</span>
        </div>
        <p className="payment-note">
          {paymentMethod === 'card' 
            ? "Vos informations de paiement sont chiffrées." 
            : "Vous allez être redirigé vers PayPal pour finaliser votre achat."}
        </p>
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          Total : <strong>{total.toFixed(2)} €</strong>
        </div>
        <button id="btnCheckout" onClick={() => onCheckout(paymentMethod)} disabled={items.length === 0}>
          Payer maintenant
        </button>
      </div>
    </aside>
  );
}
