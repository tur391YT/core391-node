/**
 * Словарь терминов для поддерживаемых игр
 */
const gameTerms = {
    genshin: { items: "Артефакты", set: "Сет", stats: "Статы", hero: "Персонаж" },
    zzz: { items: "Драйв-диски", set: "Серия", stats: "Характеристики", hero: "Агент" },
    hsr: { items: "Реликвии", set: "Набор", stats: "Параметры", hero: "Персонаж" },
    wuwa: { items: "Эхо", set: "Соната", stats: "Суб-статы", hero: "Резонатор" }
};

/**
 * Функция вставки динамического шаблона в CKEditor
 */
function insertTemplate(type, editorInstance) {
    if (!editorInstance) return;

    // Определяем текущую категорию/игру
    const categorySelect = document.querySelector('select[name="category"]');
    const category = categorySelect ? categorySelect.value : 'genshin';
    
    const t = gameTerms[category] || gameTerms.genshin;
    
    // Заглушка для картинок
    const imgPlaceholder = "https://placehold.jp/24/333333/ffffff/150x150.png?text=IMG";

    let html = '';

    if (type === 'full_guide') {
        html = `
            <div class="wp-section-title">Материалы возвышения</div>
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th>Уровень</th>
                            <th>Ресурсы</th>
                            <th>Валюта</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">80 → 90</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="${imgPlaceholder}" class="wp-avatar-img" alt="Item"> 
                                    <span>x60 Предмет</span>
                                </div>
                            </td>
                            <td>1 000 000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="wp-section-title">Лучшее оружие</div>
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th>Оружие</th>
                            <th>Описание</th>
                            <th>Рекомендация</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">
                                <img src="${imgPlaceholder}" class="wp-avatar-img" alt="Weapon">
                                <div class="wp-stars">★★★★★</div>
                                <div class="wp-item-name">Название</div>
                            </td>
                            <td class="wp-cell-effect">Описание эффектов и бонусов...</td>
                            <td style="padding: 15px; text-align: center; font-weight: bold; color: #ffcc00;">Лучший выбор</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="wp-section-title">Лучшие ${t.items}</div>
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th>${t.set}</th>
                            <th>Бонусы</th>
                            <th>Рекомендация</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">
                                <img src="${imgPlaceholder}" class="wp-avatar-img" alt="Set">
                                <div class="wp-stars">★★★★★</div>
                                <div class="wp-item-name">Название</div>
                            </td>
                            <td class="wp-cell-effect">Описание бонусов набора...</td>
                            <td style="padding: 15px; text-align: center; font-weight: bold;">Основной набор</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="wp-section-title">Рекомендуемые ${t.stats}</div>
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th>Слот</th>
                            <th>Главный стат</th>
                            <th>Доп. ${t.stats}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">Слот 1</td>
                            <td style="padding: 15px;">Атака % / Крит. урон</td>
                            <td style="padding: 15px;">Криты &gt; Скорость &gt; АТК%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="wp-section-title">Лучшие отряды</div>
            <div class="wp-table-wrapper">
                <table class="wp-table-team">
                    <thead>
                        <tr>
                            <th>Состав отряда</th>
                            <th>Синергия и связки</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="wp-team-slots">
                                    <div class="wp-slot">
                                        <div class="wp-slot-role main-dd">Main DD</div>
                                        <img src="${imgPlaceholder}" class="wp-avatar-img" alt="Char">
                                        <span class="wp-slot-name">${t.hero} 1</span>
                                    </div>
                                    <div class="wp-slot">
                                        <div class="wp-slot-role support">Support</div>
                                        <img src="${imgPlaceholder}" class="wp-avatar-img" alt="Char">
                                        <span class="wp-slot-name">${t.hero} 2</span>
                                    </div>
                                </div>
                            </td>
                            <td class="wp-cell-effect">Описание взаимодействия персонажей в ротации...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    } else if (type === 'news') {
        html = `
            <div class="wp-section-title">🔥 Заголовок новости</div>
            <p>Введите текст новости здесь...</p>
        `;
    } else if (type === 'tier') {
        html = `
            <div class="wp-section-title">ТИР-ЛИСТ</div>
            <h3 style="background: #ff4d00; color: #fff; padding: 6px 16px; display: inline-block; border-radius: 4px; font-weight: 800;">S-RANK</h3>
        `;
    }

    // Вставка сгенерированного HTML в CKEditor
    const viewFragment = editorInstance.data.processor.toView(html);
    const modelFragment = editorInstance.data.toModel(viewFragment);
    editorInstance.model.insertContent(modelFragment);
}

/**
 * Переключение активной кнопки выбора игры
 */
function selectGame(game) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.btn-${game}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}