require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');

const app = express();

// Лимит по умолчанию у express.urlencoded — всего 100kb, этого не хватает,
// если в тексте поста есть картинка, вставленная через Ctrl+V (она кодируется
// в base64 прямо внутри формы и легко может весить несколько МБ).
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 дней
    // secure: true, // включи, когда сайт будет работать по HTTPS
  }
}));

// Статика: /css/*, /js/*, /img/*
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', postsRoutes);
app.use('/', profileRoutes);

app.use((req, res) => {
  res.status(404).send('<h1>404 — Страница не найдена</h1><p><a href="/">На главную</a></p>');
});

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('<h1>500 — Ошибка сервера</h1>');
});

const PORT = process.env.PORT || 3000;

// Автоматическая миграция БД при старте — раньше content был TEXT (лимит
// ~64 КБ), чего не хватает под картинки, вставленные через Ctrl+V (base64).
// Расширяем до LONGTEXT. Выполнять повторно безопасно — если колонка уже
// LONGTEXT, запрос просто ничего не меняет.
async function runMigrations() {
  try {
    await pool.query('ALTER TABLE posts MODIFY content LONGTEXT NOT NULL');
    console.log('Миграция БД: content -> LONGTEXT — готово.');
  } catch (err) {
    console.error('Не удалось выполнить миграцию content -> LONGTEXT:', err.message);
  }
}

runMigrations().then(() => {
  app.listen(PORT, () => console.log(`CORE 391 запущен на http://localhost:${PORT}`));
});
