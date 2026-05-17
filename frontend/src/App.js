import React, { useState, useEffect, Suspense, lazy } from 'react';
import './styles/App.css';
import { apiCall } from './api';

import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
const Cart = lazy(() => import('./components/Cart'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const OrdersList = lazy(() => import('./components/OrdersList'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

const featuredProducts = [
  {
    id: 1,
    name: 'Rose Quartz Vase',
    description: 'Vase en verre rosé et lignes douces, idéal pour créer une ambiance romantique et élégante.',
    price: 79.00,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
  },
  {
    id: 2,
    name: 'Linen Throw Pillow',
    description: 'Coussin en lin beige avec texture délicate, pour apporter confort et style à votre salon.',
    price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
  },
  {
    id: 3,
    name: 'Soft Gold Candle Holder',
    description: 'Bougeoir doré doux pour une lumière chaleureuse et un intérieur raffiné.',
    price: 36.00,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200',
  },
  {
    id: 4,
    name: 'Velvet Accent Chair',
    description: 'Fauteuil velours rose poudré avec pieds dorés, parfait pour une touche chic et cosy.',
    price: 248.00,
    image_url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200',
  },
  {
    id: 5,
    name: 'Woven Wall Basket',
    description: 'Panier mural en rotin tressé pour une décoration organique et légère.',
    price: 39.00,
    image_url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200',
  },
  {
    id: 6,
    name: 'Scented Ceramic Candle',
    description: 'Bougie parfumée artisanale dans un pot céramique, douceur florale et élégante.',
    price: 28.00,
    image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200',
  }
];

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
  }, []);

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

      // 2) create provider session / approval link
      if (paymentMethod === 'card') {
        const sess = await apiCall('/payment/stripe-session', {
          method: 'POST',
          body: JSON.stringify({ items, total_amount, orderId })
        });
        if (sess.url) {
          window.location = sess.url;
        } else {
          setMessage(sess.error || 'Erreur lors de la création de la session de paiement.');
        }
      } else if (paymentMethod === 'paypal') {
        const resp = await apiCall('/payment/paypal-create', {
          method: 'POST',
          body: JSON.stringify({ items, total_amount, orderId })
        });
        if (resp.approveUrl) {
          // store paypalOrderId to capture later
          localStorage.setItem('pendingOrder', JSON.stringify({ ...pending, paypalOrderId: resp.paypalOrderId }));
          window.location = resp.approveUrl;
        } else {
          setMessage(resp.error || 'Erreur lors de la création du paiement PayPal.');
        }
      } else {
        setMessage('Méthode de paiement non supportée.');
      }
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
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>📞 +33 1 23 45 67 89</span>
          <span>✨ Livraison offerte dès 50€ d'achat ! ✨</span>
          <span>📧 hello@goldenhouse.shop</span>
        </div>
      </div>
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
                <h1>L'Art de Vivre par Golden House ✨</h1>
                <p>Découvrez une collection exclusive d'objets de décoration pour transformer votre intérieur en un havre de paix élégant.</p>
                <div className="hero-image-container">
                  <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200" alt="Home decoration setup" />
                </div>
              </section>

              <section className="home-decor-section">
                <div className="section-header">
                  <h2>Osez le style cute & élégant</h2>
                  <p>Trois pièces sélectionnées pour sublimer votre intérieur avec douceur et raffinement.</p>
                </div>
                <div className="home-decor-card">
                  <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200" alt="Home decoration" />
                  <div className="home-decor-copy">
                    <span>Collection Coup de Cœur</span>
                    <h3>Décoration chaleureuse, charme poétique</h3>
                    <p>Découvrez trois produits inspirés des univers décoratifs les plus doux et romantiques. Ils apportent une ambiance élégante et confortable à chaque pièce.</p>
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
