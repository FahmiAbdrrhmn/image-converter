const multer = require('multer');

// Gunakan MemoryStorage agar gambar disimpan sementara di RAM (Buffer)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.toLowerCase();
        if (!ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg')) {
            return cb(new Error('Hanya format JPG dan PNG yang diperbolehkan'));
        }
        cb(null, true);
    }
});

module.exports = upload;