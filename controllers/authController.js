const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const db = require('../config/db'); // Pastikan db di-import untuk query transaksi

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
        const [rows] = await db.query('SELECT id, username, tier, quota FROM users WHERE id = ?', [req.user.id]);
        return successResponse(res, 200, 'Profil ditemukan', rows[0]);
    } catch (error) {
        return errorResponse(res, 500, 'Gagal mengambil profil');
    }
};

// Endpoint untuk simulasi Upgrade ke PRO (Sekali Bayar)
exports.upgradeToPro = async (req, res) => {
    try {
        // 1. Update status akun pengguna menjadi PRO
        await db.query("UPDATE users SET tier = 'pro', quota = 999999 WHERE id = ?", [req.user.id]);
        
        // 2. TAMBAHAN: Catat data transaksi pembayaran ke tabel 'transactions'
        await db.query(
            "INSERT INTO transactions (user_id, amount, payment_method, status) VALUES (?, ?, ?, ?)", 
            [req.user.id, 50000.00, 'Simulasi', 'success']
        );

        return successResponse(res, 200, 'Berhasil upgrade ke akun PRO (Lifetime)');
    } catch (error) {
        return errorResponse(res, 500, 'Gagal upgrade');
    }
};

// [PUT] Edit Username Profil
exports.updateProfile = async (req, res) => {
    try {
        const { newUsername } = req.body;
        
        if (!newUsername) {
            return errorResponse(res, 400, 'Username baru tidak boleh kosong');
        }

        // Cek apakah username baru sudah dipakai oleh orang lain
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [newUsername]);
        if (existing.length > 0) {
            return errorResponse(res, 400, 'Username tersebut sudah digunakan orang lain');
        }

        // Update username di database
        await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.user.id]);
        
        return successResponse(res, 200, 'Username berhasil diperbarui', { username: newUsername });
    } catch (error) {
        return errorResponse(res, 500, 'Gagal memperbarui profil');
    }
};

// [DELETE] Hapus Akun Pengguna
exports.deleteProfile = async (req, res) => {
    try {
        // Hapus baris user berdasarkan ID yang ada di token JWT
        // (Karena relasi ON DELETE CASCADE, tabel conversions & transactions milik user ini otomatis terhapus)
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
        
        return successResponse(res, 200, 'Akun Anda berhasil dihapus secara permanen');
    } catch (error) {
        return errorResponse(res, 500, 'Gagal menghapus akun');
    }
};