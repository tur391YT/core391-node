const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const pool = require('../config/db');
const { renderHeader, renderFooter, escapeHtml, resolveImagePath } = require('../lib/render');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'avatar'
      ? path.join(__dirname, '..', 'public', 'img', 'avatars')
      : path.join(__dirname, '..', 'public', 'img', 'banners');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${safeExt}`);
  }
});

// Разрешаем только реальные изображения — так закрываем дыру из оригинального
// PHP-кода, где move_uploaded_file принимал файл с любым содержимым.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, ALLOWED_MIME.includes(file.mimetype))
});

router.get('/profile', async (req, res, next) => {
  try {
    const requested = req.query.u;

    if (!requested) {
      if (req.session.user_name) return res.redirect(`/profile?u=${encodeURIComponent(req.session.user_name)}`);
      return res.redirect('/login');
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [requested]);
    const user = rows[0];
    if (!user) return res.status(404).send('Пользователь не найден');

    const isOwner = req.session.user_name === user.username;
    if (isOwner) req.session.user_avatar = user.avatar || req.session.user_avatar;

    const avatarUrl = resolveImagePath(user.avatar || 'img/avatars/default.jpg');
    const bannerUrl = resolveImagePath(user.banner || 'img/banners/default.jpg');
    const status = user.status || 'CONTENT CREATOR';
    const regDate = user.reg_date ? new Date(user.reg_date).toLocaleDateString('ru-RU') : '';
    const bY = user.banner_pos_y ?? 50;
    const aX = user.avatar_pos_x ?? 0;
    const aY = user.avatar_pos_y ?? 0;
    const successMsg = req.query.success ? `<div class="success-msg">Профиль обновлён!</div>` : '';

    const settingsBlock = isOwner ? `
      <div class="tab-content" id="settings">
        <div class="content-block">
          <h3 class="block-title">Настройки профиля</h3>
          ${successMsg}
          <form class="settings-form" action="/update_profile" method="POST" enctype="multipart/form-data">
            <h4 class="mini-title">Внешний вид</h4>
            <div class="form-group">
              <label>Позиция баннера (Вертикаль)</label>
              <input type="range" name="banner_y" min="0" max="100" value="${bY}"
                     oninput="document.documentElement.style.setProperty('--banner-y', this.value + '%')">
            </div>
            <div class="form-group">
              <label>Смещение аватара (X / Y)</label>
              <div style="display:flex; gap:10px;">
                <input type="range" name="av_x" min="-100" max="100" value="${aX}"
                       oninput="document.documentElement.style.setProperty('--av-x', this.value + 'px')">
                <input type="range" name="av_y" min="-50" max="50" value="${aY}"
                       oninput="document.documentElement.style.setProperty('--av-y', this.value + 'px')">
              </div>
            </div>
            <h4 class="mini-title">Данные</h4>
            <div class="form-group">
              <label>Никнейм</label>
              <input type="text" name="nickname" value="${escapeHtml(user.username)}">
            </div>
            <div class="form-group">
              <label>Статус</label>
              <textarea name="status" rows="3" class="status-textarea">${escapeHtml(status)}</textarea>
            </div>
            <div class="form-group">
              <label>Пол</label>
              <select name="gender">
                <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Мужской (♂)</option>
                <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Женский (♀)</option>
              </select>
            </div>
            <h4 class="mini-title">Медиа</h4>
            <div class="form-group"><label>Загрузить Аватар</label><input type="file" name="avatar" accept="image/*"></div>
            <div class="form-group"><label>Загрузить Баннер</label><input type="file" name="banner" accept="image/*"></div>
            <button type="submit" class="btn-look" style="margin-top:15px;width:100%;">СОХРАНИТЬ ИЗМЕНЕНИЯ</button>
          </form>
        </div>
      </div>` : '';

    res.send(`${renderHeader({ title: `${user.username} | CORE 391`, session: req.session })}
    <style>
      :root { --banner-y: ${bY}%; --av-x: ${aX}px; --av-y: ${aY}px; }
    </style>
    <link rel="stylesheet" href="/css/profile.css">
    <main class="main-content">
      <div class="profile-layout">
        <div class="profile-header-card">
          <div class="profile-banner" style="background-image: url('${escapeHtml(bannerUrl)}');"></div>
          <div class="header-info-row">
            <div class="avatar-stack">
              <img src="${escapeHtml(avatarUrl)}" alt="Avatar" class="profile-avatar">
              <div class="user-level-badge">25</div>
            </div>
            <div class="user-info-text">
              <div class="name-row" style="display:flex;align-items:center;gap:8px;">
                <h2 style="margin:0;">${escapeHtml(user.username)}</h2>
                <span class="gender-icon" style="font-size:1.2rem;color:#ff4d00;">${user.gender === 'female' ? '♀' : '♂'}</span>
                ${user.special_icon ? `<img src="/img/icons/${escapeHtml(user.special_icon)}.png" class="verify-badge" title="Подтверждённый аккаунт">` : ''}
              </div>
              <div class="status-under-name">${escapeHtml(status)}</div>
            </div>
          </div>
        </div>

        <div class="profile-grid">
          <div class="main-side">
            <nav class="inner-nav">
              <button class="nav-btn active" data-tab="overview">Обзор</button>
              <button class="nav-btn" data-tab="posts">Посты</button>
              ${isOwner ? `<button class="nav-btn" data-tab="settings">Настройки</button>` : ''}
            </nav>

            <div class="tab-content active" id="overview">
              <div class="content-block">
                <h3 class="block-title">Последняя активность</h3>
                <div class="activity-item"><span class="activity-date">—</span><p>Пока нет активности.</p></div>
              </div>
            </div>

            <div class="tab-content" id="posts">
              <div class="content-block">
                <h3 class="block-title">Публикации</h3>
                <p style="color:#444;">Здесь пока ничего нет...</p>
              </div>
            </div>

            ${settingsBlock}
          </div>

          <aside class="info-side">
            <div class="side-block">
              <h4 class="block-title">Информация</h4>
              <ul class="user-details"><li><span>В системе с:</span> <strong>${escapeHtml(regDate)}</strong></li></ul>
            </div>
            ${isOwner ? `<a href="/logout" class="logout-btn-simple">Выйти из системы</a>` : ''}
          </aside>
        </div>
      </div>
    </main>
    <script src="/js/profile.js"></script>
    ${renderFooter()}`);
  } catch (err) { next(err); }
});

router.post('/update_profile', (req, res, next) => {
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }])(req, res, (err) => {
    if (err) return res.status(400).send('Не удалось загрузить файл: ' + err.message);
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.session.user_id) return res.redirect('/login');

    const userId = req.session.user_id;
    const nickname = req.body.nickname || req.session.user_name;
    const status = req.body.status || 'CONTENT CREATOR';
    const gender = req.body.gender || 'male';
    const bannerY = parseInt(req.body.banner_y, 10) || 50;
    const avX = parseInt(req.body.av_x, 10) || 0;
    const avY = parseInt(req.body.av_y, 10) || 0;

    await pool.query(
      `UPDATE users SET username = ?, status = ?, gender = ?, banner_pos_y = ?, avatar_pos_x = ?, avatar_pos_y = ? WHERE id = ?`,
      [nickname, status, gender, bannerY, avX, avY, userId]
    );

    req.session.user_name = nickname;

    if (req.files && req.files.banner) {
      const bannerPath = `img/banners/${req.files.banner[0].filename}`;
      await pool.query('UPDATE users SET banner = ? WHERE id = ?', [bannerPath, userId]);
    }

    if (req.files && req.files.avatar) {
      const avatarPath = `img/avatars/${req.files.avatar[0].filename}`;
      await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);
      req.session.user_avatar = avatarPath;
    }

    res.redirect(`/profile?u=${encodeURIComponent(nickname)}&success=1`);
  } catch (err) { next(err); }
});

module.exports = router;
