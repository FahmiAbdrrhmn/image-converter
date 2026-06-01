const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { createUpgradeLog, getUpgradeLogsByUserId } = require('../models/upgradeLogModel');
const { getHistoryByUserId } = require('../models/conversionHistoryModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.createUser(username, hashedPassword);
        return successResponse(res, 201, 'Registrasi berhasil');
    } catch (error) {
        return errorResponse(res, 500, 'Gagal registrasi', error.message);
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return errorResponse(res, 401, 'Kredensial salah');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, tier: user.tier },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return successResponse(res, 200, 'Login berhasil', {
            token,
            tier: user.tier
        });
    } catch (error) {
        return errorResponse(res, 500, 'Server error');
    }
};

// [GET] Profil lengkap + riwayat konversi + log upgrade
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, tier, quota, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return errorResponse(res, 404, 'User tidak ditemukan');

        const conversionHistory = await getHistoryByUserId(req.user.id);
        const upgradeLogs = await getUpgradeLogsByUserId(req.user.id);

        return successResponse(res, 200, 'Profil ditemukan', {
            ...rows[0],
            conversion_history: conversionHistory,
            upgrade_logs: upgradeLogs
        });
    } catch (error) {
        return errorResponse(res, 500, 'Gagal mengambil profil');
    }
};

// [PUT] Edit Username
exports.updateProfile = async (req, res) => {
    try {
        const { newUsername } = req.body;

        if (!newUsername) {
            return errorResponse(res, 400, 'Username baru tidak boleh kosong');
        }

        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [newUsername]);
        if (existing.length > 0) {
            return errorResponse(res, 400, 'Username tersebut sudah digunakan orang lain');
        }

        await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.user.id]);
        return successResponse(res, 200, 'Username berhasil diperbarui', { username: newUsername });
    } catch (error) {
        return errorResponse(res, 500, 'Gagal memperbarui profil');
    }
};

// [DELETE] Hapus Akun (cascade otomatis hapus history & upgrade_logs)
exports.deleteProfile = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
        return successResponse(res, 200, 'Akun Anda berhasil dihapus secara permanen');
    } catch (error) {
        return errorResponse(res, 500, 'Gagal menghapus akun');
    }
};

// [POST] Upgrade ke PRO + catat log
exports.upgradeToPro = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT tier FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return errorResponse(res, 404, 'User tidak ditemukan');
        if (rows[0].tier === 'pro') {
            return errorResponse(res, 400, 'Akun Anda sudah berstatus PRO');
        }

        await db.query("UPDATE users SET tier = 'pro', quota = 999999 WHERE id = ?", [req.user.id]);
        await createUpgradeLog(req.user.id, 'manual');

        return successResponse(res, 200, 'Berhasil upgrade ke akun PRO (Lifetime)');
    } catch (error) {
        return errorResponse(res, 500, 'Gagal upgrade');
    }
};

// [GET] Riwayat konversi saja
exports.getConversionHistory = async (req, res) => {
    try {
        const history = await getHistoryByUserId(req.user.id);
        return successResponse(res, 200, 'Riwayat konversi ditemukan', history);
    } catch (error) {
        return errorResponse(res, 500, 'Gagal mengambil riwayat konversi');
    }
};

// [GET] Log upgrade saja
exports.getUpgradeLogs = async (req, res) => {
    try {
        const logs = await getUpgradeLogsByUserId(req.user.id);
        return successResponse(res, 200, 'Log upgrade ditemukan', logs);
    } catch (error) {
        return errorResponse(res, 500, 'Gagal mengambil log upgrade');
    }
};
