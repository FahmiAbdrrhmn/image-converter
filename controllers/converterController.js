const ImageTracer = require('imagetracerjs');
const sharp = require('sharp');
const db = require('../config/db'); // Import database
const { errorResponse } = require('../utils/responseHandler'); // Import handler error

exports.convertImage = async (req, res) => {
    try {
        // 1. Cek apakah ada file
        if (!req.file) {
            return errorResponse(res, 400, 'Tidak ada gambar yang diunggah');
        }

        // 2. Ambil data tier dan kuota user langsung dari database
        const [userDb] = await db.query('SELECT tier, quota FROM users WHERE id = ?', [req.user.id]);
        
        if (userDb.length === 0) {
            return errorResponse(res, 401, 'User tidak ditemukan');
        }

        const currentTier = userDb[0].tier;
        const currentQuota = userDb[0].quota;
        const fileSize = req.file.size;
        const maxFreeSize = 1 * 1024 * 1024; // 1MB

        // 3. Validasi Bisnis (Limitasi Ukuran & Kuota)
        if (currentTier === 'free') {
            if (currentQuota <= 0) {
                return errorResponse(res, 403, 'Kuota gratis Anda habis. Silakan upgrade ke PRO.');
            }
            if (fileSize > maxFreeSize) {
                return errorResponse(res, 403, 'Akun FREE maksimal 1MB. Silakan upgrade ke PRO untuk batas hingga 5MB.');
            }
        }

        console.log("Memproses Piksel (RAM):", req.file.originalname);

        // 4. Ekstrak data piksel mentah (RGBA) dengan Sharp
        const { data, info } = await sharp(req.file.buffer)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const imgData = {
            width: info.width,
            height: info.height,
            data: data
        };

        // 5. Pengaturan Kualitas ImageTracer
        const options = currentTier === 'pro' 
            ? { numberofcolors: 64, strokewidth: 1, viewbox: true } 
            : { numberofcolors: 16, strokewidth: 1, viewbox: true };

        // 6. Proses konversi ke SVG
        const svgString = ImageTracer.imagedataToSVG(imgData, options);

        // 7. Jika sukses, potong kuota untuk user Free
        if (currentTier === 'free') {
            await db.query('UPDATE users SET quota = quota - 1 WHERE id = ?', [req.user.id]);
        }

        // 8. Kembalikan response SVG
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgString);

    } catch (error) {
        console.error("Proses Ekstraksi Gagal:", error);
        // Menggunakan standard error response
        return errorResponse(res, 500, 'Terjadi kesalahan sistem saat memproses gambar.');
    }
};