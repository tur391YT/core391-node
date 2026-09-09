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

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(20) NOT NULL,
        post_id INT DEFAULT NULL,
        post_title VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Миграция БД: таблица activity_log — готово.');
  } catch (err) {
    console.error('Не удалось создать таблицу activity_log:', err.message);
  }

  try {
    await pool.query('ALTER TABLE posts ADD COLUMN banner_pos_y INT DEFAULT 50');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Не удалось добавить posts.banner_pos_y:', err.message);
    }
  }

  // Разовая подстановка задним числом: старые посты (созданные ещё до
  // появления activity_log) не попадали бы во вкладку "Посты" в профиле,
  // потому что для них нет записи action='created'. Записываем такую
  // запись от имени tur391 для всех постов, у которых её ещё нет.
  // Безопасно выполнять повторно — уже учтённые посты не трогает.
  try {
    const [[adminUser]] = await pool.query(
      "SELECT id FROM users WHERE username = 'tur391' LIMIT 1"
    );
    if (adminUser) {
      await pool.query(
        `INSERT INTO activity_log (user_id, action, post_id, post_title, created_at)
         SELECT ?, 'created', posts.id, posts.title, posts.date
         FROM posts
         WHERE posts.id NOT IN (
           SELECT post_id FROM activity_log WHERE action = 'created' AND post_id IS NOT NULL
         )`,
        [adminUser.id]
      );
      console.log('Миграция БД: старые посты подставлены в activity_log — готово.');
    }
  } catch (err) {
    console.error('Не удалось выполнить подстановку старых постов в activity_log:', err.message);
  }
}

runMigrations().then(() => {
  app.listen(PORT, () => console.log(`CORE 391 запущен на http://localhost:${PORT}`));
});
