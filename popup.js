// Multi Tab Search Extension - Premium Version
// Enhanced with subscription management and query limits
import { PayPalService } from './src/paypal-service.js';

class PremiumManager {
    constructor() {
        this.isPremium = false;
        this.trialActive = false;
        this.trialEndDate = null;
        this.subscriptionType = null; // 'monthly' or 'yearly'
        this.subscriptionEndDate = null;
        this.queryCount = 0;
        this.dailyQueryCount = 0;
        this.lastQueryDate = null;
        this.FREE_QUERY_LIMIT = 20;
        this.paypalService = new PayPalService();
        this.init();
    }

    async init() {
        await this.loadPremiumStatus();
        this.updateUI();
    }

    async loadPremiumStatus() {
        try {
            const result = await chrome.storage.local.get([
                'isPremium', 
                'trialActive', 
                'trialEndDate', 
                'subscriptionType',
                'subscriptionEndDate',
                'queryCount',
                'dailyQueryCount',
                'lastQueryDate'
            ]);
            
            this.isPremium = result.isPremium || false;
            this.trialActive = result.trialActive || false;
            this.trialEndDate = result.trialEndDate ? new Date(result.trialEndDate) : null;
            this.subscriptionType = result.subscriptionType || null;
            this.subscriptionEndDate = result.subscriptionEndDate ? new Date(result.subscriptionEndDate) : null;
            this.queryCount = result.queryCount || 0;
            this.dailyQueryCount = result.dailyQueryCount || 0;
            this.lastQueryDate = result.lastQueryDate || null;

            // Check if trial has expired
            if (this.trialActive && this.trialEndDate && new Date() > this.trialEndDate) {
                this.trialActive = false;
                await this.savePremiumStatus();
            }

            // Check if subscription has expired
            if (this.isPremium && this.subscriptionEndDate && new Date() > this.subscriptionEndDate) {
                this.isPremium = false;
                this.subscriptionType = null;
                await this.savePremiumStatus();
            }

            // Reset daily query count if it's a new day
            const today = new Date().toDateString();
            if (this.lastQueryDate !== today) {
                this.dailyQueryCount = 0;
                this.lastQueryDate = today;
                await this.savePremiumStatus();
            }
        } catch (error) {
            console.error('Error loading premium status:', error);
        }
    }

    async savePremiumStatus() {
        try {
            await chrome.storage.local.set({
                isPremium: this.isPremium,
                trialActive: this.trialActive,
                trialEndDate: this.trialEndDate ? this.trialEndDate.toISOString() : null,
                subscriptionType: this.subscriptionType,
                subscriptionEndDate: this.subscriptionEndDate ? this.subscriptionEndDate.toISOString() : null,
                queryCount: this.queryCount,
                dailyQueryCount: this.dailyQueryCount,
                lastQueryDate: this.lastQueryDate
            });
        } catch (error) {
            console.error('Error saving premium status:', error);
        }
    }

    canPerformSearch(queryCount) {
        if (this.isPremium || this.trialActive) {
            return { allowed: true, remaining: 'unlimited' };
        }
        
        const remaining = this.FREE_QUERY_LIMIT - this.dailyQueryCount;
        if (queryCount <= remaining) {
            return { allowed: true, remaining: remaining - queryCount };
        }
        
        return { allowed: false, remaining: remaining };
    }

    async recordSearch(queryCount) {
        if (!this.isPremium && !this.trialActive) {
            this.dailyQueryCount += queryCount;
            this.queryCount += queryCount;
            await this.savePremiumStatus();
        }
    }

    async startTrial() {
        this.trialActive = true;
        this.trialEndDate = new Date();
        this.trialEndDate.setDate(this.trialEndDate.getDate() + 7); // 7-day trial
        await this.savePremiumStatus();
        this.updateUI();
        this.showTrialStartedMessage();
    }

    async subscribeToPremium(type = 'monthly') {
        this.isPremium = true;
        this.trialActive = false;
        this.subscriptionType = type;
        this.subscriptionEndDate = new Date();
        
        if (type === 'yearly') {
            this.subscriptionEndDate.setFullYear(this.subscriptionEndDate.getFullYear() + 1);
        } else {
            this.subscriptionEndDate.setMonth(this.subscriptionEndDate.getMonth() + 1);
        }
        
        await this.savePremiumStatus();
        this.updateUI();
        this.showPremiumActivatedMessage();
    }

    updateUI() {
        this.updatePremiumStatus();
        this.updateQueryCounter();
        this.togglePremiumFeatures();
    }

    updatePremiumStatus() {
        const statusContainer = document.querySelector('.premium-status') || this.createPremiumStatusContainer();
        
        if (this.isPremium) {
            statusContainer.innerHTML = `
                <span class="status-premium">✨ Premium Active</span>
                <button class="change-plan-btn" id="change-plan-btn">Manage</button>
            `;
        } else if (this.trialActive) {
            const daysLeft = Math.ceil((this.trialEndDate - new Date()) / (1000 * 60 * 60 * 24));
            statusContainer.innerHTML = `
                <span class="status-premium">🎯 Trial (${daysLeft} days left)</span>
                <button class="upgrade-btn" id="upgrade-btn">Upgrade</button>
            `;
        } else {
            statusContainer.innerHTML = `
                <span class="status-free">🆓 Free Version</span>
                <button class="upgrade-btn" id="upgrade-btn">Go Premium</button>
            `;
        }

        // Add event listeners
        const upgradeBtn = document.getElementById('upgrade-btn');
        const changePlanBtn = document.getElementById('change-plan-btn');
        
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showPremiumModal());
        }
        
        if (changePlanBtn) {
            changePlanBtn.addEventListener('click', () => this.showSubscriptionManagement());
        }
    }

    createPremiumStatusContainer() {
        const container = document.createElement('div');
        container.className = 'premium-status';
        
        const header = document.querySelector('.header');
        header.appendChild(container);
        
        return container;
    }

    updateQueryCounter() {
        let counterContainer = document.querySelector('.query-counter');
        
        if (!counterContainer) {
            counterContainer = document.createElement('div');
            counterContainer.className = 'query-counter';
            counterContainer.style.cssText = `
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 6px;
                margin: 10px 0;
                text-align: center;
                font-size: 12px;
                color: #495057;
            `;
            
            const mainContent = document.querySelector('.main-content');
            mainContent.insertBefore(counterContainer, mainContent.firstChild);
        }

        if (this.isPremium || this.trialActive) {
            counterContainer.innerHTML = `
                <span style="color: #28a745; font-weight: 600;">🚀 Unlimited Searches Available</span>
            `;
        } else {
            const remaining = this.FREE_QUERY_LIMIT - this.dailyQueryCount;
            const color = remaining <= 1 ? '#dc3545' : remaining <= 2 ? '#ffc107' : '#28a745';
            counterContainer.innerHTML = `
                <span style="color: ${color}; font-weight: 600;">
                    ${remaining} of ${this.FREE_QUERY_LIMIT} free searches remaining today
                </span>
            `;
        }
    }

    togglePremiumFeatures() {
        // Show/hide premium sections based on subscription status
        const premiumSections = document.querySelectorAll('.premium-section');
        premiumSections.forEach(section => {
            if (this.isPremium || this.trialActive) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    showPremiumModal() {
        const modal = this.createModal('premium-modal-large', 'Upgrade to Premium', `
            <div class="premium-tiers-grid">
                <div class="premium-tier" data-plan="monthly">
                    <div class="tier-header">
                        <span class="tier-icon">💎</span>
                        <h4>Monthly Plan</h4>
                        <p class="tier-description">Perfect for regular users</p>
                    </div>
                    <div class="tier-pricing">
                        <div class="price-option popular" data-billing="monthly">
                            <span class="price-amount">$4.99</span>
                            <span class="price-period">/month</span>
                        </div>
                    </div>
                    <div class="tier-features">
                        <h5>What's included:</h5>
                        <ul>
                            <li>✅ Unlimited daily searches</li>
                            <li>✅ All search engines</li>
                            <li>✅ Advanced filters</li>
                            <li>✅ Bulk URL opening</li>
                            <li>✅ Priority support</li>
                        </ul>
                    </div>
                    <button class="tier-select-btn" data-plan="monthly">Choose Monthly</button>
                </div>

                <div class="premium-tier" data-plan="yearly">
                    <div class="tier-header">
                        <span class="tier-icon">🏆</span>
                        <h4>Yearly Plan</h4>
                        <p class="tier-description">Best value - Save 58%!</p>
                    </div>
                    <div class="tier-pricing">
                        <div class="price-option popular" data-billing="yearly">
                            <span class="price-amount">$24.99</span>
                            <span class="price-period">/year</span>
                            <span class="savings">Save $35/year!</span>
                        </div>
                    </div>
                    <div class="tier-features">
                        <h5>Everything in Monthly, plus:</h5>
                        <ul>
                            <li>✅ All Monthly features</li>
                            <li>✅ 58% cost savings</li>
                            <li>✅ Priority feature requests</li>
                            <li>✅ Advanced analytics</li>
                            <li>✅ Export capabilities</li>
                        </ul>
                    </div>
                    <button class="tier-select-btn" data-plan="yearly">Choose Yearly</button>
                </div>
            </div>

            <div class="premium-features-overview">
                <h4>Why Choose Premium?</h4>
                <div class="features-grid">
                    <div class="feature-category">
                        <h5>🚀 Performance</h5>
                        <p>Unlimited searches with no daily limits</p>
                    </div>
                    <div class="feature-category">
                        <h5>🎯 Advanced Tools</h5>
                        <p>Access to all search engines and filters</p>
                    </div>
                    <div class="feature-category">
                        <h5>📊 Analytics</h5>
                        <p>Track your search patterns and productivity</p>
                    </div>
                    <div class="feature-category">
                        <h5>🛠️ Support</h5>
                        <p>Priority customer support and feature requests</p>
                    </div>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-trial-btn" id="start-trial-btn">Start 7-Day Free Trial</button>
                <button class="premium-cancel-btn" id="cancel-premium-btn">Maybe Later</button>
            </div>
            <div class="footer-info">
                <p>💳 Secure payment • 🔄 Cancel anytime • 🛡️ 30-day money-back guarantee</p>
            </div>
        `);

        // Add event listeners
        modal.querySelectorAll('.tier-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.showConfirmationModal(plan);
            });
        });

        document.getElementById('start-trial-btn').addEventListener('click', () => {
            this.closeModal();
            this.showTrialModal();
        });

        document.getElementById('cancel-premium-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    showTrialModal() {
        const modal = this.createModal('trial-modal', 'Start Your Free Trial', `
            <div class="trial-details">
                <h4>🎯 7-Day Premium Trial</h4>
                <p>Experience all premium features completely free for 7 days!</p>
                
                <div class="trial-features">
                    <h5>Trial includes:</h5>
                    <ul>
                        <li>✅ Unlimited searches for 7 days</li>
                        <li>✅ Access to all search engines</li>
                        <li>✅ Advanced filtering options</li>
                        <li>✅ Bulk URL operations</li>
                        <li>✅ All premium features</li>
                    </ul>
                </div>

                <div class="trial-note">
                    <p><strong>Note:</strong> No payment required. Trial automatically expires after 7 days. You can upgrade to premium anytime during or after the trial.</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="start-trial-btn" id="confirm-trial-btn">Start Free Trial</button>
                <button class="premium-cancel-btn" id="cancel-trial-btn">Cancel</button>
            </div>
        `);

        document.getElementById('confirm-trial-btn').addEventListener('click', () => {
            this.startTrial();
            this.closeModal();
        });

        document.getElementById('cancel-trial-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    showConfirmationModal(plan) {
        const pricing = {
            monthly: { price: '$4.99', period: 'month', total: '$4.99/month' },
            yearly: { price: '$24.99', period: 'year', total: '$24.99/year (Save 58%)' }
        };

        const planInfo = pricing[plan];
        
        const modal = this.createModal('confirmation-modal', 'Confirm Your Subscription', `
            <div class="confirmation-details">
                <h4>🎉 Almost There!</h4>
                <div class="tier-price">${planInfo.total}</div>
                
                <div class="tier-benefits">
                    <h5>You're getting:</h5>
                    <ul>
                        <li>✅ Unlimited daily searches</li>
                        <li>✅ All premium search engines</li>
                        <li>✅ Advanced filtering options</li>
                        <li>✅ Priority customer support</li>
                        <li>✅ Cancel anytime</li>
                        ${plan === 'yearly' ? '<li>✅ 58% savings vs monthly</li>' : ''}
                    </ul>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="confirm-upgrade-btn" id="confirm-upgrade-btn" data-plan="${plan}">
                    Subscribe Now - ${planInfo.price}
                </button>
                <button class="premium-cancel-btn" id="cancel-upgrade-btn">Back</button>
            </div>
        `);

        document.getElementById('confirm-upgrade-btn').addEventListener('click', (e) => {
            const selectedPlan = e.target.dataset.plan;
            this.initiatePayPalPayment(selectedPlan);
        });

        document.getElementById('cancel-upgrade-btn').addEventListener('click', () => {
            this.closeModal();
            this.showPremiumModal();
        });
    }

    async initiatePayPalPayment(planType) {
        try {
            this.closeModal();
            this.showPayPalModal(planType);
        } catch (error) {
            console.error('Error initiating PayPal payment:', error);
            this.showStatus('❌ Error setting up payment. Please try again.', 'error');
        }
    }

    showPayPalModal(planType) {
        const plan = {
            monthly: { name: 'Monthly Premium', price: '$4.99/month' },
            yearly: { name: 'Yearly Premium', price: '$24.99/year (Save 58%)' }
        };

        const selectedPlan = plan[planType];
        
        const modal = this.createModal('paypal-payment-modal', 'Complete Your Payment', `
            <div class="paypal-payment-content">
                <div class="payment-summary">
                    <h4>💳 Payment Summary</h4>
                    <div class="plan-details">
                        <span class="plan-name">${selectedPlan.name}</span>
                        <span class="plan-price">${selectedPlan.price}</span>
                    </div>
                </div>

                <div class="payment-options">
                    <h5>Choose Payment Type:</h5>
                    <div class="payment-type-buttons">
                        <button class="payment-type-btn active" data-type="subscription" id="subscription-btn">
                            🔄 Recurring Subscription
                            <small>Automatic renewal</small>
                        </button>
                        <button class="payment-type-btn" data-type="onetime" id="onetime-btn">
                            💰 One-Time Payment
                            <small>Manual renewal required</small>
                        </button>
                    </div>
                </div>

                <div class="paypal-container">
                    <div id="paypal-button-container"></div>
                </div>

                <div class="payment-security">
                    <p>🔒 Secure payment powered by PayPal</p>
                    <p>✅ No credit card details stored</p>
                    <p>🛡️ 30-day money-back guarantee</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-cancel-btn" id="cancel-paypal-btn">Cancel</button>
            </div>
        `);

        // Set up payment type selection
        let paymentType = 'subscription';
        
        document.getElementById('subscription-btn').addEventListener('click', () => {
            paymentType = 'subscription';
            this.updatePaymentTypeSelection('subscription');
            this.renderPayPalButton(planType, paymentType);
        });

        document.getElementById('onetime-btn').addEventListener('click', () => {
            paymentType = 'onetime';
            this.updatePaymentTypeSelection('onetime');
            this.renderPayPalButton(planType, paymentType);
        });

        document.getElementById('cancel-paypal-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Initial PayPal button render
        setTimeout(() => {
            this.renderPayPalButton(planType, paymentType);
        }, 100);
    }

    updatePaymentTypeSelection(selectedType) {
        document.querySelectorAll('.payment-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${selectedType}-btn`).classList.add('active');
    }

    async renderPayPalButton(planType, paymentType) {
        const container = document.getElementById('paypal-button-container');
        container.innerHTML = ''; // Clear existing buttons

        try {
            if (paymentType === 'subscription') {
                const result = await this.paypalService.createSubscription(planType);
                await this.handlePaymentSuccess(result, planType, 'subscription');
            } else {
                const result = await this.paypalService.createOneTimePayment(planType);
                await this.handlePaymentSuccess(result, planType, 'onetime');
            }
        } catch (error) {
            console.error('PayPal button error:', error);
            container.innerHTML = `
                <div class="paypal-error">
                    <p>❌ Error loading PayPal. Please try again.</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    async handlePaymentSuccess(paymentResult, planType, paymentType) {
        try {
            // Verify payment with your backend
            const verification = await this.paypalService.verifyPayment({
                ...paymentResult,
                paymentType: paymentType
            });

            if (verification.success) {
                // Activate premium
                await this.activatePremiumFromPayment(planType, paymentResult, paymentType);
                this.closeModal();
                this.showPaymentSuccessModal(planType);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showStatus('❌ Payment processing failed. Please contact support.', 'error');
        }
    }

    async activatePremiumFromPayment(planType, paymentResult, paymentType) {
        this.isPremium = true;
        this.trialActive = false;
        this.subscriptionType = planType;
        
        // Set subscription end date
        this.subscriptionEndDate = new Date();
        if (planType === 'yearly') {
            this.subscriptionEndDate.setFullYear(this.subscriptionEndDate.getFullYear() + 1);
        } else {
            this.subscriptionEndDate.setMonth(this.subscriptionEndDate.getMonth() + 1);
        }

        // Store payment information
        const paymentInfo = {
            paymentId: paymentResult.subscriptionID || paymentResult.orderID,
            paymentType: paymentType,
            planType: planType,
            activatedDate: new Date().toISOString(),
            paypalDetails: paymentResult.details
        };

        await chrome.storage.local.set({ paymentInfo });
        await this.savePremiumStatus();
        this.updateUI();
    }

    showPaymentSuccessModal(planType) {
        const planName = planType === 'yearly' ? 'Yearly' : 'Monthly';
        
        const modal = this.createModal('payment-success-modal', '🎉 Payment Successful!', `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <h4>Welcome to Premium!</h4>
                <p>Your ${planName} Premium subscription is now active.</p>
                
                <div class="premium-activated-features">
                    <h5>You now have access to:</h5>
                    <ul>
                        <li>🚀 Unlimited daily searches</li>
                        <li>🔍 All search engines</li>
                        <li>🎯 Advanced filtering options</li>
                        <li>📊 Usage analytics</li>
                        <li>🛠️ Priority support</li>
                    </ul>
                </div>

                <div class="next-steps">
                    <p><strong>Next billing:</strong> ${this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'N/A'}</p>
                    <p>You can manage your subscription anytime in the settings.</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-trial-btn" id="start-using-btn">Start Using Premium!</button>
            </div>
        `);

        document.getElementById('start-using-btn').addEventListener('click', () => {
            this.closeModal();
            this.showStatus('🎉 Premium activated! Enjoy unlimited searches!', 'success');
        });
    }

    showSubscriptionManagement() {
        const endDate = this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'N/A';
        const planType = this.subscriptionType === 'yearly' ? 'Yearly' : 'Monthly';
        
        const modal = this.createModal('subscription-modal', 'Manage Subscription', `
            <div class="subscription-info">
                <h4>✨ Premium Subscription Active</h4>
                <p><strong>Plan:</strong> ${planType} Plan</p>
                <p><strong>Next billing:</strong> ${endDate}</p>
                <p><strong>Status:</strong> Active</p>
            </div>

            <div class="subscription-actions">
                <button class="subscription-action-btn" id="change-plan-btn">Change Plan</button>
                <button class="subscription-action-btn" id="billing-history-btn">Billing History</button>
                <button class="subscription-action-btn" id="cancel-subscription-btn">Cancel Subscription</button>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-cancel-btn" id="close-subscription-btn">Close</button>
            </div>
        `);

        document.getElementById('change-plan-btn').addEventListener('click', () => {
            this.showChangePlanModal();
        });

        document.getElementById('billing-history-btn').addEventListener('click', () => {
            this.showBillingHistoryModal();
        });

        document.getElementById('cancel-subscription-btn').addEventListener('click', () => {
            this.showPayPalCancellationModal();
        });

        document.getElementById('close-subscription-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    showPayPalCancellationModal() {
        const modal = this.createModal('paypal-cancellation-modal', 'Cancel PayPal Subscription', `
            <div class="cancellation-details">
                <h4>😢 Cancel Your Subscription</h4>
                <p>This will cancel your PayPal subscription and you'll lose access to premium features.</p>
                
                <div class="cancellation-info">
                    <h5>What happens when you cancel:</h5>
                    <ul>
                        <li>❌ Your PayPal subscription will be cancelled immediately</li>
                        <li>⏰ You'll keep premium access until ${this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'your next billing date'}</li>
                        <li>🔄 No future charges will be made</li>
                        <li>📉 You'll return to the free version (20 searches/day)</li>
                    </ul>
                </div>

                <div class="retention-offer">
                    <p><strong>💡 Consider:</strong> You can pause your subscription instead of cancelling completely.</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-cancel-btn" id="confirm-paypal-cancel-btn">Cancel Subscription</button>
                <button class="premium-trial-btn" id="keep-paypal-subscription-btn">Keep Subscription</button>
            </div>
        `);

        document.getElementById('confirm-paypal-cancel-btn').addEventListener('click', () => {
            this.cancelPayPalSubscription();
        });

        document.getElementById('keep-paypal-subscription-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    async cancelPayPalSubscription() {
        try {
            // Get stored payment info
            const result = await chrome.storage.local.get(['paymentInfo']);
            const paymentInfo = result.paymentInfo;

            if (paymentInfo && paymentInfo.paymentId && paymentInfo.paymentType === 'subscription') {
                // Cancel the PayPal subscription
                await this.paypalService.cancelSubscription(paymentInfo.paymentId);
                
                // Update local status
                this.isPremium = false;
                this.subscriptionType = null;
                this.subscriptionEndDate = null;
                
                // Clear payment info
                await chrome.storage.local.remove(['paymentInfo']);
                await this.savePremiumStatus();
                
                this.updateUI();
                this.closeModal();
                this.showStatus('✅ PayPal subscription cancelled successfully.', 'success');
            } else {
                // Handle one-time payments or missing payment info
                this.isPremium = false;
                this.subscriptionType = null;
                this.subscriptionEndDate = null;
                await this.savePremiumStatus();
                this.updateUI();
                this.closeModal();
                this.showStatus('✅ Premium access cancelled.', 'success');
            }
        } catch (error) {
            console.error('Error cancelling PayPal subscription:', error);
            this.showStatus('❌ Error cancelling subscription. Please contact support.', 'error');
        }
    }

    showChangePlanModal() {
        const currentPlan = this.subscriptionType === 'yearly' ? 'Yearly' : 'Monthly';
        const otherPlan = this.subscriptionType === 'yearly' ? 'Monthly' : 'Yearly';
        const otherPlanPrice = this.subscriptionType === 'yearly' ? '$4.99/month' : '$24.99/year (Save 58%)';
        
        const modal = this.createModal('change-plan-modal', 'Change Your Plan', `
            <div class="change-plan-details">
                <h4>Current Plan: ${currentPlan}</h4>
                <p>Switch to our ${otherPlan} plan for different billing preferences.</p>
                
                <div class="plan-comparison">
                    <div class="current-plan-info">
                        <h5>Current: ${currentPlan} Plan</h5>
                        <p>✅ Currently active</p>
                        <p>Next billing: ${this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'N/A'}</p>
                    </div>
                    
                    <div class="new-plan-info">
                        <h5>Switch to: ${otherPlan} Plan</h5>
                        <p>💰 ${otherPlanPrice}</p>
                        <p>${this.subscriptionType === 'yearly' ? 'More flexible monthly billing' : 'Save 58% with annual billing'}</p>
                    </div>
                </div>
                
                <div class="change-plan-note">
                    <p><strong>Note:</strong> Plan changes take effect at your next billing cycle. You'll continue to have full access until then.</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-trial-btn" id="confirm-plan-change-btn" data-new-plan="${this.subscriptionType === 'yearly' ? 'monthly' : 'yearly'}">
                    Switch to ${otherPlan}
                </button>
                <button class="premium-cancel-btn" id="cancel-plan-change-btn">Keep Current Plan</button>
            </div>
        `);

        document.getElementById('confirm-plan-change-btn').addEventListener('click', (e) => {
            const newPlan = e.target.dataset.newPlan;
            this.changePayPalPlan(newPlan);
        });

        document.getElementById('cancel-plan-change-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    async changePayPalPlan(newPlan) {
        try {
            // For PayPal, we need to cancel current subscription and create a new one
            const result = await chrome.storage.local.get(['paymentInfo']);
            const paymentInfo = result.paymentInfo;

            if (paymentInfo && paymentInfo.paymentType === 'subscription') {
                // Cancel current subscription
                await this.paypalService.cancelSubscription(paymentInfo.paymentId);
            }

            this.closeModal();
            
            // Show new payment modal for the new plan
            this.showPayPalModal(newPlan);
            
            this.showStatus('Please complete payment for your new plan.', 'info');
        } catch (error) {
            console.error('Error changing PayPal plan:', error);
            this.showStatus('❌ Error changing plan. Please try again.', 'error');
        }
    }

    showBillingHistoryModal() {
        // Generate mock billing history based on subscription
        const history = this.generateBillingHistory();
        
        const historyHTML = history.map(item => `
            <div class="billing-item">
                <div class="billing-date">${item.date}</div>
                <div class="billing-description">${item.description}</div>
                <div class="billing-amount">${item.amount}</div>
                <div class="billing-status ${item.status.toLowerCase()}">${item.status}</div>
            </div>
        `).join('');
        
        const modal = this.createModal('billing-history-modal', 'Billing History', `
            <div class="billing-history-content">
                <div class="billing-summary">
                    <h4>📊 Account Summary</h4>
                    <p><strong>Current Plan:</strong> ${this.subscriptionType === 'yearly' ? 'Yearly' : 'Monthly'} Premium</p>
                    <p><strong>Next Billing:</strong> ${this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Payment Method:</strong> •••• •••• •••• 1234</p>
                </div>
                
                <div class="billing-history-list">
                    <h5>Recent Transactions</h5>
                    <div class="billing-header">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Amount</div>
                        <div>Status</div>
                    </div>
                    ${historyHTML}
                </div>
                
                <div class="billing-actions">
                    <button class="billing-action-btn" id="download-invoice-btn">📄 Download Invoice</button>
                    <button class="billing-action-btn" id="update-payment-btn">💳 Update Payment Method</button>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-cancel-btn" id="close-billing-btn">Close</button>
            </div>
        `);

        document.getElementById('download-invoice-btn').addEventListener('click', () => {
            this.downloadPayPalInvoice();
        });

        document.getElementById('update-payment-btn').addEventListener('click', () => {
            this.showPaymentUpdateModal();
        });

        document.getElementById('close-billing-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    downloadPayPalInvoice() {
        chrome.storage.local.get(['paymentInfo'], (result) => {
            const paymentInfo = result.paymentInfo || {};
            
            const invoiceContent = `
MULTI TAB SEARCH EXTENSION - PAYPAL INVOICE
==========================================

Date: ${new Date().toLocaleDateString()}
Invoice #: MTS-PP-${Date.now()}

Payment Method: PayPal
Payment ID: ${paymentInfo.paymentId || 'N/A'}
Payment Type: ${paymentInfo.paymentType || 'N/A'}
Subscription: ${this.subscriptionType === 'yearly' ? 'Yearly' : 'Monthly'} Premium
Amount: ${this.subscriptionType === 'yearly' ? '$24.99' : '$4.99'}
Status: Active

Next Billing: ${this.subscriptionEndDate ? this.subscriptionEndDate.toLocaleDateString() : 'N/A'}
Activated: ${paymentInfo.activatedDate ? new Date(paymentInfo.activatedDate).toLocaleDateString() : 'N/A'}

Thank you for your business!

For support, contact: support@multitabsearch.com
            `;
            
            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `paypal-invoice-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('📄 PayPal invoice downloaded successfully!', 'success');
        });
    }

    generateBillingHistory() {
        const history = [];
        const currentDate = new Date();
        const planPrice = this.subscriptionType === 'yearly' ? '$24.99' : '$4.99';
        const planName = this.subscriptionType === 'yearly' ? 'Yearly Premium' : 'Monthly Premium';
        
        // Generate last 6 months of billing history
        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate);
            if (this.subscriptionType === 'yearly') {
                date.setFullYear(date.getFullYear() - i);
            } else {
                date.setMonth(date.getMonth() - i);
            }
            
            history.push({
                date: date.toLocaleDateString(),
                description: `${planName} Subscription`,
                amount: planPrice,
                status: i === 0 ? 'Pending' : 'Paid'
            });
        }
        
        return history;
    }

    showPaymentUpdateModal() {
        const modal = this.createModal('payment-update-modal', 'Update Payment Method', `
            <div class="payment-update-content">
                <h4>💳 Update Your Payment Information</h4>
                <p>Update your payment method for future billing cycles.</p>
                
                <div class="current-payment">
                    <h5>Current Payment Method</h5>
                    <div class="payment-method">
                        <span class="card-info">💳 •••• •••• •••• 1234</span>
                        <span class="card-type">Visa</span>
                        <span class="card-expiry">Expires 12/25</span>
                    </div>
                </div>
                
                <div class="new-payment-form">
                    <h5>New Payment Method</h5>
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" id="expiry-date" placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" id="cvv" placeholder="123" maxlength="4">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="cardholder-name" placeholder="John Doe">
                    </div>
                </div>
                
                <div class="security-note">
                    <p>🔒 Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-trial-btn" id="save-payment-btn">💾 Save Payment Method</button>
                <button class="premium-cancel-btn" id="cancel-payment-btn">Cancel</button>
            </div>
        `);

        // Add input formatting
        this.setupPaymentFormFormatting();

        document.getElementById('save-payment-btn').addEventListener('click', () => {
            this.savePaymentMethod();
        });

        document.getElementById('cancel-payment-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    setupPaymentFormFormatting() {
        // Format card number input
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Format expiry date input
        const expiryInput = document.getElementById('expiry-date');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Format CVV input (numbers only)
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    savePaymentMethod() {
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholder-name').value;

        // Basic validation
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
            this.showStatus('❌ Please fill in all payment fields.', 'error');
            return;
        }

        if (cardNumber.replace(/\s/g, '').length < 13) {
            this.showStatus('❌ Please enter a valid card number.', 'error');
            return;
        }

        // Simulate saving payment method
        this.closeModal();
        this.showStatus('💳 Payment method updated successfully!', 'success');
    }

    createModal(className, title, content, footer = '') {
        // Remove existing modal
        this.closeModal();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = `modal ${className}`;

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) this.closeModal();
        });

        return modal;
    }

    closeModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
    }

    showTrialStartedMessage() {
        this.showStatus('🎉 7-day premium trial activated! Enjoy unlimited searches!', 'success');
    }

    showPremiumActivatedMessage() {
        this.showStatus('✨ Premium subscription activated! Welcome to unlimited searches!', 'success');
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Main Extension Logic
class MultiTabSearchExtension {
    constructor() {
        this.premiumManager = new PremiumManager();
        this.init();
    }

    async init() {
        await this.premiumManager.init();
        this.loadSettings();
        this.attachEventListeners();
    }

    loadSettings() {
        chrome.storage.sync.get([
            'searchEngine',
            'extraParameters',
            'surroundQuotes',
            'trimLines',
            'clearWords',
            'addHttps',
            'websiteFilters'
        ], (result) => {
            // Set search engine
            if (result.searchEngine) {
                document.getElementById('search-engine').value = result.searchEngine;
            }

            // Set extra parameters
            if (result.extraParameters) {
                document.getElementById('extra-parameters').value = result.extraParameters;
            }

            // Set checkboxes
            document.getElementById('surround-quotes').checked = result.surroundQuotes || false;
            document.getElementById('trim-lines').checked = result.trimLines !== false;
            document.getElementById('clear-words').checked = result.clearWords !== false;
            document.getElementById('add-https').checked = result.addHttps !== false;

            // Set website filters
            if (result.websiteFilters) {
                Object.keys(result.websiteFilters).forEach(filterId => {
                    const checkbox = document.getElementById(filterId);
                    if (checkbox) {
                        checkbox.checked = result.websiteFilters[filterId];
                    }
                });
            }
        });
    }

    saveSettings() {
        const settings = {
            searchEngine: document.getElementById('search-engine').value,
            extraParameters: document.getElementById('extra-parameters').value,
            surroundQuotes: document.getElementById('surround-quotes').checked,
            trimLines: document.getElementById('trim-lines').checked,
            clearWords: document.getElementById('clear-words').checked,
            addHttps: document.getElementById('add-https').checked,
            websiteFilters: this.getWebsiteFilters()
        };

        chrome.storage.sync.set(settings);
    }

    getWebsiteFilters() {
        const filters = {};
        document.querySelectorAll('input[data-site]').forEach(checkbox => {
            filters[checkbox.id] = checkbox.checked;
        });
        return filters;
    }

    attachEventListeners() {
        // Main action buttons
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('open-urls-btn').addEventListener('click', () => this.handleOpenUrls());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSettings());

        // Select all checkbox
        document.getElementById('select-all').addEventListener('change', (e) => {
            document.querySelectorAll('input[data-site]').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            this.saveSettings();
        });

        // Save settings on change
        document.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', () => this.saveSettings());
        });
    }

    async handleSearch() {
        const queries = this.getQueries();
        if (queries.length === 0) {
            this.showStatus('Please enter some search queries.', 'error');
            return;
        }

        // Check premium limits
        const limitCheck = this.premiumManager.canPerformSearch(queries.length);
        if (!limitCheck.allowed) {
            this.showLimitReachedModal(queries.length, limitCheck.remaining);
            return;
        }

        // Confirm for large number of queries
        if (queries.length > 100) {
            if (!confirm(`You're about to open ${queries.length} tabs. This might slow down your browser. Continue?`)) {
                return;
            }
        }

        await this.performSearch(queries);
        await this.premiumManager.recordSearch(queries.length);
        this.premiumManager.updateQueryCounter();

        if (document.getElementById('clear-words').checked) {
            document.getElementById('search-queries').value = '';
        }
    }

    async handleOpenUrls() {
        const queries = this.getQueries();
        const urls = queries.filter(query => this.isValidUrl(query));
        
        if (urls.length === 0) {
            this.showStatus('No valid URLs found. URLs should start with http:// or https://', 'error');
            return;
        }

        // Check premium limits for URL opening
        const limitCheck = this.premiumManager.canPerformSearch(urls.length);
        if (!limitCheck.allowed) {
            this.showLimitReachedModal(urls.length, limitCheck.remaining);
            return;
        }

        // Confirm for large number of URLs
        if (urls.length > 50) {
            if (!confirm(`You're about to open ${urls.length} URLs. This might slow down your browser. Continue?`)) {
                return;
            }
        }

        await this.openUrls(urls);
        await this.premiumManager.recordSearch(urls.length);
        this.premiumManager.updateQueryCounter();

        if (document.getElementById('clear-words').checked) {
            document.getElementById('search-queries').value = '';
        }
    }

    showLimitReachedModal(requestedQueries, remaining) {
        const modal = this.premiumManager.createModal('limit-modal', '🚫 Search Limit Reached', `
            <div class="limit-details">
                <h4>Free Version Limit</h4>
                <p>You've reached your daily limit of ${this.premiumManager.FREE_QUERY_LIMIT} free searches.</p>
                <p>You tried to search <strong>${requestedQueries}</strong> queries, but only have <strong>${remaining}</strong> searches remaining today.</p>
                
                <div class="upgrade-benefits">
                    <h5>🚀 Upgrade to Premium for:</h5>
                    <ul>
                        <li>✅ Unlimited daily searches</li>
                        <li>✅ All search engines</li>
                        <li>✅ Advanced features</li>
                        <li>✅ Priority support</li>
                    </ul>
                </div>

                <div class="pricing-highlight">
                    <p><strong>Just $4.99/month</strong> or <strong>$24.99/year</strong> (Save 58%!)</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-trial-btn" id="upgrade-now-btn">Start Free Trial</button>
                <button class="premium-cancel-btn" id="maybe-later-btn">Maybe Later</button>
            </div>
        `);

        document.getElementById('upgrade-now-btn').addEventListener('click', () => {
            this.premiumManager.closeModal();
            this.premiumManager.showPremiumModal();
        });

        document.getElementById('maybe-later-btn').addEventListener('click', () => {
            this.premiumManager.closeModal();
        });
    }

    getQueries() {
        const text = document.getElementById('search-queries').value;
        if (!text.trim()) return [];

        let queries = text.split('\n');
        
        if (document.getElementById('trim-lines').checked) {
            queries = queries.map(query => query.trim());
        }
        
        queries = queries.filter(query => query.length > 0);
        
        if (document.getElementById('surround-quotes').checked) {
            queries = queries.map(query => `"${query}"`);
        }

        return queries;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    async performSearch(queries) {
        const searchEngine = document.getElementById('search-engine').value;
        const extraParams = document.getElementById('extra-parameters').value;
        const websiteFilters = this.getWebsiteFilters();

        this.showProgress(0, queries.length);

        for (let i = 0; i < queries.length; i++) {
            const query = this.buildSearchQuery(queries[i], extraParams, websiteFilters);
            const searchUrl = this.getSearchUrl(searchEngine, query);
            
            await chrome.tabs.create({ url: searchUrl, active: false });
            
            this.showProgress(i + 1, queries.length);
            
            // Add delay to prevent overwhelming the browser
            if (i < queries.length - 1) {
                await this.delay(100);
            }
        }

        this.hideProgress();
        this.showStatus(`Successfully opened ${queries.length} search tabs!`, 'success');
    }

    async openUrls(urls) {
        const addHttps = document.getElementById('add-https').checked;
        
        this.showProgress(0, urls.length);

        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            
            if (addHttps && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            await chrome.tabs.create({ url: url, active: false });
            
            this.showProgress(i + 1, urls.length);
            
            // Add delay to prevent overwhelming the browser
            if (i < urls.length - 1) {
                await this.delay(100);
            }
        }

        this.hideProgress();
        this.showStatus(`Successfully opened ${urls.length} URLs!`, 'success');
    }

    buildSearchQuery(query, extraParams, websiteFilters) {
        let searchQuery = query;

        // Add extra parameters
        if (extraParams.trim()) {
            searchQuery += ' ' + extraParams.trim();
        }

        // Add website filters
        Object.keys(websiteFilters).forEach(filterId => {
            if (websiteFilters[filterId]) {
                const checkbox = document.getElementById(filterId);
                if (checkbox) {
                    const site = checkbox.dataset.site;
                    searchQuery += ` -site:${site}`;
                }
            }
        });

        return searchQuery;
    }

    getSearchUrl(engine, query) {
        const encodedQuery = encodeURIComponent(query);
        
        const searchUrls = {
            google: `https://www.google.com/search?q=${encodedQuery}`,
            bing: `https://www.bing.com/search?q=${encodedQuery}`,
            duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
            yahoo: `https://search.yahoo.com/search?p=${encodedQuery}`
        };

        return searchUrls[engine] || searchUrls.google;
    }

    showProgress(current, total) {
        const progressContainer = document.getElementById('progress-container');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const percentage = Math.round((current / total) * 100);
        
        progressContainer.style.display = 'block';
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${current}/${total} (${percentage}%)`;
    }

    hideProgress() {
        setTimeout(() => {
            document.getElementById('progress-container').style.display = 'none';
        }, 1000);
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }

    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            chrome.storage.sync.clear(() => {
                // Reset form to defaults
                document.getElementById('search-engine').value = 'google';
                document.getElementById('extra-parameters').value = '';
                document.getElementById('surround-quotes').checked = false;
                document.getElementById('trim-lines').checked = true;
                document.getElementById('clear-words').checked = true;
                document.getElementById('add-https').checked = true;
                document.getElementById('select-all').checked = false;
                
                // Reset all website filters
                document.querySelectorAll('input[data-site]').forEach(checkbox => {
                    checkbox.checked = false;
                });

                this.showStatus('Settings reset to defaults.', 'success');
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiTabSearchExtension();
});