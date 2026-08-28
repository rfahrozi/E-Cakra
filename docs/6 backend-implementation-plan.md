# Rencana Bertahap Perancangan File Backend (Telah Diselaraskan)

Dokumen ini merangkum tahapan implementasi backend secara **praktis, terstruktur, dan siap dibangun**. Pendekatan yang dipakai sengaja dibuat sederhana agar tidak over-engineered, dan **telah disesuaikan dengan arsitektur FastAPI (Python) yang sebenarnya diimplementasikan**.

## 1. Baseline Stack yang Digunakan

- **Runtime & Language**: Python 3.12
- **Framework**: FastAPI
- **ORM & Validation**: SQLModel (kombinasi SQLAlchemy & Pydantic)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) dengan OAuth2PasswordBearer
- **Testing**: Pytest (rencana awal)
- **Deployment**: Docker Compose + Nginx proxy

## 2. Struktur Proyek Backend

```text
backend/
├── app/
│   ├── main.py                    # Entry point aplikasi
│   ├── core/
│   │   ├── config.py              # Pengaturan environment (pydantic-settings)
│   │   └── security.py            # Hashing & verifikasi JWT
│   ├── database/
│   │   ├── session.py             # Koneksi DB & pembuatan tabel
│   │   ├── models.py              # Definisi model SQLModel
│   │   └── init_db.py             # Script seed data awal
│   ├── modules/
│   │   ├── auth/                  # Modul login/logout
│   │   │   └── router.py
│   │   ├── hearings/              # Modul sidang & integrasi Zoom
│   │   │   ├── router.py
│   │   │   └── zoom_service.py
│   │   ├── waiting_room/          # Modul operator waiting room
│   │   │   └── router.py
│   │   ├── webhook/               # Modul penerima webhook Zoom
│   │   │   └── router.py
│   │   ├── audit/                 # Modul pencatatan aktivitas
│   │   │   └── router.py
│   │   ├── users/                 # Modul CRUD user oleh Admin
│   │   │   └── router.py
│   │   ├── settings/              # Modul konfigurasi sistem
│   │   │   └── router.py
│   │   └── dashboard/             # Modul statistik halaman depan
│   │       └── router.py
│   └── utils/
│       ├── audit.py               # Helper fungsi catat log
│       └── name_validator.py      # Logika regex nama peserta
├── migrations/                    # Folder Alembic (jika diaktifkan)
├── tests/                         # Folder pengujian (unit, integration)
├── requirements.txt               # Daftar dependency Python
├── Dockerfile                     # Docker image production
└── Dockerfile.dev                 # Docker image development (hot-reload)
```

---

## 3. Tahapan Implementasi yang Telah Dilakukan

Tahap-tahap di bawah ini merepresentasikan langkah aktual yang diambil untuk mencapai status MVP saat ini (±90% tuntas).

### Tahap 1: Struktur Proyek Dasar & Konfigurasi
Fokus: Menyiapkan fondasi dan lingkungan aplikasi.
- Pembuatan struktur direktori `app/`, `core/`, `database/`.
- Penulisan `requirements.txt` (FastAPI, Uvicorn, SQLModel, passlib, python-jose).
- Pengaturan variabel environment menggunakan `pydantic-settings` di `app/core/config.py`.
- Pembuatan `Dockerfile` dan `docker-compose.yml`.

### Tahap 2: Kerangka Aplikasi Inti
Fokus: Membuat FastAPI bisa berjalan dan menerima request.
- Inisialisasi aplikasi FastAPI di `app/main.py`.
- Penambahan middleware CORS.
- Pembuatan endpoint dasar `GET /health` untuk health check container.

### Tahap 3: Manajemen Basis Data & Model (Selesai)
Fokus: Menyambungkan aplikasi ke PostgreSQL dan merancang tabel.
- Konfigurasi `session.py` (engine SQLAlchemy).
- Pembuatan model inti di `app/database/models.py` (`User`, `Hearing`, `ZoomMeeting`, `WaitingParticipant`, `AuditLog`, `SystemSettings`).
- Pembuatan skrip penyemaian data (seed) `init_db.py` untuk akun default dan pengaturan default.
- Pemasangan eksekusi seed otomatis melalui *lifespan events* di `main.py`.

### Tahap 4: Otentikasi dan Otorisasi (Selesai)
Fokus: Melindungi API dari akses yang tidak sah.
- Implementasi `passlib` untuk hashing *bcrypt* di `app/core/security.py`.
- Endpoint `POST /auth/login` yang memverifikasi kredensial dan menerbitkan JWT.
- Helper otorisasi `get_current_user` dan `require_admin`.

### Tahap 5: Modul Sidang & Zoom API (Selesai)
Fokus: Alur bisnis inti E-CAKRA.
- Endpoint pembuatan sidang (`POST /hearings`).
- Integrasi ke Zoom API menggunakan metode Server-to-Server OAuth (`app/modules/hearings/zoom_service.py`).
- Penyusunan otomatis string *template distribusi* siap salin (`GET /hearings/{id}/template`).

### Tahap 6: Webhook & Operator Waiting Room (Selesai)
Fokus: Mendengarkan event dari Zoom dan mengelolanya.
- Endpoint penerima webhook `POST /webhooks/zoom` beserta validasi *HMAC-SHA256 signature*.
- Fitur validasi nama berbasis Regex (`app/utils/name_validator.py`).
- Endpoint aksi operator (`ADMIT`, `HOLD`, `REJECT`) yang mengirimkan kembali *action* ke Zoom API.

### Tahap 7: Dashboard, Pengguna, dan Audit (Selesai)
Fokus: Fitur pendukung operasional dan manajerial.
- Endpoint statistik real-time `/dashboard/summary`.
- CRUD pengguna di `/users` khusus untuk Admin.
- Helper terpusat `log_action()` untuk mencatat seluruh kejadian sistem di `/audit-logs`.
- Konfigurasi sistem dinamis di `/settings`.

### Tahap 8: Pengujian Khusus & Optimasi (Sebagian Selesai)
Fokus: Mengoptimalkan kode.
- Penyelesaian N+1 query problem saat mengambil daftar sidang.
- Penyesuaian UX untuk penanganan kesalahan, termasuk pesan ke Frontend.

---

## 4. Tahapan yang BELUM Tuntas (Gap to 100% Production Ready)

Untuk menyelesaikan seluruh siklus implementasi *software engineering* (bukan hanya fungsionalitas MVP), langkah-langkah berikut masih menggantung:

### Tahap 9: Pengujian Otomatis (Testing)
- **Status:** KOSONG.
- **Tugas:** Folder `tests/` telah disiapkan tetapi belum ada *test case* yang ditulis menggunakan `pytest`. Minimal harus mencakup skenario pembuatan sidang, validasi HMAC webhook, dan proteksi otorisasi JWT.

### Tahap 10: Keamanan Tambahan & HTTPS
- **Status:** SEBAGIAN SELESAI.
- **Tugas:** Nginx saat ini hanya disetel untuk HTTP (Port 80). Perlu dikonfigurasi penerimaan SSL/TLS menggunakan Certbot/Let's Encrypt.
- **Tugas Tambahan:** Penambahan fitur *Rate Limiting* (misal via `slowapi` atau middleware kustom) untuk membatasi *brute-force* pada endpoint `/auth/login` dan webhook publik.

## 5. Kesimpulan
Blueprint yang awalnya diformulasikan untuk *Node.js* telah berhasil dikonversi dan direalisasikan dengan **Python/FastAPI**. Secara fitur bisnis, MVP telah **100% fungsional**, namun pekerjaan DevOps (SSL) dan Quality Assurance (Unit Test) perlu diagendakan sebelum proyek dinyatakan *go-live* ke produksi publik.
