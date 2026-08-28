# E-CAKRA — README & Installation Guide

**Electronic Command & Access for Court Room Administration**  
Portal internal persidangan elektronik berbasis Zoom untuk Pengadilan Tinggi.

---

## Prasyarat

| Kebutuhan | Versi Minimum |
|-----------|---------------|
| Docker    | 24.x          |
| Docker Compose | v2.x    |
| Akun Zoom | Server-to-Server OAuth aktif |

---

## Struktur Proyek

```
E-Cakra/
├── backend/          # FastAPI (Python)
├── frontend/         # React + TypeScript + Vite + Tailwind
├── nginx/            # Konfigurasi Nginx reverse proxy
├── docs/             # Dokumentasi proyek
├── docker-compose.yml
├── .env              # Environment variables (dari .env.example)
└── .env.example      # Template environment
```

---

## Instalasi Cepat (Docker Lokal)

### 1. Clone / Salin Proyek

```bash
cd /path/ke/proyek
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai berikut:

```env
POSTGRES_PASSWORD=password_aman_anda
SECRET_KEY=secret_key_panjang_acak_minimal_32_karakter
ZOOM_ACCOUNT_ID=isi_dari_zoom_marketplace
ZOOM_CLIENT_ID=isi_dari_zoom_marketplace
ZOOM_CLIENT_SECRET=isi_dari_zoom_marketplace
ZOOM_WEBHOOK_SECRET_TOKEN=isi_dari_zoom_marketplace
```

### 3. Jalankan Docker Compose

```bash
docker compose up -d --build
```

Tunggu semua service naik (±2–3 menit pertama kali karena build image).

### 4. Verifikasi

```bash
docker compose ps
```

Semua service harus berstatus `running` atau `healthy`:
- `ecakra_db` — PostgreSQL
- `ecakra_backend` — FastAPI
- `ecakra_frontend` — React (Nginx)
- `ecakra_nginx` — Reverse proxy

### 5. Akses Aplikasi

| Layanan | URL | Keterangan |
|---------|-----|------------|
| **Landing Page Publik** | [http://localhost](http://localhost) | Portal tanpa auth (untuk masyarakat umum) |
| **Portal Internal** | [http://localhost/login](http://localhost/login) | Dashboard untuk Panitera/Operator/Admin |
| **API Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Dokumentasi API Backend FastAPI |

---

## Akun Default (Development)

| Username   | Password      | Role      |
|------------|---------------|-----------|
| `admin`    | `admin123`    | Admin     |
| `operator` | `operator123` | Operator  |
| `panitera` | `panitera123` | Panitera  |

> ⚠️ **Ganti password default sebelum dipakai di environment production!**

---

## Endpoint API

| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET  | `/auth/me` | Identitas user aktif |
| POST | `/hearings` | Buat sidang + Zoom meeting |
| GET  | `/hearings` | Daftar semua sidang |
| GET  | `/hearings/{id}` | Detail sidang |
| DELETE| `/hearings/{id}`| Hapus sidang (Admin/Panitera) |
| GET  | `/hearings/{id}/template` | Template distribusi |
| GET  | `/hearings/{id}/participants` | Daftar peserta waiting room |
| POST | `/participants/{id}/admit` | Admit peserta (Kirim perintah ke Zoom) |
| POST | `/participants/{id}/hold` | Hold peserta |
| POST | `/participants/{id}/reject`| Reject peserta (Kirim perintah ke Zoom) |
| GET  | `/audit-logs` | Daftar audit log |
| POST | `/webhooks/zoom` | Penerima webhook Zoom |
| GET  | `/dashboard/summary` | Ringkasan dashboard |
| GET  | `/public/today` | Daftar sidang terbuka untuk landing page |
| GET  | `/users` | Manajemen pengguna (Admin) |
| POST | `/users` | Tambah pengguna (Admin) |
| PATCH| `/users/{id}` | Edit pengguna (Admin) |
| DELETE| `/users/{id}` | Hapus pengguna (Admin) |
| GET  | `/settings` | Pengaturan sistem (Admin) |
| PATCH| `/settings/{key}` | Ubah pengaturan sistem (Admin) |
| GET  | `/health` | Health check |

**Swagger UI:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---

## Konfigurasi Zoom Webhook

1. Login ke [Zoom Marketplace](https://marketplace.zoom.us)
2. Buka aplikasi Server-to-Server OAuth Anda
3. Tambahkan Event Subscription:
   - `meeting.participant_waiting`
   - `meeting.participant_joined_waiting_room`
4. Set Webhook URL ke: `https://domain-anda.com/webhooks/zoom`
5. Salin `Secret Token` ke `.env` → `ZOOM_WEBHOOK_SECRET_TOKEN`

Untuk development lokal, gunakan [ngrok](https://ngrok.com):
```bash
ngrok http 80
# Gunakan URL ngrok sebagai Webhook URL di Zoom
```

---

## Perintah Berguna

```bash
# Lihat log semua service
docker compose logs -f

# Lihat log backend saja
docker compose logs -f backend

# Restart backend saja
docker compose restart backend

# Stop semua
docker compose down

# Stop + hapus volume database (HATI-HATI: data terhapus)
docker compose down -v

# Rebuild dari nol
docker compose up -d --build --force-recreate
```

---

## Troubleshooting

### Backend tidak bisa konek ke database
```bash
docker compose logs db
# Tunggu hingga "database system is ready to accept connections"
docker compose restart backend
```

### Zoom meeting gagal dibuat
- Periksa `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` di `.env`
- Pastikan akun Zoom mendukung Server-to-Server OAuth
- Cek log: `docker compose logs backend | grep ZOOM`

### Frontend tidak muncul
```bash
docker compose logs frontend
docker compose logs nginx
```

---

## Deployment ke Ubuntu VPS

```bash
# 1. Copy proyek ke server
scp -r . user@server:/opt/ecakra

# 2. SSH ke server
ssh user@server

# 3. Konfigurasi .env production
cd /opt/ecakra
cp .env.example .env
nano .env  # isi semua nilai

# 4. Jalankan
docker compose up -d --build

# 5. Setup SSL (Certbot + Nginx)
# Update nginx/nginx.conf dengan konfigurasi HTTPS
```

---

## Alur Kerja Sistem

```
[Masyarakat] → Buka Halaman Publik → Lihat Daftar Sidang Terbuka & Link YouTube
       ↑
[Panitera] Buat sidang → Zoom meeting otomatis terbuat + Terekam di Dashboard
       ↓
Template distribusi siap salin (join link, format nama) → Dikirim ke Peserta
       ↓
[Peserta] Join via link Zoom → Masuk waiting room Zoom
       ↓
Webhook Zoom → Backend terima → Validasi nama otomatis (Valid/Review/Invalid)
       ↓
[Operator] Pantau Dashboard/Waiting Room → klik Admit / Hold / Reject
       ↓
Backend kirim perintah balik ke Zoom API (Peserta masuk/ditolak)
       ↓
Semua aksi tercatat di Audit Log
```

---

## Akun & Keamanan Production

- Ganti semua password default sebelum go-live
- Set `SECRET_KEY` yang panjang dan acak (min 32 karakter)
- Aktifkan HTTPS via Nginx + Certbot
- Batasi akses port 5432 (PostgreSQL) dari publik
- Simpan `.env` di luar repository

---

*Dibuat: 28 Agustus 2026 · E-CAKRA v1.0.0 MVP*
