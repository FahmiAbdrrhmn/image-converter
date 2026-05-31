const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.createUser(username, hashedPassword);
        
        // Gunakan successResponse
        return successResponse(res, 201, 'Registrasi berhasil');
    } catch (error) {
        // Gunakan errorResponse
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

// Endpoint untuk mengambil data profil terbaru (termasuk kuota)
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await require('../config/db').query('SELECT id, username, tier, quota FROM users WHERE id = ?', [req.user.id]);
        return require('../utils/responseHandler').successResponse(res, 200, 'Profil ditemukan', rows[0]);
    } catch (error) {
        return require('../utils/responseHandler').errorResponse(res, 500, 'Gagal mengambil profil');
    }
};

// Endpoint untuk simulasi Upgrade ke PRO (Sekali Bayar)
exports.upgradeToPro = async (req, res) => {
    try {
        await require('../config/db').query("UPDATE users SET tier = 'pro', quota = 999999 WHERE id = ?", [req.user.id]);
        return require('../utils/responseHandler').successResponse(res, 200, 'Berhasil upgrade ke akun PRO (Lifetime)');
    } catch (error) {
        return require('../utils/responseHandler').errorResponse(res, 500, 'Gagal upgrade');
    }
};

// [PUT] Edit Username Profil
exports.updateProfile = async (req, res) => {
    try {
        const { newUsername } = req.body;
        
        if (!newUsername) {
            return require('../utils/responseHandler').errorResponse(res, 400, 'Username baru tidak boleh kosong');
        }

        // Cek apakah username baru sudah dipakai oleh orang lain
        const [existing] = await require('../config/db').query('SELECT id FROM users WHERE username = ?', [newUsername]);
        if (existing.length > 0) {
            return require('../utils/responseHandler').errorResponse(res, 400, 'Username tersebut sudah digunakan orang lain');
        }

        // Update username di database
        await require('../config/db').query('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.user.id]);
        
        return require('../utils/responseHandler').successResponse(res, 200, 'Username berhasil diperbarui', { username: newUsername });
    } catch (error) {
        return require('../utils/responseHandler').errorResponse(res, 500, 'Gagal memperbarui profil');
    }
};

// [DELETE] Hapus Akun Pengguna
exports.deleteProfile = async (req, res) => {
    try {
        // Hapus baris user berdasarkan ID yang ada di token JWT
        await require('../config/db').query('DELETE FROM users WHERE id = ?', [req.user.id]);
        
        return require('../utils/responseHandler').successResponse(res, 200, 'Akun Anda berhasil dihapus secara permanen');
    } catch (error) {
        return require('../utils/responseHandler').errorResponse(res, 500, 'Gagal menghapus akun');
    }
};