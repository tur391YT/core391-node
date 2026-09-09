const pool = require('../config/db');

/**
 * Записывает действие в журнал активности (для вкладки "Обзор" в профиле).
 * action: 'viewed' | 'created' | 'edited'
 * Ошибки записи активности не должны ронять основной запрос — поэтому
 * тут свой try/catch, вызывающий код может просто не дожидаться (await
 * не обязателен).
 */
async function logActivity(userId, action, postId, postTitle) {
  if (!userId) return;
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, post_id, post_title) VALUES (?, ?, ?, ?)',
      [userId, action, postId || null, postTitle || null]
    );
  } catch (err) {
    console.error('Не удалось записать активность:', err.message);
  }
}

module.exports = { logActivity };
