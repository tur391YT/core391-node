CREATE DATABASE IF NOT EXISTS core_391 CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE core_391;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- bcrypt-хеш (старые md5-хеши мигрируют автоматически при входе)
  avatar VARCHAR(255) DEFAULT 'img/avatars/default.jpg',
  status TEXT DEFAULT NULL,
  reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  banner VARCHAR(255) DEFAULT 'img/banners/default.jpg',
  bio TEXT DEFAULT NULL,
  birth_date DATE DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  banner_pos_y INT DEFAULT 50,
  avatar_pos_x INT DEFAULT 0,
  avatar_pos_y INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  banner_wide TEXT DEFAULT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,           -- genshin / wuwa / hsr / zzz
  sub_category VARCHAR(50) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT '#ff4d00'
);

-- Примечание: таблица categories пока не используется Node-кодом напрямую —
-- разделы сайта (Genshin/ZZZ/HSR/Wuwa) захардкожены в routes/posts.js
-- (GAME_SETTINGS, GAME_LABELS, GAME_BANNERS). Если нужно брать разделы
-- динамически из этой таблицы — дай знать, это несложно доработать.

-- Права админа выдаются жёстко по условию username === 'tur391'
-- (см. routes/auth.js) — как и было в оригинальном PHP-коде.
