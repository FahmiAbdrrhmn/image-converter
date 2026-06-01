const db = require('../config/db');

const createUser = async (username, hashedPassword) => {
    const [result] = await db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)', 
        [username, hashedPassword]
    );
    return result;
};

const findUserByUsername = async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

module.exports = { createUser, findUserByUsername };