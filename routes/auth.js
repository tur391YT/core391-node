const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { escapeHtml } = require('../lib/render');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// Ники, которым выдаются права админа.
const ADMIN_USERNAMES = ['tur391', 'pzwt4cc'];

function authPage({ title, formHtml, errorHtml = '' }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="/css/style2.css">
    <link rel="stylesheet" href="/css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-box">
            ${errorHtml}
            ${formHtml}
        </div>
    </div>
</body>
</html>`;
}

router.get('/login', (req, res) => {
  res.send(authPage({
    title: 'Вход | CORE 391',
    formHtml: `
      <h2>Вход</h2>
      <form action="/login" method="POST">
        <input type="text" name="username" class="auth-input" placeholder="Никнейм" required>
        <input type="password" name="password" class="auth-input" placeholder="Пароль" required>
        <button type="submit" class="auth-btn">ВОЙТИ В СИСТЕМУ</button>
      </form>
      <a href="/register" class="auth-link">Нет аккаунта? Зарегистрироваться</a>`
  }));
});

router.post('/login', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).send(authPage({
        title: 'Вход | CORE 391',
        errorHtml: '<div class="auth-error">Пользователь не найден!</div>',
        formHtml: `
          <h2>Вход</h2>
          <form action="/login" method="POST">
            <input type="text" name="username" class="auth-input" placeholder="Никнейм" required>
            <input type="password" name="password" class="auth-input" placeholder="Пароль" required>
            <button type="submit" class="auth-btn">ВОЙТИ В СИСТЕМУ</button>
          </form>
          <a href="/register" class="auth-link">Нет аккаунта? Зарегистрироваться</a>`
      }));
    }

    let ok = false;

    if (user.password.startsWith('$2')) {
      ok = await bcrypt.compare(password, user.password);
    } else if (md5(password) === user.password) {
      // Старый md5-хеш (наследие от PHP) — принимаем и сразу мигрируем на bcrypt
      ok = true;
      const newHash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
    }

    if (!ok) {
      return res.status(401).send(authPage({
        title: 'Вход | CORE 391',
        errorHtml: '<div class="auth-error">Неверный пароль!</div>',
        formHtml: `
          <h2>Вход</h2>
          <form action="/login" method="POST">
            <input type="text" name="username" class="auth-input" placeholder="Никнейм" required>
            <input type="password" name="password" class="auth-input" placeholder="Пароль" required>
            <button type="submit" class="auth-btn">ВОЙТИ В СИСТЕМУ</button>
          </form>
          <a href="/register" class="auth-link">Нет аккаунта? Зарегистрироваться</a>`
      }));
    }

    req.session.user_id = user.id;
    req.session.user_name = user.username;
    if (user.avatar) req.session.user_avatar = user.avatar;
    // ВЫДАЁМ ПРАВА АДМИНА — как и в оригинале, по никнейму.
    req.session.admin = ADMIN_USERNAMES.includes(user.username);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера при входе.');
  }
});

router.get('/register', (req, res) => {
  res.send(authPage({
    title: 'Регистрация | CORE 391',
    formHtml: `
      <h2>Регистрация</h2>
      <form action="/register" method="POST">
        <input type="text" name="username" class="auth-input" placeholder="Введите никнейм" required>
        <input type="password" name="password" class="auth-input" placeholder="Придумайте пароль" required>
        <button type="submit" class="auth-btn">СОЗДАТЬ АККАУНТ</button>
      </form>
      <a href="/login" class="auth-link">Уже есть аккаунт? Войти</a>`
  }));
});

router.post('/register', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    const rerender = (message) => authPage({
      title: 'Регистрация | CORE 391',
      errorHtml: `<div class="auth-error">${message}</div>`,
      formHtml: `
        <h2>Регистрация</h2>
        <form action="/register" method="POST">
          <input type="text" name="username" class="auth-input" placeholder="Введите никнейм" required value="${escapeHtml(username)}">
          <input type="password" name="password" class="auth-input" placeholder="Придумайте пароль" required>
          <button type="submit" class="auth-btn">СОЗДАТЬ АККАУНТ</button>
        </form>
        <a href="/login" class="auth-link">Уже есть аккаунт? Войти</a>`
    });

    if (!username || !password) return res.status(400).send(rerender('Заполните все поля.'));
    if (password.length < 6) return res.status(400).send(rerender('Пароль должен быть не короче 6 символов.'));

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).send(rerender('Такой никнейм уже занят.'));

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, reg_date) VALUES (?, ?, NOW())',
      [username, hash]
    );

    req.session.user_id = result.insertId;
    req.session.user_name = username;
    req.session.admin = ADMIN_USERNAMES.includes(username);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера при регистрации.');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
