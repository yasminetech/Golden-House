import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';

export default function AdminPanel({ userToken, onProductAdded }) {
  console.log('AdminPanel mounted');
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', image_url: '', category: '', stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchMessages();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiCall('/products');
      console.log('AdminPanel Products Data:', data);
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array of products, got:', data);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiCall('/contact');
      console.log('AdminPanel Messages Data:', data);
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Expected array of messages, got:', data);
      }
    } catch (error) { console.error(error); }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiCall('/orders');
      console.log('AdminPanel Orders Data:', data);
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Expected array of orders, got:', data);
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Assuming there is a route to update order status, if not we should add one
      // For now, let's just log it or add the route later if needed
      console.log(`Updating order ${orderId} to ${newStatus}`);
      // await apiCall(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      // fetchOrders();
    } catch (error) { console.error(error); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });
      setNewProduct({ name: '', description: '', price: '', image_url: '', category: '', stock: '' });
      fetchProducts();
      if (onProductAdded) onProductAdded();
      alert('Produit ajouté ! ✨');
    } catch (error) { alert('Erreur'); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
        if (onProductAdded) onProductAdded();
      } catch (error) { alert('Erreur'); }
    }
  };

  return (
    <section className="admin-panel section">
      <div className="section-header">
        <h2>Tableau de Bord Admin 🛠️</h2>
        <div className="auth-tabs" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Produits</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Commandes</button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>Messages</button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="admin-grid">
          <div className="form-card">
            <h3>Nouveau Produit</h3>
            <form onSubmit={handleAddProduct}>
              <input placeholder="Nom" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required />
              <input type="number" placeholder="Prix (€)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
              <input placeholder="Image URL" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} required />
              <input placeholder="Catégorie" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
              <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
              <button type="submit" className="btn-primary">Ajouter 🪄</button>
            </form>
          </div>

          <div className="admin-list-card">
            <h3>Gestion Catalogue</h3>
            <div className="admin-product-list">
              {products.map(p => (
                <div key={p.id} className="admin-product-item">
                  <img src={p.image_url} alt="" />
                  <div className="item-info">
                    <strong>{p.name}</strong>
                    <span>{p.price} € - Stock: {p.stock}</span>
                  </div>
                  <button className="secondary danger-text" onClick={() => handleDeleteProduct(p.id)}>Supprimer</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-orders-list" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3>Historique des Commandes 📦</h3>
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card-v2" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <div className="order-header">
                  <div className="order-id-badge">
                    <span>Commande</span>
                    <strong>#{order.id}</strong>
                  </div>
                  <div className={`order-status-tag ${order.status}`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="order-body">
                  <p><strong>Client:</strong> {order.username} ({order.email})</p>
                  <p><strong>Paiement:</strong> {order.payment_method === 'card' ? '💳 Carte' : '🅿️ PayPal'}</p>
                  <div className="order-items-mini">
                    {order.items.map(item => (
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
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="order-total-display">
                    <span>Total</span>
                    <strong>{Number(order.total_amount).toFixed(2)} €</strong>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p>Aucune commande pour le moment.</p>}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Messages Clients 📩</h3>
          {messages.map(m => (
            <div key={m.id} className="form-card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong>{m.name} ({m.email})</strong>
                <small>{new Date(m.created_at).toLocaleDateString()}</small>
              </div>
              <p>{m.message}</p>
            </div>
          ))}
          {messages.length === 0 && <p>Aucun message pour le moment.</p>}
        </div>
      )}
    </section>
  );
}
