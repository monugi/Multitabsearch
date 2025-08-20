// PayPal Configuration
export const PAYPAL_CONFIG = {
    CLIENT_ID: 'AZLPpoike4Z0KDjMzOgco38d3oxiy7S_NNT_G6AzS0O9qY8TicQnmoMUyN14-6kJgw8RhvslEINIOuLW',
    CURRENCY: 'USD',
    ENVIRONMENT: 'sandbox', // Change to 'production' for live payments
    PLANS: {
        monthly: {
            id: 'monthly-premium',
            name: 'Monthly Premium',
            price: '4.99',
            interval: 'month'
        },
        yearly: {
            id: 'yearly-premium', 
            name: 'Yearly Premium',
            price: '24.99',
            interval: 'year'
        }
    }
};

export const PAYPAL_ENDPOINTS = {
    // You'll need to set up these endpoints on your server
    CREATE_SUBSCRIPTION: 'https://your-server.com/api/paypal/create-subscription',
    CANCEL_SUBSCRIPTION: 'https://your-server.com/api/paypal/cancel-subscription',
    VERIFY_PAYMENT: 'https://your-server.com/api/paypal/verify-payment'
};