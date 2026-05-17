(async ()=>{
  const base = 'http://localhost:5500';
  try {
    console.log('Signing up user...');
    let r = await fetch(base + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'autotest', email: 'autotest@example.com', password: 'password' })
    });
    console.log('signup status', r.status);
    console.log(await r.text());

    console.log('Logging in...');
    r = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'autotest@example.com', password: 'password' })
    });
    const login = await r.json();
    console.log('login status', r.status, login);
    const token = login.token;

    console.log('Fetching products...');
    r = await fetch(base + '/api/products');
    const products = await r.json();
    console.log('products count', Array.isArray(products) ? products.length : 'not array');

    if (!Array.isArray(products) || products.length === 0) {
      console.error('No products available to order');
      return;
    }

    const items = [{ id: products[0].id, quantity: 1, price: Number(products[0].price), name: products[0].name }];
    console.log('Creating order for item', items[0]);

    r = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ total_amount: items.reduce((s,i)=>s+i.quantity*i.price,0), items, payment_method: 'card' })
    });
    console.log('create order status', r.status);
    console.log(await r.text());
  } catch (e) {
    console.error('Test script error:', e);
  }
})();
