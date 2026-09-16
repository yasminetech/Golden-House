import React, { useState, useEffect, Suspense, lazy } from 'react';
import './styles/App.css';
import { apiCall } from './api';

import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import { SparklesIcon, GalleryIcon, ContactIcon } from './components/Icons';
const Cart = lazy(() => import('./components/Cart'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const OrdersList = lazy(() => import('./components/OrdersList'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));


function App() {
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState('products');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [userToken, setUserToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    if (userToken) {
      apiCall('/auth/me')
        .then(user => {
          if (user && user.id) {
            setUserData(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        })
        .catch(() => {
          setUserToken(null);
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, [userToken]);

  const fetchProducts = async () => {
    try {
      const data = await apiCall('/products');
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    console.log('Current User Data:', userData);
    console.log('Is Admin:', userData?.role === 'admin');
  }, [userData]);


  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      const productWithNumPrice = { ...product, price: Number(product.price) };
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...productWithNumPrice, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartItem = (productId, delta) => {
    setCart(prevCart => prevCart
      .map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter(item => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId) => {
    handleUpdateCartItem(productId, -1);
  };

  const handleAddQuantity = (productId) => {
    handleUpdateCartItem(productId, 1);
  };

  const handleDeleteFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleLogin = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        setUserToken(data.token);
        setUserData(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthOpen(false);
        setMessage('Connecté avec succès');
      } else {
        setMessage(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      setMessage('Impossible de se connecter');
    }
  };

  const handleSignup = async (username, email, password) => {
    try {
      const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      if (data.userId) {
        setMessage('Inscription réussie. Connectez-vous maintenant.');
        setAuthTab('login');
      } else {
        setMessage(data.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      setMessage('Impossible de s\'inscrire');
    }
  };

  const handleLogout = () => {
    setUserToken(null);
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('Déconnecté');
  };

  const handleCheckout = async (paymentMethod) => {
    if (!userToken) {
      setMessage('Connectez-vous avant de commander');
      return;
    }
    if (cart.length === 0) {
      setMessage('Votre panier est vide');
      return;
    }

    try {
      const total_amount = cart.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
      const items = cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: Number(item.price) }));

      // 1) create order in our system (status pending)
      const orderResp = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify({ total_amount, items, payment_method: paymentMethod })
      });

      if (!orderResp.orderId) {
        setMessage(orderResp.error || orderResp.message || 'Erreur de création de commande');
        return;
      }

      const orderId = orderResp.orderId;
      // save pending order info locally so we can confirm after redirect
      const pending = { orderId, provider: paymentMethod };
      localStorage.setItem('pendingOrder', JSON.stringify(pending));

      // Instant order confirmation for Paiement à la livraison
      setCart([]);
      setCartOpen(false);
      setMessage('Votre commande a été validée avec succès ! Le règlement s\'effectuera à la livraison. 🚚');
    } catch (error) {
      const errMsg = (typeof error === 'string') ? error : (error.error || error.message || JSON.stringify(error));
      setMessage(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
    }
  };

  // On load, check for payment return query params and confirm with backend
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const session_id = params.get('session_id');
    const pendingRaw = localStorage.getItem('pendingOrder');
    if (!pendingRaw) return;
    const pending = JSON.parse(pendingRaw);

    const confirmStripe = async (sessionId, orderId) => {
      try {
        const resp = await apiCall('/payment/stripe-confirm', {
          method: 'POST',
          body: JSON.stringify({ sessionId })
        });
        if (resp.success) {
          setCart([]);
          setMessage('Paiement réussi — commande confirmée.');
          localStorage.removeItem('pendingOrder');
          setCartOpen(false);
        } else {
          setMessage(resp.error || 'Échec de la confirmation Stripe.');
        }
      } catch (err) {
        setMessage(err.error || err.message || 'Erreur lors de la confirmation Stripe');
      }
    };

    const confirmPaypal = async (paypalOrderId, orderId) => {
      try {
        const resp = await apiCall('/payment/paypal-capture', {
          method: 'POST',
          body: JSON.stringify({ paypalOrderId })
        });
        if (resp.success) {
          setCart([]);
          setMessage('Paiement PayPal confirmé.');
          localStorage.removeItem('pendingOrder');
          setCartOpen(false);
        } else {
          setMessage(resp.error || 'Échec de la capture PayPal.');
        }
      } catch (err) {
        setMessage(err.error || err.message || 'Erreur lors de la capture PayPal');
      }
    };

    if (payment === 'stripe_success' && session_id && pending.provider === 'card') {
      confirmStripe(session_id, pending.orderId);
    }

    if (payment === 'paypal_success' && pending.provider === 'paypal') {
      // use stored paypalOrderId if present
      const paypalOrderId = pending.paypalOrderId || params.get('token');
      if (paypalOrderId) confirmPaypal(paypalOrderId, pending.orderId);
    }
  }, []);

  return (
    <div className="app">
      <Suspense fallback={<div>Chargement...</div>}>
        <Header
          currentView={currentView}
          onProductsClick={() => setCurrentView('products')}
          onContactClick={() => setCurrentView('contact')}
          onOrdersClick={() => setCurrentView('orders')}
          onAdminClick={() => setCurrentView('admin')}
          onCartClick={() => setCartOpen(!cartOpen)}
          onLoginClick={() => {
            setAuthTab('login');
            setAuthOpen(true);
          }}
          onSignupClick={() => {
            setAuthTab('signup');
            setAuthOpen(true);
          }}
          onLogoutClick={handleLogout}
          isLoggedIn={!!userToken}
          isAdmin={userData?.role === 'admin' || userData?.email === 'admin@goldenhouse.shop'}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />

        <main className="container">
          {currentView === 'products' && (
            <>
              <section className="hero">
                <span className="hero-badge">
                  <SparklesIcon /> Haute Décoration & Mobilier de Luxe
                </span>
                <h1>
                  L'Élégance Pure par <span className="gold-text">Golden House</span>
                </h1>
                <p>
                  Sublimez votre intérieur avec notre collection exclusive d'objets rares, luminaires d'exception et pièces artisanales conçues pour éveiller vos sens.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => {
                    const grid = document.querySelector('.controls-bar');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <GalleryIcon /> Découvrir les Collections
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentView('contact')}>
                    <ContactIcon /> Prendre Rendez-vous
                  </button>
                </div>

                <div className="hero-stats">
                  <div className="stat-item">
                    <strong>100%</strong>
                    <span>Pièces Authentiques</span>
                  </div>
                  <div className="stat-item">
                    <strong>500 DH+</strong>
                    <span>Livraison Offerte</span>
                  </div>
                  <div className="stat-item">
                    <strong>24/7</strong>
                    <span>Service Concierge</span>
                  </div>
                </div>

                <div className="hero-image-container">
                  <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400" alt="Luxury interior setup" />
                </div>
              </section>

              <section className="home-decor-section">
                <div className="home-decor-card">
                  <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000" alt="Luxury home decor setup" />
                  <div className="home-decor-copy">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <SparklesIcon /> Édition Privée & Artisanat
                    </span>
                    <h3>Harmonie du Verre & Métal Précieux</h3>
                    <p>
                      Chaque création Golden House est sélectionnée pour sa noblesse et sa finition irréprochable. Offrez à votre intérieur une touche de poésie et un luxe discret qui traverse le temps.
                    </p>
                    <button className="btn-primary" onClick={() => setCurrentView('contact')}>
                      <ContactIcon /> Consulter un Designer
                    </button>
                  </div>
                </div>
              </section>

              <section className="product-showcase-section">
                <ProductGrid products={products} onAddToCart={handleAddToCart} />
              </section>
            </>
          )}

          {currentView === 'contact' && (
            <ContactForm onMessageSent={() => setMessage('Message envoyé avec succès!')} />
          )}

          {currentView === 'orders' && (
            <OrdersList userToken={userToken} />
          )}

          {currentView === 'admin' && (userData?.role === 'admin' || userData?.email === 'admin@goldenhouse.shop') && (
            <AdminPanel onProductAdded={fetchProducts} />
          )}

          {message && (
            <div className="message-banner">
              {message}
              <button onClick={() => setMessage('')}>✕</button>
            </div>
          )}
        </main>

        <Footer />

        {cartOpen && (
          <Cart
            items={cart}
            onDecrease={handleRemoveFromCart}
            onIncrease={handleAddQuantity}
            onDelete={handleDeleteFromCart}
            onCheckout={handleCheckout}
            onClose={() => setCartOpen(false)}
          />
        )}

        {authOpen && (
          <AuthModal
            tab={authTab}
            onTabChange={setAuthTab}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onClose={() => setAuthOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
