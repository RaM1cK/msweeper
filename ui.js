/* --- Modal Helpers --- */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.querySelectorAll('.menu-item.active-dropdown').forEach(el => el.classList.remove('active-dropdown'));
}

/* --- Stats UI --- */
function showStats() {
    closeAllModals();
    const stats = loadStats();
    const diffKey = getDifficultyKey(width, height, totalMines);
    const curr = stats[diffKey] || {played: 0, won: 0, bestTime: null, currentStreak: 0, bestStreak: 0};
    const overall = stats['_overall'] || {played: 0, won: 0, currentStreak: 0, bestStreak: 0};
    const winRate = curr.played > 0 ? Math.round(curr.won / curr.played * 100) : 0;
    const overallWinRate = overall.played > 0 ? Math.round(overall.won / overall.played * 100) : 0;

    const diffLabel = DIFFICULTY_KEY[`${width},${height},${totalMines}`] || 'Custom';

    document.getElementById('statsContent').innerHTML = `
        <div class="stats-grid">
            <div class="stats-card">
                <div class="stat-num">${curr.played}</div>
                <div class="stat-label">${diffLabel} Games</div>
            </div>
            <div class="stats-card">
                <div class="stat-num">${curr.won}</div>
                <div class="stat-label">${diffLabel} Wins</div>
            </div>
            <div class="stats-card">
                <div class="stat-num">${winRate}%</div>
                <div class="stat-label">${diffLabel} Win Rate</div>
            </div>
            <div class="stats-card">
                <div class="stat-num">${curr.bestTime !== null ? curr.bestTime : '--'}</div>
                <div class="stat-label">${diffLabel} Best Time</div>
            </div>
        </div>
        <hr style="border-color: var(--border-dark);">
        <div class="stat-row"><span class="stat-label">Total Games</span><span class="stat-value">${overall.played}</span></div>
        <div class="stat-row"><span class="stat-label">Total Wins</span><span class="stat-value">${overall.won}</span></div>
        <div class="stat-row"><span class="stat-label">Overall Win Rate</span><span class="stat-value">${overallWinRate}%</span></div>
        <div class="stat-row"><span class="stat-label">Current Streak</span><span class="stat-value ${overall.currentStreak > 2 ? 'stat-highlight' : ''}">${overall.currentStreak}</span></div>
        <div class="stat-row"><span class="stat-label">Best Streak</span><span class="stat-value stat-highlight">${overall.bestStreak || 0}</span></div>
    `;
    document.getElementById('statsModal').style.display = 'block';
}

function resetStats() {
    const diffKey = getDifficultyKey(width, height, totalMines);
    const diffLabel = DIFFICULTY_KEY[`${width},${height},${totalMines}`] || 'Custom';
    if (confirm(`Reset statistics for ${diffLabel}?`)) {
        const stats = loadStats();
        delete stats[diffKey];
        saveStats(stats);
        document.getElementById('statsModal').style.display = 'none';
    }
}

/* --- Achievements UI --- */
function showAchievements() {
    closeAllModals();
    const achs = loadAchievements();
    const html = ACHIEVEMENTS.map(a => {
        const unlocked = !!achs[a.id];
        return `<div class="ach-item ${unlocked ? 'ach-unlocked' : 'ach-locked'}">
            <span class="ach-icon">${unlocked ? a.icon : '🔒'}</span>
            <div class="ach-info">
                <div class="ach-name">${a.name}</div>
                <div class="ach-desc">${a.desc}</div>
            </div>
            ${unlocked ? '<span class="ach-check">✓</span>' : ''}
        </div>`;
    }).join('');

    const unlocked = Object.keys(achs).length;
    document.getElementById('achContent').innerHTML = `
        <div style="text-align:center;margin-bottom:10px;font-size:13px;opacity:0.7;">
            ${unlocked} / ${ACHIEVEMENTS.length} unlocked
        </div>
        ${html}
    `;
    document.getElementById('achModal').style.display = 'block';
}

/* --- Help --- */
function showHelp() {
    closeAllModals();
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches;
    const helpContent = document.getElementById('helpContent');

    const basics = isMobile ? `
            <li><b>Long Press:</b> Open a cell.</li>
            <li><b>Short Press:</b> Place or remove a flag.</li>` : `
            <li><b>Left Click:</b> Open a cell.</li>
            <li><b>Right Click or F Key:</b> Place or remove a flag.</li>
            <li><b>R Key:</b> Restart.</li>`;

    helpContent.innerHTML = `
        <ul style="padding-left: 0; list-style-type: none; margin-top: 5px; line-height: 1.6;">
            ${basics}
            <li><b>Press a Number:</b> If the correct amount of flags surround the number, it instantly opens the remaining adjacent cells.</li>
        </ul>
        <h3>UI Navigation</h3>
        <div style="font-size: 12px; line-height: 1.6;">
            <b>Difficulty:</b> Beginner / Intermediate / Expert / Custom<br>
            <b>Themes:</b> Classic / Dark / Neon / Forest<br>
            <b>Statistics:</b> Per-Difficulty win rate / Best time / Win streak<br>
            <b>Achievements:</b> 12 achievements with popup notifications<br>
            <b>Result:</b> Summary is shown at the end of each game<br>
        </div>
    `;
    document.getElementById('helpModal').style.display = 'block';
}

function triggerBlink(element) {
    element.classList.remove('error-blink');
    void element.offsetWidth;
    element.classList.add('error-blink');
}

function openCustomModal() {
    document.getElementById('c_width').classList.remove('error-blink');
    document.getElementById('c_height').classList.remove('error-blink');
    document.getElementById('c_mines').classList.remove('error-blink');
    document.getElementById('customModal').style.display = 'block';
}

function closeCustomModal() {
    document.getElementById('customModal').style.display = 'none';
}

function applyCustom() {
    const widthInput = document.getElementById('c_width');
    const heightInput = document.getElementById('c_height');
    const minesInput = document.getElementById('c_mines');

    let w = parseInt(widthInput.value);
    let h = parseInt(heightInput.value);
    let m = parseInt(minesInput.value);

    if (isNaN(w)) w = 8;
    if (isNaN(h)) h = 8;
    if (isNaN(m)) m = 1;

    let wFixed = Math.max(8, Math.min(64, w));
    let hFixed = Math.max(8, Math.min(64, h));

    let maxM = Math.floor(wFixed * hFixed * 0.25);
    let mFixed = Math.max(1, Math.min(maxM, m));

    let hasError = false;

    if (w !== wFixed) {
        widthInput.value = wFixed;
        triggerBlink(widthInput);
        hasError = true;
    }
    if (h !== hFixed) {
        heightInput.value = hFixed;
        triggerBlink(heightInput);
        hasError = true;
    }
    if (m !== mFixed) {
        minesInput.value = mFixed;
        triggerBlink(minesInput);
        hasError = true;
    }

    if (hasError) return;

    closeCustomModal();
    initGame(wFixed, hFixed, mFixed);
}

/* --- Display Helpers --- */
function updateDigits(value, containerId) {
    const valStr = String(Math.max(0, Math.min(999, value))).padStart(3, '0');
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        let digit = document.createElement('div');
        digit.className = 'digit';
        digit.style.backgroundImage = `url('assets/number_${valStr[i]}.svg')`;
        container.appendChild(digit);
    }
}

function setFace(state) {
    faceEl.setAttribute('data-state', state);
}

/* --- Face Button --- */
faceEl.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isFacePressed = true;
    setFace('pressed');
});

faceEl.addEventListener('mouseenter', () => {
    if (isFacePressed) setFace('pressed');
});

faceEl.addEventListener('mouseleave', () => {
    if (isFacePressed) {
        setFace(gameOver ? (openedCells === width * height - totalMines ? 'win' : 'lose') : 'unpressed');
    }
});

/* --- Game Summary --- */
function showGameSummary(won, time) {
    const totalCells = width * height;
    const diffLabel = DIFFICULTY_KEY[`${width},${height},${totalMines}`] || 'Custom';
    const safeCells = totalCells - totalMines;
    const pct = Math.round(openedCells / safeCells * 100);

    document.getElementById('resultTitle').textContent = won ? 'Victory!' : 'Defeat';
    document.getElementById('resultTitle').className = won ? 'result-win' : 'result-lose';

    document.getElementById('resultContent').innerHTML = `
        <div class="result-grid">
            <div class="result-item result-item-full" style="text-align:center;justify-content:center;border:none;font-size:14px;padding:6px 0;">
                ${won ? 'You cleared the minefield!' : 'You hit a mine!'}
            </div>
            <div class="result-divider"></div>
            <div class="result-item">
                <span class="ri-label">Difficulty</span>
                <span class="ri-value">${diffLabel}</span>
            </div>
            <div class="result-item">
                <span class="ri-label">Time</span>
                <span class="ri-value">${time}s</span>
                </div>
            <div class="result-item">   
                <span class="ri-label">Mines</span>
                <span class="ri-value">${totalMines}</span>
            </div>
            <div class="result-item">
                <span class="ri-label">Flags</span>
                <span class="ri-value">${flagsPlaced} / ${totalMines}</span>
            </div>
            <div class="result-item">
                <span class="ri-label">Opened</span>
                <span class="ri-value">${openedCells} / ${safeCells} (${pct}%)</span>
            </div>
            <div class="result-item">
                <span class="ri-label">Board</span>
                <span class="ri-value">${width}x${height}</span>
            </div>
        </div>
    `;
    document.getElementById('resultModal').style.display = 'block';
}

function getHoveredCell() {
    return boardEl.querySelector('.cell:hover');
}
