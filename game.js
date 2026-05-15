/* --- Game Initialization --- */
function initGame(w, h, m) {
    if (confettiAnim) {
        cancelAnimationFrame(confettiAnim);
        confettiAnim = null;
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    document.getElementById('flash-overlay').classList.remove('active');
    gameFrame.classList.remove('shake');
    document.getElementById('resultModal').style.display = 'none';
    document.getElementById('achModal').style.display = 'none';

    width = w;
    height = h;
    totalMines = m;
    rootStyle.setProperty('--col-count', width);
    rootStyle.setProperty('--row-count', height);
    updateCellSize();

    gameStarted = false;
    gameOver = false;
    isLeftMouseDown = false;
    isFacePressed = false;
    activeChordCenter = null;
    flagsPlaced = 0;
    openedCells = 0;
    currentTime = 0;
    gameResult = null;
    cellsRevealedInOneClick = 0;
    noFlagsUsed = true;
    clearInterval(gameTimerInterval);
    updateDigits(totalMines, 'mines-counter');
    updateDigits(0, 'time-counter');
    setFace('unpressed');

    boardEl.innerHTML = '';
    grid = [];
    cellElements = [];

    for (let y = 0; y < height; y++) {
        grid[y] = [];
        cellElements[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = {
                isMine: false,
                isOpened: false,
                isFlagged: false,
                minesNear: 0,
                deathMine: false,
                falseFlag: false
            };
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            boardEl.appendChild(cell);
            cellElements[y][x] = cell;
        }
    }
}

function generateMines(firstX, firstY) {
    let placed = 0;
    while (placed < totalMines) {
        let rx = Math.floor(Math.random() * width);
        let ry = Math.floor(Math.random() * height);
        if (!grid[ry][rx].isMine && (rx !== firstX || ry !== firstY)) {
            grid[ry][rx].isMine = true;
            placed++;
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[y][x].isMine) continue;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    let nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx].isMine) count++;
                }
            }
            grid[y][x].minesNear = count;
        }
    }
    gameStarted = true;
    startTime = Date.now();
    gameTimerInterval = setInterval(() => {
        if (!gameOver) {
            currentTime = Math.floor((Date.now() - startTime) / 1000);
            updateDigits(currentTime, 'time-counter');
        }
    }, 1000);
}

function unfold(startX, startY) {
    cellsRevealedInOneClick = 0;
    const queue = [[startX, startY]];
    const inQueue = Array.from({length: height}, () => new Uint8Array(width));
    inQueue[startY][startX] = 1;

    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const cell = grid[cy][cx];

        if (!cell.isOpened && !cell.isFlagged) {
            cell.isOpened = true;
            openedCells++;
            cellsRevealedInOneClick++;
            updateCellView(cx, cy);

            if (cell.minesNear === 0) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        let nx = cx + dx, ny = cy + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            let nCell = grid[ny][nx];
                            if (!nCell.isOpened && !nCell.isFlagged && inQueue[ny][nx] === 0) {
                                inQueue[ny][nx] = 1;
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
            }
        }
    }
}

function openCell(x, y) {
    if (gameOver) return;
    const cell = grid[y][x];
    if (cell.isOpened || cell.isFlagged) return;

    if (!gameStarted) {
        generateMines(x, y);
        tryUnlockAndNotify('first_steps');
    }

    if (cell.isMine) {
        cell.deathMine = true;
        processGameOver(false);
    } else {
        if (cell.minesNear === 0) {
            cellsRevealedInOneClick = 0;
            unfold(x, y);
        }
        else {
            cellsRevealedInOneClick = 1;
            cell.isOpened = true;
            openedCells++;
            updateCellView(x, y);
        }
        if (openedCells === (width * height) - totalMines) processGameOver(true);
    }
}

function toggleFlag(x, y) {
    if (gameOver) return;
    const cell = grid[y][x];
    if (cell.isOpened) return;

    if (!cell.isFlagged && flagsPlaced < totalMines) {
        cell.isFlagged = true;
        flagsPlaced++;
        noFlagsUsed = false;
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsPlaced--;
    }

    updateDigits(totalMines - flagsPlaced, 'mines-counter');
    updateCellView(x, y);
}

/* --- Chording --- */
function isValidChord(x, y) {
    const cell = grid[y][x];
    if (!cell.isOpened || cell.minesNear === 0) return false;

    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (grid[ny][nx].isFlagged) flagCount++;
            }
        }
    }
    return flagCount === cell.minesNear;
}

function hasUnopenedUnflaggedNeighbors(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (!grid[ny][nx].isOpened && !grid[ny][nx].isFlagged) return true;
            }
        }
    }
    return false;
}

function highlightChord(x, y) {
    clearChordHighlight();
    if (gameOver) return;
    activeChordCenter = {x, y};
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                let nCell = grid[ny][nx];
                if (!nCell.isOpened && !nCell.isFlagged) {
                    cellElements[ny][nx].setAttribute('data-state', 'pressed');
                }
            }
        }
    }
}

function clearChordHighlight() {
    if (!activeChordCenter) return;
    const {x, y} = activeChordCenter;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                let nCell = grid[ny][nx];
                if (!nCell.isOpened && !nCell.isFlagged) {
                    cellElements[ny][nx].removeAttribute('data-state');
                }
            }
        }
    }
    activeChordCenter = null;
}

function executeChord(x, y) {
    if (gameOver) return;
    if (!isValidChord(x, y)) return;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                let nCell = grid[ny][nx];
                if (!nCell.isOpened && !nCell.isFlagged) {
                    openCell(nx, ny);
                }
            }
        }
    }
}

/* --- Game Over --- */
function processGameOver(isWin) {
    gameOver = true;
    gameResult = isWin ? 'win' : 'lose';
    clearInterval(gameTimerInterval);
    setFace(isWin ? 'win' : 'lose');

    const finalTime = currentTime;
    const diffKey = getDifficultyKey(width, height, totalMines);
    recordGame(diffKey, isWin, finalTime);
    checkAchievements(isWin, finalTime);

    if (isWin) {
        setTimeout(startConfetti, 100);
        setTimeout(() => gameFrame.classList.add('win-glow'), 200);
        setTimeout(() => gameFrame.classList.remove('win-glow'), 5000);
    } else {
        triggerExplosion();
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let c = grid[y][x];
            if (isWin) {
                if (c.isMine && !c.isFlagged) {
                    c.isFlagged = true;
                    updateCellView(x, y);
                }
            } else {
                if (c.isMine && !c.isFlagged) {
                    c.isOpened = true;
                    updateCellView(x, y);
                } else if (!c.isMine && c.isFlagged) {
                    c.falseFlag = true;
                    updateCellView(x, y);
                }
            }
        }
    }
    if (isWin) updateDigits(0, 'mines-counter');

    setTimeout(() => showGameSummary(isWin, finalTime), isWin ? 1200 : 800);
}

function updateCellView(x, y) {
    const cell = grid[y][x];
    const el = cellElements[y][x];
    if (!cell.isOpened) {
        if (cell.isFlagged) el.setAttribute('data-state', gameOver && cell.falseFlag ? 'flag-wrong' : 'flag');
        else el.removeAttribute('data-state');
    } else {
        if (cell.isMine) el.setAttribute('data-state', cell.deathMine ? 'mine-wrong' : 'mine');
        else el.setAttribute('data-state', cell.minesNear.toString());
    }
}
