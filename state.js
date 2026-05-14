let width, height, totalMines;
let grid = [];
let cellElements = [];
let gameStarted = false, gameOver = false;
let flagsPlaced = 0, openedCells = 0;
let startTime = 0, gameTimerInterval = null, currentTime = 0;
let gameResult = null;
let cellsRevealedInOneClick = 0;
let noFlagsUsed = true;

let touchTimer = null, touchMoved = false, touchTarget = null;
let isLeftMouseDown = false;
let isFacePressed = false;
let activeChordCenter = null;

const boardEl = document.getElementById('board');
const faceEl = document.getElementById('face');
const rootStyle = document.documentElement.style;
const appContainer = document.getElementById('app-container');
const gameFrame = document.getElementById('game-frame');

const DIFFICULTY_KEY = {
    '9,9,10': 'beginner',
    '16,16,40': 'intermediate',
    '30,16,99': 'expert'
};

const ACHIEVEMENTS = [
    { id: 'first_steps', name: 'First Steps', desc: 'Open your first cell', icon: '👣' },
    { id: 'first_win', name: 'First Victory', desc: 'Win your first game', icon: '🏆' },
    { id: 'beginner', name: 'Beginner', desc: 'Win a Beginner game (9x9)', icon: '🌱' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Win an Intermediate game (16x16)', icon: '⚡' },
    { id: 'expert', name: 'Expert', desc: 'Win an Expert game (30x16)', icon: '💀' },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Win Beginner in under 10 seconds', icon: '🔥' },
    { id: 'speed_runner', name: 'Speed Runner', desc: 'Win Intermediate in under 30 seconds', icon: '⏱️' },
    { id: 'no_flags', name: 'Bare Hands', desc: 'Win a game without placing any flags', icon: '✋' },
    { id: 'flag_master', name: 'Flag Master', desc: 'Win with all mines correctly flagged', icon: '🚩' },
    { id: 'mass_reveal', name: 'Chain Reaction', desc: 'Open 50+ cells in a single click', icon: '💥' },
    { id: 'streak_5', name: 'On Fire', desc: 'Win 5 games in a row', icon: '🎯' },
    { id: 'century', name: 'Century', desc: 'Play 100 games total', icon: '💯' },
];

function getDifficultyKey(w, h, m) {
    const k = `${w},${h},${m}`;
    return DIFFICULTY_KEY[k] || `custom_${k}`;
}
