// Matrix Game State
let matrix = {
    size: 3,
    sequence: [],
    playerSequence: [],
    isDisplaying: false,
    score: 0,
    level: 1,
    roundsPerSize: 3,
    canClick: false
};

function initMatrixGame() {
    console.log("Iniciando juego de Matrix...");

    // Read configuration from UI
    const startLevelInput = document.getElementById('matrix-start-level');
    const roundsCfgInput = document.getElementById('matrix-rounds-cfg');

    if (startLevelInput) matrix.level = parseInt(startLevelInput.value) || 1;
    if (roundsCfgInput) matrix.roundsPerSize = parseInt(roundsCfgInput.value) || 3;

    // Calculate size based on level
    matrix.size = calculateMatrixSize(matrix.level, matrix.roundsPerSize);

    matrix.score = 0;
    matrix.sequence = [];
    matrix.isDisplaying = false;
    matrix.canClick = false;

    updateMatrixUI();
    renderMatrix();

    const btn = document.getElementById('matrix-start-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = "INICIAR SECUENCIA";
        btn.onclick = startNextBatch;
        btn.style.opacity = "1";
    }

    // Toggle settings availability
    toggleSettings(true);
}

function calculateMatrixSize(level, rounds) {
    // 3x3 for level 1-3 (if rounds=3), 4x4 for 4-6, etc.
    let extraSize = Math.floor((level - 1) / rounds);
    return Math.min(30, 3 + extraSize);
}

function toggleSettings(enabled) {
    const startLevelInput = document.getElementById('matrix-start-level');
    const roundsCfgInput = document.getElementById('matrix-rounds-cfg');
    if (startLevelInput) startLevelInput.disabled = !enabled;
    if (roundsCfgInput) roundsCfgInput.disabled = !enabled;

    const settingsContainer = document.querySelector('.game-settings');
    if (settingsContainer) {
        settingsContainer.style.opacity = enabled ? "1" : "0.5";
        settingsContainer.style.pointerEvents = enabled ? "auto" : "none";
    }
}

function updateMatrixUI() {
    const levelEl = document.getElementById('matrix-level');
    const scoreEl = document.getElementById('matrix-score');
    if (levelEl) levelEl.innerText = `${matrix.level} (${matrix.size}x${matrix.size})`;
    if (scoreEl) scoreEl.innerText = matrix.score;
}

function renderMatrix() {
    const board = document.getElementById('matrix-board');
    if (!board) return;
    board.innerHTML = '';

    const containerWidth = Math.min(window.innerWidth - 60, 600);
    const cellSize = Math.floor((containerWidth - (matrix.size * 8)) / matrix.size);

    board.style.gridTemplateColumns = `repeat(${matrix.size}, 1fr)`;
    board.style.width = `${containerWidth}px`;
    board.style.margin = "0 auto";

    for (let i = 0; i < matrix.size * matrix.size; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.id = `cell-${i}`;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.onclick = () => handleCellClick(i);
        board.appendChild(cell);
    }
}

function startNextBatch() {
    if (matrix.isDisplaying) return;

    // Lock settings when game starts
    toggleSettings(false);

    matrix.playerSequence = [];
    matrix.canClick = false;

    const totalCells = matrix.size * matrix.size;
    matrix.sequence.push(Math.floor(Math.random() * totalCells));

    playSequence();
}

async function playSequence() {
    matrix.isDisplaying = true;
    const btn = document.getElementById('matrix-start-btn');

    if (btn) {
        btn.disabled = true;
        btn.innerText = "OBSERVA...";
        btn.style.opacity = "0.5";
    }

    await new Promise(r => setTimeout(r, 800));

    for (const cellId of matrix.sequence) {
        const cell = document.getElementById(`cell-${cellId}`);
        if (cell) {
            cell.classList.add('active');
            await new Promise(r => setTimeout(r, 600));
            cell.classList.remove('active');
            await new Promise(r => setTimeout(r, 200));
        }
    }

    matrix.isDisplaying = false;
    matrix.canClick = true;

    if (btn) {
        btn.innerText = "TU TURNO";
        btn.style.opacity = "1";
    }
}

function handleCellClick(index) {
    if (matrix.isDisplaying || !matrix.canClick || matrix.sequence.length === 0) return;

    const cell = document.getElementById(`cell-${index}`);
    if (!cell) return;

    matrix.playerSequence.push(index);
    cell.classList.add('active');
    setTimeout(() => cell.classList.remove('active'), 200);

    const step = matrix.playerSequence.length - 1;

    if (matrix.playerSequence[step] !== matrix.sequence[step]) {
        gameOver();
        return;
    }

    if (matrix.playerSequence.length === matrix.sequence.length) {
        matrix.score += matrix.level * 10;
        matrix.level++;
        matrix.canClick = false;

        // Apply new level and size logic
        const newSize = calculateMatrixSize(matrix.level, matrix.roundsPerSize);
        if (newSize !== matrix.size) {
            matrix.size = newSize;
            renderMatrix();
        }

        updateMatrixUI();
        if (typeof markDayComplete === 'function') markDayComplete();

        setTimeout(() => {
            showNotification(`¡Nivel ${matrix.level} alcanzado!`);
            startNextBatch();
        }, 800);
    }
}

function gameOver() {
    matrix.canClick = false;
    showNotification('SECUENCIA FALLIDA');

    const board = document.getElementById('matrix-board');
    if (board) {
        board.classList.add('shake');
        setTimeout(() => board.classList.remove('shake'), 500);
    }

    setTimeout(() => {
        initMatrixGame();
    }, 1000);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('matrix-board')) {
        initMatrixGame();

        // Listeners for real-time preview of settings
        const startLevelInput = document.getElementById('matrix-start-level');
        const roundsCfgInput = document.getElementById('matrix-rounds-cfg');

        if (startLevelInput) {
            startLevelInput.onchange = () => {
                if (!matrix.isDisplaying && matrix.sequence.length === 0) {
                    initMatrixGame();
                }
            };
        }
        if (roundsCfgInput) {
            roundsCfgInput.onchange = () => {
                if (!matrix.isDisplaying && matrix.sequence.length === 0) {
                    initMatrixGame();
                }
            };
        }
    }
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    if (document.getElementById('matrix-board') && !matrix.sequence.length) {
        initMatrixGame();
    }
}
