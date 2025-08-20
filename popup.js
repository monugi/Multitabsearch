// Multi Tab Search Extension - Premium Version
// Enhanced with subscription management and query limits

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
            <div class="modal-subtitle">Unlock unlimited searches and advanced features</div>
            
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
            this.subscribeToPremium(selectedPlan);
            this.closeModal();
        });

        document.getElementById('cancel-upgrade-btn').addEventListener('click', () => {
            this.closeModal();
            this.showPremiumModal();
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
            this.closeModal();
            this.showPremiumModal();
        });

        document.getElementById('billing-history-btn').addEventListener('click', () => {
            this.showStatus('Billing history feature coming soon!', 'info');
        });

        document.getElementById('cancel-subscription-btn').addEventListener('click', () => {
            this.showCancellationModal();
        });

        document.getElementById('close-subscription-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    showCancellationModal() {
        const modal = this.createModal('cancellation-modal', 'Cancel Subscription', `
            <div class="cancellation-details">
                <h4>😢 Sorry to see you go!</h4>
                <p>Are you sure you want to cancel your premium subscription?</p>
                
                <div class="cancellation-info">
                    <h5>What you'll lose:</h5>
                    <ul>
                        <li>❌ Unlimited searches (back to 20/day)</li>
                        <li>❌ Advanced search engines</li>
                        <li>❌ Premium filters</li>
                        <li>❌ Priority support</li>
                    </ul>
                </div>

                <div class="retention-offer">
                    <p><strong>💡 Before you go:</strong> Would you like to pause your subscription instead? You can reactivate anytime!</p>
                </div>
            </div>
        `, `
            <div class="footer-actions">
                <button class="premium-cancel-btn" id="confirm-cancel-btn">Yes, Cancel</button>
                <button class="premium-trial-btn" id="keep-subscription-btn">Keep Subscription</button>
            </div>
        `);

        document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
            this.cancelSubscription();
            this.closeModal();
        });

        document.getElementById('keep-subscription-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    async cancelSubscription() {
        this.isPremium = false;
        this.subscriptionType = null;
        this.subscriptionEndDate = null;
        await this.savePremiumStatus();
        this.updateUI();
        this.showStatus('Subscription cancelled. You now have the free version with 20 searches per day.', 'info');
    }

    createModal(className, title, content, footer = '') {
        // Remove existing modal
        this.closeModal();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.className = `modal ${className}`;
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideInUp 0.3s ease;
        `;

        modal.innerHTML = `
            <div class="modal-header" style="padding: 20px 20px 0 20px; border-bottom: 1px solid #e9ecef;">
                <h3 style="margin: 0 0 10px 0; color: #212529; font-size: 20px;">${title}</h3>
                <button class="modal-close" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #6c757d;">×</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                ${content}
            </div>
            ${footer ? `<div class="modal-footer" style="padding: 0 20px 20px 20px;">${footer}</div>` : ''}
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