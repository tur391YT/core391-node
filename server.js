require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
app.listen(PORT, () => console.log(`CORE 391 запущен на http://localhost:${PORT}`));
