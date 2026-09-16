import React, { useState, useEffect } from 'react';
import { apiCall, apiBase, getFullImageUrl } from '../api';
import { AdminIcon, EditIcon, TrashIcon, SearchIcon } from './Icons';

export default function AdminPanel({ onProductAdded }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      if (isEditing && editingProduct) {
        setEditingProduct({ ...editingProduct, image_url: data.imageUrl });
      } else {
        setNewProduct({ ...newProduct, image_url: data.imageUrl });
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors du téléchargement de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMessages();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiCall('/products');
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiCall('/contact');
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiCall('/orders');
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    }
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

      setNewProduct({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        stock: ''
      });

      fetchProducts();
      if (onProductAdded) onProductAdded();

      alert('Produit ajouté au catalogue avec succès.');
    } catch (error) {
      alert(error.error || error.message || 'Erreur lors de l\'ajout du produit');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await apiCall(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock)
        })
      });

      setEditingProduct(null);
      fetchProducts();
      if (onProductAdded) onProductAdded();

      alert('Produit mis à jour avec succès.');
    } catch (error) {
      alert(error.error || error.message || 'Erreur de modification du produit');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit du catalogue ?')) {
      try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
        if (onProductAdded) onProductAdded();
      } catch (error) {
        alert(error.error || error.message || 'Erreur de suppression');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiCall(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      alert('Erreur lors du changement de statut de la commande.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la commande #${orderId} ?`)) {
      try {
        await apiCall(`/orders/${orderId}`, { method: 'DELETE' });
        fetchOrders();
        alert('Commande supprimée avec succès.');
      } catch (error) {
        alert(error.error || error.message || 'Erreur lors de la suppression de la commande');
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Supprimer ce message client ?')) {
      try {
        await apiCall(`/contact/${id}`, { method: 'DELETE' });
        fetchMessages();
      } catch (error) {
        alert('Erreur lors de la suppression du message');
      }
    }
  };

  // Metric KPIs
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'pending') return o.status === 'pending';
    if (orderFilter === 'completed') return o.status === 'completed';
    if (orderFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <section className="admin-panel section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="hero-badge">Administration Système</span>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
          <AdminIcon /> Tableau de Bord Golden House
        </h2>
      </div>

      {/* KPI STATS CARDS */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="form-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', uppercase: 'true', color: 'var(--text-muted)', fontWeight: '700' }}>VENTES RÉALISÉES</span>
          <strong style={{ display: 'block', fontSize: '2.2rem', fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold-dark)', marginTop: '0.3rem' }}>
            {totalRevenue.toFixed(2)} DH
          </strong>
        </div>

        <div className="form-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', uppercase: 'true', color: 'var(--text-muted)', fontWeight: '700' }}>COMMANDES À LIVRER</span>
          <strong style={{ display: 'block', fontSize: '2.2rem', fontFamily: 'Cormorant Garamond, serif', color: 'var(--royal-navy)', marginTop: '0.3rem' }}>
            {pendingOrdersCount}
          </strong>
        </div>

        <div className="form-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', uppercase: 'true', color: 'var(--text-muted)', fontWeight: '700' }}>CATALOGUE PRODUITS</span>
          <strong style={{ display: 'block', fontSize: '2.2rem', fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold-dark)', marginTop: '0.3rem' }}>
            {products.length}
          </strong>
        </div>

        <div className="form-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
          <span style={{ fontSize: '0.8rem', uppercase: 'true', color: 'var(--text-muted)', fontWeight: '700' }}>MESSAGES CLIENTS</span>
          <strong style={{ display: 'block', fontSize: '2.2rem', fontFamily: 'Cormorant Garamond, serif', color: 'var(--royal-navy)', marginTop: '0.3rem' }}>
            {messages.length}
          </strong>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="auth-tabs" style={{ maxWidth: '640px', margin: '0 auto 2.5rem' }}>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          Gestion Catalogue ({products.length})
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Commandes ({orders.length})
        </button>
        <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
          Messages ({messages.length})
        </button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="admin-grid">
          <div className="form-card">
            <h3>{editingProduct ? '✏️ Modifier Produit' : '✨ Nouveau Produit'}</h3>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
              <label>NOM DU PRODUIT *</label>
              <input
                placeholder="Ex: Vase Artisanal Monogramme"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={e => editingProduct 
                  ? setEditingProduct({ ...editingProduct, name: e.target.value })
                  : setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />

              <label>DESCRIPTION DÉTAILLÉE *</label>
              <textarea
                placeholder="Description et finitions..."
                rows="4"
                value={editingProduct ? editingProduct.description : newProduct.description}
                onChange={e => editingProduct
                  ? setEditingProduct({ ...editingProduct, description: e.target.value })
                  : setNewProduct({ ...newProduct, description: e.target.value })}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>PRIX (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="85.00"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={e => editingProduct
                      ? setEditingProduct({ ...editingProduct, price: e.target.value })
                      : setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>STOCK *</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={editingProduct ? editingProduct.stock : newProduct.stock}
                    onChange={e => editingProduct
                      ? setEditingProduct({ ...editingProduct, stock: e.target.value })
                      : setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <label>CATÉGORIE *</label>
              <input
                placeholder="Ex: Vases, Mobilier, Éclairage"
                value={editingProduct ? editingProduct.category : newProduct.category}
                onChange={e => editingProduct
                  ? setEditingProduct({ ...editingProduct, category: e.target.value })
                  : setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />

              <div className="file-upload-group" style={{ marginBottom: '1.25rem' }}>
                <label>IMAGE DU PRODUIT (URL OU FICHIER)</label>
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={editingProduct ? editingProduct.image_url : newProduct.image_url}
                  onChange={e => editingProduct
                    ? setEditingProduct({ ...editingProduct, image_url: e.target.value })
                    : setNewProduct({ ...newProduct, image_url: e.target.value })}
                />
                
                <div style={{ margin: '0.4rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>— OU IMPORTER UN FICHIER —</div>
                
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, !!editingProduct)} disabled={uploading} />
                {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', marginTop: '0.4rem' }}>Téléchargement de l'image...</p>}
                
                {(editingProduct ? editingProduct.image_url : newProduct.image_url) && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={getFullImageUrl(editingProduct ? editingProduct.image_url : newProduct.image_url)}
                      alt="Aperçu" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-gold)' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>✓ Image chargée</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.95rem' }} disabled={uploading}>
                  {editingProduct ? 'Mettre à jour le produit' : 'Ajouter au catalogue'}
                </button>
                {editingProduct && (
                  <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Catalogue ({filteredProducts.length})</h3>
            </div>

            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <span className="search-icon"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Filtrer les produits par nom ou catégorie..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '600px', overflowY: 'auto' }}>
              {filteredProducts.map(p => (
                <div key={p.id} className="admin-product-item" style={{ background: '#faf8f5', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                  <img src={getFullImageUrl(p.image_url)} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-gold)' }} />
                  <div className="item-info" style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ color: 'var(--royal-navy)', fontSize: '0.98rem' }}>{p.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--gold-dark)' }}>{Number(p.price).toFixed(2)} DH</span> • Stock: <strong>{p.stock}</strong> • {p.category}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => { setEditingProduct(p); window.scrollTo({ top: 300, behavior: 'smooth' }); }} title="Éditer">
                      <EditIcon />
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.45rem 0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteProduct(p.id)} title="Supprimer">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Aucun produit ne correspond au filtre.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Gestion des Commandes ({filteredOrders.length})</h3>

            {/* ORDER STATUS FILTERS */}
            <div className="category-pills" style={{ margin: 0, paddingBottom: 0 }}>
              <button 
                className={`category-pill ${orderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                Toutes ({orders.length})
              </button>
              <button 
                className={`category-pill ${orderFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setOrderFilter('pending')}
              >
                En cours ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button 
                className={`category-pill ${orderFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setOrderFilter('completed')}
              >
                Confirmées / Livrées ({orders.filter(o => o.status === 'completed').length})
              </button>
              <button 
                className={`category-pill ${orderFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setOrderFilter('cancelled')}
              >
                Annulées ({orders.filter(o => o.status === 'cancelled').length})
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card-v2">
                <div className="order-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                      COMMANDE #{order.id}
                    </span>
                    <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--royal-navy)', marginTop: '0.2rem' }}>
                      {order.username} ({order.email})
                    </strong>
                  </div>
                  <div className={`order-status-tag ${order.status}`}>
                    {order.status === 'completed' ? 'Livrée' : order.status === 'pending' ? 'En cours' : 'Annulée'}
                  </div>
                </div>

                <div className="order-body">
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-gold)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>MODALITÉ DE PAIEMENT & LIVRAISON :</strong>
                    <div style={{ fontSize: '0.92rem', color: 'var(--royal-navy)', fontWeight: '600' }}>
                      {order.payment_method}
                    </div>
                  </div>

                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>ARTICLES COMMANDÉS :</strong>
                  {order.items && order.items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span><strong>{item.quantity}x</strong> {item.product_name}</span>
                      <span style={{ fontWeight: '700', color: 'var(--gold-dark)' }}>{(item.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📅 Date : <strong>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong> • Total: <strong style={{ color: 'var(--gold-dark)', fontSize: '1.1rem' }}>{Number(order.total_amount).toFixed(2)} DH</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Changer Statut :</span>
                    <button 
                      className={`btn-secondary ${order.status === 'pending' ? 'btn-primary' : ''}`}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                      onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                    >
                      En cours
                    </button>
                    <button 
                      className={`btn-secondary ${order.status === 'completed' ? 'btn-primary' : ''}`}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                    >
                      Livrée
                    </button>
                    <button 
                      className={`btn-secondary ${order.status === 'cancelled' ? 'btn-primary' : ''}`}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', color: 'var(--danger)' }}
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                    >
                      Annulée
                    </button>
                    <button 
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => handleDeleteOrder(order.id)}
                      title="Supprimer la commande"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredOrders.length === 0 && <p className="form-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Aucune commande trouvée dans ce filtre.</p>}
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Messages Clients ({messages.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map(m => (
              <div key={m.id} className="form-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#ffffff' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--royal-navy)', fontSize: '1.1rem' }}>{m.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: '700' }}>{m.email}</span>
                  </div>
                  <p style={{ margin: '0.75rem 0', color: 'var(--text-main)', lineHeight: '1.6', background: '#faf8f5', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                    {m.message}
                  </p>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📅 Recu le {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '0.5rem 0.85rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} 
                  onClick={() => handleDeleteMessage(m.id)}
                  title="Supprimer le message"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          {messages.length === 0 && <p className="form-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Aucun message client répertorié.</p>}
        </div>
      )}
    </section>
  );
}