const payments = {
    tier: 'FREE', // FREE, PRO, ELITE

    init() {
        // 1. Check for URL Parameters (Redirect from Square)
        const urlParams = new URLSearchParams(window.location.search);
        const unlockParam = urlParams.get('unlock');

        if (unlockParam) {
            this.setTier(unlockParam);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            alert(`Purchase Successful! You are now on the ${unlockParam} tier.`);
        } else {
            // 2. Load from Storage
            const storedTier = localStorage.getItem('fit_tier');
            if (storedTier) {
                this.tier = storedTier;
            }
        }

        this.updateUI();
    },

    setTier(level) {
        // Simple hierarchy check
        if(['PRO', 'ELITE'].includes(level)) {
            this.tier = level;
            localStorage.setItem('fit_tier', level);
            this.updateUI();
        }
    },

    getTier() {
        return this.tier;
    },

    updateUI() {
        const badge = document.getElementById('tier-badge');
        badge.innerText = this.tier;
        
        if(this.tier === 'ELITE') {
            badge.style.background = '#f1c40f'; // Gold
            badge.style.color = '#000';
        } else if (this.tier === 'PRO') {
            badge.style.background = '#3498db'; // Blue
        }
        
        // Refresh app views if loaded
        if(typeof app !== 'undefined') app.renderLocks();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    payments.init();
});
