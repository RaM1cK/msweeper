/* --- Responsive Sizing --- */
function getCSSVar(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val ? parseInt(val) : fallback;
}

function updateCellSize() {
    const isMobile = window.innerWidth <= 600;
    const bodyPad = isMobile ? 16 : 40;
    const bw = getCSSVar('--border-w', 18);
    const availW = window.innerWidth - bodyPad - bw * 2;
    let size = Math.floor(availW / width);
    size = Math.max(14, Math.min(28, size));
    if (height > width) {
        const headerH = getCSSVar('--header-h', 48);
        const bh = getCSSVar('--border-h', 16);
        const availH = window.innerHeight - bodyPad - headerH - bh * 4 - 30;
        const sizeH = Math.floor(availH / height);
        size = Math.min(size, Math.max(14, sizeH));
    }
    rootStyle.setProperty('--cell-size', `${size}px`);
}

/* --- Theme --- */
function setTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-neon', 'theme-forest');
    if (theme !== 'classic') {
        document.body.classList.add(`theme-${theme}`);
    }
    try {
        localStorage.setItem('msweeper_theme', theme);
    } catch {
    }
}

function loadTheme() {
    try {
        const theme = localStorage.getItem('msweeper_theme');
        if (theme && theme !== 'classic') {
            setTheme(theme);
        }
    } catch {
    }
}

/* --- Confetti --- */
let confettiAnim = null;

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffff00',
        '#ff00ff',
        '#00ffff',
        '#ff8800',
        '#88ff00',
        '#ff4488',
        '#44ff88'
    ];
    const pieces = [];

    for (let i = 0; i < 200; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: Math.random() * 3 + 2,
            vx: Math.random() * 3 - 1.5,
            rotation: Math.random() * 360,
            rotSpeed: Math.random() * 10 - 5,
            swing: Math.random() * 2 - 1,
            swingSpeed: Math.random() * 0.1 + 0.05,
            phase: Math.random() * Math.PI * 2
        });
    }

    if (confettiAnim) cancelAnimationFrame(confettiAnim);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        for (const p of pieces) {
            if (p.y < canvas.height + 50) {
                active = true;
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.phase) * p.swing;
                p.phase += p.swingSpeed;
                p.rotation += p.rotSpeed;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.globalAlpha = Math.min(1, (canvas.height + 50 - p.y) / 150);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 4;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
        }
        if (active) {
            confettiAnim = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiAnim = null;
        }
    }

    draw();

    setTimeout(() => {
        if (confettiAnim) {
            cancelAnimationFrame(confettiAnim);
            confettiAnim = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, 8000);
}

/* --- Flash / Shake Effects --- */
function triggerExplosion() {
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 200);

    gameFrame.classList.add('shake');
    setTimeout(() => gameFrame.classList.remove('shake'), 400);

    let delay = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y] && grid[y][x];
            if (cell && cell.isMine) {
                const el = cellElements[y] && cellElements[y][x];
                if (el) {
                    setTimeout(() => el.classList.add('explode'), delay);
                    delay += 20;
                }
            }
        }
    }
}

/* --- Resize --- */
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (width && height) updateCellSize();
    }, 200);
});
