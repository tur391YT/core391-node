// =========================================================================
// CORE 391 - Конструктор гайдов: Игровой Редактор
// =========================================================================

// Переменная для хранения активной картинки
let activeImage = null;

/**
 * Инициализация обработчиков событий после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('visual-editor');
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');

    if (editor) {
        // Отслеживание кликов по изображениям внутри редактора для ресайза
        editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                activeImage = e.target;
                // Визуальная подсветка выбранного изображения
                editor.querySelectorAll('img').forEach(img => img.style.outline = 'none');
                activeImage.style.outline = '2px solid #ff4d00';
            } else {
                if (activeImage) activeImage.style.outline = 'none';
                activeImage = null;
            }
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            // Переключаем табы, если селектор изменили вручную из другого места
            syncTabButtons(categorySelect.value);
            updateToolbarButtons();
            updateEditorTheme();
        });
        // Первичная настройка при загрузке страницы
        syncTabButtons(categorySelect.value);
        updateToolbarButtons();
        updateEditorTheme();
    }
});

/**
 * Функция для внешних кнопок переключения (Табов в HTML)
 * Позволяет переключать игру, менять стили кнопок и сразу обновлять весь интерфейс
 */
function switchGameAndTheme(gameValue) {
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    if (categorySelect) {
        categorySelect.value = gameValue;
        syncTabButtons(gameValue);
        updateToolbarButtons();
        updateEditorTheme();
    }
}

/**
 * Вспомогательная функция для синхронизации визуального состояния кнопок-табов
 */
function syncTabButtons(gameValue) {
    const buttons = document.querySelectorAll('.game-tab-btn');
    if (buttons.length === 0) return; // Защита: если кнопок еще нет в HTML, скрипт не упадет

    buttons.forEach(btn => {
        const isCurrent = btn.getAttribute('data-game') === gameValue;
        
        if (isCurrent) {
            btn.classList.add('active');
            // Для WuWa ставим фирменный жёлтый, для остальных — оранжевый CORE 391
            btn.style.borderColor = (gameValue === 'wuwa') ? '#ffcc00' : '#ff4d00';
            btn.style.color = '#fff';
        } else {
            btn.classList.remove('active');
            btn.style.borderColor = '#222';
            btn.style.color = '#aaa';
        }
    });
}

/**
 * Основные функции форматирования и очистки
 */
function formatDoc(cmd, value = null) {
    document.execCommand(cmd, false, value);
    const editor = document.getElementById('visual-editor');
    if (editor) editor.focus();
}

function addLink() {
    const url = prompt("Введите ссылку:", "https://");
    if (url) formatDoc('createLink', url);
}

// Удаляет надпись-заглушку при начале редактирования или вставке контента
function clearPlaceholder() {
    const editor = document.getElementById('visual-editor');
    if (!editor) return;
    const placeholder = editor.querySelector('.empty-area');
    if (placeholder) { placeholder.remove(); }
}

// Очистка редактора с подтверждением и возвратом заглушки
function clearEditor() {
    if (confirm("Вы уверены, что хотите полностью очистить содержимое редактора?")) {
        const editor = document.getElementById('visual-editor');
        if (editor) {
            editor.innerHTML = '<div class="empty-area" style="color: #444; pointer-events: none;">Выберите игру выше и нажмите "СГЕНЕРИРОВАТЬ ШАБЛОН"...</div>';
        }
        activeImage = null;
    }
}

/**
 * Логика изображений (Вставка, выделение, изменение размера)
 */
function insertImg() {
    const url = prompt("Прямая ссылка на изображение:");
    if (url) {
        const editor = document.getElementById('visual-editor');
        if (!editor) return;
        clearPlaceholder();
        editor.focus();
        const imgHtml = `<div style="text-align: center; margin: 20px 0;"><img src="${url}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #1a1a1a; cursor: pointer;"></div>`;
        document.execCommand('insertHTML', false, imgHtml + '<p><br></p>');
    }
}

function resizeImage() {
    if (!activeImage) {
        alert("Сначала кликните по картинке внутри самого редактора (текстовой зоны)!");
        return;
    }
    const panel = document.getElementById('imageResizerPanel');
    const overlay = document.getElementById('resizerOverlay');
    const slider = document.getElementById('sizeSlider');
    const display = document.getElementById('sizeValue');

    if (panel && overlay) {
        panel.style.display = 'block';
        overlay.style.display = 'block';
    }

    let currentWidth = activeImage.style.width || "100%";
    let numericValue = parseInt(currentWidth) || 100;
    
    if (slider && display) {
        slider.value = numericValue;
        display.innerText = numericValue + "%";
        slider.oninput = function() {
            display.innerText = this.value + "%";
            if (activeImage) {
                activeImage.style.width = this.value + "%";
                activeImage.style.height = "auto";
            }
        };
    }
}

function applySize() { closeResizer(); }
function closeResizer() {
    const panel = document.getElementById('imageResizerPanel');
    const overlay = document.getElementById('resizerOverlay');
    if (panel) panel.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

/**
 * Изменение интерфейса и динамические кнопки под выбранную игру
 */
function updateToolbarButtons() {
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    if (!categorySelect) return;
    
    const game = categorySelect.value;
    const wpBtn = document.getElementById('add-weapon-btn');
    const artBtn = document.getElementById('add-artifact-btn');
    
    const buttonLabels = {
        'wuwa': { wp: '+ ОРУЖИЕ', art: '+ ЭХО' },
        'genshin': { wp: '+ ОРУЖИЕ', art: '+ АРТЕФАКТЫ' },
        'hsr': { wp: '+ КОНУС', art: '+ РЕЛИКВИИ' },
        'zzz': { wp: '+ АМПЛИФИКАТОР', art: '+ ДРАЙВ-ДИСКИ' }
    };

    const labels = buttonLabels[game] || buttonLabels['genshin'];
    if (wpBtn) wpBtn.innerText = labels.wp;
    if (artBtn) artBtn.innerText = labels.art;
}

// Динамическое обновление цвета инлайн-кнопок в редакторе при смене игры или генерации
function updateEditorTheme() {
    const editor = document.getElementById('visual-editor');
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    if (!editor || !categorySelect) return;

    const themeColor = (categorySelect.value === 'wuwa') ? '#ffcc00' : '#ff4d00';
    editor.querySelectorAll('.wp-inline-add-btn').forEach(btn => btn.style.color = themeColor);
}

/**
 * Функции динамического добавления строк прямо ВНУТРЬ таблиц/блоков гайда
 */
function addRowToWeapon(button) {
    const tableWrapper = button.closest('.wp-table-wrapper');
    if (!tableWrapper) return;
    const table = tableWrapper.querySelector('.wp-table-weapon tbody');
    if (!table) return;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="wp-cell-center">
            <div class="wp-item-icon-wrapper"><div class="wp-item-blank-icon"></div></div>
            <div class="wp-item-name" contenteditable="true">Альтернативное снаряжение</div>
            <div class="wp-stars" contenteditable="true">★★★★★</div>
            <div class="wp-item-sub" contenteditable="true">Базовые параметры</div>
        </td>
        <td class="wp-cell-effect" contenteditable="true">
            <p>Описание пассивного эффекта альтернативного снаряжения...</p>
        </td>
    `;
    table.appendChild(newRow);
}

function addRowToArtifact(button) {
    const containerWrapper = button.closest('.wp-artifacts-container');
    if (!containerWrapper) return;
    const container = containerWrapper.querySelector('.wp-artifacts-list-wrapper');
    if (!container) return;

    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    const game = categorySelect ? categorySelect.value : 'genshin';
    
    let setLabel = "Альтернативный комплект";
    if (game === 'wuwa') setLabel = "Альтернативная Соната";
    else if (game === 'hsr') setLabel = "Альтернативные Релики";
    else if (game === 'zzz') setLabel = "Альтернативные Драйв-диски";

    const newBlock = document.createElement('div');
    newBlock.className = 'wp-grid-echo';
    newBlock.style.margin = '20px 0 0 0';
    newBlock.innerHTML = `
        <div class="wp-echo-card-left">
            <div class="wp-block-header-text">Комплект</div>
            <div class="wp-echo-meta">
                <div class="wp-item-blank-icon circle"></div>
                <div class="wp-item-name" contenteditable="true">${setLabel}</div>
                <div class="wp-set-desc" contenteditable="true">2 части: Бонус характеристик<br>4-5 частей: Описание эффекта альтернативного сета...</div>
            </div>
        </div>
        <div class="wp-echo-card-right">
            <div class="wp-block-header-text">Рекомендации</div>
            <div class="wp-echo-recommend-title" contenteditable="true">Почему выбирают этот комплект?</div>
            <div class="wp-echo-recommend-text" contenteditable="true">
                <p>Опишите синергию комплекта с персонажем, почему эти бонусы эффективны и в каких ситуациях данный сет раскрывает себя лучше всего...</p>
            </div>
        </div>
    `;
    container.appendChild(newBlock);
}

function addRowToTeam(button) {
    const tableWrapper = button.closest('.wp-table-wrapper');
    if (!tableWrapper) return;
    const table = tableWrapper.querySelector('.wp-table-team tbody');
    if (!table) return;

    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    const game = categorySelect ? categorySelect.value : 'genshin';
    const isThreeSlot = (game === 'wuwa'); 

    const slotStyle = 'display: inline-block; vertical-align: top; margin-right: 10px; text-align: center;';
    const roleStyle = 'display: flex; align-items: center; justify-content: center; height: 24px; font-size: 11px; font-weight: bold; padding: 2px 4px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; text-align: center; line-height: 1.1; color: #fff;';

    let slotsHTML = `
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role main-dd" style="${roleStyle} background: #ff4d00;">Мейн-ДД</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name" contenteditable="true">Персонаж 1</span>
        </div>
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role sub-dd" style="${roleStyle} background: #9c27b0;">Сап-ДД</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name" contenteditable="true">Персонаж 2</span>
        </div>
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role support" style="${roleStyle} background: #4caf50;">Саппорт</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name" contenteditable="true">Персонаж 3</span>
        </div>
    `;

    if (!isThreeSlot) {
        slotsHTML += `
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role support" style="${roleStyle} background: #00bcd4;">Саппорт/Хил</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name" contenteditable="true">Персонаж 4</span>
        </div>`;
    }

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="wp-team-slots" style="display: flex; gap: 10px; align-items: flex-start;">
                ${slotsHTML}
            </div>
        </td>
        <td class="wp-cell-effect" contenteditable="true">
            <p>Описание тактики новой альтернативной команды, её синергии и преимуществ...</p>
        </td>
    `;
    table.appendChild(newRow);
}

/**
 * Полная генерация структуры CORE 391 под конкретную игру
 */
function applyGameTemplate() {
    const editor = document.getElementById('visual-editor');
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    if (!editor || !categorySelect) return;

    clearPlaceholder();
    const game = categorySelect.value;
    
    let labels = {
        char: "Персонажа", weapon: "Оружие", artifacts: "Лучшие Артефакты",
        set: "Комплект", consts: "Созвездия", skills: "Таланты",
        priorityText: "Обычная атака -> Элементальный навык -> Взрыв стихий"
    };

    if (game === 'wuwa') {
        labels = {
            char: "Резонатора", weapon: "Оружие", artifacts: "Лучшее Эхо",
            set: "Соната (Set)", consts: "Цепочка резонанса (Дубликаты)", skills: "Навыки",
            priorityText: "Resonance Liberation -> Resonance Skill -> Forte Circuit"
        };
    } else if (game === 'hsr') {
        labels = {
            char: "Персонажа", weapon: "Световой конус", artifacts: "Лучшие Реликварии и Планарки",
            set: "Реликвии / Планарки", consts: "Эйдолоны", skills: "Следы и Способности",
            priorityText: "Сверхспособность -> Навык -> Талант -> Базовая атака"
        };
    } else if (game === 'zzz') {
        labels = {
            char: "Агента", weapon: "Амплификатор", artifacts: "Лучшие Драйв-диски",
            set: "Драйв-диски (4+2)", consts: "Ментальная картина (Дубликаты)", skills: "Навыки и Приоритеты",
            priorityText: "Запуск за цепочки / Ульта -> Особая атака -> Базовая атака -> Уклонение"
        };
    }

    const slotStyle = 'display: inline-block; vertical-align: top; text-align: center;';
    const roleStyle = 'display: flex; align-items: center; justify-content: center; height: 24px; font-size: 11px; font-weight: bold; padding: 2px 4px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; text-align: center; line-height: 1.1; color: #fff;';

    let teamSlotsHeaderHTML = `
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role main-dd" style="${roleStyle} background: #ff4d00;">Мейн-ДД</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name">Персонаж 1</span>
        </div>
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role sub-dd" style="${roleStyle} background: #9c27b0;">Сап-ДД</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name">Персонаж 2</span>
        </div>
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role support" style="${roleStyle} background: #4caf50;">Саппорт</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name">Персонаж 3</span>
        </div>
    `;
    
    if (game !== 'wuwa') {
        teamSlotsHeaderHTML += `
        <div class="wp-slot" style="${slotStyle}">
            <span class="wp-slot-role support" style="${roleStyle} background: #00bcd4;">Саппорт/Хил</span>
            <div class="wp-item-blank-icon"></div>
            <span class="wp-slot-name">Персонаж 4</span>
        </div>`;
    }

    const template = `
        <h3 class="wp-section-title">Описание ${labels.char}</h3>
        <p>Краткое введение, роль персонажа в мете и особенности его геймплея...</p>
        
        <h3 class="wp-section-title">Преимущества и Недостатки</h3>
        <div style="display: flex; gap: 20px; margin: 20px 0;" contenteditable="false">
            <div class="pros-box" contenteditable="true">
                <b>Преимущества:</b>
                <ul style="margin: 10px 0; padding-left: 20px; color: #ddd; font-size: 14px;">
                    <li>Высокий базовый урон и отличная синергия.</li>
                </ul>
            </div>
            <div class="cons-box" contenteditable="true">
                <b>Недостатки:</b>
                <ul style="margin: 10px 0; padding-left: 20px; color: #ddd; font-size: 14px;">
                    <li>Требователен к экипировке и правильной ротации.</li>
                </ul>
            </div>
        </div>

        <h3 class="wp-section-title">Приоритет прокачки ${labels.skills}</h3>
        <p>В какую очередь стоит вливать ресурсы для максимальной эффективности:</p>
        <p><b>Порядок прокачки:</b> ${labels.priorityText}</p>

        <h3 class="wp-section-title">Лучшие ${labels.consts}</h3>
        <p>Описание самых полезных созвездий/эффектов при получении копий:</p>
        <ul>
            <li><strong>C1 / E1:</strong> Краткое описание ключевого первого дубликата...</li>
            <li><strong>C2 / E2:</strong> Краткое описание второго дубликата...</li>
            <li><strong>C6 / E6:</strong> Описание финального сильнейшего баффа...</li>
        </ul>

        <h3 class="wp-section-title">Лучшее снаряжение (${labels.weapon})</h3>
        <div class="wp-table-wrapper" contenteditable="false">
            <table class="wp-table-weapon">
                <thead>
                    <tr>
                        <th style="width: 30%;">${labels.weapon}</th>
                        <th style="width: 70%;">Эффект / Характеристики</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="wp-cell-center">
                            <div class="wp-item-icon-wrapper"><div class="wp-item-blank-icon"></div></div>
                            <div class="wp-item-name" contenteditable="true">Название сигнатурки</div>
                            <div class="wp-stars" contenteditable="true">★★★★★</div>
                            <div class="wp-item-sub" contenteditable="true">Базовые параметры и мейн-стат</div>
                        </td>
                        <td class="wp-cell-effect" contenteditable="true">
                            <p>Описание пассивного бонуса, условий его срабатывания и синергии...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToWeapon(this)" style="margin-top: 10px; width: 100%; padding: 10px; background: #141414; border: 1px solid #333; font-weight: bold; cursor: pointer; border-radius: 6px;">➕ ДОБАВИТЬ ВАРИАНТ ОРУЖИЯ</button>
        </div>

        <h3 class="wp-section-title">${labels.artifacts}</h3>
        <div class="wp-artifacts-container" contenteditable="false">
            <div class="wp-artifacts-list-wrapper">
                <div class="wp-grid-echo">
                    <div class="wp-echo-card-left">
                        <div class="wp-block-header-text">${labels.set}</div>
                        <div class="wp-echo-meta">
                            <div class="wp-item-blank-icon circle"></div>
                            <div class="wp-item-name" contenteditable="true">Название фулл-комплекта</div>
                            <div class="wp-set-desc" contenteditable="true">2 части: Бонус характеристик<br>4-5 частей: Уникальный эффект сета при выполнении условий</div>
                        </div>
                    </div>
                    <div class="wp-echo-card-right">
                        <div class="wp-block-header-text">Рекомендации</div>
                        <div class="wp-echo-recommend-title" contenteditable="true">Why choose this set?</div>
                        <div class="wp-echo-recommend-text" contenteditable="true">
                            <p>Опишите синергию комплекта с персонажем, почему эти бонусы эффективны и в каких ситуациях данный сет раскрывает себя лучше всего...</p>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToArtifact(this)" style="margin-top: 15px; width: 100%; padding: 10px; background: #141414; border: 1px dashed #333; font-weight: bold; cursor: pointer; border-radius: 6px;">➕ ДОБАВИТЬ ЕЩЕ СЕТ АРТЕФАКТОВ</button>
        </div>

        <h3 class="wp-section-title">Лучшие отряды и команды</h3>
        <div class="wp-table-wrapper" contenteditable="false">
            <table class="wp-table-team">
                <thead>
                    <tr>
                        <th style="width: 55%;">Компоновка группы</th>
                        <th style="width: 45%;">Описание синергии и тактика</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="wp-team-slots" style="display: flex; gap: 10px; align-items: flex-start;">
                                ${teamSlotsHeaderHTML}
                            </div>
                        </td>
                        <td class="wp-cell-effect" contenteditable="true">
                            <p>Очередность прожатия кнопок (ротация), как комбинировать баффы и ультимейты для нанесения максимального урона...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToTeam(this)" style="margin-top: 10px; width: 100%; padding: 10px; background: #141414; border: 1px dashed #333; font-weight: bold; cursor: pointer; border-radius: 6px;">➕ ДОБАВИТЬ ДРУГОЙ ОТРЯД</button>
        </div>

        <h3 class="wp-section-title">Как играть (Ротация)</h3>
        <p>Пошаговое руководство по ведению боя на данном герое...</p>
        <p><br></p>
    `;
    
    editor.innerHTML = template;
    updateEditorTheme();
}

/**
 * Добавление отдельно стоящих блоков через верхний тулбар
 */
function addDynamicRow(type) {
    const editor = document.getElementById('visual-editor');
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    if (!editor || !categorySelect) return;

    clearPlaceholder();
    editor.focus();
    const game = categorySelect.value;
    let html = '';

    if (type === 'weapon') {
        let weaponLabel = "Оружие";
        if (game === 'hsr') weaponLabel = "Световой конус";
        if (game === 'zzz') weaponLabel = "Амплификатор";

        html = `
        <div class="wp-table-wrapper" contenteditable="false">
            <table class="wp-table-weapon" style="margin: 15px 0;">
                <thead>
                    <tr>
                        <th style="width: 30%;">${weaponLabel}</th>
                        <th style="width: 70%;">Эффект / Характеристики</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="wp-cell-center">
                            <div class="wp-item-icon-wrapper"><div class="wp-item-blank-icon"></div></div>
                            <div class="wp-item-name" contenteditable="true">Название предмета</div>
                            <div class="wp-stars" contenteditable="true">★★★★★</div>
                            <div class="wp-item-sub" contenteditable="true">Параметры статов</div>
                        </td>
                        <td class="wp-cell-effect" contenteditable="true">
                            <p>Описание пассивного эффекта...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToWeapon(this)" style="width:100%; padding:8px; background:#141414; border:1px dashed #333; font-weight:bold; cursor:pointer; border-radius:6px;">➕ ДОБАВИТЬ СТРОКУ ОРУЖИЯ</button>
        </div>`;
    } else if (type === 'artifact') {
        let setLabel = "Комплект";
        if (game === 'wuwa') setLabel = "Соната (Set)";
        else if (game === 'hsr') setLabel = "Реликвии / Планарки";
        else if (game === 'zzz') setLabel = "Драйв-диски";

        html = `
        <div class="wp-artifacts-container" contenteditable="false">
            <div class="wp-artifacts-list-wrapper">
                <div class="wp-grid-echo" style="margin: 15px 0;">
                    <div class="wp-echo-card-left">
                        <div class="wp-block-header-text">${setLabel}</div>
                        <div class="wp-echo-meta">
                            <div class="wp-item-blank-icon circle"></div>
                            <div class="wp-item-name" contenteditable="true">Название нового сета</div>
                            <div class="wp-set-desc" contenteditable="true">Описание бонусов сета...</div>
                        </div>
                    </div>
                    <div class="wp-echo-card-right">
                        <div class="wp-block-header-text">Рекомендации</div>
                        <div class="wp-echo-recommend-title" contenteditable="true">Почему выбирают этот комплект?</div>
                        <div class="wp-echo-recommend-text" contenteditable="true">
                            <p>Опишите синергию комплекта с персонажем, почему эти бонусы эффективны и в каких ситуациях данный сет раскрывает себя лучше всего...</p>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToArtifact(this)" style="width:100%; padding:8px; background:#141414; border:1px dashed #333; font-weight:bold; cursor:pointer; border-radius:6px;">➕ ДОБАВИТЬ ЕЩЕ СЕТ</button>
        </div>`;
    } else if (type === 'team') {
        const isThreeSlot = (game === 'wuwa');
        const slotStyle = 'display: inline-block; vertical-align: top; text-align: center;';
        const roleStyle = 'display: flex; align-items: center; justify-content: center; height: 24px; font-size: 11px; font-weight: bold; padding: 2px 4px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; text-align: center; line-height: 1.1; color: #fff;';

        let slotsHTML = `
            <div class="wp-slot" style="${slotStyle}"><span class="wp-slot-role main-dd" style="${roleStyle} background: #ff4d00;">Мейн-ДД</span><div class="wp-item-blank-icon"></div><span class="wp-slot-name" contenteditable="true">Имя</span></div>
            <div class="wp-slot" style="${slotStyle}"><span class="wp-slot-role sub-dd" style="${roleStyle} background: #9c27b0;">Сап-ДД</span><div class="wp-item-blank-icon"></div><span class="wp-slot-name" contenteditable="true">Имя</span></div>
            <div class="wp-slot" style="${slotStyle}"><span class="wp-slot-role support" style="${roleStyle} background: #4caf50;">Саппорт</span><div class="wp-item-blank-icon"></div><span class="wp-slot-name" contenteditable="true">Имя</span></div>
        `;
        if (!isThreeSlot) {
            slotsHTML += `<div class="wp-slot" style="${slotStyle}"><span class="wp-slot-role support" style="${roleStyle} background: #00bcd4;">Саппорт/Хил</span><div class="wp-item-blank-icon"></div><span class="wp-slot-name" contenteditable="true">Имя</span></div>`;
        }

        html = `
        <div class="wp-table-wrapper" contenteditable="false">
            <table class="wp-table-team" style="margin: 15px 0;">
                <thead>
                    <tr>
                        <th style="width: 55%;">Персонажи</th>
                        <th style="width: 45%;">Описание команды</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><div class="wp-team-slots" style="display: flex; gap: 10px; align-items: flex-start;">${slotsHTML}</div></td>
                        <td class="wp-cell-effect" contenteditable="true"><p>Описание синергии...</p></td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="wp-inline-add-btn" onclick="addRowToTeam(this)" style="width:100%; padding:8px; background:#141414; border:1px dashed #333; font-weight:bold; cursor:pointer; border-radius:6px;">➕ ДОБАВИТЬ СТРОКУ ОТРЯДА</button>
        </div>`;
    }

    if (!document.execCommand('insertHTML', false, html + '<p><br></p>')) {
        editor.innerHTML += html + '<p><br></p>';
    }
    updateEditorTheme();
}

/**
 * Умная таблица билда
 */
function insertBuildTable() {
    const categorySelect = document.getElementById('game-category') || document.getElementById('game-category-select');
    const isWuwa = categorySelect && categorySelect.value === 'wuwa';
    const editor = document.getElementById('visual-editor');
    
    const color = isWuwa ? '#ffcc00' : '#ff4d00';
    const label = isWuwa ? 'ЭХО / СОНЕТ' : 'АРТЕФАКТ / ОРУЖИЕ';

    const tableHTML = `
        <div class="build-table-container" style="margin: 20px 0;">
            <table style="width:100%; border-collapse:collapse; background:#0a0a0a; border:1px solid #222; border-radius:8px; overflow:hidden;">
                <thead>
                    <tr style="background:#111;">
                        <th style="padding:15px; border:1px solid #222; color:${color}; text-transform:uppercase; font-size:12px; width:30%;">${label}</th>
                        <th style="padding:15px; border:1px solid #222; color:${color}; text-transform:uppercase; font-size:12px;">ХАРАКТЕРИСТИКИ</th>
                        <th style="padding:15px; border:1px solid #222; color:${color}; text-transform:uppercase; font-size:12px; width:15%;">TIER</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding:15px; border:1px solid #222; color:#fff;" contenteditable="true">Название предмета</td>
                        <td style="padding:15px; border:1px solid #222; color:#ccc;" contenteditable="true">Главные статы...</td>
                        <td style="padding:15px; border:1px solid #222; text-align:center; color:#ffff00; font-weight:900;" contenteditable="true">S+</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p><br></p>
    `;

    if (editor) {
        clearPlaceholder();
        editor.focus();
        document.execCommand('insertHTML', false, tableHTML);
    }
}

/**
 * Подготовка контента перед отправкой формы в PHP
 */
function prepareContent() {
    const editor = document.getElementById('visual-editor');
    const hiddenInput = document.getElementById('real-content'); 
    
    if (!editor || !hiddenInput) {
        console.error("Элементы редактора или скрытого поля не найдены!");
        return false;
    }

    const placeholder = editor.querySelector('.empty-area');
    if (placeholder) {
        hiddenInput.value = "";
        return true;
    }

    const clone = editor.cloneNode(true);

    // Убираем подсветку выделенной картинки, если она осталась перед сохранением
    clone.querySelectorAll('img').forEach(img => img.style.outline = 'none');

    // Перед отправкой полностью вырезаем служебные кнопки инлайн-добавления
    clone.querySelectorAll('.wp-inline-add-btn').forEach(btn => btn.remove());

    hiddenInput.value = clone.innerHTML.trim();
    return true;
}