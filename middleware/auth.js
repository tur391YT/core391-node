function requireAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  return res.status(403).send('<h1>403 — Доступ запрещён</h1><p><a href="/login">Войти</a></p>');
}

function requireLogin(req, res, next) {
  if (req.session && req.session.user_id) return next();
  return res.redirect('/login');
}

module.exports = { requireAdmin, requireLogin };
