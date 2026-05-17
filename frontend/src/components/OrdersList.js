import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';

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
        <div className="section-header">
          <h2>Mes commandes</h2>
          <p>Suivez l'état de vos commandes récentes et retrouvez vos factures.</p>
        </div>

        {!userToken && (
          <div className="empty-state">
            <p>Connectez-vous pour voir l'historique de vos commandes.</p>
          </div>
        )}

        {userToken && loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement de vos commandes...</p>
          </div>
        )}

        {userToken && !loading && orders.length === 0 && (
          <div className="empty-state">
            <p>Vous n'avez pas encore passé de commande.</p>
          </div>
        )}

        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card-v2">
              <div className="order-header">
                <div className="order-id-badge">
                  <span>Commande</span>
                  <strong>#{order.id}</strong>
                </div>
                <div className={`order-status-tag ${order.status}`}>
                  {order.status === 'completed' ? 'Livrée' : order.status === 'pending' ? 'En cours' : 'Annulée'}
                </div>
              </div>
              
              <div className="order-body">
                <div className="order-items-mini">
                  {order.items && order.items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.product_name}</span>
                      <span className="item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-footer">
                <div className="order-date">
                  <i className="far fa-calendar-alt"></i>
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <span style={{ marginLeft: '1rem', opacity: 0.7 }}>
                    💳 {order.payment_method === 'card' ? 'Carte' : 'PayPal'}
                  </span>
                </div>
                <div className="order-total-display">
                  <span>Total</span>
                  <strong>{Number(order.total_amount).toFixed(2)} €</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
