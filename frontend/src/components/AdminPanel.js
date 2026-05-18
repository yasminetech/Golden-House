import React, { useState, useEffect } from 'react';
import { apiCall, apiBase, getFullImageUrl } from '../api';

export default function AdminPanel({ onProductAdded }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
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
      setNewProduct({ ...newProduct, image_url: data.imageUrl });
      alert('Image téléchargée ! ✅');
    } catch (error) {
      console.error(error);
      alert('Erreur lors du téléchargement');
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

      alert('Produit ajouté ! ✨');
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
        if (onProductAdded) onProductAdded();
      } catch (error) {
        alert('Erreur');
      }
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

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div className="admin-grid">
          <div className="form-card">
            <h3>Nouveau Produit</h3>
            <form onSubmit={handleAddProduct}>
              <input placeholder="Nom" value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />

              <textarea placeholder="Description" value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />

              <input type="number" placeholder="Prix (€)" value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />

              <div className="file-upload-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Image du produit (URL ou Fichier)
                </label>
                <input placeholder="Image URL" value={newProduct.image_url}
                  onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
                
                <div style={{ margin: '0.5rem 0', textAlign: 'center', color: '#666' }}>— OU —</div>
                
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Téléchargement en cours...</p>}
                
                {newProduct.image_url && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={getFullImageUrl(newProduct.image_url)} alt="Preview" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <input placeholder="Catégorie" value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required />

              <input type="number" placeholder="Stock" value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />

              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Attendez...' : 'Ajouter 🪄'}
              </button>
            </form>
          </div>

          <div className="admin-list-card">
            <h3>Gestion Catalogue</h3>
            <div className="admin-product-list">
              {products.map(p => (
                <div key={p.id} className="admin-product-item">
                  <img src={getFullImageUrl(p.image_url)} alt="" />
                  <div className="item-info">
                    <strong>{p.name}</strong>
                    <span>{p.price} € - Stock: {p.stock}</span>
                  </div>
                  <button className="secondary danger-text"
                    onClick={() => handleDeleteProduct(p.id)}>
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3>Commandes 📦</h3>

          {orders.map(order => (
            <div key={order.id} className="order-card-v2">
              <strong>Commande #{order.id}</strong>
              <p>{order.status}</p>
              <p>Total: {Number(order.total_amount).toFixed(2)} €</p>
            </div>
          ))}

          {orders.length === 0 && <p>Aucune commande.</p>}
        </div>
      )}

      {/* MESSAGES */}
      {activeTab === 'messages' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Messages 📩</h3>

          {messages.map(m => (
            <div key={m.id} className="form-card">
              <strong>{m.name} ({m.email})</strong>
              <p>{m.message}</p>
            </div>
          ))}

          {messages.length === 0 && <p>Aucun message.</p>}
        </div>
      )}
    </section>
  );
}