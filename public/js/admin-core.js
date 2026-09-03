document.addEventListener('DOMContentLoaded', () => {
    const visualEditor = document.getElementById('visual-editor');
    const hiddenInput = document.getElementById('real-content');

    // Картинка-заглушка для новых блоков
    const PLACEHOLDER_IMG = 'https://via.placeholder.com/100x100/222222/888888?text=IMG';

    // Как называется "снаряжение" в каждой игре — используется кнопкой
    // "+ Предмет", чтобы подставлять нужное слово в зависимости от того,
    // какая игра выбрана в select#game-category на момент вставки блока.
    const GAME_ITEM_LABELS = {
        genshin: 'АРТЕФАКТ',
        wuwa: 'ЭХО',
        hsr: 'РЕЛИКВИЯ',
        zzz: 'ДИСК ДРАЙВА'
    };

    function buildItemCardHtml() {
        const gameSelect = document.getElementById('game-category');
        const gameValue = gameSelect ? gameSelect.value : '';
        const label = GAME_ITEM_LABELS[gameValue] || 'ПРЕДМЕТ';

        return `
            <div class="wp-table-wrapper">
                <table class="wp-table-weapon">
                    <thead>
                        <tr>
                            <th style="width: 30%;">${label}</th>
                            <th>ЭФФЕКТ / ХАРАКТЕРИСТИКИ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="wp-cell-center">
                                <img src="${PLACEHOLDER_IMG}" class="wp-avatar-img" alt="${label}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;">
                                <div class="wp-item-name">Название предмета</div>
                                <div style="color: #ffcc00;">★★★★★</div>
                            </td>
                            <td class="wp-cell-effect">
                                <p>Описание эффекта, пассивного бонуса или комплекта...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p></p>
        `;
    }

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
        // 1. Блок отряда на 4 слота
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

        // 2. Блок преимуществ и недостатков
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

        // 3. Оранжевый заголовок
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
        const html = type === 'itemCard' ? buildItemCardHtml() : CORE_TEMPLATES[type];
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

    // Добавление слота в блок "Отряд" (.wp-team-slots — не таблица, поэтому
    // отдельные функции, а не переиспользование addRow/deleteRow)
    window.addSlot = function() {
        const sel = window.getSelection();
        let container = sel.anchorNode?.parentElement?.closest('.wp-team-slots');

        // Если курсор сейчас не внутри блока отряда — берём последний
        // вставленный в редакторе блок отряда
        if (!container && visualEditor) {
            const all = visualEditor.querySelectorAll('.wp-team-slots');
            container = all[all.length - 1];
        }

        if (!container) {
            alert('Сначала добавьте блок "+ Отряд", затем поставьте курсор внутрь него и нажмите "+ Слот отряда"');
            return;
        }

        const lastSlot = container.querySelector('.wp-slot:last-child');
        let newSlot;

        if (lastSlot) {
            newSlot = lastSlot.cloneNode(true);
            const nameEl = newSlot.querySelector('.wp-slot-name');
            if (nameEl) nameEl.textContent = 'Персонаж';
        } else {
            newSlot = document.createElement('div');
            newSlot.className = 'wp-slot';
            newSlot.style.cssText = 'text-align: center; flex: 1;';
            newSlot.innerHTML = `
                <div class="wp-slot-role" style="color: #aaa; font-weight: bold;">УЧАСТНИК</div>
                <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; margin: 5px 0;">
                <div class="wp-slot-name">Персонаж</div>
            `;
        }

        container.appendChild(newSlot);
        syncData();
    };

    // Удаление слота из блока "Отряд" — оставляет минимум 1 слот
    window.deleteSlot = function() {
        const sel = window.getSelection();
        const slot = sel.anchorNode?.parentElement?.closest('.wp-slot');

        if (!slot) {
            alert('Поставьте курсор внутрь слота отряда, который нужно удалить');
            return;
        }

        const container = slot.closest('.wp-team-slots');
        if (container && container.querySelectorAll('.wp-slot').length <= 1) {
            alert('В отряде должен остаться хотя бы один слот');
            return;
        }

        if (confirm('Удалить этот слот отряда?')) {
            slot.remove();
            syncData();
        }
    };
});