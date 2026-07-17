loadTheme();

document.addEventListener('DOMContentLoaded', () => {
    /* --- Dropdown Menu --- */
    document.querySelectorAll('.menu-item').forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (!dropdown) return;

        let closeTimer;

        function openDropdown() {
            clearTimeout(closeTimer);
            closeAllModals();
            document.querySelectorAll('.menu-item.active-dropdown').forEach(el => {
                if (el !== item) el.classList.remove('active-dropdown');
            });
            item.classList.add('active-dropdown');
        }

        function scheduleClose() {
            closeTimer = setTimeout(() => {
                if (!item.matches(':hover') && !dropdown.matches(':hover')) {
                    item.classList.remove('active-dropdown');
                }
            }, 150);
        }

        item.addEventListener('mouseenter', openDropdown);
        item.addEventListener('mouseleave', scheduleClose);

        dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
        dropdown.addEventListener('mouseleave', scheduleClose);
    });

    /* --- Init Game --- */
    initGame(16, 16, 40);
});
