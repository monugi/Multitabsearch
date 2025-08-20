// PayPal Service for handling payments
import { PAYPAL_CONFIG, PAYPAL_ENDPOINTS } from './paypal-config.js';

export class PayPalService {
    constructor() {
        this.isSDKLoaded = false;
        this.loadSDK();
    }

    async loadSDK() {
        return new Promise((resolve, reject) => {
            if (this.isSDKLoaded || window.paypal) {
                this.isSDKLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&vault=true&intent=subscription`;
            script.onload = () => {
                this.isSDKLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async createSubscription(planType) {
        try {
            await this.loadSDK();
            
            const plan = PAYPAL_CONFIG.PLANS[planType];
            if (!plan) {
                throw new Error('Invalid plan type');
            }

            return new Promise((resolve, reject) => {
                window.paypal.Buttons({
                    createSubscription: (data, actions) => {
                        return actions.subscription.create({
                            plan_id: this.getPlanId(planType),
                            application_context: {
                                brand_name: 'Multi Tab Search Extension',
                                user_action: 'SUBSCRIBE_NOW'
                            }
                        });
                    },
                    onApprove: async (data, actions) => {
                        try {
                            const details = await actions.subscription.get();
                            resolve({
                                subscriptionID: data.subscriptionID,
                                details: details,
                                planType: planType
                            });
                        } catch (error) {
                            reject(error);
                        }
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        reject(err);
                    },
                    onCancel: () => {
                        reject(new Error('Payment cancelled by user'));
                    }
                }).render('#paypal-button-container');
            });
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    async createOneTimePayment(planType) {
        try {
            await this.loadSDK();
            
            const plan = PAYPAL_CONFIG.PLANS[planType];
            if (!plan) {
                throw new Error('Invalid plan type');
            }

            return new Promise((resolve, reject) => {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: plan.price,
                                    currency_code: PAYPAL_CONFIG.CURRENCY
                                },
                                description: `${plan.name} - Multi Tab Search Extension`
                            }],
                            application_context: {
                                brand_name: 'Multi Tab Search Extension'
                            }
                        });
                    },
                    onApprove: async (data, actions) => {
                        try {
                            const details = await actions.order.capture();
                            resolve({
                                orderID: data.orderID,
                                details: details,
                                planType: planType
                            });
                        } catch (error) {
                            reject(error);
                        }
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        reject(err);
                    },
                    onCancel: () => {
                        reject(new Error('Payment cancelled by user'));
                    }
                }).render('#paypal-button-container');
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    getPlanId(planType) {
        // In production, you would create actual PayPal subscription plans
        // and return their IDs here. For now, we'll use placeholder IDs.
        const planIds = {
            monthly: 'P-5ML4271244454362WXNWU5NQ',
            yearly: 'P-2UF78835G6983714TXNWU5NQ'
        };
        return planIds[planType] || planIds.monthly;
    }

    async verifyPayment(paymentData) {
        try {
            const response = await fetch(PAYPAL_ENDPOINTS.VERIFY_PAYMENT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId) {
        try {
            const response = await fetch(PAYPAL_ENDPOINTS.CANCEL_SUBSCRIPTION, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subscriptionId })
            });

            if (!response.ok) {
                throw new Error('Subscription cancellation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }
}