const express = require('express');
const cors = require('cors'); // Import CORS
require('dotenv').config();
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// 1. Middlewares Dasar
app.use(cors()); // Mengizinkan akses dari domain/port lain
app.use(express.json());
app.use(express.static('public')); 

// 2. Routing Utama
app.use('/api', apiRoutes);

// 3. Fallback Route (Jika endpoint tidak ditemukan)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// 4. Global Error Handler (Menangkap error sistem yang lolos dari try-catch)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan fatal pada server' });
});

const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});