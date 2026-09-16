import React, { useState } from 'react';
import { getFullImageUrl } from '../api';
import { CartIcon, TrashIcon, OrdersIcon, CheckIcon } from './Icons';

export default function Cart({ items, onDecrease, onIncrease, onDelete, onCheckout, onClose }) {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const total = items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.fullName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim() || !shippingInfo.city.trim()) {
      setErrorMsg('Veuillez renseigner toutes vos coordonnées de livraison obligatoires.');
      return;
    }
    setErrorMsg('');
    const fullMethod = `Paiement à la livraison (Destinataire: ${shippingInfo.fullName}, Tél: ${shippingInfo.phone}, Adresse: ${shippingInfo.address}, ${shippingInfo.city})`;
    onCheckout(fullMethod, shippingInfo);
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-panel">
        <div className="cart-header">
          <div>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <CartIcon /> <span className="gold-text">Votre Sélection</span>
            </h3>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {items.reduce((s, i) => s + i.quantity, 0)} article{items.length > 1 ? 's' : ''} d'exception
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#faf8f5',
              border: '1px solid var(--border-gold)',
              color: 'var(--royal-navy)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'grid',
              placeItems: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Fermer le panier"
          >
            ✕
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div style={{ color: 'var(--gold-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.25rem' }}>
                <CartIcon size={40} />
              </div>
              <h4 style={{ color: 'var(--royal-navy)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Votre panier est vide</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Explorez notre catalogue pour y ajouter des pièces uniques et des objets d'artisanat.
              </p>
              <button className="btn-secondary" style={{ marginTop: '1.75rem' }} onClick={onClose}>
                Découvrir les Collections
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    {item.image_url && (
                      <img 
                        src={getFullImageUrl(item.image_url)} 
                        alt={item.name} 
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-gold)',
                          flexShrink: 0
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1rem', color: 'var(--royal-navy)', margin: '0 0 0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h4>
                      <p className="cart-summary" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>
                        {Number(item.price).toFixed(2)} DH / unité
                      </p>
                      
                      <div className="cart-controls">
                        <button type="button" onClick={() => onDecrease(item.id)}>-</button>
                        <span style={{ color: 'var(--royal-navy)', fontWeight: '700', padding: '0 0.5rem', fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button type="button" onClick={() => onIncrease(item.id)}>+</button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontWeight: '800', color: 'var(--gold-dark)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.35rem' }}>
                        {(Number(item.price) * item.quantity).toFixed(2)} DH
                      </div>
                      <button 
                        type="button" 
                        onClick={() => onDelete(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                        title="Supprimer l'article"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-card" style={{ marginTop: '1.75rem', padding: '1.35rem', background: '#faf8f5', border: '1px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--gold-dark)' }}>
                  <OrdersIcon />
                  <h4 style={{ color: 'var(--royal-navy)', margin: 0, fontSize: '1.1rem' }}>
                    Coordonnées de Livraison
                  </h4>
                </div>

                {errorMsg && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>NOM ET PRÉNOM *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Jean Dupont" 
                      value={shippingInfo.fullName}
                      onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      style={{ marginBottom: 0, background: '#ffffff' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>TÉLÉPHONE DE CONTACT *</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: +33 6 12 34 56 78" 
                      value={shippingInfo.phone}
                      onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      style={{ marginBottom: 0, background: '#ffffff' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>ADRESSE DE LIVRAISON *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 14 Rue de la Paix" 
                      value={shippingInfo.address}
                      onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      style={{ marginBottom: 0, background: '#ffffff' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>VILLE & CODE POSTAL *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 75002 Paris" 
                      value={shippingInfo.city}
                      onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      style={{ marginBottom: 0, background: '#ffffff' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>INSTRUCTIONS (OPTIONNEL)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Code B12, appeler à l'arrivée" 
                      value={shippingInfo.notes}
                      onChange={e => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      style={{ marginBottom: 0, background: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="payment-section">
              <label style={{ marginBottom: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>MODE DE PAIEMENT SÉLECTIONNÉ</label>
              <div 
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--gold-amber)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.15rem',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', color: 'var(--gold-dark)' }}>
                  <CheckIcon />
                  <strong style={{ color: 'var(--royal-navy)', fontSize: '0.98rem' }}>
                    Paiement à la livraison
                  </strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Règlement sécurisé en espèces ou CB directement auprès du livreur à la réception de votre colis.
                </p>
              </div>
            </div>

            <div className="cart-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Frais de livraison :</span>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>GRATUIT (Offerts)</span>
              </div>
              <div className="cart-total" style={{ marginBottom: '1.25rem' }}>
                <span>Total de la commande :</span>
                <strong>{total.toFixed(2)} DH</strong>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '1.15rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.98rem' }}
                onClick={handleSubmit}
              >
                <CheckIcon /> Valider la Commande
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
