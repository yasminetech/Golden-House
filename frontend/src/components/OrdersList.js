import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { OrdersIcon } from './Icons';

export default function OrdersList({ userToken }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userToken) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiCall('/orders/user', { method: 'GET' });
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userToken]);

  return (
    <section className="section orders-section">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="hero-badge">Historique d'Achats</span>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
            <OrdersIcon /> Mes Commandes
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.75rem auto 0' }}>
            Consultez le statut de vos commandes en cours et retrouvez le récapitulatif de vos réservations.
          </p>
        </div>

        {!userToken && (
          <div className="form-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '540px', margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              Connectez-vous à votre compte privilège pour consulter l'historique de vos commandes.
            </p>
          </div>
        )}

        {userToken && loading && (
          <div className="loading-state" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Chargement de vos commandes...</p>
          </div>
        )}

        {userToken && !loading && orders.length === 0 && (
          <div className="form-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '540px', margin: '0 auto' }}>
            <div style={{ color: 'var(--gold-primary)', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
              <OrdersIcon />
            </div>
            <h4 style={{ color: 'var(--royal-navy)', marginBottom: '0.5rem' }}>Aucune commande pour le moment</h4>
            <p style={{ color: 'var(--text-muted)' }}>Vous n'avez pas encore passé de commande dans notre galerie.</p>
          </div>
        )}

        {userToken && !loading && orders.length > 0 && (
          <div className="orders-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card-v2">
                <div className="order-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                      COMMANDE #{order.id}
                    </span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--royal-navy)', marginTop: '0.2rem' }}>
                      Règlement à la livraison
                    </strong>
                  </div>
                  <div className={`order-status-tag ${order.status}`}>
                    {order.status === 'completed' ? 'Livrée' : order.status === 'pending' ? 'En cours' : 'Annulée'}
                  </div>
                </div>
                
                <div className="order-body">
                  <div style={{ marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px dashed var(--border-gold)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>MODALITÉ :</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--royal-navy)' }}>{order.payment_method}</strong>
                  </div>

                  <div className="order-items-mini">
                    {order.items && order.items.map(item => (
                      <div key={item.id} className="order-item-row">
                        <span className="item-qty"><strong>{item.quantity}x</strong> {item.product_name}</span>
                        <span className="item-price" style={{ fontWeight: '700', color: 'var(--gold-dark)' }}>{(item.price * item.quantity).toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="order-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📅 Recu le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="order-total-display">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Total :</span>
                    <strong style={{ fontSize: '1.3rem', fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold-dark)' }}>{Number(order.total_amount).toFixed(2)} DH</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
