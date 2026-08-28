const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { renderHeader, renderFooter, escapeHtml, resolveImagePath } = require('../lib/render');
const { requireAdmin } = require('../middleware/auth');

const GAME_SETTINGS = {
  genshin: { title: 'Genshin Impact', class: 'genshin' },
  zzz: { title: 'Zenless Zone Zero', class: 'zzz' },
  wuwa: { title: 'Wuthering Waves', class: 'wuwa' },
  hsr: { title: 'Honkai Star Rail', class: 'star-rail' }
};

const GAME_BANNERS = {
  genshin: 'https://i.pinimg.com/1200x/0a/84/9d/0a849d1db2e9b5c7b6a5d196d399f81a.jpg',
  zzz: 'https://i.pinimg.com/1200x/ac/c0/26/acc02683542b899c52129a232b43cb61.jpg',
  wuwa: 'https://i.pinimg.com/736x/f3/27/70/f32770d88f356fefbd53de6b40748bc8.jpg',
  hsr: 'https://i.pinimg.com/1200x/22/15/b9/2215b99842d6d7b7a96891fc06367a83.jpg'
};

const GAME_OPTIONS = ['genshin', 'wuwa', 'hsr', 'zzz'];
const GAME_LABELS = {
  genshin: 'Genshin Impact',
  wuwa: 'Wuthering Waves',
  hsr: 'Honkai: Star Rail',
  zzz: 'Zenless Zone Zero'
};

function templatePanelHtml() {
  return `
  <div class="template-panel">
    <button type="button" class="template-btn" onclick="insertTemplate('sectionTitle')">+ Заголовок</button>
    <button type="button" class="template-btn" onclick="insertTemplate('itemCard')">+ Предмет (оружие/артефакт)</button>
    <button type="button" class="template-btn" onclick="insertTemplate('teamSlots')">+ Отряд</button>
    <button type="button" class="template-btn" onclick="insertTemplate('prosCons')">+ Плюсы/Минусы</button>
    <button type="button" class="template-btn" onclick="addRow()">+ Строка таблицы</button>
    <button type="button" class="template-btn" onclick="deleteRow()">- Удалить строку</button>
  </div>`;
}

// Реальная админка грузит только admin-core.js — он сам объявляет
// insertTemplate/addRow/deleteRow/insertImageBlock и сам синхронизирует
// #visual-editor с #real-content. editor.js и editor-templates.js в
// реальном проекте существуют, но не подключены ни на одной странице —
// оставлены как есть, Node-версия их тоже не грузит.
const EDITOR_SCRIPTS = `
<script src="/js/admin-core.js"></script>`;

// ---------- Главная ----------
router.get('/', async (req, res, next) => {
  try {
    const [sliderPosts] = await pool.query('SELECT * FROM posts ORDER BY id DESC LIMIT 3');

    const slides = sliderPosts.map(post => `
      <a href="/post/${post.id}" class="slide-item">
        <img src="${escapeHtml(resolveImagePath(post.image))}" alt="${escapeHtml(post.title)}">
        <div class="slide-info">
          <span class="category-badge">${escapeHtml(post.sub_category || 'ГАЙДЫ')}</span>
          <h3>${escapeHtml(post.title)}</h3>
        </div>
      </a>`).join('');

    const dots = sliderPosts.map((_, i) => `<div class="nav-dot" onclick="currentSlide(${i})"></div>`).join('');

    res.send(`${renderHeader({ session: req.session })}
    <section class="hero" style="background-image: url('/img/banner.png');">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>CORE <span>SYSTEM</span></h1>
        <p>ТВОЙ ЦЕНТР УПРАВЛЕНИЯ ГАЧА-МИРАМИ:</p>
      </div>
    </section>
    <main class="main-content">
      <h2 class="section-title">ПОСЛЕДНИЕ МАТЕРИАЛЫ</h2>
      <div class="slider-container">
        <div class="top-slider" id="mainSlider">
          ${sliderPosts.length ? slides : '<p class="empty-msg">Пока нет опубликованных материалов.</p>'}
        </div>
        <div class="slider-nav">${dots}</div>
      </div>

      <h2 class="section-title">ВСЕ ИГРЫ</h2>
      <div class="index-grid promo-footer-grid">
        <a href="/category?game=genshin" class="game-card">
          <img src="https://i.pinimg.com/736x/a2/67/86/a26786b9c7bbffb87e1ebdf626c1cec6.jpg" alt="Genshin Impact">
          <div class="content"><span class="category-badge">Genshin Impact</span><h3>Гайды, билды и новости</h3></div>
        </a>
        <a href="/category?game=zzz" class="game-card">
          <img src="https://i.pinimg.com/736x/fc/7e/4a/fc7e4ab9a142afb49ff522c00f7061a2.jpg" alt="Zenless Zone Zero">
          <div class="content"><span class="category-badge">Zenless Zone Zero</span><h3>Агенты и билды</h3></div>
        </a>
        <a href="/category?game=wuwa" class="game-card">
          <img src="https://i.pinimg.com/736x/f5/9c/51/f59c511d7cd5239529dd452e95f50a22.jpg" alt="Wuthering Waves">
          <div class="content"><span class="category-badge">Wuthering Waves</span><h3>Резонаторы и фарм</h3></div>
        </a>
      </div>
    </main>
    <script>
      // Слайдер — как в оригинальном index.php, отдельного файла под него в проекте нет
      let slideIndex = 0;
      const slider = document.getElementById('mainSlider');
      const dots = document.querySelectorAll('.nav-dot');

      function showSlides() {
        slideIndex++;
        if (slideIndex >= dots.length) slideIndex = 0;
        updateSlider();
      }
      function currentSlide(n) { slideIndex = n; updateSlider(); }
      function updateSlider() {
        if (!slider) return;
        slider.style.transform = \`translateX(-\${slideIndex * 100}%)\`;
        dots.forEach((dot, index) => dot.classList.toggle('active', index === slideIndex));
      }
      if (dots.length > 0) { updateSlider(); setInterval(showSlides, 5000); }
    </script>
    ${renderFooter()}`);
  } catch (err) { next(err); }
});

// ---------- Категория ----------
router.get('/category', async (req, res, next) => {
  try {
    const game = (req.query.game || 'zzz').trim();
    const settings = GAME_SETTINGS[game];
    const currentTitle = settings ? settings.title : game.toUpperCase();
    const bodyClass = settings ? settings.class : '';

    const [posts] = await pool.query('SELECT * FROM posts WHERE category = ? ORDER BY id DESC', [game]);
    const heroBg = GAME_BANNERS[game] || (posts[0] && posts[0].banner_wide) || '/img/banner.png';
    const isAdmin = req.session.admin === true;

    const cards = posts.map(post => `
      <div style="position: relative; display: flex; flex-direction: column;">
        ${isAdmin ? `<a href="/edit_post/${post.id}" class="admin-edit-link">⚙️ ПРАВКА</a>` : ''}
        <a href="/post/${post.id}" class="game-card">
          <img src="${escapeHtml(resolveImagePath(post.image))}" alt="${escapeHtml(post.title)}">
          <div class="content" style="padding: 10px; display: flex; flex-direction: column; flex-grow: 1;">
            <span class="category-badge" style="font-size: 11px; font-weight: 700; text-transform: uppercase;">
              ${escapeHtml(post.sub_category || 'ГАЙД')}
            </span>
            <h3>${escapeHtml(post.title)}</h3>
            <span class="btn-look">СМОТРЕТЬ</span>
          </div>
        </a>
      </div>`).join('');

    res.send(`${renderHeader({ title: `Раздел: ${currentTitle}`, bodyClass, session: req.session })}
    <section class="hero" style="background-image: url('${escapeHtml(heroBg)}');">
      <div class="hero-overlay"></div>
      <div class="hero-content"><h1><span>РАЗДЕЛ:</span> ${escapeHtml(currentTitle)}</h1></div>
    </section>
    <main class="main-content">
      <div class="index-grid">
        ${posts.length ? cards : `<div style="grid-column: 1/-1; text-align: center; padding: 100px 0;"><p style="color: #555;">В этом разделе пока пусто.</p></div>`}
      </div>
    </main>
    ${renderFooter()}`);
  } catch (err) { next(err); }
});

// ---------- Просмотр поста ----------
router.get('/post/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) return res.status(404).send('Гайд не найден.');

    const gameTitles = { genshin: 'Genshin Impact', zzz: 'Zenless Zone Zero', wuwa: 'Wuthering Waves', hsr: 'Honkai Star Rail' };
    const displayGame = gameTitles[post.category] || post.category;
    const finalBg = post.banner_wide || resolveImagePath(post.image);
    const themeClass = post.category === 'wuwa' ? 'theme-wuwa' : '';
    // bodyClass — та же карта, что и в /category, чтобы оформление по игре
    // (цвет акцента, шрифт заголовков) применялось и на странице поста, а
    // не только на странице раздела.
    const bodyClass = (GAME_SETTINGS[post.category] && GAME_SETTINGS[post.category].class) || '';
    const isAdmin = req.session.admin === true;

    res.send(`${renderHeader({ title: post.title, bodyClass, session: req.session })}
    <link rel="stylesheet" href="/css/content-styles.css">
    <section class="hero" style="background-image: url('${escapeHtml(finalBg)}');">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <a href="/category?game=${encodeURIComponent(post.category)}" class="back-link" style="color:#fff;text-decoration:none;font-size:0.9rem;opacity:0.8;">
          ← Назад в раздел ${escapeHtml(displayGame)}
        </a>
        <h1 style="margin-top:20px;font-size:3rem;text-transform:uppercase;font-weight:900;">${escapeHtml(post.title)}</h1>
      </div>
    </section>
    <main class="main-content ${themeClass}">
      <div class="post-container-wide" style="max-width:1000px;margin:0 auto;">
        <div class="entry-content">
          ${post.content ? post.content : '<p style="color:#666;font-style:italic;">Содержание этого гайда скоро будет дополнено...</p>'}
        </div>
        ${isAdmin ? `
        <div style="margin-top:50px;padding-top:20px;border-top:1px solid #222;display:flex;justify-content:flex-end;">
          <a href="/edit_post/${post.id}" style="color:#ff4d00;text-decoration:none;font-size:0.8rem;border:1px solid #333;padding:8px 15px;border-radius:4px;">⚙️ РЕДАКТИРОВАТЬ МАТЕРИАЛ</a>
        </div>` : ''}
      </div>
    </main>
    ${renderFooter()}`);
  } catch (err) { next(err); }
});

// ---------- Добавление поста (автономная страница, только админ) ----------
router.get('/add_post', requireAdmin, (req, res) => {
  const options = GAME_OPTIONS.map(g => `<option value="${g}">${GAME_LABELS[g]}</option>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Создать пост — CORE 391</title>
    <link rel="stylesheet" href="/css/style2.css">
    <link rel="stylesheet" href="/css/admin.css">
    <link rel="stylesheet" href="/css/builder-templates.css">
    <link rel="stylesheet" href="/css/admin-editor.css">
    <link rel="stylesheet" href="/css/patches.css">
</head>
<body>

<div class="admin-container">
    <h1>Создать новый гайд / пост</h1>

    <form method="POST" action="/add_post">
        <div class="form-group">
            <label for="title">Заголовок поста:</label>
            <input type="text" id="title" name="title" required placeholder="Например: Гайд на Камелию">
        </div>

        <div class="form-group">
            <label for="game-category">Игра:</label>
            <select id="game-category" name="game_category">${options}</select>
        </div>

        ${templatePanelHtml()}

        <div id="visual-editor" contenteditable="true" class="editor-area">
            <p>Начните писать пост или добавьте готовый блок с помощью кнопок выше...</p>
        </div>

        <input type="hidden" name="content" id="real-content">

        <button type="submit" class="submit-btn">Опубликовать пост</button>
    </form>
</div>
${EDITOR_SCRIPTS}
</body>
</html>`);
});

router.post('/add_post', requireAdmin, async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const game = (req.body.game_category || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) return res.status(400).send('Заполните заголовок и содержание.');

    await pool.query(
      'INSERT INTO posts (title, category, content) VALUES (?, ?, ?)',
      [title, game, content]
    );

    res.redirect('/');
  } catch (err) { next(err); }
});

// ---------- Редактирование поста (автономная страница, только админ) ----------
router.get('/edit_post/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) return res.status(404).send('Пост не найден!');

    const success = req.query.success ? `<div class="success-msg">Изменения успешно сохранены!</div>` : '';
    const options = GAME_OPTIONS.map(g =>
      `<option value="${g}" ${post.category === g ? 'selected' : ''}>${GAME_LABELS[g]}</option>`).join('');

    res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактирование поста #${post.id} — CORE 391</title>
    <link rel="stylesheet" href="/css/style2.css">
    <link rel="stylesheet" href="/css/admin.css">
    <link rel="stylesheet" href="/css/builder-templates.css">
    <link rel="stylesheet" href="/css/admin-editor.css">
    <link rel="stylesheet" href="/css/content-styles.css">
    <link rel="stylesheet" href="/css/patches.css">
</head>
<body>

<div class="admin-container">
    <h1>Редактирование поста #${post.id}</h1>
    ${success}
    <form method="POST" action="/edit_post/${id}">
        <div class="form-group">
            <label>Заголовок поста:</label>
            <input type="text" name="title" value="${escapeHtml(post.title)}" required>
        </div>
        <div class="form-group">
            <label>Игра:</label>
            <select name="game_category">${options}</select>
        </div>

        ${templatePanelHtml()}

        <div id="visual-editor" contenteditable="true" class="editor-area">${post.content || ''}</div>
        <input type="hidden" name="content" id="real-content">

        <button type="submit" class="submit-btn">Сохранить изменения</button>
    </form>
</div>
${EDITOR_SCRIPTS}
</body>
</html>`);
  } catch (err) { next(err); }
});

router.post('/edit_post/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    const title = (req.body.title || '').trim();
    const game = (req.body.game_category || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) return res.status(400).send('Заполните заголовок и содержание.');

    await pool.query('UPDATE posts SET title = ?, category = ?, content = ? WHERE id = ?', [title, game, content, id]);
    res.redirect(`/edit_post/${id}?success=1`);
  } catch (err) { next(err); }
});

module.exports = router;
