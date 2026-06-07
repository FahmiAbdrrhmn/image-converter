const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('../routes/apiRoutes');

const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public')); 

// 2. Routing Utama
app.use('/api', apiRoutes);

// 3. Fallback Route (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan fatal pada server' });
});

// Port listener ini tidak akan dieksekusi di Vercel, jadi aman ditinggal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;