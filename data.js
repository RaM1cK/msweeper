/* --- Stats --- */
function loadStats() {
    try {
        const raw = localStorage.getItem('msweeper_stats');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem('msweeper_stats', JSON.stringify(stats));
    } catch {
    }
}

function ensureStatsEntry(stats, key) {
    if (!stats[key]) {
        stats[key] = {played: 0, won: 0, bestTime: null, currentStreak: 0, bestStreak: 0};
    }
    return stats[key];
}

function recordGame(diffKey, won, time) {
    const stats = loadStats();
    const entry = ensureStatsEntry(stats, diffKey);
    entry.played++;
    if (won) {
        entry.won++;
        entry.currentStreak = (entry.currentStreak || 0) + 1;
        if (entry.currentStreak > (entry.bestStreak || 0)) entry.bestStreak = entry.currentStreak;
        if (entry.bestTime === null || time < entry.bestTime) entry.bestTime = time;
    } else {
        entry.currentStreak = 0;
    }

    const overall = ensureStatsEntry(stats, '_overall');
    overall.played = (overall.played || 0) + 1;
    if (won) overall.won = (overall.won || 0) + 1;
    if (won) {
        overall.currentStreak = (overall.currentStreak || 0) + 1;
        if (overall.currentStreak > (overall.bestStreak || 0)) overall.bestStreak = overall.currentStreak;
    } else {
        overall.currentStreak = 0;
    }

    saveStats(stats);
}

/* --- Achievements --- */
function loadAchievements() {
    try {
        const raw = localStorage.getItem('msweeper_achievements');
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveAchievements(achs) {
    try {
        localStorage.setItem('msweeper_achievements', JSON.stringify(achs));
    } catch {}
}

function isAchievementUnlocked(id) {
    const achs = loadAchievements();
    return !!achs[id];
}

function unlockAchievement(id) {
    if (isAchievementUnlocked(id)) return false;
    const achs = loadAchievements();
    achs[id] = Date.now();
    saveAchievements(achs);
    return true;
}

function showAchievementNotification(achievement) {
    const toast = document.getElementById('ach-toast');
    toast.querySelector('.ach-toast-icon').textContent = achievement.icon;
    toast.querySelector('.ach-toast-name').textContent = achievement.name;
    toast.querySelector('.ach-toast-desc').textContent = achievement.desc;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function tryUnlockAndNotify(id) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    if (unlockAchievement(id)) {
        setTimeout(() => showAchievementNotification(ach), 600);
    }
}

function checkAchievements(won, time) {
    const stats = loadStats();
    const overall = stats._overall || { played: 0, won: 0, currentStreak: 0 };
    const totalPlayed = overall.played || 0;
    const currentStreak = overall.currentStreak || 0;
    const diffKey = getDifficultyKey(width, height, totalMines);

    if (won) {
        tryUnlockAndNotify('first_win');
        if (diffKey === 'beginner') tryUnlockAndNotify('beginner');
        if (diffKey === 'intermediate') tryUnlockAndNotify('intermediate');
        if (diffKey === 'expert') tryUnlockAndNotify('expert');
        if (diffKey === 'beginner' && time < 10) tryUnlockAndNotify('speed_demon');
        if (diffKey === 'intermediate' && time < 30) tryUnlockAndNotify('speed_runner');
        if (noFlagsUsed) tryUnlockAndNotify('no_flags');
        if (flagsPlaced === totalMines) tryUnlockAndNotify('flag_master');
        if (currentStreak >= 5) tryUnlockAndNotify('streak_5');
    }

    if (cellsRevealedInOneClick >= 50) tryUnlockAndNotify('mass_reveal');
    if (totalPlayed >= 100) tryUnlockAndNotify('century');
}
