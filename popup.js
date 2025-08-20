// Multi Tab Search Extension - Main Popup Script
console.log('Loading popup.js...');

// Initialize immediately available variables
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    yahoo: 'https://search.yahoo.com/search?p='
};

// Global variables
let elements = {};
let checkboxes = {};
let filterCheckboxes = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {/* premium removed */
    console.log('DOM loaded, initializing popup...');
    
    // Initialize all functionality
    initializeElements();
    loadSettings();
    setupEventListeners();
    
    // Premium disabled
    
    // Test button removed - premium features are now working
    
    console.log('Popup initialization complete');
});

// Initialize DOM elements
function initializeElements() {
    // Get all required elements
    elements = {
        searchQueries: document.getElementById('search-queries'),
        extraParameters: document.getElementById('extra-parameters'),
        searchEngine: document.getElementById('search-engine'),
        searchBtn: document.getElementById('search-btn'),
        openUrlsBtn: document.getElementById('open-urls-btn'),
        resetBtn: document.getElementById('reset-btn'),
        status: document.getElementById('status'),
        progressContainer: document.getElementById('progress-container'),
        progressFill: document.getElementById('progress-fill'),
        progressText: document.getElementById('progress-text'),
        upgradeBtn: null,
        premiumStatus: null
    };

    // Get all checkboxes
    checkboxes = {
        selectAll: document.getElementById('select-all'),
        clearWords: document.getElementById('clear-words'),
        addHttps: document.getElementById('add-https'),
        surroundQuotes: document.getElementById('surround-quotes'),
        trimLines: document.getElementById('trim-lines')
    };

    // Get filter checkboxes
    filterCheckboxes = document.querySelectorAll('input[type="checkbox"][data-site]');
    
    console.log('Elements initialized:', {
        upgradeBtn: !!elements.upgradeBtn,
        premiumStatus: !!elements.premiumStatus
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Main buttons
    if (elements.searchBtn) elements.searchBtn.addEventListener('click', handleSearch);
    if (elements.openUrlsBtn) elements.openUrlsBtn.addEventListener('click', handleOpenUrls);
    if (elements.resetBtn) elements.resetBtn.addEventListener('click', handleReset);

    // Select all checkbox
    if (checkboxes.selectAll) {
        checkboxes.selectAll.addEventListener('change', handleSelectAll);
    }

    // Save settings when changed
    if (elements.searchEngine) elements.searchEngine.addEventListener('change', saveSettings);
    if (elements.extraParameters) elements.extraParameters.addEventListener('input', saveSettings);
    
    Object.values(checkboxes).forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', saveSettings);
        }
    });

    filterCheckboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', saveSettings);
        }
    });

    // Premium search engine buttons
    document.querySelectorAll('.premium-engine-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showPremiumFeaturePrompt('Advanced Search Engines');
        });
    });

    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showPremiumFeaturePrompt('Search Templates');
        });
    });
    
    console.log('Event listeners setup complete');
}

// Show new premium modal
function showNewPremiumModal() { return; /* premium removed */
    console.log('Showing comprehensive premium modal');
    
    // Check if user is already premium
    chrome.storage.sync.get('premiumSubscription', (result) => {
        const isPremium = result.premiumSubscription && result.premiumSubscription.status === 'active';
        const currentPlan = result.premiumSubscription ? result.premiumSubscription.plan : null;
        
        if (isPremium) {
            showChangePlanModal(currentPlan);
                } else {
                    showUpgradeModal();
                }
    });
}

// Show upgrade modal for new users
function showUpgradeModal() { return; /* premium removed */
    // Remove any existing modals
    const existingModal = document.querySelector('.new-premium-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'new-premium-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">🚀 Upgrade to Premium</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Choose the perfect plan for your search needs</p>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                ">×</button>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                <!-- Single Premium Plan -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; text-align: center; font-size: 22px;">Premium Plan</h3>
                    <div style="
                        display: flex;
                        justify-content: center;
                        margin-bottom: 30px;
                    ">
                        <!-- Single Premium Plan -->
                        <div class="plan-tier premium-plan" data-plan="premium" style="
                            border: 2px solid #667eea;
                            border-radius: 12px;
                            padding: 30px;
                            text-align: center;
                            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                            max-width: 400px;
                            width: 100%;
                        ">
                            <div style="
                                position: absolute;
                                top: -10px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: #667eea;
                                color: white;
                                padding: 6px 16px;
                                border-radius: 16px;
                                font-size: 12px;
                                font-weight: 600;
                            ">BEST VALUE</div>
                            <div style="font-size: 64px; margin: 20px 0 15px 0;">🚀</div>
                            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">Premium Plan</h4>
                            <p style="margin: 0 0 25px 0; color: #666; font-size: 16px;">All premium features included</p>
                            <div style="margin-bottom: 25px;">
                                <div style="font-size: 36px; font-weight: 700; color: #667eea;">$9.99</div>
                                <div style="color: #666; font-size: 16px;">per month</div>
                                <div style="color: #28a745; font-size: 14px; margin-top: 8px;">Save 20% with yearly billing</div>
                            </div>
                            <ul style="
                                list-style: none;
                                padding: 0;
                                margin: 0 0 25px 0;
                                text-align: left;
                            ">
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Search Engines (9 engines)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Advanced Search Templates (9 templates)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Filtering (8 filters)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Advanced Tab Management (7 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Analytics (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Team Collaboration (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    AI Enhancement (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Search Automation (5 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Enterprise Integration (6 features)
                                </li>
                            </ul>
                            <button class="select-plan-btn" data-plan="premium" style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 10px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                width: 100%;
                                transition: all 0.2s ease;
                            ">Get Premium for $9.99/month</button>
                        </div>
                    </div>
                </div>

                <!-- Billing Options -->
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    text-align: center;
                ">
                    <h4 style="margin: 0 0 15px 0; color: #333;">💳 Billing Options</h4>
                    <div style="
                        display: flex;
                        gap: 20px;
                        justify-content: center;
                        align-items: center;
                        flex-wrap: wrap;
                    ">
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            cursor: pointer;
                            padding: 10px 20px;
                            background: white;
                            border-radius: 8px;
                            border: 2px solid #28a745;
                        ">
                            <input type="radio" name="billing" value="monthly" checked style="margin: 0;">
                            <span style="font-weight: 600; color: #333;">Monthly</span>
                        </label>
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            cursor: pointer;
                            padding: 10px 20px;
                            background: white;
                            border-radius: 8px;
                            border: 2px solid #e9ecef;
                        ">
                            <input type="radio" name="billing" value="yearly" style="margin: 0;">
                            <span style="font-weight: 600; color: #333;">Yearly (Save up to 30%)</span>
                        </label>
                    </div>
                </div>

                <!-- Features Overview -->
                <div style="margin-bottom: 30px;">
                    <h4 style="margin: 0 0 20px 0; color: #333; text-align: center;">🌟 Premium Features Overview</h4>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                    ">
                        <div style="
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
                            <h5 style="margin: 0 0 10px 0; color: #333;">Advanced Search</h5>
                            <p style="margin: 0; color: #666; font-size: 13px;">Access specialized engines like Google Scholar, arXiv, and more</p>
                        </div>
                        <div style="
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                            <h5 style="margin: 0 0 10px 0; color: #333;">Smart Filtering</h5>
                            <p style="margin: 0; color: #666; font-size: 13px;">Filter by content type, date range, language, and region</p>
                        </div>
                        <div style="
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; margin-bottom: 10px;">📋</div>
                            <h5 style="margin: 0 0 10px 0; color: #333;">Search Templates</h5>
                            <p style="margin: 0; color: #666; font-size: 13px;">Pre-built templates for research, reviews, news, and docs</p>
                        </div>
                        <div style="
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                        ">
                            <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                            <h5 style="margin: 0 0 10px 0; color: #333;">Enhanced Performance</h5>
                            <p style="margin: 0; color: #666; font-size: 13px;">Faster processing, bulk operations, and priority support</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button class="start-trial-btn" style="
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">🎁 Start 7-Day Free Trial</button>
                    <button class="premium-cancel-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Maybe Later</button>
                </div>

                <!-- Footer Info -->
                <div style="
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                ">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                        💳 No credit card required for trial • Cancel anytime • 30-day money-back guarantee
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const cancelBtn = modal.querySelector('.premium-cancel-btn');
    const trialBtn = modal.querySelector('.start-trial-btn');
    const planBtns = modal.querySelectorAll('.select-plan-btn');
    const planTiers = modal.querySelectorAll('.plan-tier');

    // Close modal
    closeBtn.addEventListener('click', () => {
        console.log('Modal close clicked');
        modal.remove();
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        console.log('Cancel clicked');
        modal.remove();
    });

    // Start trial
    trialBtn.addEventListener('click', () => {
        console.log('Trial button clicked');
        modal.remove();
        startPremiumTrial();
    });

    // Plan selection
    planBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plan = e.target.dataset.plan;
            console.log('Plan selected:', plan);
            modal.remove();
            showPlanConfirmation(plan);
        });
    });

    // Plan tier hover effects
    planTiers.forEach(tier => {
        tier.addEventListener('mouseenter', () => {
            tier.style.transform = 'translateY(-5px)';
            tier.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        });
        
        tier.addEventListener('mouseleave', () => {
            tier.style.transform = 'translateY(0)';
            tier.style.boxShadow = 'none';
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Modal overlay clicked');
            modal.remove();
        }
    });

    document.body.appendChild(modal);
    console.log('Upgrade modal added to DOM');
}

// Show change plan modal for existing premium users
function showChangePlanModal(currentPlan) { return; /* premium removed */
    console.log('Showing change plan modal for current plan:', currentPlan);
    
    // Remove any existing modals
    const existingModal = document.querySelector('.change-plan-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'change-plan-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h2 style="margin: 0; font-size: 28px; font-weight: 700;">🔄 Manage Your Premium Plan</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">You're currently on our Premium Plan</p>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                ">×</button>
            </div>
            
            <!-- Current Plan Status -->
            <div style="padding: 20px 30px 0 30px;">
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
                    border: 2px solid #28a745;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 30px;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #155724; font-size: 18px;">Current Plan</h4>
                    <div style="
                        font-size: 24px;
                        font-weight: 700;
                        color: #28a745;
                        margin-bottom: 5px;
                    ">Premium Plan</div>
                    <p style="margin: 0; color: #155724; font-size: 14px;">Active subscription • All premium features unlocked</p>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 0 30px 30px 30px;">
                <!-- Single Premium Plan -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #333; text-align: center; font-size: 22px;">Your Premium Plan</h3>
                    <div style="
                        display: flex;
                        justify-content: center;
                        margin-bottom: 30px;
                    ">
                        <!-- Single Premium Plan -->
                        <div class="plan-tier premium-plan" data-plan="premium" style="
                            border: 2px solid #667eea;
                            border-radius: 12px;
                            padding: 30px;
                            text-align: center;
                            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                            max-width: 400px;
                            width: 100%;
                        ">
                            <div style="
                                position: absolute;
                                top: -10px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: #667eea;
                                color: white;
                                padding: 6px 16px;
                                border-radius: 16px;
                                font-size: 12px;
                                font-weight: 600;
                            ">CURRENT PLAN</div>
                            <div style="font-size: 64px; margin: 20px 0 15px 0;">🚀</div>
                            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">Premium Plan</h4>
                            <p style="margin: 0 0 25px 0; color: #666; font-size: 16px;">All premium features included</p>
                            <div style="margin-bottom: 25px;">
                                <div style="font-size: 36px; font-weight: 700; color: #667eea;">$9.99</div>
                                <div style="color: #666; font-size: 16px;">per month</div>
                                <div style="color: #28a745; font-size: 14px; margin-top: 8px;">Save 20% with yearly billing</div>
                            </div>
                            <ul style="
                                list-style: none;
                                padding: 0;
                                margin: 0 0 25px 0;
                                text-align: left;
                            ">
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Search Engines (9 engines)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Advanced Search Templates (9 templates)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Filtering (8 filters)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Advanced Tab Management (7 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Premium Analytics (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Team Collaboration (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    AI Enhancement (6 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Search Automation (5 features)
                                </li>
                                <li style="padding: 8px 0; color: #555; font-size: 14px; display: flex; align-items: center;">
                                    <span style="margin-right: 10px; color: #28a745;">✅</span>
                                    Enterprise Integration (6 features)
                                </li>
                            </ul>
                            <button class="current-plan-btn" style="
                                background: #28a745;
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 10px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: default;
                                width: 100%;
                                opacity: 0.7;
                            ">Current Plan</button>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button class="manage-subscription-btn" style="
                        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">⚙️ Manage Subscription</button>
                    <button class="cancel-subscription-btn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">❌ Cancel Subscription</button>
                </div>

                <!-- Footer Info -->
                <div style="
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                ">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                        🔒 Secure plan management • Changes take effect immediately • 30-day money-back guarantee
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const manageBtn = modal.querySelector('.manage-subscription-btn');
    const cancelBtn = modal.querySelector('.cancel-subscription-btn');

    // Close modal
    closeBtn.addEventListener('click', () => {
        console.log('Modal close clicked');
        modal.remove();
    });

    // Manage subscription
    manageBtn.addEventListener('click', () => {
        console.log('Manage subscription clicked');
        showSubscriptionManagement();
    });

    // Cancel subscription
    cancelBtn.addEventListener('click', () => {
        console.log('Cancel subscription clicked');
        showCancelConfirmation();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Modal overlay clicked');
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Show plan confirmation modal
function showPlanConfirmation(plan) { return; /* premium removed */
    console.log('Showing plan confirmation for:', plan);
    
    const planInfo = {
        premium: { name: 'Premium Plan', price: '$9.99/month', color: '#667eea' }
    };
    
    const selectedPlan = planInfo[plan];
    
    const modal = document.createElement('div');
    modal.className = 'plan-confirmation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, ${selectedPlan.color} 0%, ${selectedPlan.color}dd 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">🎯 Confirm Your Selection</h3>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            </div>
            
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">You've selected: ${selectedPlan.name}</h4>
                    <div style="
                        font-size: 32px;
                        font-weight: 700;
                        color: ${selectedPlan.color};
                        margin-bottom: 20px;
                    ">${selectedPlan.price}</div>
                    
                    <div style="
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: left;
                    ">
                        <h5 style="margin: 0 0 15px 0; color: #495057;">Your benefits include:</h5>
                        <ul style="
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        ">
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Premium Search Engines (9 engines)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Advanced Search Templates (9 templates)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Premium Filtering (8 filters)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Advanced Tab Management (7 features)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Premium Analytics (6 features)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Team Collaboration (6 features)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                AI Enhancement (6 features)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Search Automation (5 features)
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                Enterprise Integration (6 features)
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                ">
                    <button class="confirm-upgrade-btn" data-plan="${plan}" style="
                        background: linear-gradient(135deg, ${selectedPlan.color} 0%, ${selectedPlan.color}dd 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">💳 Confirm & Upgrade</button>
                    <button class="go-back-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Go Back</button>
                </div>
                
                <div style="
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                ">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                        🔒 Secure payment • 30-day money-back guarantee • Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const goBackBtn = modal.querySelector('.go-back-btn');
    const confirmBtn = modal.querySelector('.confirm-upgrade-btn');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    goBackBtn.addEventListener('click', () => {
        modal.remove();
        showNewPremiumModal();
    });

    confirmBtn.addEventListener('click', (e) => {
        const selectedPlan = e.target.dataset.plan;
        modal.remove();
        processUpgrade(selectedPlan);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Show plan change confirmation modal
// Show plan change confirmation modal (simplified for single plan)
function showPlanChangeConfirmation(currentPlan, newPlan) { return; /* premium removed */
    console.log('Plan change confirmation requested but only one plan available');
    
    // Since we only have one plan, just show a simple message
    const modal = document.createElement('div');
    modal.className = 'plan-change-confirmation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">ℹ️ Single Plan Available</h3>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            </div>
            
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Premium Plan Only</h4>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                        We currently offer only one premium plan that includes all features. 
                        No plan changes are needed - you already have access to everything!
                    </p>
                    
                    <div style="
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: left;
                    ">
                        <h5 style="margin: 0 0 15px 0; color: #495057;">Your current benefits include:</h5>
                        <ul style="
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        ">
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                All Premium Search Engines
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                All Advanced Templates
                            </li>
                            <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                                <span style="margin-right: 10px; color: #28a745;">✅</span>
                                All Premium Features
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                ">
                    <button class="close-modal-btn" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Got It!</button>
                </div>
                
                <div style="
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                ">
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">
                        🔒 All premium features are already included in your current plan
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const closeModalBtn = modal.querySelector('.close-modal-btn');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Show premium feature prompt
function showPremiumFeaturePrompt(featureName) {
    const message = `🔒 ${featureName} is a premium feature. Upgrade to access this and many more features!`;
    
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    banner.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">🔒</span>
            <span>${message}</span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="upgrade-now-banner-btn" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
            ">Upgrade Now</button>
            <button class="close-banner-btn" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        </div>
    `;

    const upgradeBtn = banner.querySelector('.upgrade-now-banner-btn');
    const closeBtn = banner.querySelector('.close-banner-btn');

    upgradeBtn.addEventListener('click', () => {
        banner.remove();
        showNewPremiumModal();
    });

    closeBtn.addEventListener('click', () => {
        banner.remove();
    });

    document.body.appendChild(banner);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (banner.parentNode) {
            banner.remove();
        }
    }, 10000);
}

// Process upgrade to selected plan
function processUpgrade(plan) { return; /* premium removed */
    console.log('Processing upgrade for plan:', plan);
    
    try {
        const planInfo = {
            premium: { name: 'Premium Plan', price: '$9.99/month' }
        };
        
        const selectedPlan = planInfo[plan];
        
        // In a real implementation, this would integrate with a payment processor
        // For demo purposes, we'll simulate a successful upgrade
        
        const subscription = {
            tier: 'PREMIUM',
            plan: 'premium',
            startDate: new Date().toISOString(),
            status: 'active',
            type: 'paid',
            price: selectedPlan.price
        };

        chrome.storage.sync.set({ premiumSubscription: subscription }, () => {
            showStatus(`🎉 Welcome to ${selectedPlan.name}! Your premium features are now active.`, 'success');
            
            // Update UI immediately
            updatePremiumStatus(plan);
            
            // Show premium sections
            showPremiumSections();
            
            // Show upgrade success modal
            showUpgradeSuccess(plan);
            
            // Ensure popup refreshes to reflect state immediately
            setTimeout(() => { try { location.reload(); } catch(e) {} }, 400);
        });
        
    } catch (error) {
        console.error('Error during upgrade:', error);
        showStatus('Error processing upgrade. Please try again.', 'error');
    }
}

// Process plan change
function processPlanChange(currentPlan, newPlan) { return; /* premium removed */
    console.log('Processing plan change from', currentPlan, 'to', newPlan);
    
    try {
        const planInfo = {
            premium: { name: 'Premium Plan', price: '$9.99/month' }
        };
        
        const currentPlanDetails = planInfo[currentPlan];
        const newPlanDetails = planInfo[newPlan];
        
        // In a real implementation, this would integrate with a payment processor
        // For demo purposes, we'll simulate a successful upgrade
        
        const subscription = {
            tier: 'PREMIUM',
            plan: 'premium',
            startDate: new Date().toISOString(),
            status: 'active',
            type: 'paid',
            price: newPlanDetails.price
        };

        chrome.storage.sync.set({ premiumSubscription: subscription }, () => {
            showStatus(`🎉 Your plan has been changed to ${newPlanDetails.name}! Your premium features are now active.`, 'success');
            
            // Update UI immediately
            updatePremiumStatus(newPlan);
            
            // Show premium sections
            showPremiumSections();
            
            // Show upgrade success modal
            showUpgradeSuccess(newPlan);
            
            // Ensure popup refreshes to reflect state immediately
            setTimeout(() => { try { location.reload(); } catch(e) {} }, 400);
        });
        
    } catch (error) {
        console.error('Error during plan change:', error);
        showStatus('Error processing plan change. Please try again.', 'error');
    }
}

// Show upgrade success modal
function showUpgradeSuccess(plan) { return; /* premium removed */
    const planInfo = {
        premium: { name: 'Premium Plan', color: '#667eea' }
    };
    
    const selectedPlan = planInfo[plan];
    
    const modal = document.createElement('div');
    modal.className = 'upgrade-success-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, ${selectedPlan.color} 0%, ${selectedPlan.color}dd 100%);
                color: white;
                padding: 30px;
                border-radius: 16px 16px 0 0;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">Welcome to ${selectedPlan.name}!</h3>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your premium features are now active</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                ">
                    <h4 style="margin: 0 0 15px 0; color: #333;">🚀 What's Next?</h4>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        text-align: left;
                    ">
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #28a745;">✅</span>
                            Explore your new premium features
                        </li>
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #28a745;">✅</span>
                            Try advanced search engines
                        </li>
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #28a745;">✅</span>
                            Use enhanced filtering options
                        </li>
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #28a745;">✅</span>
                            Access professional templates
                        </li>
                    </ul>
                </div>
                
                <button class="get-started-btn" style="
                    background: linear-gradient(135deg, ${selectedPlan.color} 0%, ${selectedPlan.color}dd 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">🚀 Get Started</button>
            </div>
        </div>
    `;

    const getStartedBtn = modal.querySelector('.get-started-btn');

    getStartedBtn.addEventListener('click', () => {
        modal.remove();
        // Refresh the popup to show new features
        setTimeout(() => {
            location.reload();
        }, 500);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

// Start premium trial
function startPremiumTrial() { return; /* premium removed */
    console.log('Starting premium trial');
    
    try {
        const trialData = {
            tier: 'PREMIUM',
            plan: 'premium',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'trial',
            type: 'trial'
        };

        chrome.storage.sync.set({ premiumSubscription: trialData }, () => {
            showStatus('🎉 Premium trial activated! Refresh the extension to see new features.', 'success');
            
            // Update UI immediately
            updatePremiumStatus('premium', true);
            
            // Show premium sections
            showPremiumSections();
        });
        
    } catch (error) {
        console.error('Error starting trial:', error);
        showStatus('Error starting trial. Please try again.', 'error');
    }
}

// Update premium status display
function updatePremiumStatus(plan, isTrial = false) { return; /* premium removed */
    console.log('Updating premium status for plan:', plan, 'isTrial:', isTrial);
    
    if (!elements.premiumStatus) {
        console.error('Premium status element not found');
        return;
    }
    
    // Remove existing status elements
    const existingStatus = elements.premiumStatus.querySelector('.status-free, .status-premium');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Update upgrade button to Change Plan button
    if (elements.upgradeBtn) {
        elements.upgradeBtn.textContent = 'Change Plan';
        elements.upgradeBtn.style.display = 'inline-block';
        elements.upgradeBtn.className = 'upgrade-btn change-plan-btn';
        
        // Remove old event listener and add new one for change plan
        const newBtn = elements.upgradeBtn.cloneNode(true);
        elements.upgradeBtn.parentNode.replaceChild(newBtn, elements.upgradeBtn);
        elements.upgradeBtn = newBtn;
        
        // Add change plan event listener
        elements.upgradeBtn.addEventListener('click', function(e) {
            console.log('Change Plan button clicked!');
            e.preventDefault();
            e.stopPropagation();
            showNewPremiumModal();
        });
    }
    
    // Create new status element
    const statusElement = document.createElement('span');
    statusElement.className = 'status-premium';
    
    if (isTrial) {
        statusElement.textContent = 'Premium Plan (Trial)';
    } else {
        statusElement.textContent = 'Premium Plan';
    }
    
    // Add the new status element
    elements.premiumStatus.appendChild(statusElement);
    
    console.log('Premium status updated to:', statusElement.textContent);
    console.log('Upgrade button changed to Change Plan button');
}

// Refresh premium status from storage
function refreshPremiumStatus() { return; /* premium removed */
    console.log('Refreshing premium status from storage');
    
    chrome.storage.sync.get('premiumSubscription', (result) => {
        if (result.premiumSubscription && result.premiumSubscription.status === 'active') {
            const plan = result.premiumSubscription.plan;
            const isTrial = result.premiumSubscription.type === 'trial';
            
            console.log('Found active subscription:', plan, 'isTrial:', isTrial);
            
            // Update status display
            updatePremiumStatus(plan, isTrial);
            
            // Show premium sections
            showPremiumSections();
                } else {
            console.log('No active subscription found, showing free status');
            
            // Show free status
            if (elements.premiumStatus) {
                // Remove existing status elements
                const existingStatus = elements.premiumStatus.querySelector('.status-free, .status-premium');
                if (existingStatus) {
                    existingStatus.remove();
                }
                
                // Create free status element
                const statusElement = document.createElement('span');
                statusElement.className = 'status-free';
                statusElement.textContent = 'Free Plan';
                elements.premiumStatus.appendChild(statusElement);
                
                // Reset upgrade button to original state
                if (elements.upgradeBtn) {
                    elements.upgradeBtn.textContent = 'Upgrade to Premium';
                    elements.upgradeBtn.className = 'upgrade-btn';
                    elements.upgradeBtn.style.display = 'inline-block';
                    
                    // Remove old event listener and add new one for upgrade
                    const newBtn = elements.upgradeBtn.cloneNode(true);
                    elements.upgradeBtn.parentNode.replaceChild(newBtn, elements.upgradeBtn);
                    elements.upgradeBtn = newBtn;
                    
                    // Add upgrade event listener
                    elements.upgradeBtn.addEventListener('click', function(e) {
                        console.log('Upgrade button clicked!');
                        e.preventDefault();
                        e.stopPropagation();
                        showNewPremiumModal();
                    });
                }
            }
            
            // Hide premium sections
            hidePremiumSections();
        }
    });
}

// Show premium sections based on current plan
function showPremiumSections() { return; /* premium removed */
    console.log('Showing premium sections based on current plan');
    
    // Get current subscription to determine which features to show
    chrome.storage.sync.get('premiumSubscription', (result) => {
        if (result.premiumSubscription && result.premiumSubscription.status === 'active') {
            const plan = result.premiumSubscription.plan;
            const isTrial = result.premiumSubscription.type === 'trial';
            
            console.log('Showing features for plan:', plan, 'isTrial:', isTrial);
            
            // Show features based on plan
            showPlanFeatures(plan, isTrial);
        }
    });
}

// Show features based on plan tier
function showPlanFeatures(plan, isTrial = false) { return; /* premium removed */
    console.log('Showing premium features for plan:', plan);
    
    // Hide all premium sections first
    hidePremiumSections();
    
    // Show all premium features for any premium plan
    showAllPremiumFeatures();
    
    // If trial, show trial indicator
    if (isTrial) {
        showTrialIndicator();
    }
}

// Show all premium features (single premium plan)
function showAllPremiumFeatures() { return; /* premium removed */
    console.log('Showing all premium features for $9.99 plan');
    
    // All Premium Features (Single Plan)
    const allPremiumFeatures = [
        {
            id: 'premium-search-engines',
            title: '🔒 Premium Search Engines',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Google Scholar', action: 'google_scholar', type: 'search_engine' },
                { name: 'arXiv Research', action: 'arxiv', type: 'search_engine' },
                { name: 'DuckDuckGo Instant', action: 'duckduckgo_instant', type: 'search_engine' },
                { name: 'Bing Visual', action: 'bing_visual', type: 'search_engine' },
                { name: 'Yahoo Finance', action: 'yahoo_finance', type: 'search_engine' },
                { name: 'PubMed Medical', action: 'pubmed', type: 'search_engine' },
                { name: 'IEEE Xplore', action: 'ieee_xplore', type: 'search_engine' },
                { name: 'ScienceDirect', action: 'sciencedirect', type: 'search_engine' },
                { name: 'Web of Science', action: 'web_of_science', type: 'search_engine' }
            ]
        },
        {
            id: 'premium-templates',
            title: '🔒 Premium Search Templates',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Research Paper', action: 'research_paper', type: 'template' },
                { name: 'Product Review', action: 'product_review', type: 'template' },
                { name: 'News Analysis', action: 'news_analysis', type: 'template' },
                { name: 'Technical Docs', action: 'technical_documentation', type: 'template' },
                { name: 'Academic Search', action: 'academic_search', type: 'template' },
                { name: 'Business Research', action: 'business_research', type: 'template' },
                { name: 'Legal Research', action: 'legal_research', type: 'template' },
                { name: 'Medical Research', action: 'medical_research', type: 'template' },
                { name: 'Patent Search', action: 'patent_search', type: 'template' }
            ]
        },
        {
            id: 'premium-filters',
            title: '🔒 Premium Filtering',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Content Type Filter', action: 'content_filter', type: 'filter' },
                { name: 'Date Range Filter', action: 'date_filter', type: 'filter' },
                { name: 'Language Filter', action: 'language_filter', type: 'filter' },
                { name: 'Region Filter', action: 'region_filter', type: 'filter' },
                { name: 'File Type Filter', action: 'file_type_filter', type: 'filter' },
                { name: 'Author Filter', action: 'author_filter', type: 'filter' },
                { name: 'Journal Filter', action: 'journal_filter', type: 'filter' },
                { name: 'Citation Filter', action: 'citation_filter', type: 'filter' }
            ]
        },
        {
            id: 'premium-tab-management',
            title: '🔒 Advanced Tab Management',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Group by Domain', action: 'group_by_domain', type: 'tab_management' },
                { name: 'Group by Search', action: 'group_by_search', type: 'tab_management' },
                { name: 'Group by Time', action: 'group_by_time', type: 'tab_management' },
                { name: 'Close All Tabs', action: 'close_all_tabs', type: 'tab_management' },
                { name: 'Refresh All Tabs', action: 'refresh_all_tabs', type: 'tab_management' },
                { name: 'Bookmark All Tabs', action: 'bookmark_all_tabs', type: 'tab_management' },
                { name: 'Export Tab URLs', action: 'export_tab_urls', type: 'tab_management' }
            ]
        },
        {
            id: 'premium-analytics',
            title: '🔒 Premium Analytics',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Search History', action: 'view_history', type: 'analytics' },
                { name: 'Popular Queries', action: 'popular_queries', type: 'analytics' },
                { name: 'Export Data', action: 'export_data', type: 'analytics' },
                { name: 'Search Trends', action: 'search_trends', type: 'analytics' },
                { name: 'Performance Metrics', action: 'performance_metrics', type: 'analytics' },
                { name: 'Custom Reports', action: 'custom_reports', type: 'analytics' }
            ]
        },
        {
            id: 'premium-collaboration',
            title: '🔒 Team Collaboration',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Share Results', action: 'share_results', type: 'collaboration' },
                { name: 'Export CSV', action: 'export_csv', type: 'collaboration' },
                { name: 'Create Workspace', action: 'create_workspace', type: 'collaboration' },
                { name: 'Join Workspace', action: 'join_workspace', type: 'collaboration' },
                { name: 'Team Chat', action: 'team_chat', type: 'collaboration' },
                { name: 'Permission Management', action: 'permission_management', type: 'collaboration' }
            ]
        },
        {
            id: 'premium-ai',
            title: '🔒 AI Enhancement',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Smart Suggestions', action: 'smart_suggestions', type: 'ai' },
                { name: 'Auto Complete', action: 'auto_complete', type: 'ai' },
                { name: 'Content Analysis', action: 'content_analysis', type: 'ai' },
                { name: 'Result Summarization', action: 'result_summarization', type: 'ai' },
                { name: 'Query Optimization', action: 'query_optimization', type: 'ai' },
                { name: 'Intelligent Filtering', action: 'intelligent_filtering', type: 'ai' }
            ]
        },
        {
            id: 'premium-automation',
            title: '🔒 Search Automation',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'Scheduled Searches', action: 'scheduled_searches', type: 'automation' },
                { name: 'Auto Refresh', action: 'auto_refresh', type: 'automation' },
                { name: 'Set Interval', action: 'set_interval', type: 'automation' },
                { name: 'Conditional Actions', action: 'conditional_actions', type: 'automation' },
                { name: 'Workflow Automation', action: 'workflow_automation', type: 'automation' }
            ]
        },
        {
            id: 'premium-enterprise',
            title: '🔒 Enterprise Integration',
            subtitle: 'Premium Plan - $9.99',
            features: [
                { name: 'API Access', action: 'api_access', type: 'enterprise' },
                { name: 'View API Docs', action: 'view_api_docs', type: 'enterprise' },
                { name: 'Bulk Export', action: 'bulk_export', type: 'enterprise' },
                { name: 'Bulk Import', action: 'bulk_import', type: 'enterprise' },
                { name: 'SSO Integration', action: 'sso_integration', type: 'enterprise' },
                { name: 'LDAP Support', action: 'ldap_support', type: 'enterprise' }
            ]
        }
    ];
    
    // Render sections inline and also backfill legacy containers at the top
    createFeatureSections(allPremiumFeatures);
    populateLegacyPremiumContainers(allPremiumFeatures);
}

// Show trial indicator
function showTrialIndicator() { return; /* premium removed */
    const trialBanner = document.createElement('div');
    trialBanner.className = 'trial-banner';
    trialBanner.innerHTML = `
        <div class="trial-banner-content">
            <span class="trial-icon">🎁</span>
            <span class="trial-message">Premium Trial Active - All features unlocked for 7 days!</span>
            <button class="trial-upgrade-btn">Upgrade Now</button>
        </div>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(trialBanner, container.firstChild);
        
        // Add event listener for upgrade button
        const upgradeBtn = trialBanner.querySelector('.trial-upgrade-btn');
        upgradeBtn.addEventListener('click', () => {
            trialBanner.remove();
            showNewPremiumModal();
        });
    }
}

// Hide premium sections
function hidePremiumSections() {
    const premiumSections = document.querySelectorAll('.premium-section');
    premiumSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove trial banner if exists
    const trialBanner = document.querySelector('.trial-banner');
    if (trialBanner) {
        trialBanner.remove();
    }
}

// Handle advanced search engine usage
function useAdvancedSearchEngine(engine) {
    console.log('Using advanced search engine:', engine);
    
    const engineUrls = {
        'google_scholar': 'https://scholar.google.com/scholar?q=',
        'arxiv': 'https://arxiv.org/search/?query=',
        'duckduckgo_instant': 'https://duckduckgo.com/?q=',
        'bing_visual': 'https://www.bing.com/images/search?q=',
        'yahoo_finance': 'https://finance.yahoo.com/quote/'
    };
    
    const queries = getQueries();
    if (queries.length === 0) {
        showStatus('Please enter search queries first.', 'error');
        return;
    }
    
    const baseUrl = engineUrls[engine];
    if (!baseUrl) {
        showStatus('Search engine not available.', 'error');
        return;
    }
    
    showStatus(`Using ${engine.replace('_', ' ')} search engine...`, 'success');
    
    // Open searches with the advanced engine
    queries.forEach(query => {
        const searchUrl = baseUrl + encodeURIComponent(query);
        chrome.tabs.create({ url: searchUrl, active: false });
    });
}

// Apply search template
function applySearchTemplate(template) {
    console.log('Applying search template:', template);
    
    const templates = {
        'research_paper': 'research paper "{query}" site:edu OR site:ac.uk OR site:ac.za',
        'product_review': '"{query}" review comparison pros cons 2024',
        'news_analysis': '"{query}" news analysis 2024',
        'technical_documentation': '"{query}" documentation tutorial guide how-to',
        'academic_search': '"{query}" academic research paper journal',
        'business_research': '"{query}" business market analysis report',
        'legal_research': '"{query}" legal case law statute regulation',
        'medical_research': '"{query}" medical research clinical trial study',
        'patent_search': '"{query}" patent invention prior art'
    };
    
    const templateQuery = templates[template];
    if (!templateQuery) {
        showStatus('Template not available.', 'error');
        return;
    }
    
    const currentQueries = elements.searchQueries ? elements.searchQueries.value.trim() : '';
    if (currentQueries) {
        const queries = currentQueries.split('\n');
        const templatedQueries = queries.map(query => 
            templateQuery.replace('{query}', query.trim())
        );
        elements.searchQueries.value = templatedQueries.join('\n');
        showStatus(`Applied ${template.replace('_', ' ')} template`, 'success');
    } else {
        showStatus('Please enter search queries first.', 'error');
    }
}

// Handle tab management actions
function handleTabManagement(action) {
    console.log('Tab management action:', action);
    
    switch(action) {
        case 'group-by-domain':
            showStatus('Grouping tabs by domain...', 'success');
            // Implementation would group tabs by domain
            break;
        case 'group-by-search':
            showStatus('Grouping tabs by search query...', 'success');
            // Implementation would group tabs by search
            break;
        case 'group-by-time':
            showStatus('Grouping tabs by creation time...', 'success');
            // Implementation would group tabs by time
            break;
        case 'close-all':
            if (confirm('Are you sure you want to close all tabs?')) {
                showStatus('Closing all tabs...', 'success');
                // Implementation would close all tabs
            }
            break;
        case 'refresh-all':
            showStatus('Refreshing all tabs...', 'success');
            // Implementation would refresh all tabs
            break;
        case 'bookmark-all':
            showStatus('Bookmarking all tabs...', 'success');
            // Implementation would bookmark all tabs
            break;
        default:
            showStatus('Action not implemented yet.', 'info');
    }
}

// Handle analytics actions
function handleAnalytics(action) {
    console.log('Analytics action:', action);
    
    switch(action) {
        case 'view-history':
            showStatus('Opening search history...', 'success');
            // Implementation would show search history
            break;
        case 'export-data':
            showStatus('Exporting analytics data...', 'success');
            // Implementation would export data
            break;
        default:
            showStatus('Analytics feature not implemented yet.', 'info');
    }
}

// Handle collaboration actions
function handleCollaboration(action) {
    console.log('Collaboration action:', action);
    
    switch(action) {
        case 'share-results':
            showStatus('Sharing search results...', 'success');
            // Implementation would share results
            break;
        case 'export-csv':
            showStatus('Exporting to CSV...', 'success');
            // Implementation would export CSV
            break;
        case 'create-workspace':
            showStatus('Creating team workspace...', 'success');
            // Implementation would create workspace
            break;
        case 'join-workspace':
            showStatus('Joining team workspace...', 'success');
            // Implementation would join workspace
            break;
        default:
            showStatus('Collaboration feature not implemented yet.', 'info');
    }
}

// Handle AI enhancement actions
function handleAIEnhancement(action) {
    console.log('AI enhancement action:', action);
    
    switch(action) {
        case 'get-suggestions':
            showStatus('Getting AI suggestions...', 'success');
            // Implementation would get AI suggestions
            break;
        case 'auto-complete':
            showStatus('Auto-completing query...', 'success');
            // Implementation would auto-complete
            break;
        case 'analyze-content':
            showStatus('Analyzing content with AI...', 'success');
            // Implementation would analyze content
            break;
        case 'summarize-results':
            showStatus('Summarizing results with AI...', 'success');
            // Implementation would summarize results
            break;
        default:
            showStatus('AI enhancement not implemented yet.', 'info');
    }
}

// Handle automation actions
function handleAutomation(action) {
    console.log('Automation action:', action);
    
    switch(action) {
        case 'schedule-search':
            showStatus('Scheduling search...', 'success');
            // Implementation would schedule search
            break;
        case 'view-schedule':
            showStatus('Opening schedule view...', 'success');
            // Implementation would show schedule
            break;
        case 'enable-auto-refresh':
            showStatus('Enabling auto-refresh...', 'success');
            // Implementation would enable auto-refresh
            break;
        case 'set-interval':
            showStatus('Setting refresh interval...', 'success');
            // Implementation would set interval
            break;
        default:
            showStatus('Automation feature not implemented yet.', 'info');
    }
}

// Handle enterprise integration actions
function handleEnterpriseIntegration(action) {
    console.log('Enterprise integration action:', action);
    
    switch(action) {
        case 'generate-api-key':
            showStatus('Generating API key...', 'success');
            // Implementation would generate API key
            break;
        case 'view-api-docs':
            showStatus('Opening API documentation...', 'success');
            // Implementation would show API docs
            break;
        case 'bulk-export':
            showStatus('Starting bulk export...', 'success');
            // Implementation would start bulk export
            break;
        case 'bulk-import':
            showStatus('Starting bulk import...', 'success');
            // Implementation would start bulk import
            break;
        default:
            showStatus('Enterprise feature not implemented yet.', 'info');
    }
}

// Handle search functionality
async function handleSearch() {
    const queries = getQueries();
    if (queries.length === 0) {
        showStatus('Please enter some search queries.', 'error');
        return;
    }

    if (queries.length > 100) {
        const confirmed = confirm(`You're about to open ${queries.length} tabs. This might slow down your browser. Continue?`);
        if (!confirmed) return;
    }

    const searchEngine = elements.searchEngine.value;
    const baseUrl = searchEngines[searchEngine];
    const extraParams = elements.extraParameters.value.trim();

    showProgress(true);
    elements.searchBtn.disabled = true;

    try {
        const premiumFilters = await getPremiumFilters();
        const premiumTokens = buildQueryTokensFromPremiumFilters(premiumFilters);
        const openedTabIds = [];
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            let assembled = [query];
            if (extraParams) assembled.push(extraParams);
            const filters = getActiveFilters();
            if (filters.length > 0) {
                assembled.push(filters.map(site => `-site:${site}`).join(' '));
            }
            if (premiumTokens.length > 0) assembled.push(premiumTokens.join(' '));
            const finalQuery = assembled.join(' ').trim();
            const searchUrl = baseUrl + encodeURIComponent(finalQuery);

            const tab = await chrome.tabs.create({ url: searchUrl, active: false });
            if (tab && typeof tab.id === 'number') openedTabIds.push(tab.id);
            
            // Update progress
            const progress = Math.round(((i + 1) / queries.length) * 100);
            updateProgress(progress);

            // Small delay to prevent overwhelming the browser
            if (i < queries.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        if (openedTabIds.length) {
            await addExtensionTabIds(openedTabIds);
            await addAnalyticsEvent({ type: 'search_opened', count: openedTabIds.length });
        }

        showStatus(`Successfully opened ${queries.length} search tabs!`, 'success');
        
        if (checkboxes.clearWords.checked) {
            elements.searchQueries.value = '';
        }

    } catch (error) {
        console.error('Search error:', error);
        showStatus('Error opening search tabs. Please try again.', 'error');
    } finally {
        elements.searchBtn.disabled = false;
        showProgress(false);
    }
}

// Handle open URLs functionality
async function handleOpenUrls() {
    const queries = getQueries();
    const urls = queries.filter(query => isValidUrl(query));
    
    if (urls.length === 0) {
        showStatus('No valid URLs found. URLs should start with http:// or https://', 'error');
        return;
    }

    if (urls.length > 50) {
        const confirmed = confirm(`You're about to open ${urls.length} URLs. This might slow down your browser. Continue?`);
        if (!confirmed) return;
    }

    showProgress(true);
    elements.openUrlsBtn.disabled = true;

    try {
        const openedTabIds = [];
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            
            if (checkboxes.addHttps.checked && !url.startsWith('http')) {
                url = 'https://' + url;
            }

            const tab = await chrome.tabs.create({ url: url, active: false });
            if (tab && typeof tab.id === 'number') openedTabIds.push(tab.id);
            
            const progress = Math.round(((i + 1) / urls.length) * 100);
            updateProgress(progress);

            if (i < urls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        if (openedTabIds.length) {
            await addExtensionTabIds(openedTabIds);
            await addAnalyticsEvent({ type: 'urls_opened', count: openedTabIds.length });
        }

        showStatus(`Successfully opened ${urls.length} URLs!`, 'success');
        
        if (checkboxes.clearWords.checked) {
            elements.searchQueries.value = '';
        }

    } catch (error) {
        console.error('URL opening error:', error);
        showStatus('Error opening URLs. Please try again.', 'error');
    } finally {
        elements.openUrlsBtn.disabled = false;
        showProgress(false);
    }
}

// Handle reset functionality
function handleReset() {
    const confirmed = confirm('This will reset all settings to default. Continue?');
    if (!confirmed) return;

    // Clear storage
    chrome.storage.sync.clear();
    
    // Reset form
    elements.searchQueries.value = '';
    elements.extraParameters.value = '';
    elements.searchEngine.value = 'google';
    
    // Reset checkboxes
    Object.values(checkboxes).forEach(checkbox => {
        if (checkbox) {
            checkbox.checked = checkbox.id === 'clear-words' || 
                              checkbox.id === 'add-https' || 
                              checkbox.id === 'trim-lines';
        }
    });

    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    showStatus('Settings reset to default.', 'success');
}

// Handle select all functionality
function handleSelectAll() {
    const isChecked = checkboxes.selectAll.checked;
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    saveSettings();
}

// Get processed queries from textarea
function getQueries() {
    let queries = elements.searchQueries.value.split('\n');
    
    if (checkboxes.trimLines.checked) {
        queries = queries.map(q => q.trim());
    }
    
    queries = queries.filter(q => q.length > 0);
    
    if (checkboxes.surroundQuotes.checked) {
        queries = queries.map(q => `"${q}"`);
    }
    
    return queries;
}

// Get active site filters
function getActiveFilters() {
    const filters = [];
    filterCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            filters.push(checkbox.dataset.site);
        }
    });
    return filters;
}

// Check if string is a valid URL
function isValidUrl(string) {
    try {
        new URL(string.startsWith('http') ? string : 'https://' + string);
        return true;
    } catch {
        return false;
    }
}

// Show status message
function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;
    elements.status.style.display = 'block';
    
    setTimeout(() => {
        elements.status.style.display = 'none';
    }, 5000);
}

// Show/hide progress bar
function showProgress(show) {
    elements.progressContainer.style.display = show ? 'block' : 'none';
    if (!show) {
        updateProgress(0);
    }
}

// Update progress bar
function updateProgress(percentage) {
    elements.progressFill.style.width = percentage + '%';
    elements.progressText.textContent = percentage + '%';
}

// Save settings to storage
async function saveSettings() {
    const settings = {
        searchEngine: elements.searchEngine.value,
        extraParameters: elements.extraParameters.value,
        clearWords: checkboxes.clearWords.checked,
        addHttps: checkboxes.addHttps.checked,
        surroundQuotes: checkboxes.surroundQuotes.checked,
        trimLines: checkboxes.trimLines.checked,
        filters: {}
    };

    filterCheckboxes.forEach(checkbox => {
        settings.filters[checkbox.dataset.site] = checkbox.checked;
    });

    try {
        await chrome.storage.sync.set({ settings });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load settings from storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get('settings');
        const settings = result.settings || {};

        if (settings.searchEngine) {
            elements.searchEngine.value = settings.searchEngine;
        }
        
        if (settings.extraParameters) {
            settings.extraParameters.value = settings.extraParameters;
        }

        // Load checkbox states
        if (settings.clearWords !== undefined) checkboxes.clearWords.checked = settings.clearWords;
        if (settings.addHttps !== undefined) checkboxes.addHttps.checked = settings.addHttps;
        if (settings.surroundQuotes !== undefined) checkboxes.surroundQuotes.checked = settings.surroundQuotes;
        if (settings.trimLines !== undefined) checkboxes.trimLines.checked = settings.trimLines;

        // Load filter states
        if (settings.filters) {
            filterCheckboxes.forEach(checkbox => {
                const site = checkbox.dataset.site;
                if (settings.filters[site] !== undefined) {
                    checkbox.checked = settings.filters[site];
                }
            });
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Helper function to get plan display name
function getPlanDisplayName(plan) {
    return 'Premium Plan';
}

// Show subscription management
function showSubscriptionManagement() {
    console.log('Showing subscription management');
    
    const modal = document.createElement('div');
    modal.className = 'subscription-management-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">⚙️ Subscription Management</h3>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            </div>
            
            <div style="padding: 30px;">
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                ">
                    <h4 style="margin: 0 0 15px 0; color: #333;">📋 Subscription Details</h4>
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 20px;
                    ">
                        <div>
                            <strong style="color: #495057;">Status:</strong>
                            <div style="color: #28a745; font-weight: 600;">Active</div>
                        </div>
                        <div>
                            <strong style="color: #495057;">Next Billing:</strong>
                            <div style="color: #6c757d;">Next month</div>
                        </div>
                        <div>
                            <strong style="color: #495057;">Billing Cycle:</strong>
                            <div style="color: #6c757d;">Monthly</div>
                        </div>
                        <div>
                            <strong style="color: #495057;">Payment Method:</strong>
                            <div style="color: #6c757d;">•••• •••• •••• 1234</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 25px;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #856404;">💡 Need Help?</h5>
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        Contact our support team for billing questions, plan changes, or technical assistance.
                    </p>
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button class="contact-support-btn" style="
                        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">📞 Contact Support</button>
                    <button class="close-management-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Close</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const closeManagementBtn = modal.querySelector('.close-management-btn');
    const contactSupportBtn = modal.querySelector('.contact-support-btn');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    closeManagementBtn.addEventListener('click', () => {
        modal.remove();
    });

    contactSupportBtn.addEventListener('click', () => {
        modal.remove();
        showContactSupport();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Show cancel subscription confirmation
function showCancelConfirmation() {
    console.log('Showing cancel subscription confirmation');

    const modal = document.createElement('div');
    modal.className = 'cancel-subscription-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">❌ Cancel Subscription</h3>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            </div>
            
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Are you sure you want to cancel?</h4>
                    <p style="margin: 0; color: #666; line-height: 1.5;">
                        Canceling your subscription will:
                    </p>
                </div>
                
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                ">
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        text-align: left;
                    ">
                        <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #dc3545;">❌</span>
                            Remove access to premium features
                        </li>
                        <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #dc3545;">❌</span>
                            Disable advanced search engines
                        </li>
                        <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #dc3545;">❌</span>
                            Remove enhanced filtering options
                        </li>
                        <li style="padding: 8px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #dc3545;">❌</span>
                            Disable search templates
                        </li>
                    </ul>
                        </div>
                
                <div style="
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 25px;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #856404;">💡 Before you go...</h5>
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        Consider downgrading to a lower plan instead of canceling completely. You can always reactivate later!
                    </p>
                    </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                ">
                    <button class="confirm-cancel-btn" style="
                        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">❌ Yes, Cancel Subscription</button>
                    <button class="keep-subscription-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Keep Subscription</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const keepBtn = modal.querySelector('.keep-subscription-btn');
    const confirmCancelBtn = modal.querySelector('.confirm-cancel-btn');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    keepBtn.addEventListener('click', () => {
        modal.remove();
    });

    confirmCancelBtn.addEventListener('click', () => {
        modal.remove();
        processSubscriptionCancellation();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Show contact support
function showContactSupport() {
    console.log('Showing contact support');
    
    const modal = document.createElement('div');
    modal.className = 'contact-support-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                color: white;
                padding: 25px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                position: relative;
            ">
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">📞 Contact Support</h3>
                <button class="modal-close-btn" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                ">×</button>
            </div>
            
            <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📧</div>
                    <h4 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Get Help from Our Team</h4>
                    <p style="margin: 0; color: #666; line-height: 1.5;">
                        Our support team is here to help with any questions or issues you may have.
                    </p>
                </div>
                
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                ">
                    <h5 style="margin: 0 0 15px 0; color: #495057;">Contact Methods:</h5>
                    <div style="
                        display: grid;
                        gap: 15px;
                    ">
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px;
                            background: white;
                            border-radius: 6px;
                            border: 1px solid #e9ecef;
                        ">
                            <span style="font-size: 20px;">📧</span>
                            <div>
                                <strong style="color: #333;">Email:</strong>
                                <div style="color: #6c757d; font-size: 14px;">support@multitabsearch.com</div>
                            </div>
                        </div>
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px;
                            background: white;
                            border-radius: 6px;
                            border: 1px solid #e9ecef;
                        ">
                            <span style="font-size: 20px;">💬</span>
                            <div>
                                <strong style="color: #333;">Live Chat:</strong>
                                <div style="color: #6c757d; font-size: 14px;">Available 24/7</div>
                            </div>
                        </div>
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 10px;
                            background: white;
                            border-radius: 6px;
                            border: 1px solid #e9ecef;
                        ">
                            <span style="font-size: 20px;">📚</span>
                            <div>
                                <strong style="color: #333;">Help Center:</strong>
                                <div style="color: #6c757d; font-size: 14px;">help.multitabsearch.com</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                ">
                    <button class="close-support-btn" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Close</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.modal-close-btn');
    const closeSupportBtn = modal.querySelector('.close-support-btn');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    closeSupportBtn.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Process subscription cancellation
function processSubscriptionCancellation() {
    console.log('Processing subscription cancellation');
    
    try {
        // Remove premium subscription
        chrome.storage.sync.remove('premiumSubscription', () => {
            showStatus('❌ Your subscription has been canceled. You can reactivate anytime!', 'error');
        
        // Update UI immediately
        if (elements.premiumStatus) {
            const statusElement = elements.premiumStatus.querySelector('.status-free, .status-premium');
            if (statusElement) {
                    statusElement.textContent = 'Free Plan';
                    statusElement.className = 'status-free';
            }
            if (elements.upgradeBtn) {
                    elements.upgradeBtn.style.display = 'inline-block';
                }
            }
            
            // Hide premium sections
            hidePremiumSections();
            
            // Show cancellation success modal
            showCancellationSuccess();
        });
        
    } catch (error) {
        console.error('Error during cancellation:', error);
        showStatus('Error processing cancellation. Please try again.', 'error');
    }
}

// Show cancellation success modal
function showCancellationSuccess() {
    const modal = document.createElement('div');
    modal.className = 'cancellation-success-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        ">
            <div style="
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                color: white;
                padding: 30px;
                border-radius: 16px 16px 0 0;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">👋</div>
                <h3 style="margin: 0; font-size: 24px; font-weight: 700;">Subscription Canceled</h3>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">We're sorry to see you go</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                ">
                    <h4 style="margin: 0 0 15px 0; color: #333;">What happens next?</h4>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        text-align: left;
                    ">
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #6c757d;">📅</span>
                            Your premium features will remain active until the end of your billing period
                        </li>
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #6c757d;">💳</span>
                            No further charges will be made
                        </li>
                        <li style="padding: 6px 0; color: #6c757d; display: flex; align-items: center;">
                            <span style="margin-right: 10px; color: #6c757d;">🔄</span>
                            You can reactivate your subscription anytime
                        </li>
                    </ul>
                </div>
                
                <button class="reactivate-btn" style="
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">🔄 Reactivate Subscription</button>
            </div>
        </div>
    `;

    const reactivateBtn = modal.querySelector('.reactivate-btn');

    reactivateBtn.addEventListener('click', () => {
        modal.remove();
        showNewPremiumModal(); // Show upgrade modal to reactivate
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 15000);
}

// Start premium upgrade (legacy function - now redirects to new modal)
function startPremiumUpgrade() {
    console.log('Legacy upgrade function called, redirecting to new modal');
    showNewPremiumModal();
}

// Test functions removed - premium features are now working properly

// Handle search engine actions
function handleSearchEngineAction(action) {
    console.log('Search engine action:', action);
    
    const engineUrls = {
        'google_scholar': 'https://scholar.google.com/scholar?q=',
        'arxiv': 'https://arxiv.org/search/?query=',
        'duckduckgo_instant': 'https://duckduckgo.com/?q=',
        'bing_visual': 'https://www.bing.com/images/search?q=',
        'yahoo_finance': 'https://finance.yahoo.com/quote/',
        'pubmed': 'https://pubmed.ncbi.nlm.nih.gov/?term=',
        'ieee_xplore': 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=',
        'sciencedirect': 'https://www.sciencedirect.com/search?qs=',
        'web_of_science': 'https://www.webofscience.com/wos/woscc/summary/'
    };
    
    const queries = getQueries();
    if (queries.length === 0) {
        showStatus('Please enter search queries first.', 'error');
        return;
    }

    const baseUrl = engineUrls[action];
    if (!baseUrl) {
        showStatus('Search engine not available.', 'error');
        return;
    }
    
    showStatus(`Using ${action.replace('_', ' ')} search engine...`, 'success');
    
    // Open searches with the advanced engine
    queries.forEach(query => {
        const searchUrl = baseUrl + encodeURIComponent(query);
        chrome.tabs.create({ url: searchUrl, active: false });
    });
}

// Handle template actions
function handleTemplateAction(action) {
    console.log('Template action:', action);
    
    const templates = {
        'research_paper': 'research paper "{query}" site:edu OR site:ac.uk OR site:ac.za',
        'product_review': '"{query}" review comparison pros cons 2024',
        'news_analysis': '"{query}" news analysis 2024',
        'technical_documentation': '"{query}" documentation tutorial guide how-to',
        'academic_search': '"{query}" academic research paper journal',
        'business_research': '"{query}" business market analysis report',
        'legal_research': '"{query}" legal case law statute regulation',
        'medical_research': '"{query}" medical research clinical trial study',
        'patent_search': '"{query}" patent invention prior art'
    };
    
    const templateQuery = templates[action];
    if (!templateQuery) {
        showStatus('Template not available.', 'error');
        return;
    }
    
    const currentQueries = elements.searchQueries ? elements.searchQueries.value.trim() : '';
    if (currentQueries) {
        const queries = currentQueries.split('\n');
        const templatedQueries = queries.map(query => 
            templateQuery.replace('{query}', query.trim())
        );
        elements.searchQueries.value = templatedQueries.join('\n');
        showStatus(`Applied ${action.replace('_', ' ')} template`, 'success');
    } else {
        showStatus('Please enter search queries first.', 'error');
    }
}

// Handle filter actions
function handleFilterAction(action) {
    console.log('Filter action:', action);
    
    switch(action) {
        case 'content_filter':
        case 'date_filter':
        case 'language_filter':
        case 'region_filter':
        case 'file_type_filter':
        case 'author_filter':
        case 'journal_filter':
        case 'citation_filter':
            configurePremiumFilter(action);
            break;
        default:
            showStatus('Filter not implemented yet.', 'info');
    }
}

// Handle tab management actions
async function handleTabManagementAction(action) {
    console.log('Tab management action:', action);
    
    switch(action) {
        case 'group_by_domain': {
            const ids = await getExtensionTabIds();
            if (!ids.length) return showStatus('No extension tabs to group.', 'info');
            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
                const map = {};
                tabs.filter(t => ids.includes(t.id)).forEach(t => {
                    try {
                        const u = new URL(t.url || '');
                        const d = u.hostname || 'unknown';
                        (map[d] ||= []).push(t);
                    } catch {}
                });
                const list = Object.keys(map).map(k => `${k} — ${map[k].length} tabs`).join('<br/>');
                showSimpleModal('Group by Domain (Preview)', `<div>${list || 'No tabs'}</div>`);
            });
            break;
        }
        case 'group_by_search': {
            const ids = await getExtensionTabIds();
            if (!ids.length) return showStatus('No extension tabs to group.', 'info');
            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
                const map = {};
                tabs.filter(t => ids.includes(t.id)).forEach(t => {
                    const q = (t.url || '').split('?q=')[1] || (t.url || '').split('?p=')[1] || '';
                    const key = q ? decodeURIComponent(q).split('+')[0].slice(0, 40) : 'unknown';
                    (map[key] ||= []).push(t);
                });
                const list = Object.keys(map).map(k => `${k} — ${map[k].length} tabs`).join('<br/>');
                showSimpleModal('Group by Search (Preview)', `<div>${list || 'No tabs'}</div>`);
            });
            break;
        }
        case 'group_by_time':
            showStatus('Grouping by time (preview only).', 'success');
            break;
        case 'close_all_tabs': {
            const ids = await getExtensionTabIds();
            if (!ids.length) return showStatus('No extension tabs to close.', 'info');
            if (confirm(`Close ${ids.length} tabs opened by this extension?`)) {
                await Promise.all(ids.map(id => new Promise(res => chrome.tabs.remove(id, () => res()))));
                await setExtensionTabIds([]);
                showStatus('All extension tabs closed.', 'success');
            }
            break;
        }
        case 'refresh_all_tabs': {
            const ids = await getExtensionTabIds();
            if (!ids.length) return showStatus('No extension tabs to refresh.', 'info');
            ids.forEach(id => chrome.tabs.reload(id));
            showStatus('All extension tabs refreshed.', 'success');
            break;
        }
        case 'bookmark_all_tabs': {
            const ids = await getExtensionTabIds();
            if (!ids.length) return showStatus('No extension tabs to bookmark.', 'info');
            chrome.tabs.query({}, (tabs) => {
                const ourTabs = tabs.filter(t => ids.includes(t.id));
                const text = ourTabs.map(t => t.url).join('\n');
                exportTextFile('tabs.txt', text);
                showStatus('Exported tab URLs to tabs.txt', 'success');
            });
            break;
        }
        case 'export_tab_urls': {
            const ids = await getExtensionTabIds();
            chrome.tabs.query({}, (tabs) => {
                const ourTabs = tabs.filter(t => ids.includes(t.id));
                const text = ourTabs.map(t => t.url).join('\n');
                exportTextFile('tabs.txt', text);
                showStatus('Exported tab URLs to tabs.txt', 'success');
            });
            break;
        }
        default:
            showStatus('Tab management action not implemented yet.', 'info');
    }
}

// Handle analytics actions
async function handleAnalyticsAction(action) {
    console.log('Analytics action:', action);
    
    const analytics = await getAnalytics();
    switch(action) {
        case 'view_history': {
            const rows = analytics.filter(a => a.type === 'search_opened' || a.type === 'urls_opened')
                .slice().reverse()
                .map(a => `<div>• ${new Date(a.ts).toLocaleString()} — ${a.type} (${a.count})</div>`)
                .join('');
            showSimpleModal('Search History', rows || '<div>No history yet.</div>');
            break;
        }
        case 'popular_queries': {
            showStatus('Showing popular queries...', 'success');
            break;
        }
        case 'export_data': {
            const text = analytics.map(a => JSON.stringify(a)).join('\n');
            exportTextFile('analytics.jsonl', text);
            showStatus('Exported analytics.jsonl', 'success');
            break;
        }
        case 'search_trends':
            showStatus('Showing search trends...', 'success');
            break;
        case 'performance_metrics':
            showStatus('Showing performance metrics...', 'success');
            break;
        case 'custom_reports':
            showStatus('Generating custom report...', 'success');
            break;
        case 'export_csv_tabs':
            await exportTabsCSV();
            break;
        case 'share_results':
            await copyResultsToClipboard();
            break;
        case 'create_workspace':
            showWorkspaceManager();
            break;
        case 'view_schedule':
            createScheduleFromCurrent();
            break;
        default:
            showStatus('Analytics feature not implemented yet.', 'info');
    }
}

// Handle collaboration actions
async function handleCollaborationAction(action) {
    console.log('Collaboration action:', action);
    
    switch(action) {
        case 'share_results':
            showStatus('Sharing search results...', 'success');
            break;
        case 'export_csv':
            await exportTabsCSV();
            break;
        case 'create_workspace':
            showWorkspaceManager();
            break;
        case 'join_workspace':
            showStatus('Invite link feature coming soon.', 'info');
            break;
        case 'team_chat':
            showStatus('Opening team chat...', 'success');
            break;
        case 'permission_management':
            showStatus('Opening permission management...', 'success');
            break;
        default:
            showStatus('Collaboration feature not implemented yet.', 'info');
    }
}

// Handle AI enhancement actions
function handleAIAction(action) {
    console.log('AI enhancement action:', action);
    
    switch(action) {
        case 'smart_suggestions':
            showStatus('Getting AI suggestions...', 'success');
            break;
        case 'auto_complete':
            showStatus('Auto-completing query...', 'success');
            break;
        case 'content_analysis':
            showStatus('Analyzing content with AI...', 'success');
            break;
        case 'result_summarization':
            showStatus('Summarizing results with AI...', 'success');
            break;
        case 'query_optimization':
            showStatus('Optimizing query with AI...', 'success');
            break;
        case 'intelligent_filtering':
            showStatus('Applying intelligent filtering...', 'success');
            break;
        default:
            showStatus('AI enhancement not implemented yet.', 'info');
    }
}

// Handle automation actions
function handleAutomationAction(action) {
    console.log('Automation action:', action);
    
    switch(action) {
        case 'scheduled_searches':
            showStatus('Scheduling search...', 'success');
            break;
        case 'auto_refresh':
            showStatus('Enabling auto-refresh...', 'success');
            break;
        case 'set_interval':
            showStatus('Setting refresh interval...', 'success');
            break;
        case 'conditional_actions':
            showStatus('Setting conditional actions...', 'success');
            break;
        case 'workflow_automation':
            showStatus('Setting up workflow automation...', 'success');
            break;
        default:
            showStatus('Automation feature not implemented yet.', 'info');
    }
}

// Handle enterprise integration actions
function handleEnterpriseAction(action) {
    console.log('Enterprise integration action:', action);
    
    switch(action) {
        case 'api_access':
            showStatus('Generating API key...', 'success');
            break;
        case 'view_api_docs':
            showStatus('Opening API documentation...', 'success');
            break;
        case 'bulk_export':
            showStatus('Starting bulk export...', 'success');
            break;
        case 'bulk_import':
            showStatus('Starting bulk import...', 'success');
            break;
        case 'sso_integration':
            showStatus('Setting up SSO integration...', 'success');
            break;
        case 'ldap_support':
            showStatus('Setting up LDAP support...', 'success');
            break;
        default:
            showStatus('Enterprise feature not implemented yet.', 'info');
    }
}

// Create feature sections dynamically
function createFeatureSections(features) {
    features.forEach(featureGroup => {
        const section = document.createElement('div');
        section.id = featureGroup.id;
        section.className = 'premium-section premium-plan';
        section.style.cssText = `
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
        `;
        
        section.innerHTML = `
            <h3 class="premium-label">
                ${featureGroup.title}
                <span class="feature-count">${featureGroup.features.length}</span>
            </h3>
            <p class="feature-subtitle">${featureGroup.subtitle}</p>
            <div class="feature-grid">
                ${featureGroup.features.map(feature => `
                    <button class="feature-btn ${feature.type}-btn" data-action="${feature.action}" data-type="${feature.type}">
                        ${feature.name}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Insert after the search engine section
        const searchEngineSection = document.querySelector('.search-engine-section');
        if (searchEngineSection) {
            searchEngineSection.parentNode.insertBefore(section, searchEngineSection.nextSibling);
        }
        
        // Add event listeners to feature buttons
        section.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const type = e.target.dataset.type;
                handleFeatureAction(action, type);
            });
        });
    });
}

// Handle feature actions based on type
function handleFeatureAction(action, type) {
    console.log('Feature action:', action, 'Type:', type);
    
    switch(type) {
        case 'search_engine':
            handleSearchEngineAction(action);
            break;
        case 'template':
            handleTemplateAction(action);
            break;
        case 'filter':
            handleFilterAction(action);
            break;
        case 'tab_management':
            handleTabManagementAction(action);
            break;
        case 'analytics':
            handleAnalyticsAction(action);
            break;
        case 'collaboration':
            handleCollaborationAction(action);
            break;
        case 'ai':
            handleAIAction(action);
            break;
        case 'automation':
            handleAutomationAction(action);
            break;
        case 'enterprise':
            handleEnterpriseAction(action);
            break;
        default:
            showStatus('Feature type not implemented yet.', 'info');
    }
}

// Utility: simple modal helper
function showSimpleModal(title, contentHtml, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'mts-simple-modal';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 1000000; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center; padding: 16px;
    `;
    modal.innerHTML = `
        <div style="background: #fff; border-radius: 12px; max-width: 640px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div style="padding: 16px 20px; background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; border-radius: 12px 12px 0 0; display:flex; align-items:center; justify-content: space-between;">
                <h3 style="margin:0; font-size:18px; font-weight:700;">${title}</h3>
                <button class="mts-modal-close" style="background: rgba(255,255,255,0.2); color:#fff; border:none; width:32px; height:32px; border-radius: 50%; cursor:pointer; font-size:18px;">×</button>
            </div>
            <div style="padding: 16px 20px; max-height: 70vh; overflow:auto;">${contentHtml}</div>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    modal.querySelector('.mts-modal-close').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
    return modal;
}

// Premium filters state helpers
async function getPremiumFilters() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('premiumFilters', (res) => {
            resolve(res.premiumFilters || {});
        });
    });
}

async function setPremiumFilters(premiumFilters) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ premiumFilters }, () => resolve());
    });
}

function buildQueryTokensFromPremiumFilters(filters) {
    const tokens = [];
    if (!filters) return tokens;
    // Content type presets -> approximate tokens
    if (filters.content_filter) {
        const t = (filters.content_filter + '').toLowerCase();
        if (t === 'pdf' || t === 'doc' || t === 'ppt' || t === 'xls') tokens.push(`filetype:${t}`);
        if (t === 'video') tokens.push('site:youtube.com OR site:vimeo.com');
        if (t === 'image') tokens.push('site:images.google.com');
        if (t === 'news') tokens.push('site:news.google.com');
    }
    if (filters.date_filter) {
        // Expect YYYY-MM-DD or keywords like last:7d, last:30d
        const v = filters.date_filter + '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) tokens.push(`after:${v}`);
        else if (/^last:\d+d$/.test(v)) tokens.push(v);
    }
    if (filters.language_filter) tokens.push(`lang:${filters.language_filter}`);
    if (filters.region_filter) tokens.push(`region:${filters.region_filter}`);
    if (filters.file_type_filter) tokens.push(`filetype:${filters.file_type_filter}`);
    if (filters.author_filter) tokens.push(`author:"${filters.author_filter}"`);
    if (filters.journal_filter) tokens.push(`journal:"${filters.journal_filter}"`);
    if (filters.citation_filter) tokens.push(`citation:${filters.citation_filter}`);
    return tokens.filter(Boolean);
}

async function configurePremiumFilter(action) {
    const filters = await getPremiumFilters();
    const labelMap = {
        content_filter: 'Content Type (video, image, news, pdf, doc, ppt, xls)',
        date_filter: 'Date Filter (YYYY-MM-DD or last:7d)',
        language_filter: 'Language (en, es, fr, de, ...)',
        region_filter: 'Region (US, UK, IN, ...)',
        file_type_filter: 'File Type (pdf, docx, xlsx, ...)',
        author_filter: 'Author Name',
        journal_filter: 'Journal Name',
        citation_filter: 'Minimum Citations (number)'
    };
    const nice = labelMap[action] || 'Value';
    const current = filters[action] || '';
    const content = `
        <div style="display:flex; flex-direction: column; gap: 12px;">
            <label style="font-weight:600; color:#333;">${nice}</label>
            <input id="mts-filter-input" type="text" placeholder="Enter value" value="${String(current).replace(/"/g,'&quot;')}"
                   style="padding: 10px 12px; border:1px solid #e5e7eb; border-radius:8px; outline:none;" />
            <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button id="mts-filter-clear" style="background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">Clear</button>
                <button id="mts-filter-save" style="background:#667eea; color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">Save</button>
            </div>
        </div>
    `;
    const modal = showSimpleModal('Set Premium Filter', content);
    modal.querySelector('#mts-filter-save').addEventListener('click', async () => {
        const v = (modal.querySelector('#mts-filter-input').value || '').trim();
        if (v) filters[action] = v; else delete filters[action];
        await setPremiumFilters(filters);
        showStatus('Premium filter saved', 'success');
        modal.remove();
    });
    modal.querySelector('#mts-filter-clear').addEventListener('click', async () => {
        delete filters[action];
        await setPremiumFilters(filters);
        showStatus('Premium filter cleared', 'success');
        modal.remove();
    });
}

// Track tabs opened by the extension
async function getExtensionTabIds() {
    return new Promise((resolve) => {
        chrome.storage.local.get('extensionTabIds', (res) => {
            resolve(Array.isArray(res.extensionTabIds) ? res.extensionTabIds : []);
        });
    });
}

async function setExtensionTabIds(ids) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ extensionTabIds: ids }, () => resolve());
    });
}

async function addExtensionTabIds(newIds) {
    const old = await getExtensionTabIds();
    const merged = Array.from(new Set([...old, ...newIds].filter((id) => typeof id === 'number')));
    await setExtensionTabIds(merged);
}

// Analytics helpers
async function addAnalyticsEvent(event) {
    return new Promise((resolve) => {
        chrome.storage.local.get('analytics', (res) => {
            const list = Array.isArray(res.analytics) ? res.analytics : [];
            list.push({ ...event, ts: Date.now() });
            chrome.storage.local.set({ analytics: list.slice(-1000) }, () => resolve());
        });
    });
}

async function getAnalytics() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['analytics'], (res) => resolve(Array.isArray(res.analytics) ? res.analytics : []));
    });
}

function exportTextFile(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

function populateLegacyPremiumContainers(allGroups) { return; /* premium removed */
    const byId = {};
    allGroups.forEach(g => { byId[g.id] = g; });

    const containerMap = [
        { containerId: 'premium-search-engines', groupId: 'premium-search-engines' },
        { containerId: 'premium-templates', groupId: 'premium-templates' },
        { containerId: 'premium-enhanced-filters', groupId: 'premium-filters' }
    ];

    containerMap.forEach(({ containerId, groupId }) => {
        const el = document.getElementById(containerId);
        const group = byId[groupId];
        if (!el || !group) return;
        el.style.display = 'block';
        el.innerHTML = `
            <h3 class="premium-label">${group.title} <span class="feature-count">${group.features.length}</span></h3>
            <p class="feature-subtitle">${group.subtitle}</p>
            <div class="feature-grid">
                ${group.features.map(f => `
                    <button class="feature-btn ${f.type}-btn" data-action="${f.action}" data-type="${f.type}">${f.name}</button>
                `).join('')}
            </div>
        `;
        el.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                const type = e.currentTarget.getAttribute('data-type');
                handleFeatureAction(action, type);
            });
        });
    });
}

// Workspaces (save/load sets of queries and filters)
async function getWorkspaces() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('workspaces', (res) => resolve(res.workspaces || {}));
    });
}

async function setWorkspaces(workspaces) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ workspaces }, () => resolve());
    });
}

async function saveWorkspace(name) {
    const queriesText = elements.searchQueries ? elements.searchQueries.value : '';
    const extraParameters = elements.extraParameters ? elements.extraParameters.value : '';
    const engine = elements.searchEngine ? elements.searchEngine.value : 'google';
    const siteFilters = {};
    filterCheckboxes.forEach(cb => { siteFilters[cb.dataset.site] = cb.checked; });
    const premiumFilters = await getPremiumFilters();

    const ws = await getWorkspaces();
    ws[name] = { name, queriesText, extraParameters, engine, siteFilters, premiumFilters, updatedAt: Date.now() };
    await setWorkspaces(ws);
}

async function loadWorkspace(name) {
    const ws = await getWorkspaces();
    const data = ws[name];
    if (!data) return false;
    if (elements.searchQueries) elements.searchQueries.value = data.queriesText || '';
    if (elements.extraParameters) elements.extraParameters.value = data.extraParameters || '';
    if (elements.searchEngine) elements.searchEngine.value = data.engine || 'google';
    if (data.siteFilters) {
        filterCheckboxes.forEach(cb => { cb.checked = !!data.siteFilters[cb.dataset.site]; });
    }
    if (data.premiumFilters) await setPremiumFilters(data.premiumFilters);
    showStatus(`Workspace "${name}" loaded.`, 'success');
    return true;
}

function showWorkspaceManager() {
    getWorkspaces().then(ws => {
        const names = Object.keys(ws);
        const list = names.map(n => `<div style=\"display:flex; align-items:center; justify-content:space-between; padding:8px 0;\">
            <div style=\"font-weight:600;\">${n}</div>
            <div style=\"display:flex; gap:8px;\">
                <button class=\"mts-ws-load\" data-name=\"${n}\" style=\"padding:6px 10px;\">Load</button>
                <button class=\"mts-ws-delete\" data-name=\"${n}\" style=\"padding:6px 10px; background:#ef4444; color:#fff; border:none; border-radius:6px;\">Delete</button>
            </div>
        </div>`).join('');
        const content = `
            <div style=\"display:flex; flex-direction:column; gap:12px;\">
                <div style=\"display:flex; gap:8px;\">
                    <input id=\"mts-ws-name\" placeholder=\"Workspace name\" style=\"flex:1; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px;\" />
                    <button id=\"mts-ws-save\" style=\"background:#667eea; color:#fff; border:none; padding:8px 12px; border-radius:8px;\">Save Current</button>
                </div>
                <div>${list || '<i>No workspaces yet.</i>'}</div>
            </div>
        `;
        const modal = showSimpleModal('Workspaces', content);
        modal.querySelector('#mts-ws-save').addEventListener('click', async () => {
            const nameEl = modal.querySelector('#mts-ws-name');
            const name = (nameEl.value || '').trim();
            if (!name) return showStatus('Please enter a name', 'error');
            await saveWorkspace(name);
            modal.remove();
            showWorkspaceManager();
        });
        modal.querySelectorAll('.mts-ws-load').forEach(btn => btn.addEventListener('click', async (e) => {
            const n = e.currentTarget.getAttribute('data-name');
            await loadWorkspace(n);
            modal.remove();
        }));
        modal.querySelectorAll('.mts-ws-delete').forEach(btn => btn.addEventListener('click', async (e) => {
            const n = e.currentTarget.getAttribute('data-name');
            const wsAll = await getWorkspaces();
            delete wsAll[n];
            await setWorkspaces(wsAll);
            modal.remove();
            showWorkspaceManager();
        }));
    });
}

// Export open tabs (from extension) as CSV (title,url)
async function exportTabsCSV() {
    const ids = await getExtensionTabIds();
    if (!ids.length) return showStatus('No extension tabs to export.', 'info');
    chrome.tabs.query({}, (tabs) => {
        const ourTabs = tabs.filter(t => ids.includes(t.id));
        const lines = [['Title', 'URL']].concat(ourTabs.map(t => [t.title || '', t.url || '']));
        const csv = lines.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
        exportTextFile('tabs.csv', csv);
        showStatus('Exported tabs.csv', 'success');
    });
}

async function copyResultsToClipboard() {
    const ids = await getExtensionTabIds();
    chrome.tabs.query({}, async (tabs) => {
        const ourTabs = tabs.filter(t => ids.includes(t.id));
        const text = ourTabs.map(t => `${t.title || ''}\n${t.url || ''}`).join('\n\n');
        try {
            await navigator.clipboard.writeText(text);
            showStatus('Results copied to clipboard.', 'success');
        } catch {
            exportTextFile('results.txt', text);
            showStatus('Clipboard unavailable. Exported results.txt', 'info');
        }
    });
}

// Scheduling (uses chrome.alarms handled in background)
async function getScheduledJobs() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('scheduledJobs', (res) => resolve(res.scheduledJobs || {}));
    });
}

async function setScheduledJobs(jobs) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ scheduledJobs: jobs }, () => resolve());
    });
}

async function createScheduleFromCurrent() {
    const content = `
        <div style=\"display:flex; flex-direction:column; gap:12px;\">
            <label style=\"font-weight:600;\">Schedule Name</label>
            <input id=\"mts-sch-name\" placeholder=\"Name\" style=\"padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px;\" />
            <label style=\"font-weight:600;\">Frequency</label>
            <select id=\"mts-sch-freq\" style=\"padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px;\">
                <option value=\"60\">Hourly</option>
                <option value=\"720\">Every 12 hours</option>
                <option value=\"1440\" selected>Daily</option>
                <option value=\"10080\">Weekly</option>
            </select>
            <div style=\"display:flex; justify-content:flex-end; gap:8px;\">
                <button id=\"mts-sch-cancel\" style=\"padding:8px 12px;\">Cancel</button>
                <button id=\"mts-sch-save\" style=\"background:#667eea; color:#fff; border:none; padding:8px 12px; border-radius:8px;\">Save</button>
            </div>
        </div>`;
    const modal = showSimpleModal('Schedule Searches', content);
    modal.querySelector('#mts-sch-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#mts-sch-save').addEventListener('click', async () => {
        const name = (modal.querySelector('#mts-sch-name').value || '').trim();
        const minutes = parseInt(modal.querySelector('#mts-sch-freq').value, 10);
        if (!name) return showStatus('Please name your schedule', 'error');

        const queriesText = elements.searchQueries ? elements.searchQueries.value : '';
        if (!queriesText.trim()) return showStatus('Enter queries before scheduling', 'error');

        const job = {
            name,
            engine: elements.searchEngine ? elements.searchEngine.value : 'google',
            extraParameters: elements.extraParameters ? elements.extraParameters.value : '',
            queries: queriesText.split('\n').map(q => q.trim()).filter(Boolean),
            siteFilters: (() => { const o = {}; filterCheckboxes.forEach(cb => o[cb.dataset.site] = cb.checked); return o; })(),
            premiumFilters: await getPremiumFilters(),
            periodInMinutes: minutes
        };
        const jobs = await getScheduledJobs();
        jobs[name] = job;
        await setScheduledJobs(jobs);
        chrome.runtime.sendMessage({ type: 'createAlarm', payload: { name, periodInMinutes: minutes } });
        showStatus('Schedule saved. It will run in background.', 'success');
        modal.remove();
    });
}

console.log('Popup.js loaded successfully');