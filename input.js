/* --- Desktop Mouse Events --- */
boardEl.addEventListener('mousedown', e => {
    if (e.button !== 0 && e.button !== 2) return;
    if (gameOver) return;

    if (e.button === 0) isLeftMouseDown = true;

    const cellEl = e.target.closest('.cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x), y = parseInt(cellEl.dataset.y);
    const cell = grid[y][x];

    if (e.button === 0) {
        if (!cell.isOpened && !cell.isFlagged) {
            setFace('stressed');
            cellEl.setAttribute('data-state', 'pressed');
        } else if (cell.isOpened && cell.minesNear > 0) {
            if (isValidChord(x, y) && hasUnopenedUnflaggedNeighbors(x, y)) {
                setFace('stressed');
            }
            highlightChord(x, y);
        }
    } else if (e.button === 2) {
        toggleFlag(x, y);
    }
});

boardEl.addEventListener('mouseover', e => {
    if (!isLeftMouseDown || gameOver) return;
    const cellEl = e.target.closest('.cell');
    if (cellEl) {
        const x = parseInt(cellEl.dataset.x), y = parseInt(cellEl.dataset.y);
        const cell = grid[y][x];

        if (!cell.isOpened && !cell.isFlagged) {
            setFace('stressed');
            cellEl.setAttribute('data-state', 'pressed');
        } else if (cell.isOpened && cell.minesNear > 0) {
            if (isValidChord(x, y) && hasUnopenedUnflaggedNeighbors(x, y)) {
                setFace('stressed');
            } else {
                setFace('unpressed');
            }
            highlightChord(x, y);
        } else {
            setFace('unpressed');
        }
    }
});

boardEl.addEventListener('mouseout', e => {
    if (!isLeftMouseDown || gameOver) return;
    const cellEl = e.target.closest('.cell');
    if (cellEl) {
        const x = parseInt(cellEl.dataset.x), y = parseInt(cellEl.dataset.y);
        const cell = grid[y][x];

        if (!cell.isOpened && !cell.isFlagged) {
            cellEl.removeAttribute('data-state');
        } else if (cell.isOpened && cell.minesNear > 0) {
            clearChordHighlight();
        }
        setFace('unpressed');
    }
});

boardEl.addEventListener('mouseup', e => {
    if (gameOver) return;

    if (e.button === 0 && !isLeftMouseDown) return;

    const cellEl = e.target.closest('.cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x), y = parseInt(cellEl.dataset.y);
    const cell = grid[y][x];

    if (e.button === 0) {
        if (cellEl.getAttribute('data-state') === 'pressed') {
            cellEl.removeAttribute('data-state');
        }
        clearChordHighlight();

        if (!cell.isOpened) {
            openCell(x, y);
        } else {
            executeChord(x, y);
        }
    }

    if (!gameOver) setFace('unpressed');
});

document.addEventListener('mouseup', e => {
    if (e.button === 0) {
        if (isFacePressed) {
            isFacePressed = false;
            if (e.target === faceEl) {
                initGame(width, height, totalMines);
                return;
            } else {
                if (!gameOver) setFace('unpressed');
                else setFace(openedCells === width * height - totalMines ? 'win' : 'lose');
            }
        }

        isLeftMouseDown = false;
        clearChordHighlight();
        if (!gameOver && faceEl.getAttribute('data-state') === 'stressed') {
            setFace('unpressed');
        }
    }
});

boardEl.addEventListener('contextmenu', e => e.preventDefault());

/* --- Keyboard Shortcuts --- */
document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            initGame(width, height, totalMines);
        }
    }
    if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const hovered = getHoveredCell();
            if (hovered) {
                const x = parseInt(hovered.dataset.x), y = parseInt(hovered.dataset.y);
                toggleFlag(x, y);
            }
        }
    }
});

/* --- Mobile Touch Events --- */
boardEl.addEventListener('touchstart', e => {
    if (e.touches.length > 1 || gameOver) return;
    const cellEl = e.target.closest('.cell');
    if (!cellEl) return;

    touchMoved = false;
    touchTarget = cellEl;
    const x = parseInt(cellEl.dataset.x), y = parseInt(cellEl.dataset.y);
    const cell = grid[y][x];

    if (!cell.isOpened && !cell.isFlagged) {
        setFace('stressed');
        cellEl.setAttribute('data-state', 'pressed');
    } else if (cell.isOpened && cell.minesNear > 0) {
        if (isValidChord(x, y) && hasUnopenedUnflaggedNeighbors(x, y)) {
            setFace('stressed');
        }
        highlightChord(x, y);
    }

    touchTimer = setTimeout(() => {
        touchTimer = null;
        if (!touchMoved) {
            if (navigator.vibrate) navigator.vibrate(50);

            if (!cell.isOpened) {
                if (touchTarget && touchTarget.getAttribute('data-state') === 'pressed') {
                    touchTarget.removeAttribute('data-state');
                }
                openCell(x, y);
                if (!gameOver) setFace('unpressed');
            }
        }
    }, 400);
}, {passive: false});

boardEl.addEventListener('touchmove', e => {
    touchMoved = true;
    if (touchTarget && touchTarget.getAttribute('data-state') === 'pressed') {
        touchTarget.removeAttribute('data-state');
    }
    if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
        setFace('unpressed');
        clearChordHighlight();
    }
}, {passive: true});

boardEl.addEventListener('touchend', e => {
    if (gameOver || !touchTarget) return;

    const performedAction = touchTimer && !touchMoved;

    if (performedAction) e.preventDefault();

    if (touchTarget.getAttribute('data-state') === 'pressed') {
        touchTarget.removeAttribute('data-state');
    }
    clearChordHighlight();

    if (touchTimer && !touchMoved) {
        clearTimeout(touchTimer); touchTimer = null;

        const x = parseInt(touchTarget.dataset.x), y = parseInt(touchTarget.dataset.y);
        const cell = grid[y][x];

        if (!cell.isOpened) {
            toggleFlag(x, y);
        } else if (cell.minesNear > 0) {
            executeChord(x, y);
        }
    }

    if (!gameOver) setFace('unpressed');
    touchTarget = null;
}, {passive: false});
