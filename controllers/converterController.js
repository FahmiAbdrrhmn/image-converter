const ImageTracer = require('imagetracerjs');
const sharp = require('sharp');
const db = require('../config/db');
const { createHistory } = require('../models/conversionHistoryModel');
const { errorResponse } = require('../utils/responseHandler');

exports.convertImage = async (req, res) => {
    try {
        //cek file ada/tidak
        if (!req.file) {
            return errorResponse(res, 400, 'Tidak ada gambar yang diunggah');
        }

        const filename = req.file.originalname;
        const fileSize = req.file.size;

        //ambil data user dari db
        const [userDb] = await db.query('SELECT tier, quota FROM users WHERE id = ?', [req.user.id]);

        if (userDb.length === 0) {
            return errorResponse(res, 401, 'User tidak ditemukan');
        }

        const currentTier = userDb[0].tier;
        const currentQuota = userDb[0].quota;
        const maxFreeSize = 1 * 1024 * 1024; // 1MB

        //limiter ukuran & kuota
        if (currentTier === 'free') {
            if (currentQuota <= 0) {
                await createHistory(req.user.id, filename, fileSize, 'failed');
                return errorResponse(res, 403, 'Kuota gratis Anda habis. Silakan upgrade ke PRO.');
            }
            if (fileSize > maxFreeSize) {
                await createHistory(req.user.id, filename, fileSize, 'failed');
                return errorResponse(res, 403, 'Akun FREE maksimal 1MB. Silakan upgrade ke PRO untuk batas hingga 5MB.');
            }
        }

        console.log("Memproses Piksel (RAM):", filename);

        //ekstarksi data pixel dengan sharp
        const { data, info } = await sharp(req.file.buffer)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const imgData = {
            width: info.width,
            height: info.height,
            data: data
        };

        //setting kualitas berdasarkan tier
        const options = currentTier === 'pro'
            ? { numberofcolors: 64, strokewidth: 1, viewbox: true }
            : { numberofcolors: 16, strokewidth: 1, viewbox: true };

        //proses konversi
        const svgString = ImageTracer.imagedataToSVG(imgData, options);

        //update kuota jika free & simpan riwayat sukses
        if (currentTier === 'free') {
            await db.query('UPDATE users SET quota = quota - 1 WHERE id = ?', [req.user.id]);
        }
        await createHistory(req.user.id, filename, fileSize, 'success');

        //res hasil konvert
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgString);

    } catch (error) {
        console.error("Proses Ekstraksi Gagal:", error);
        if (req.file) {
            try {
                await createHistory(req.user.id, req.file.originalname, req.file.size, 'failed');
            } catch (_) {}
        }
        return errorResponse(res, 500, 'Terjadi kesalahan sistem saat memproses gambar.');
    }
};
