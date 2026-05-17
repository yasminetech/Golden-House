const express = require('express');
const router = express.Router();
const db = require('../db');
require('dotenv').config();

// Stripe
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER');

// PayPal (optional)
let paypal = null;
try {
    paypal = require('@paypal/checkout-server-sdk');
} catch (e) {
    console.warn('PayPal SDK not installed; PayPal endpoints will be disabled.');
}

function paypalClient() {
    if (!paypal) throw new Error('PayPal SDK not installed');
    const clientId = process.env.PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID_PLACEHOLDER';
    const clientSecret = process.env.PAYPAL_SECRET || 'PAYPAL_SECRET_PLACEHOLDER';
    return new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(clientId, clientSecret));
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ==========================================
// STRIPE ENDPOINTS
// ==========================================

// Create Stripe Checkout Session
router.post('/stripe-session', async (req, res) => {
    const { items, orderId } = req.body;
    
    if (!items || !Array.isArray(items) || !orderId) {
        return res.status(400).json({ error: 'Missing required parameters: items and orderId' });
    }

    try {
        const line_items = items.map(i => ({
            price_data: {
                currency: 'eur',
                product_data: { name: i.name || `Product ${i.id}` },
                unit_amount: Math.round(parseFloat(i.price) * 100) // Ensure float converts perfectly to cents
            },
            quantity: parseInt(i.quantity, 10) || 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            metadata: { orderId: orderId.toString() },
            success_url: `${FRONTEND_URL}/?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/?payment=cancelled`
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).json({ error: err.message || 'Stripe error' });
    }
});

// Confirm Stripe payment and update order
router.post('/stripe-confirm', async (req, res) => {
    const { sessionId } = req.body;
    try {
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.payment_status === 'paid';
        const orderId = session.metadata?.orderId;

        if (orderId && paid) {
            // Verify order status first to prevent repeat actions if needed
            await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);
            return res.json({ success: true, orderId });
        }
        
        res.status(400).json({ error: 'Payment not completed or invalid order data' });
    } catch (err) {
        console.error('Stripe confirm error:', err);
        res.status(500).json({ error: err.message || 'Stripe confirm error' });
    }
});

// ==========================================
// PAYPAL ENDPOINTS
// ==========================================

// Create PayPal order (approval URL)
router.post('/paypal-create', async (req, res) => {
    if (!paypal) return res.status(501).json({ error: 'PayPal not configured on server.' });
    const { total_amount, orderId } = req.body;

    if (!total_amount || !orderId) {
        return res.status(400).json({ error: 'Missing total_amount or orderId' });
    }

    try {
        const formattedAmount = typeof total_amount === 'number' ? total_amount.toFixed(2) : parseFloat(total_amount).toFixed(2);
        
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: { currency_code: 'EUR', value: formattedAmount },
                custom_id: orderId.toString()
            }],
            application_context: {
                return_url: `${FRONTEND_URL}/?payment=paypal_success`, // PayPal automatically appends token/PayerID parameters
                cancel_url: `${FRONTEND_URL}/?payment=cancelled`
            }
        });

        const client = paypalClient();
        const order = await client.execute(request);
        const approve = order.result.links.find(l => l.rel === 'approve');
        
        res.json({ approveUrl: approve.href, paypalOrderId: order.result.id });
    } catch (err) {
        console.error('PayPal create error:', err);
        res.status(500).json({ error: err.message || 'PayPal error' });
    }
});

// Confirm PayPal capture and update order
router.post('/paypal-capture', async (req, res) => {
    if (!paypal) return res.status(501).json({ error: 'PayPal not configured on server.' });
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
        return res.status(400).json({ error: 'Missing paypalOrderId' });
    }

    try {
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});
        const client = paypalClient();
        const capture = await client.execute(request);
        
        // Ensure the capture status was actually COMPLETED
        const status = capture.result.status;
        const purchase = capture.result.purchase_units?.[0];
        const orderId = purchase?.custom_id;

        if (status === 'COMPLETED' && orderId) {
            await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);
            return res.json({ success: true, orderId });
        }
        
        res.status(400).json({ error: `PayPal order not completed. Status: ${status}` });
    } catch (err) {
        console.error('PayPal capture error:', err);
        res.status(500).json({ error: err.message || 'PayPal capture error' });
    }
});

module.exports = router;