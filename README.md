# CORE 391 — Node.js версия

Полная переработка сайта с PHP на Node.js (Express + MariaDB/MySQL). Без REST API и без шаблонизаторов — сервер сам генерирует HTML-страницы.

## Быстрый старт

1. Установи зависимости:
```bash
npm install
```

2. Разверни базу данных из файла дампов:
```bash
mysql -u root -p < core_391.sql
```

3. Запусти сервер:
```bash
npm start        # обычный запуск
npm run dev       # с автоперезапуском через nodemon
```

Сайт поднимется на http://localhost:3000.

## Соответствие маршрутов

Действие / Страница,Маршрут (Node)
Главная страница,GET /
Авторизация / Вход,GET/POST /login
Регистрация,GET/POST /register
Выход,GET /logout
Страница категорий,GET /category?game=...
Просмотр поста,GET /post/:id
Добавить пост,GET/POST /add_post (только админ)
Редактировать пост,GET/POST /edit_post/:id (только админ)
Профиль пользователя,GET /profile?u=...
Обновление профиля,POST /update_profile

## Структура проекта

```bash
core391-node/
├── server.js              # точка входа
├── core_391.sql           # дамп базы данных
├── schema.sql             # структура БД (исходная)
├── config/db.js           # пул соединений с базой
├── middleware/auth.js     # проверка прав (requireAdmin, requireLogin)
├── lib/render.js          # рендеринг шапки/подвала, экранирование
├── routes/
│   ├── auth.js            # логин, регистрация, выход
│   ├── posts.js           # посты, лента, категории, админка
│   └── profile.js         # профиль и загрузка медиа
└── public/
    ├── css/               # таблицы стилей
    ├── js/                # скрипты интерфейса и редактора
    └── img/               # изображения (аватары, баннеры, иконки)
```