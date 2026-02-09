/**
 * Capitals Game Logic
 * Guess the capital of a given country.
 */

let capitalGame = {
    score: 0,
    currentCountry: null
};

function initCapitalsGame() {
    capitalGame.score = 0;
    nextCapitalQuestion();
}

function nextCapitalQuestion() {
    capitalGame.currentCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
    renderCapitalGame();
}

function renderCapitalGame() {
    const container = document.getElementById('capital-game-content');
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'game-card glass game-center-card';

    // Randomly decide whether to show flag or country name
    const showFlag = Math.random() > 0.5;

    card.innerHTML = `
        <h3>¿Cuál es la capital de?</h3>
        ${showFlag ? `<img src="https://flagcdn.com/w320/${capitalGame.currentCountry.code}.png" class="flag-image">` : ''}
        <h2 class="country-display">${capitalGame.currentCountry.name}</h2>
        <div class="options-grid" id="capital-options"></div>
    `;

    const optionsGrid = card.querySelector('#capital-options');
    const options = getCapitalOptions(capitalGame.currentCountry.capital);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkCapitalAnswer(opt === capitalGame.currentCountry.capital, btn);
        optionsGrid.appendChild(btn);
    });

    container.appendChild(card);
}

function getCapitalOptions(correct) {
    let opts = [correct];
    while (opts.length < 4) {
        let rand = countriesData[Math.floor(Math.random() * countriesData.length)].capital;
        if (!opts.includes(rand)) opts.push(rand);
    }
    return opts.sort(() => Math.random() - 0.5);
}

function checkCapitalAnswer(isCorrect, btn) {
    if (isCorrect) {
        btn.classList.add('correct');
        capitalGame.score++;
        document.getElementById('capitals-score').innerText = capitalGame.score;
        showNotification('¡Correcto! 🏛️');
        markDayComplete();
        setTimeout(nextCapitalQuestion, 1000);
    } else {
        btn.classList.add('wrong');
        btn.classList.add('shake');
    }
}
