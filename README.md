# Vectify - Image to SVG Converter

Aplikasi full-stack untuk mengonversi gambar bitmap (JPG/PNG) menjadi vektor (SVG) dengan sistem autentikasi, tier langganan, riwayat konversi, dan log upgrade.

---

## 1. Langkah Instalasi

1. **Instal dependensi:**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment:**
   Buat file `.env` di root folder dan isi:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=converter_db
   JWT_SECRET=rahasia
   ```

3. **Siapkan Database:**
   Buka MySQL / phpMyAdmin, lalu jalankan seluruh isi file `database.sql`.

4. **Jalankan Aplikasi:**
   ```bash
   node app.js
   ```
   Akses di `http://localhost:3000`

---

## 2. Struktur Database (3 Tabel)

```
users
  ├── id, username, password, tier, quota, created_at
  │
  ├──► conversion_history
  │      id, user_id, filename, file_size, status, created_at
  │
  └──► upgrade_logs
         id, user_id, method, upgraded_at
```

- **`conversion_history`** — dicatat otomatis setiap kali `/api/convert` dipanggil (sukses maupun gagal).
- **`upgrade_logs`** — dicatat otomatis setiap kali `/api/upgrade` berhasil dijalankan.
- Kedua tabel menggunakan `ON DELETE CASCADE`, sehingga data terhapus otomatis saat akun dihapus.

---

## 3. Endpoint REST API

Semua endpoint bertanda 🔒 wajib menyertakan header:
`Authorization: Bearer <token>`

| Method | Endpoint            | Auth | Fungsi                                      |
|:-------|:--------------------|:----:|:--------------------------------------------|
| POST   | `/api/register`     |      | Daftarkan akun baru                         |
| POST   | `/api/login`        |      | Login dan dapatkan Token JWT                |
| GET    | `/api/profile`      | 🔒   | Profil + riwayat konversi + log upgrade     |
| PUT    | `/api/profile`      | 🔒   | Ubah username                               |
| DELETE | `/api/profile`      | 🔒   | Hapus akun (cascade semua data)             |
| POST   | `/api/upgrade`      | 🔒   | Upgrade ke PRO (catat ke upgrade_logs)      |
| POST   | `/api/convert`      | 🔒   | Konversi JPG/PNG → SVG (catat ke history)   |
| GET    | `/api/history`      | 🔒   | Ambil riwayat konversi saja                 |
| GET    | `/api/upgrade-logs` | 🔒   | Ambil log upgrade saja                      |

---

## 4. Halaman Frontend

| Path               | Akses       | Deskripsi                               |
|:-------------------|:------------|:----------------------------------------|
| `/` (index.html)   | Wajib Login | Dashboard konversi gambar               |
| `/login.html`      | Publik      | Halaman login                           |
| `/register.html`   | Publik      | Halaman registrasi                      |
| `/profile.html`    | Wajib Login | Profil, riwayat konversi, log upgrade   |
