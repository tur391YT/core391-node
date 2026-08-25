# CORE 391 — Node.js версия

Полная переработка сайта с PHP на Node.js (Express + MySQL). Без REST API и без
шаблонизаторов — сервер сам генерирует HTML-страницы, как раньше делал PHP.

## Установка

1. Установи зависимости:
   ```bash
   npm install
   ```

2. Создай базу данных:
   ```bash
   mysql -u root -p < schema.sql
   ```

3. Скопируй `.env.example` в `.env` и заполни своими данными:
   ```bash
   cp .env.example .env
   ```
   Обязательно смени `SESSION_SECRET` на случайную строку:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Создай первого админа (регистрируешься на сайте под ником `tur391` —
   права админа выдаются по этому нику, как и в оригинальном PHP-коде).

5. Положи свои картинки в `public/img/` (`banner.png`,
   `default-banner.png`, `avatars/default.jpg`, `banners/default.jpg`) —
   в исходных PHP-файлах на них были ссылки, но сами файлы не входили в
   переданный набор.

6. Запусти сервер:
   ```bash
   npm start        # обычный запуск
   npm run dev       # с автоперезапуском через nodemon
   ```

Сайт поднимется на `http://localhost:3000`.

## Соответствие маршрутов старым PHP-файлам

| Было (PHP)                  | Стало (Node)              |
|------------------------------|----------------------------|
| `index.php`                  | `GET /`                    |
| `login.php` / `auth_handler.php?action=login` | `GET/POST /login` |
| `register.php`               | `GET/POST /register`       |
| `logout.php`                 | `GET /logout`               |
| `category.php?game=...`      | `GET /category?game=...`   |
| `post.php?id=...`            | `GET /post/:id`             |
| `add_post.php`               | `GET/POST /add_post` (только админ) |
| `edit_post.php?id=...`       | `GET/POST /edit_post/:id` (только админ) |
| `profile.php?u=...`          | `GET /profile?u=...`        |
| `update_profile.php`         | `POST /update_profile`      |

## Что изменилось по сравнению с оригиналом (осознанно, в сторону безопасности)

- **Пароли**: новые пароли сразу хешируются через `bcrypt`. Старые
  MD5-хеши (если будешь переносить пользователей из старой БД) при первом
  успешном входе автоматически мигрируют на bcrypt — как и раньше, вход
  сработает.
- **XSS**: во всех местах, где PHP выводил `avatar`/`banner`/`status` без
  `htmlspecialchars`, здесь стоит экранирование (`escapeHtml`). Содержимое
  постов (`post.content`) по-прежнему вставляется как есть — это осознанно,
  т.к. это HTML из твоего собственного визуального редактора, доступного
  только админу. Если когда-нибудь дашь возможность писать посты не-админам —
  обязательно прогони контент через санитайзер (например `dompurify`).
- **Загрузка файлов**: теперь проверяется, что аватар/баннер — реально
  картинка (по MIME-типу через `multer`), а не любой файл, как раньше
  принимал `move_uploaded_file` в PHP. Ограничение — 5 МБ.
- **Права админа**: сохранено то же поведение, что было в PHP — админ
  определяется по нику `tur391`, захардкоженному в `routes/auth.js`. Это
  быстро работает для одного владельца сайта, но негибко и небезопасно при
  росте проекта — рекомендую позже добавить колонку `is_admin` в таблицу
  `users` и переключиться на неё.

## Соответствие структуры файлов твоему PHP-проекту

Структура `public/` и `routes/` пересобрана под твою реальную папку `Core_391`:

| Было (PHP)                        | Стало (Node)                        |
|-------------------------------------|---------------------------------------|
| `config/database.php`               | `config/db.js`                        |
| `includes/header.php` / `footer.php`| `lib/render.js` (renderHeader/renderFooter) |
| `css/style2.css`                    | `public/css/style2.css`               |
| `css/header-new.css`                | `public/css/header-new.css`           |
| `css/footer.css`                    | `public/css/footer.css`               |
| `css/auth.css`                      | `public/css/auth.css`                 |
| `css/profile.css`                   | `public/css/profile.css`              |
| `css/admin.css`                     | `public/css/admin.css`                |
| `css/builder-templates.css`         | `public/css/builder-templates.css`    |
| `css/admin-editor.css`              | `public/css/admin-editor.css`         |
| `css/content-styles.css`            | `public/css/content-styles.css`       |
| `js/admin-core.js`                  | `public/js/admin-core.js` (теперь просто синхронизирует редактор с формой) |
| `js/editor-templates.js`            | `public/js/editor-templates.js`       |
| `js/editor.js`                      | `public/js/editor.js`                 |
| `js/profile.js`                     | `public/js/profile.js`                |
| `img/`, `img/avatars/`, `img/banners/` | `public/img/...` (те же подпапки)  |

Важно: **`login.php`, `register.php`, `add_post.php`, `edit_post.php` в оригинале — автономные страницы**, они НЕ подключают `includes/header.php`/`footer.php` (у них свой `<head>` со своими стилями). Node-версия это повторяет: роуты `/login`, `/register`, `/add_post`, `/edit_post/:id` рендерят страницу целиком сами, без общей шапки/подвала сайта. А вот `/`, `/category`, `/post/:id`, `/profile` — используют общий header/footer, как и `index.php`/`category.php`/`post.php`/`profile.php` в оригинале.

## Что нужно донести самому

- В присланных PHP-файлах не было `includes/header.php`, `includes/footer.php`,
  файлов `css/*.css` и `admin-core.js` — их содержимого я не видел, поэтому
  шапка/подвал (`lib/render.js`), стили (`public/css/*.css`) и логика
  визуального редактора (`public/js/admin-core.js`) написаны с нуля в похожей
  стилистике (тёмная тема, оранжевый акцент). Функционально всё работает,
  но визуально может отличаться от твоего текущего сайта — донастрой цвета/
  вёрстку под себя.
- Реальные изображения (баннеры игр можно оставить как есть — они по прямым
  ссылкам на pinimg.com; но `img/banner.png`, `default-banner.png`,
  дефолтные аватар/баннер профиля — нужно положить самому).

## Структура проекта

```
core391-node/
├── server.js              # точка входа
├── schema.sql              # структура БД
├── config/db.js            # пул соединений MySQL
├── middleware/auth.js      # requireAdmin, requireLogin
├── lib/render.js           # header/footer, escapeHtml, resolveImagePath
├── routes/
│   ├── auth.js              # login/register/logout
│   ├── posts.js             # главная, категории, посты, add/edit
│   └── profile.js           # профиль + загрузка аватара/баннера
└── public/
    ├── css/                 # style.css, admin.css, content-styles.css, profile.css
    ├── js/                  # slider.js, profile-tabs.js, admin-core.js
    └── img/                 # avatars/, banners/, icons/
```
