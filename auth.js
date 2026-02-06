const auth = {
    user: null,

    init() {
        const storedUser = localStorage.getItem('fit_user');
        if (storedUser) {
            this.user = storedUser;
            this.showApp();
        } else {
            this.showLogin();
        }

        // Event Listeners
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email-input').value;
            this.login(email);
        });

        document.getElementById('guest-btn').addEventListener('click', () => {
            this.login('Guest');
        });
    },

    login(email) {
        this.user = email;
        localStorage.setItem('fit_user', email);
        this.showApp();
        // Reload to refresh payments/app state specific to user
        location.reload(); 
    },

    logout() {
        localStorage.removeItem('fit_user');
        localStorage.removeItem('fit_tier'); // Optional: Clear tier on logout? Keeping it usually better for UX.
        location.reload();
    },

    showApp() {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');
    },

    showLogin() {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});
