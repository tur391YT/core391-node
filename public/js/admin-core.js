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
                                <div class="wp-stars" style="color: #ffcc00;">★★★★★</div>
                                <div class="wp-item-stats" style="text-align: left; font-size: 12px; color: #aaa; margin-top: 6px; line-height: 1.6;">
                                    <div>HP: 000-0000</div>
                                    <div>Сила атаки: 00-000</div>
                                    <div>Защита: 00-000</div>
                                </div>
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

    // Строит один слот отряда (роль + один или несколько альтернативных
    // персонажей внутри .wp-slot-chars-row — сюда же добавляет свои
    // элементы кнопка "+ Или (альт. персонаж)")
    function buildSlotHtml(roleClass, roleColor, roleLabel, charName) {
        return `
            <div class="wp-slot" style="text-align: center; flex: 1;">
                <div class="wp-slot-role ${roleClass}" style="color: ${roleColor}; font-weight: bold;">${roleLabel}</div>
                <div class="wp-slot-chars-row" style="display: flex; gap: 6px; justify-content: center; align-items: flex-end; flex-wrap: wrap;">
                    <div class="wp-slot-char">
                        <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 4px;">
                        <div class="wp-slot-name">${charName}</div>
                    </div>
                </div>
            </div>`;
    }

    // Блок "Отряд" — для Genshin с колонкой описания синергии (там она
    // изначально и была нужна), для остальных игр — просто ряд слотов
    // без таблицы и пустого места справа.
    function buildTeamSlotsHtml() {
        const gameSelect = document.getElementById('game-category');
        const gameValue = gameSelect ? gameSelect.value : '';

        const slotsRow = `<div class="wp-team-slots" style="display: flex; gap: 10px;">`
            + buildSlotHtml('main-dd', '#ff4444', 'МЕЙН ДД', 'Персонаж 1')
            + buildSlotHtml('sub-dd', '#ffbb00', 'САП ДД', 'Персонаж 2')
            + buildSlotHtml('support', '#33b5e5', 'САППОРТ', 'Персонаж 3')
            + buildSlotHtml('heal', '#00C851', 'ХИЛЕР', 'Персонаж 4')
            + `</div>`;

        if (gameValue === 'genshin') {
            return `
                <div class="wp-table-wrapper">
                    <table class="wp-table-team">
                        <thead>
                            <tr>
                                <th style="width: 55%;">Компоновка группы</th>
                                <th style="width: 45%;">Описание синергии и тактика</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${slotsRow}</td>
                                <td class="wp-cell-effect">
                                    <p>Опишите здесь, почему именно такой состав хорошо работает — синергия между персонажами, порядок применения способностей...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p></p>
            `;
        }

        return `${slotsRow}<p></p>`;
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

        // Клик по заголовку/короткой подписи сразу выделяет весь её текст —
        // не нужно вручную выделять и стирать по букве, следующее нажатие
        // клавиши сразу заменит содержимое целиком.
        const QUICK_SELECT_SELECTOR = [
            '.wp-section-title', '.wp-item-name', '.wp-slot-name',
            '.wp-item-sub', '.wp-set-desc', '.wp-block-header-text',
            '.wp-echo-stats', '.wp-stars'
        ].join(', ');

        visualEditor.addEventListener('click', (e) => {
            const target = e.target.closest(QUICK_SELECT_SELECTOR);
            if (!target || e.target.tagName === 'IMG') return;

            const range = document.createRange();
            range.selectNodeContents(target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });

        // Вставка картинок через Ctrl+V из буфера обмена. Если курсор сейчас
        // внутри маленькой иконки (Снаряжение/Отряд) — подменяем именно её
        // src, сохраняя маленький фиксированный размер. Иначе вставляем как
        // крупную иллюстрацию (class="full-width") в место курсора.
        visualEditor.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            let imageFile = null;
            for (const item of items) {
                if (item.type && item.type.startsWith('image/')) {
                    imageFile = item.getAsFile();
                    break;
                }
            }
            // Если в буфере не картинка (просто текст) — не мешаем обычной вставке
            if (!imageFile) return;

            e.preventDefault();

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Сжимаем картинку перед вставкой — скриншоты и фото с
                    // телефона легко весят 10-25 МБ в исходном виде, что
                    // раздувает пост и упирается в лимиты сервера. Уменьшаем
                    // до разумного размера и переводим в JPEG — для
                    // иллюстраций в статье этого более чем достаточно.
                    const MAX_DIM = 1600;
                    let { width, height } = img;
                    if (width > MAX_DIM || height > MAX_DIM) {
                        const scale = MAX_DIM / Math.max(width, height);
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

                    const sel = window.getSelection();
                    const iconWrapper = sel.anchorNode?.parentElement?.closest('.wp-item-blank-icon, .wp-slot, .wp-cell-center');
                    const existingImg = iconWrapper ? iconWrapper.querySelector('img') : null;

                    if (existingImg) {
                        // Курсор был внутри иконки снаряжения/слота отряда —
                        // просто меняем картинку на месте, размер не трогаем
                        existingImg.src = dataUrl;
                    } else {
                        // Обычное место в тексте — вставляем как крупную иллюстрацию
                        visualEditor.focus();
                        const imgHtml = `<img src="${dataUrl}" alt="Вставленная картинка" class="full-width">`;
                        document.execCommand('insertHTML', false, imgHtml);
                    }
                    syncData();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(imageFile);
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
        let html;
        if (type === 'itemCard') html = buildItemCardHtml();
        else if (type === 'teamSlots') html = buildTeamSlotsHtml();
        else html = CORE_TEMPLATES[type];
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
            // class="full-width" — штатное исключение из admin.css: без него
            // #visual-editor img по умолчанию считается маленькой иконкой
            // (45×45px), а этот класс явно говорит "это крупная иллюстрация".
            const imgHtml = `<p><img src="${url.trim()}" alt="Картинка статьи" class="full-width"></p><p></p>`;
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
            // Если у клонируемого слота были альтернативные персонажи
            // ("или") — новый слот должен начинаться только с одного
            const charsRow = newSlot.querySelector('.wp-slot-chars-row');
            if (charsRow) {
                const chars = charsRow.querySelectorAll('.wp-slot-char');
                charsRow.querySelectorAll('.wp-slot-alt-sep').forEach(el => el.remove());
                chars.forEach((el, i) => { if (i > 0) el.remove(); });
            }
            const nameEl = newSlot.querySelector('.wp-slot-name');
            if (nameEl) nameEl.textContent = 'Персонаж';
        } else {
            newSlot = document.createElement('div');
            newSlot.className = 'wp-slot';
            newSlot.style.cssText = 'text-align: center; flex: 1;';
            newSlot.innerHTML = `
                <div class="wp-slot-role" style="color: #aaa; font-weight: bold;">УЧАСТНИК</div>
                <div class="wp-slot-chars-row" style="display: flex; gap: 6px; justify-content: center; align-items: flex-end; flex-wrap: wrap;">
                    <div class="wp-slot-char">
                        <img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 4px;">
                        <div class="wp-slot-name">Персонаж</div>
                    </div>
                </div>
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

    // Добавляет "или" + ещё одного персонажа В ТОТ ЖЕ слот — для случаев,
    // когда на позицию подходит несколько взаимозаменяемых персонажей
    // (например, разные крио-саппорты в команде Таяния).
    window.addAltCharacter = function() {
        const sel = window.getSelection();
        const slot = sel.anchorNode?.parentElement?.closest('.wp-slot');

        if (!slot) {
            alert('Поставьте курсор внутрь слота отряда, к которому нужно добавить альтернативного персонажа');
            return;
        }

        const charsRow = slot.querySelector('.wp-slot-chars-row');
        if (!charsRow) {
            alert('Этот слот в старом формате — пересоздайте его через кнопку "+ Отряд", чтобы можно было добавлять альтернативы');
            return;
        }

        const existingChar = charsRow.querySelector('.wp-slot-char');

        const divider = document.createElement('div');
        divider.className = 'wp-slot-alt-sep';
        divider.textContent = 'или';
        divider.style.cssText = 'color:#888; font-size:10px; text-transform:uppercase; align-self:center; padding-bottom:18px;';

        const newChar = existingChar
            ? existingChar.cloneNode(true)
            : (() => {
                const div = document.createElement('div');
                div.className = 'wp-slot-char';
                div.innerHTML = `<img src="${PLACEHOLDER_IMG}" alt="Персонаж" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer; display: block; margin: 0 auto 4px;"><div class="wp-slot-name">Персонаж</div>`;
                return div;
            })();

        const nameEl = newChar.querySelector('.wp-slot-name');
        if (nameEl) nameEl.textContent = 'Персонаж';

        charsRow.appendChild(divider);
        charsRow.appendChild(newChar);
        syncData();
    };
});