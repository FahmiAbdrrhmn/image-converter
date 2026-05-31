# Vectify - Image to SVG Converter

Aplikasi full-stack untuk mengonversi gambar bitmap (JPG/PNG) menjadi vektor (SVG) dengan sistem autentikasi, tier langganan, dan pemrosesan in-memory.

## 1. Langkah Instalasi

1. **Instal dependensi:**
   Buka terminal di dalam folder proyek, lalu jalankan:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment:**
   Buat file bernama `.env` di root folder proyek dan isi dengan konfigurasi berikut:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=converter_db
   JWT_SECRET=rahasia_super_aman_123
   ```
   *(Kosongkan `DB_PASSWORD` jika menggunakan XAMPP/Laragon bawaan).*

3. **Jalankan Aplikasi:**
   ```bash
   node app.js
   ```
   Aplikasi akan berjalan dan dapat diakses melalui browser di `http://localhost:3000`.

---

## 2. Query Database (MySQL)

Buka console MySQL atau phpMyAdmin, lalu eksekusi query berikut untuk menyiapkan struktur database:

```sql
CREATE DATABASE converter_db;
USE converter_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tier ENUM('free', 'pro') DEFAULT 'free',
    quota INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Endpoint REST API

Semua endpoint yang memerlukan autentikasi wajib menyertakan token JWT di header (`Authorization: Bearer <token>`).

| Method | Endpoint         | Body (Payload)        | Fungsi                          |
|:-------|:-----------------|:----------------------|:--------------------------------|
| POST   | `/api/register`  | `username`, `password`| Mendaftarkan akun baru          |
| POST   | `/api/login`     | `username`, `password`| Login dan mendapatkan Token JWT |
| GET    | `/api/profile`   | -                     | Mengambil data profil dan kuota |
| PUT    | `/api/profile`   | `newUsername`         | Mengubah username pengguna      |
| DELETE | `/api/profile`   | -                     | Menghapus akun secara permanen  |
| POST   | `/api/convert`   | `image` (form-data)   | Eksekusi konversi JPG/PNG ke SVG|
| POST   | `/api/upgrade`   | -                     | Simulasi upgrade ke akun PRO    |

---

## 4. Endpoint Website (Frontend)

Halaman antarmuka yang terintegrasi langsung di dalam public folder.

| Path             | Akses        | Deskripsi                                      |
|:-----------------|:-------------|:-----------------------------------------------|
| `/` atau `/index.html` | Wajib Login  | Dashboard utama untuk konversi gambar          |
| `/login.html`    | Publik       | Halaman masuk pengguna                         |
| `/register.html` | Publik       | Halaman pendaftaran akun baru                  |
| `/profile.html`  | Wajib Login  | Pengaturan akun (Edit username & Delete)       |
