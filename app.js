const app = {
    data: {
        nutrition: { cal: 0, prot: 0, carb: 0, sugar: 0 },
        goals: { cal: 2000, prot: 150 } // Defaults
    },

    init() {
        this.loadData();
        this.renderStats();
        this.renderLocks();

        // Event Listeners
        document.getElementById('entry-form').addEventListener('submit', (e) => this.addEntry(e));
        document.getElementById('goals-form').addEventListener('submit', (e) => this.saveGoals(e));
        
        // Show Tracker by default
        this.showSection('tracker');
    },

    loadData() {
        const stored = localStorage.getItem('fit_data');
        if (stored) {
            this.data = JSON.parse(stored);
        }
        
        // Populate Goal Inputs
        document.getElementById('target-cal').value = this.data.goals.cal || 2000;
        document.getElementById('target-prot').value = this.data.goals.prot || 150;
    },

    saveData() {
        localStorage.setItem('fit_data', JSON.stringify(this.data));
    },

    addEntry(e) {
        e.preventDefault();
        const cal = parseInt(document.getElementById('cal-in').value) || 0;
        const prot = parseInt(document.getElementById('prot-in').value) || 0;
        const carb = parseInt(document.getElementById('carb-in').value) || 0;
        const sugar = parseInt(document.getElementById('sugar-in').value) || 0;

        this.data.nutrition.cal += cal;
        this.data.nutrition.prot += prot;
        this.data.nutrition.carb += carb;
        this.data.nutrition.sugar += sugar;

        this.saveData();
        this.renderStats();
        document.getElementById('entry-form').reset();
    },

    clearDaily() {
        if(confirm('Reset all nutrition data for today?')) {
            this.data.nutrition = { cal: 0, prot: 0, carb: 0, sugar: 0 };
            this.saveData();
            this.renderStats();
        }
    },

    saveGoals(e) {
        e.preventDefault();
        // Security Check
        if(payments.getTier() === 'FREE') {
            alert('Please upgrade to Pro to save goals.');
            return;
        }

        this.data.goals.cal = document.getElementById('target-cal').value;
        this.data.goals.prot = document.getElementById('target-prot').value;
        this.saveData();
        this.renderStats(); // Re-render to show progress vs goals
        alert('Goals saved!');
    },

    renderStats() {
        const tier = payments.getTier();
        const n = this.data.nutrition;
        const g = this.data.goals;

        const showGoals = tier !== 'FREE';

        const html = `
            <div class="stat-box">
                <h3>Calories</h3>
                <p class="h1">${n.cal} ${showGoals ? '/ ' + g.cal : ''}</p>
            </div>
            <div class="stat-box">
                <h3>Protein</h3>
                <p class="h1">${n.prot}g ${showGoals ? '/ ' + g.prot + 'g' : ''}</p>
            </div>
            <div class="stat-box">
                <h3>Carbs</h3>
                <p class="h1">${n.carb}g</p>
            </div>
            <div class="stat-box">
                <h3>Sugar</h3>
                <p class="h1">${n.sugar}g</p>
            </div>
        `;
        document.getElementById('stats-display').innerHTML = html;
    },

    renderLocks() {
        const tier = payments.getTier();
        
        // Handle PRO Features (Goals)
        const goalsContent = document.getElementById('goals-content');
        const goalsLock = document.getElementById('goals-locked');
        
        if (tier === 'FREE') {
            goalsContent.classList.add('hidden');
            goalsLock.classList.remove('hidden');
        } else {
            goalsContent.classList.remove('hidden');
            goalsLock.classList.add('hidden');
        }

        // Handle ELITE Features (Workouts)
        const workContent = document.getElementById('workouts-content');
        const workLock = document.getElementById('workouts-locked');
        
        if (tier === 'ELITE') {
            workContent.classList.remove('hidden');
            workLock.classList.add('hidden');
        } else {
            workContent.classList.add('hidden');
            workLock.classList.remove('hidden');
        }
        
        // Re-render stats to toggle goal visibility
        this.renderStats();
    },

    showSection(id) {
        // Hide all sections
        ['tracker', 'goals', 'workouts', 'upgrade'].forEach(s => {
            document.getElementById(`${s}-section`).classList.add('hidden');
        });
        // Show target
        document.getElementById(`${id}-section`).classList.remove('hidden');
    }
};

// Start App when Auth is ready (handled by Auth.js but good to ensure load)
window.addEventListener('load', () => {
    if(localStorage.getItem('fit_user')) {
        app.init();
    }
});
