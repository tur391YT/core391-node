document.addEventListener('DOMContentLoaded', () => {
    const visualEditor = document.getElementById('visual-editor');
    const hiddenInput = document.getElementById('real-content');

    // Картинка-заглушка для новых блоков
    const PLACEHOLDER_IMG = 'https://via.placeholder.com/100x100/222222/888888?text=IMG';

    // Авто-синхронизация с скрытым полем отправки формы
    function syncData() {
        if (visualEditor && hiddenInput) {
            hiddenInput.value = visualEditor.innerHTML;
        }
    }

    // ==========================================
    // НАБОР ТОЧЕЧНЫХ ШАБЛОНОВ CORE 391
    // ==========================================
    const CORE_TEMPLATES = {
        // 1. Одиночная карточка оружия
        weaponCard: `
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th style="width: 30%;">ОРУЖИЕ</th>
                            <th>ЭФФЕКТ / ХАРАКТЕРИСТИКИ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">
                                <img src="${PLACEHOLDER_IMG}" class="wp-avatar-img" alt="Оружие" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;">
                                <div class="wp-item-name">Название оружия</div>
                                <div style="color: #ffcc00;">★★★★★</div>
                            </td>
                            <td class="wp-cell-effect">
                                <p>Описание пассивного бонуса и характеристик...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p></p>
        `,

        // 2. Блок артефакта / комплекта
        artifactCard: `
            <div class="wp-artifacts-container">
                <div class="wp-grid-echo" style="display: flex; gap: 20px;">
                    <div class="wp-echo-card-left" style="flex: 1; text-align: center;">
                        <div class="wp-block-header-text" style="color: #ff7700; font-weight: bold; margin-bottom: 10px;">КОМПЛЕКТ</div>
                        <img src="${PLACEHOLDER_IMG}" class="wp-avatar-img" alt="Артефакт" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; cursor: pointer; margin-bottom: 10px;">
                        <div class="wp-item-name" style="font-weight: bold;">Название фулл-комплекта</div>
                    </div>
                    <div class="wp-echo-card-right" style="flex: 1;">
                        <div class="wp-block-header-text" style="color: #ff7700; font-weight: bold; margin-bottom: 10px;">РЕКОМЕНДАЦИИ</div>
                        <p>Описание бонусов и почему этот сет подходит...</p>
                    </div>
                </div>
            </div>
            <p></p>
        `,

        // 3. Блок отряда на 4 слота
        teamSlots: `
            <div class="wp-team-slots" style="display: flex; gap: 10px;">
                <div class="wp-slot" style="text-align: center; flex: 1;">
                    <div class="wp-slot-role main-dd" style="color: #ff4444; font-weight: bold;">МЕЙН ДД</div>
                    <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; margin: 5px 0;">
                    <div class="wp-slot-name">Персонаж 1</div>
                </div>
                <div class="wp-slot" style="text-align: center; flex: 1;">
                    <div class="wp-slot-role sub-dd" style="color: #ffbb00; font-weight: bold;">САП ДД</div>
                    <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; margin: 5px 0;">
                    <div class="wp-slot-name">Персонаж 2</div>
                </div>
                <div class="wp-slot" style="text-align: center; flex: 1;">
                    <div class="wp-slot-role support" style="color: #33b5e5; font-weight: bold;">САППОРТ</div>
                    <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; margin: 5px 0;">
                    <div class="wp-slot-name">Персонаж 3</div>
                </div>
                <div class="wp-slot" style="text-align: center; flex: 1;">
                    <div class="wp-slot-role heal" style="color: #00C851; font-weight: bold;">ХИЛЕР</div>
                    <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; margin: 5px 0;">
                    <div class="wp-slot-name">Персонаж 4</div>
                </div>
            </div>
            <p></p>
        `,

        // 4. Блок преимуществ и недостатков
        prosCons: `
            <div class="wp-pros-cons-container">
                <div class="pros-box">
                    <b style="color: #4caf50;">ПРЕИМУЩЕСТВА:</b>
                    <ul><li>Плюс 1</li></ul>
                </div>
                <div class="cons-box">
                    <b style="color: #f44336;">НЕОДОСТАТКИ:</b>
                    <ul><li>Минус 1</li></ul>
                </div>
            </div>
            <p></p>
        `,

        // 5. Оранжевый заголовок
        sectionTitle: `
            <h2 class="wp-section-title">ЗАГОЛОВОК СЕКЦИИ</h2>
            <p></p>
        `
    };

    // ==========================================
    // ОБРАБОТКА ВСТАВКИ И КЛИКОВ ПО КАРТИНКАМ
    // ==========================================
    if (visualEditor) {
        // Замена изображения по single-click или dblclick
        visualEditor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                
                const currentSrc = e.target.getAttribute('src') || '';
                const defaultVal = (currentSrc.includes('placeholder') || currentSrc === '') ? '' : currentSrc;
                
                const newSrc = prompt('Вставьте относительный путь (например: img/weapon.png) или URL к изображению:', defaultVal);
                
                if (newSrc !== null && newSrc.trim() !== '') {
                    const cleanPath = newSrc.trim();
                    e.target.src = cleanPath;
                    e.target.setAttribute('src', cleanPath);
                    syncData();
                }
            }
        });

        // Блокируем стандартный ввод текста прямо «внутрь» картинки
        visualEditor.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });

        visualEditor.addEventListener('input', syncData);
    }

    // ==========================================
    // ФУНКЦИИ КНОПОК
    // ==========================================
    window.insertTemplate = function(type) {
        const html = CORE_TEMPLATES[type];
        if (!html) return;

        if (visualEditor) {
            visualEditor.focus();
            document.execCommand('insertHTML', false, html);
            syncData();
        }
    };

    // Добавление новой обычной картинки в место курсора
    window.insertImageBlock = function() {
        const url = prompt('Укажите путь к картинке (например: img/posts/banner.jpg или URL):');
        if (url && url.trim() !== '' && visualEditor) {
            visualEditor.focus();
            const imgHtml = `<p><img src="${url.trim()}" alt="Картинка статьи"></p><p></p>`;
            document.execCommand('insertHTML', false, imgHtml);
            syncData();
        }
    };

    // Добавление строки в существующую таблицу
    window.addRow = function() {
        const sel = window.getSelection();
        const row = sel.anchorNode?.parentElement?.closest('tr');

        if (row) {
            const newRow = row.cloneNode(true);
            newRow.querySelectorAll('td').forEach((td) => {
                td.innerText = '—';
            });
            row.parentNode.insertBefore(newRow, row.nextSibling);
            syncData();
        } else {
            alert("Поставьте курсор в таблицу, чтобы добавить новую строку");
        }
    };

    // Удаление строки таблицы
    window.deleteRow = function() {
        const sel = window.getSelection();
        const row = sel.anchorNode?.parentElement?.closest('tr');

        if (row && confirm("Удалить выбранную строку?")) { 
            row.remove(); 
            syncData(); 
        }
    };
});