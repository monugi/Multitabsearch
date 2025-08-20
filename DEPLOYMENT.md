# PayPal Integration Deployment Guide

## Overview
This guide will help you deploy the PayPal backend server and configure the extension for production use.

## Prerequisites
- PayPal Business Account
- Node.js 14+ installed
- A hosting platform account (Heroku, Vercel, Railway, etc.)

## Step 1: PayPal Setup

### 1.1 Create PayPal App
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal Business account
3. Click "Create App"
4. Choose "Default Application"
5. Select your business account
6. Copy your Client ID and Client Secret

### 1.2 Create Products (One-time setup)
You need to create products in PayPal for your subscription plans:

1. In PayPal Dashboard, go to "Products & Plans"
2. Create two products:
   - **Product 1**: Name: "Multi Tab Search Monthly", ID: `PROD-MULTITAB-MONTHLY`
   - **Product 2**: Name: "Multi Tab Search Yearly", ID: `PROD-MULTITAB-YEARLY`

## Step 2: Backend Deployment

### Option A: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Prepare the backend**
   ```bash
   cd server
   npm install
   ```

3. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**
   ```bash
   heroku config:set PAYPAL_CLIENT_ID=your_client_id
   heroku config:set PAYPAL_CLIENT_SECRET=your_client_secret
   heroku config:set PAYPAL_ENVIRONMENT=sandbox  # or 'live' for production
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

### Option B: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd server
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENVIRONMENT`

### Option C: Deploy to Railway

1. **Connect to Railway**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `server` folder as root

2. **Set environment variables**
   - Add the PayPal credentials in Railway dashboard

## Step 3: Configure Extension

### 3.1 Update API Endpoints
Edit `src/paypal-config.js`:

```javascript
export const PAYPAL_ENDPOINTS = {
    CREATE_SUBSCRIPTION: 'https://your-deployed-backend.herokuapp.com/api/paypal/create-subscription',
    CANCEL_SUBSCRIPTION: 'https://your-deployed-backend.herokuapp.com/api/paypal/cancel-subscription',
    VERIFY_PAYMENT: 'https://your-deployed-backend.herokuapp.com/api/paypal/verify-payment'
};
```

### 3.2 Update Manifest Permissions
Edit `manifest.json`:

```json
{
  "permissions": [
    "tabs",
    "storage",
    "activeTab",
    "unlimitedStorage",
    "https://www.paypal.com/*",
    "https://your-deployed-backend.herokuapp.com/*"
  ]
}
```

### 3.3 Switch to Production
In `src/paypal-config.js`, change:

```javascript
ENVIRONMENT: 'production', // Change from 'sandbox'
```

## Step 4: Create Subscription Plans

### 4.1 Run Plan Creation Endpoint
Make a POST request to your deployed backend:

```bash
curl -X POST https://your-deployed-backend.herokuapp.com/api/paypal/create-plans
```

This will return the plan IDs. Update `src/paypal-service.js` with the actual plan IDs:

```javascript
getPlanId(planType) {
    const planIds = {
        monthly: 'P-ACTUAL-MONTHLY-PLAN-ID',
        yearly: 'P-ACTUAL-YEARLY-PLAN-ID'
    };
    return planIds[planType] || planIds.monthly;
}
```

## Step 5: Set Up Webhooks (Optional but Recommended)

### 5.1 Configure Webhook in PayPal
1. In PayPal Dashboard, go to "Webhooks"
2. Click "Create Webhook"
3. Set URL: `https://your-deployed-backend.herokuapp.com/api/paypal/webhook`
4. Select events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `PAYMENT.SALE.COMPLETED`

### 5.2 Verify Webhook Signatures (Production)
For production, implement webhook signature verification in your backend.

## Step 6: Testing

### 6.1 Test in Sandbox Mode
1. Use PayPal sandbox accounts for testing
2. Test both subscription and one-time payments
3. Verify webhook events are received

### 6.2 Test Extension
1. Load the extension in Chrome
2. Try purchasing premium plans
3. Verify subscription management works
4. Test cancellation flow

## Step 7: Go Live

### 7.1 Switch to Live Environment
1. Update backend to use live PayPal environment
2. Update extension configuration
3. Test with real PayPal account (small amount)

### 7.2 Monitor
- Set up logging for payment events
- Monitor webhook deliveries
- Track subscription metrics

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your backend has proper CORS configuration
   - Check that extension permissions include your backend URL

2. **PayPal SDK Not Loading**
   - Verify Client ID is correct
   - Check browser console for errors
   - Ensure PayPal domain is in manifest permissions

3. **Payment Verification Fails**
   - Check backend logs for errors
   - Verify PayPal credentials are correct
   - Ensure webhook endpoints are accessible

4. **Subscription Not Activating**
   - Check PayPal webhook delivery
   - Verify plan IDs are correct
   - Check backend payment verification logic

### Support Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

## Security Checklist

- [ ] Client Secret never exposed to client-side
- [ ] All API calls use HTTPS
- [ ] Webhook signatures verified (production)
- [ ] Payment verification implemented
- [ ] Error handling for failed payments
- [ ] Subscription status properly tracked
- [ ] User data minimally stored

## Maintenance

### Regular Tasks
- Monitor PayPal webhook deliveries
- Check for failed payments
- Update subscription statuses
- Review error logs
- Update PayPal SDK versions

### Scaling Considerations
- Implement database for user management
- Add payment analytics
- Set up automated testing
- Implement backup payment methods
- Add customer support tools

This completes the PayPal integration setup. Your extension now has professional payment processing capabilities!