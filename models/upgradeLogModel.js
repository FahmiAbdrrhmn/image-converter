const db = require('../config/db');

//save log upgrd
const createUpgradeLog = async (userId, method = 'manual') => {
    const [result] = await db.query(
        'INSERT INTO upgrade_logs (user_id, method) VALUES (?, ?)',
        [userId, method]
    );
    return result;
};

//ambil log upgrd user
const getUpgradeLogsByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id, method, upgraded_at FROM upgrade_logs WHERE user_id = ? ORDER BY upgraded_at DESC',
        [userId]
    );
    return rows;
}

module.exports = { createUpgradeLog, getUpgradeLogsByUserId };