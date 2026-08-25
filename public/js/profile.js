// =========================================================================
// CORE 391 - Профиль / Табы кабинета
// =========================================================================

document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    if (!navButtons.length) return;

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Ищем саму кнопку, даже если кликнули по иконке/тексту внутри неё
            const btn = e.target.closest('.nav-btn[data-tab]');
            if (!btn) return;

            const targetTab = btn.getAttribute('data-tab');

            // 1. Убираем активный класс у всех кнопок
            navButtons.forEach(b => b.classList.remove('active'));
            // 2. Скрываем все вкладки
            tabContents.forEach(tab => tab.classList.remove('active'));

            // 3. Активируем нужную кнопку и вкладку
            btn.classList.add('active');
            const activeTab = document.getElementById(targetTab);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });
});