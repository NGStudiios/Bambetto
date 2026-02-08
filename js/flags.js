/**
 * Flags Game Logic
 * MODIFIED: No labels in choice mode, fixed hangman, improved map UI.
 */

let flagGame = {
    currentMode: 'choice', // choice, hangman, write, map
    currentCountry: null,
    score: 0,
    attempts: 0,
    hangmanWord: [],
    hangmanHidden: []
};

function initFlagsGame() {
    setFlagMode('choice');
}

function setFlagMode(mode) {
    flagGame.currentMode = mode;
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(b => {
        const btnMode = b.getAttribute('onclick').match(/'([^']+)'/)[1];
        b.classList.toggle('active', btnMode === mode);
    });
    nextFlagQuestion();
}

function nextFlagQuestion() {
    flagGame.currentCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
    renderFlagGame();
}

function renderFlagGame() {
    const container = document.getElementById('flag-game-content');
    container.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'game-center';

    if (flagGame.currentMode === 'choice') {
        content.innerHTML = `<h3>¿Qué bandera pertenece a <b>${flagGame.currentCountry.name}</b>?</h3><p style="color: var(--text-secondary); margin-bottom: 20px;">Selecciona la imagen correcta</p>`;
        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'options-grid';
        optionsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';

        const options = getRandomOptions(flagGame.currentCountry);
        options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'flag-option glass';
            btn.innerHTML = `<img src="https://flagcdn.com/w320/${opt.code}.png" class="flag-img-only">`;
            btn.onclick = () => checkFlagAnswer(opt === flagGame.currentCountry, btn);
            optionsGrid.appendChild(btn);
        });
        content.appendChild(optionsGrid);
    }
    else if (flagGame.currentMode === 'hangman') {
        content.innerHTML = `
            <h3>MODO AHORCADO</h3>
            <img src="https://flagcdn.com/w320/${flagGame.currentCountry.code}.png" class="flag-image" style="max-height: 150px; margin-bottom: 20px;">
            <div class="hangman-display" id="hangman-word"></div>
            <div class="keyboard" id="keyboard"></div>
        `;
        // Ensure UI is updated before init
        setTimeout(initHangman, 50);
    }
    else if (flagGame.currentMode === 'write') {
        content.innerHTML = `
            <h3>ESCRIBE EL PAÍS</h3>
            <img src="https://flagcdn.com/w320/${flagGame.currentCountry.code}.png" class="flag-image" style="max-height: 200px; margin-bottom: 30px;">
            <div class="input-group">
                <input type="text" id="flag-input" placeholder="Nombre completo en español..." autocomplete="off">
                <button onclick="checkWriteAnswer()" class="primary-btn">Enviar</button>
            </div>
        `;
        document.getElementById('flag-input')?.focus();
    }
    else if (flagGame.currentMode === 'map') {
        content.innerHTML = `
            <h3>ADIVINA EL PAÍS OCULTO</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">Basado en proximidad geográfica</p>
            <div class="input-group">
                <input type="text" id="map-input" placeholder="Ingresa un país..." list="countries-list">
                <datalist id="countries-list">
                    ${countriesData.map(c => `<option value="${c.name}">`).join('')}
                </datalist>
                <button onclick="checkMapAnswer()" class="primary-btn">Intentar</button>
            </div>
            <div id="map-feedback" class="map-feedback" style="width: 100%; max-width: 500px; max-height: 300px; overflow-y: auto; padding-right: 10px;"></div>
        `;
    }

    container.appendChild(content);
}

function getRandomOptions(correct) {
    let opts = [correct];
    while (opts.length < 4) {
        let rand = countriesData[Math.floor(Math.random() * countriesData.length)];
        if (!opts.find(o => o.code === rand.code)) opts.push(rand);
    }
    return opts.sort(() => Math.random() - 0.5);
}

function checkFlagAnswer(isCorrect, element) {
    if (isCorrect) {
        element.style.borderColor = 'var(--accent-teal)';
        showNotification('¡Correcto! 🚩');
        markDayComplete();
        setTimeout(nextFlagQuestion, 800);
    } else {
        element.style.borderColor = '#ef4444';
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }
}

// Hangman Logic
function initHangman() {
    const word = flagGame.currentCountry.name.toUpperCase();
    flagGame.hangmanWord = word.split('');
    // Handle spaces and accents for display
    flagGame.hangmanHidden = word.split('').map(char => {
        if (char === ' ') return ' ';
        if (char === '-') return '-';
        return '_';
    });

    updateHangmanUI();

    const kb = document.getElementById('keyboard');
    if (!kb) return;
    kb.innerHTML = '';

    'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.innerText = letter;
        btn.onclick = () => guessLetter(letter, btn);
        kb.appendChild(btn);
    });
}

function updateHangmanUI() {
    const display = document.getElementById('hangman-word');
    if (display) display.innerText = flagGame.hangmanHidden.join(' ');
}

function guessLetter(l, btn) {
    btn.disabled = true;
    let found = false;

    // Simple accent normalization for comparison
    const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const goalLetter = normalize(l);

    flagGame.hangmanWord.forEach((char, i) => {
        if (normalize(char) === goalLetter) {
            flagGame.hangmanHidden[i] = char;
            found = true;
        }
    });

    if (found) {
        btn.style.background = 'var(--accent-teal)';
        btn.style.borderColor = 'var(--accent-teal)';
        updateHangmanUI();
        if (!flagGame.hangmanHidden.includes('_')) {
            showNotification('¡Excelente! Sabes de países.');
            markDayComplete();
            setTimeout(nextFlagQuestion, 1500);
        }
    } else {
        btn.style.background = '#ef4444';
        btn.style.borderColor = '#ef4444';
    }
}

// Write Logic
function checkWriteAnswer() {
    const input = document.getElementById('flag-input');
    const val = input.value.trim().toLowerCase();
    const correct = flagGame.currentCountry.name.toLowerCase();

    // Normalize for comparison but be strict about Spanish spelling if possible
    if (val === correct) {
        showNotification('¡Exacto! +10 puntos');
        markDayComplete();
        setTimeout(nextFlagQuestion, 1000);
    } else {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
}

// Map Proximity Logic
function checkMapAnswer() {
    const input = document.getElementById('map-input');
    const guessName = input.value.trim();
    const guess = countriesData.find(c => c.name.toLowerCase() === guessName.toLowerCase());

    if (!guess) {
        showNotification('Ese país no está en nuestra lista');
        return;
    }

    const dist = calculateDistance(guess.lat, guess.lon, flagGame.currentCountry.lat, flagGame.currentCountry.lon);
    const feedback = document.getElementById('map-feedback');

    const div = document.createElement('div');
    div.className = 'proximity-indicator glass';
    div.style.padding = '15px';
    div.style.marginBottom = '10px';
    div.style.borderLeft = '6px solid';

    let color = '#7f1d1d'; // Very far
    if (dist === 0) color = '#10b981';
    else if (dist < 1500) color = '#4ade80';
    else if (dist < 3500) color = '#facc15';
    else if (dist < 6000) color = '#f97316';

    div.style.borderColor = color;
    div.innerHTML = `
        <div style="text-align: left;">
            <b style="color: white; display: block;">${guess.name}</b>
            <span style="font-size: 0.8rem; color: #94a3b8;">${getHint(dist)}</span>
        </div>
        <span style="font-weight: bold; color: ${color}">${Math.round(dist)} km</span>
    `;
    feedback.prepend(div);
    input.value = '';

    if (dist === 0) {
        showNotification('¡ENCONTRADO!');
        markDayComplete();
        setTimeout(nextFlagQuestion, 2000);
    }
}

function getHint(dist) {
    if (dist === 0) return "¡Exacto!";
    if (dist < 1500) return "¡Muy cerca!";
    if (dist < 3500) return "En la región...";
    if (dist < 6000) return "Bastante lejos";
    return "En la otra punta del mundo";
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
