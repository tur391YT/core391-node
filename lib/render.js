function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Приводит путь картинки к валидному URL — аналог логики resolveImagePath из PHP
function resolveImagePath(img) {
  if (!img) return '/img/default-banner.png';
  const isUrl = /^https?:\/\//i.test(img);
  if (isUrl) return img;
  if (img.startsWith('/')) return img;
  if (img.startsWith('img/')) return '/' + img;
  return '/img/' + img;
}

// Портировано 1-в-1 из твоего includes/header.php
function renderHeader({ title = '', bodyClass = 'default', session = {} } = {}) {
  const isLoggedIn = !!session.user_name;
  const isAdmin = session.admin === true;
  const currentAvatar = resolveImagePath(session.user_avatar);
  const pageTitle = title ? `${escapeHtml(title)} — CORE 391` : 'CORE 391';
  const cacheBust = Date.now();

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <link rel="stylesheet" href="/css/style2.css?v=${cacheBust}">
    <link rel="stylesheet" href="/css/header-new.css?v=${cacheBust}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        header { background: #000; border-bottom: 1px solid #1a1a1a; padding: 10px 0; min-height: 70px; }
        .header-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .nav-links { display: flex; list-style: none; gap: 20px; align-items: center; margin: 0; padding: 0; }
        .nav-links a { color: #fff; text-decoration: none; font-size: 13px; font-weight: bold; }
        .header-profile-box { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 5px 15px; border-radius: 20px; }
        .header-mini-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #ff4d00; }
        .header-username { color: #fff; font-weight: bold; text-transform: uppercase; }
        .nav-links a:hover { color: #ff4d00; }
        .admin-badge { color: #ff4d00; border: 1px solid #ff4d00; padding: 4px 8px; border-radius: 4px; font-size: 10px; margin-left: 5px; }
    </style>
</head>
<body class="${escapeHtml(bodyClass)}">
<header>
    <div class="header-container">
        <a href="/" class="logo">
            <img src="/img/logo.png" alt="CORE 391" style="height: 40px;">
        </a>
        <nav>
            <ul class="nav-links">
                <li><a href="/">ГЛАВНАЯ</a></li>
                <li><a href="/category?game=genshin">GENSHIN IMPACT</a></li>
                <li><a href="/category?game=zzz">ZENLESS ZONE ZERO</a></li>
                <li><a href="/category?game=hsr">HONKAI STAR RAIL</a></li>
                <li><a href="/category?game=wuwa">WUTHERING WAVES</a></li>

                ${isAdmin ? `<li><a href="/add_post" style="color: #ff4d00; background: rgba(255, 77, 0, 0.1); padding: 8px 15px; border-radius: 6px; border: 1px solid #ff4d00;">+ СОЗДАТЬ</a></li>` : ''}

                <li class="header-user-section">
                    ${isLoggedIn ? `
                        <a href="/profile?u=${encodeURIComponent(session.user_name)}" class="header-profile-box">
                            <img src="${escapeHtml(currentAvatar)}" alt="Ava" class="header-mini-avatar">
                            <span class="header-username">${escapeHtml(session.user_name)}</span>
                        </a>` : `
                        <div class="auth-guest-links">
                            <a href="/login" class="nav-auth-link">ВХОД</a>
                        </div>`}
                </li>
            </ul>
        </nav>
    </div>
</header>
`;
}

// Портировано 1-в-1 из твоего includes/footer.php
function renderFooter() {
  return `
<link rel="stylesheet" href="/css/footer.css">
<footer class="main-footer">
    <div class="footer-centered-content">
        <p>&copy; ${new Date().getFullYear()} CORE 391. Все права защищены.</p>
    </div>
</footer>

<style>
    .main-footer {
        width: 100%;
        padding: 40px 0;
        background: #050505;
        border-top: 1px solid #1a1a1a;
        margin-top: 60px;
    }

    .footer-centered-content {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .footer-centered-content p {
        color: #555;
        font-size: 14px;
        letter-spacing: 1px;
        margin: 0;
    }
</style>

<script>
    // Скрипт для аккордеонов
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => header.parentElement.classList.toggle('active');
    });
</script>

</body>
</html>`;
}

module.exports = { renderHeader, renderFooter, escapeHtml, resolveImagePath };
