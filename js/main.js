const app = {
    init: () => {
        app.loadTheme();
        // app.updateStreak();
    },

    loadTheme: () => {
        const bg = localStorage.getItem('theme-bg');
        const accent = localStorage.getItem('theme-accent');
        const text = localStorage.getItem('theme-text');

        if (bg) document.documentElement.style.setProperty('--bg-dark', bg);
        if (accent) {
            document.documentElement.style.setProperty('--accent-green', accent);
            document.documentElement.style.setProperty('--accent-green-glow', `${accent}4d`);
        }
        if (text) document.documentElement.style.setProperty('--text-primary', text);
    },

    updateStreak: () => {
        const streak = localStorage.getItem('neuroStreak') || 0;
        const el = document.getElementById('global-streak');
        if (el) el.innerText = `${streak}`;
    }
};

document.addEventListener('DOMContentLoaded', app.init);

// Shared logic for completing a day
function markDayComplete() {
    const today = new Date().toISOString().split('T')[0];
    let completed = JSON.parse(localStorage.getItem('neuroCompletedDays') || '[]');

    if (!completed.includes(today)) {
        completed.push(today);
        localStorage.setItem('neuroCompletedDays', JSON.stringify(completed));

        // Streak logic commented out for Arcade mode
        // let streak = parseInt(localStorage.getItem('neuroStreak') || 0);
        // streak++;
        // localStorage.setItem('neuroStreak', streak);

        // Update UI
        // const el = document.getElementById('global-streak');
        // if (el) el.innerText = `${streak}`;

        // showNotification("¡Día Completado! 🔥");
    }
}

function showNotification(msg) {
    const n = document.getElementById('notification');
    if (!n) return;
    n.innerText = msg;
    n.classList.remove('hidden');
    n.style.transform = "translateY(0)";
    setTimeout(() => {
        n.style.transform = "translateY(200%)";
        setTimeout(() => n.classList.add('hidden'), 500);
    }, 3000);
}
