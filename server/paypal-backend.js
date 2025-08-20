// PayPal Backend Server (Node.js/Express)
// This should be deployed to your server (Heroku, Vercel, etc.)

const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// PayPal Configuration
const CLIENT_ID = 'AZLPpoike4Z0KDjMzOgco38d3oxiy7S_NNT_G6AzS0O9qY8TicQnmoMUyN14-6kJgw8RhvslEINIOuLW';
const CLIENT_SECRET = 'EGRYiCHzSvygeNd3vvKfPrDSw0F3oeIoybEHgERBR4a8xpevGzQyHh9-_tfVQ9Niq8CBxiKGcEIT_aCj';

// PayPal Environment (sandbox for testing, live for production)
const environment = new paypal.core.SandboxEnvironment(CLIENT_ID, CLIENT_SECRET);
// For production: const environment = new paypal.core.LiveEnvironment(CLIENT_ID, CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

// Create subscription plans (run this once to set up your plans)
app.post('/api/paypal/create-plans', async (req, res) => {
    try {
        // Monthly Plan
        const monthlyPlanRequest = new paypal.subscriptions.PlansCreateRequest();
        monthlyPlanRequest.requestBody({
            product_id: 'PROD-MULTITAB-MONTHLY',
            name: 'Multi Tab Search - Monthly Premium',
            description: 'Monthly premium subscription for Multi Tab Search Extension',
            status: 'ACTIVE',
            billing_cycles: [{
                frequency: {
                    interval_unit: 'MONTH',
                    interval_count: 1
                },
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: {
                        value: '4.99',
                        currency_code: 'USD'
                    }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3
            }
        });

        const monthlyPlan = await client.execute(monthlyPlanRequest);

        // Yearly Plan
        const yearlyPlanRequest = new paypal.subscriptions.PlansCreateRequest();
        yearlyPlanRequest.requestBody({
            product_id: 'PROD-MULTITAB-YEARLY',
            name: 'Multi Tab Search - Yearly Premium',
            description: 'Yearly premium subscription for Multi Tab Search Extension',
            status: 'ACTIVE',
            billing_cycles: [{
                frequency: {
                    interval_unit: 'YEAR',
                    interval_count: 1
                },
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: {
                        value: '24.99',
                        currency_code: 'USD'
                    }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3
            }
        });

        const yearlyPlan = await client.execute(yearlyPlanRequest);

        res.json({
            success: true,
            monthlyPlan: monthlyPlan.result,
            yearlyPlan: yearlyPlan.result
        });
    } catch (error) {
        console.error('Error creating plans:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify payment
app.post('/api/paypal/verify-payment', async (req, res) => {
    try {
        const { subscriptionID, orderID, details, planType, paymentType } = req.body;

        let verification = { success: false };

        if (paymentType === 'subscription' && subscriptionID) {
            // Verify subscription
            const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionID);
            const subscription = await client.execute(request);
            
            if (subscription.result.status === 'ACTIVE') {
                verification = {
                    success: true,
                    subscriptionId: subscriptionID,
                    status: subscription.result.status,
                    planType: planType
                };
            }
        } else if (paymentType === 'onetime' && orderID) {
            // Verify one-time payment
            const request = new paypal.orders.OrdersGetRequest(orderID);
            const order = await client.execute(request);
            
            if (order.result.status === 'COMPLETED') {
                verification = {
                    success: true,
                    orderId: orderID,
                    status: order.result.status,
                    planType: planType
                };
            }
        }

        res.json(verification);
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cancel subscription
app.post('/api/paypal/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
        request.requestBody({
            reason: 'User requested cancellation'
        });

        const cancellation = await client.execute(request);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Webhook handler for PayPal events
app.post('/api/paypal/webhook', async (req, res) => {
    try {
        const event = req.body;
        
        // Handle different webhook events
        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                console.log('Subscription activated:', event.resource.id);
                // Update your database to mark subscription as active
                break;
                
            case 'BILLING.SUBSCRIPTION.CANCELLED':
                console.log('Subscription cancelled:', event.resource.id);
                // Update your database to mark subscription as cancelled
                break;
                
            case 'PAYMENT.SALE.COMPLETED':
                console.log('Payment completed:', event.resource.id);
                // Handle successful payment
                break;
                
            default:
                console.log('Unhandled webhook event:', event.event_type);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PayPal backend server running on port ${PORT}`);
});

module.exports = app;