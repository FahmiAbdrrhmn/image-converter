const db = require('../config/db');

const createHistory = async (userId, filename, fileSize, status) => {
    const [result] = await db.query(
        'INSERT INTO conversion_history (user_id, filename, file_size, status) VALUES (?, ?, ?, ?)',
        [userId, filename, fileSize, status]
    
    );
    return result;
};

//funct ambil riwayat konvert by user
const getHistoryByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id, filename, file_size, status, created_at FROM conversion_history WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    return rows;
};

//hapus all riwayat user
const deleteHistoryByUserId = async (userId) => {
    const [result] = await db.query('DELETE FROM conversion_history WHERE user_id = ?', [userId]);
};

module.exports = { createHistory, getHistoryByUserId, deleteHistoryByUserId };
