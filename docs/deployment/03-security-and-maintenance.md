# Security and Maintenance Guide

Dokumen ini merangkum praktik terbaik untuk menjaga keamanan dan memelihara aplikasi E-CAKRA setelah berhasil *live* di *Production*.

---

## 1. Keamanan Aplikasi (Security Hardening)

### A. Manajemen Secrets

- **Jangan commit `.env` ke Git** — File `.env` wajib ada di `.gitignore`. Gunakan `.env.example` sebagai acuan variabel.
- **Kekuatan `SECRET_KEY`** — Gunakan string acak minimal 32 karakter: `openssl rand -hex 32`
- **Rotasi API Key Berkala** — Disarankan merotasi `ZOOM_CLIENT_SECRET` dan `ZOOM_WEBHOOK_SECRET_TOKEN` di Zoom Marketplace setiap 6 bulan dan memperbarui nilai di file `.env` server.
- **Sertifikat SSL** — File `.pem` di `nginx/ssl/` tidak boleh di-commit ke Git (sudah dilindungi oleh `nginx/ssl/.gitignore`).

### B. Proteksi Endpoint (Sudah Diimplementasikan)

| Mekanisme | Detail | Lokasi |
|-----------|--------|--------|
| **JWT Bearer Auth** | Semua endpoint internal memerlukan token valid (HS256, 60 menit) | `core/security.py` |
| **Token Blacklist** | Token yang di-logout disimpan di tabel `revoked_tokens` — tidak bisa dipakai lagi meskipun belum expire | `auth/router.py` |
| **RBAC** | Tiga role: `admin`, `panitera`, `operator` — setiap endpoint memvalidasi role yang diizinkan | Semua router |
| **Webhook HMAC-SHA256** | Setiap request webhook Zoom diverifikasi signature-nya menggunakan `ZOOM_WEBHOOK_SECRET_TOKEN` | `webhook/router.py` |
| **Anti-Replay Attack** | Timestamp webhook lebih dari 300 detik (5 menit) langsung ditolak | `webhook/router.py` |
| **Rate Limiting** | Nginx membatasi 10 req/s dengan burst 20 untuk `/api/` dan `/webhooks/` | `nginx/nginx.conf` |
| **Swagger Disabled** | `/docs` dan `/openapi.json` dinonaktifkan otomatis di `APP_ENV=production` | `main.py` |
| **Fail-Fast Guard** | App gagal start jika `SECRET_KEY` atau `ZOOM_WEBHOOK_SECRET_TOKEN` belum diisi | `core/config.py` |

### C. Keamanan TLS/HTTPS

- Nginx dikonfigurasi hanya menerima **TLS 1.2 dan TLS 1.3**
- Cipher suite modern: ECDHE/DHE dengan forward secrecy
- Header **HSTS** (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`) dikirim setiap response HTTPS
- Semua request HTTP (port 80) otomatis di-redirect ke HTTPS (port 443) dengan kode 301

### D. Keamanan Database & Network

- Port 5432 (PostgreSQL) **tidak di-bind ke host** — hanya dapat diakses internal melalui Docker network `ecakra_net`
- Gunakan user DB khusus aplikasi (`ecakra`), bukan user `postgres` default
- Password DB minimal 20 karakter acak

### E. Ganti Password Default

Setelah pertama kali deploy, ganti semua password default melalui halaman **Profil** (`/profile`) atau User Management (`/users`):

| User Default | Password Default | ⚠️ Wajib Diganti |
|-------------|-----------------|------------------|
| `admin` | `admin123` | **Ya** |
| `panitera` | `panitera123` | **Ya** |
| `operator` | `operator123` | **Ya** |

> Endpoint ganti password: `PATCH /auth/me/password` — tersedia di halaman `/profile` untuk semua user yang sudah login.

---

## 2. Pemeliharaan Sistem (Maintenance)

### A. Deploy Ulang Setelah Update Kode

```bash
cd /opt/ecakra

# Ambil update terbaru
git pull origin main

# Rebuild & restart container (downtime minimal)
docker compose up -d --build

# Verifikasi
docker compose ps
docker compose logs -f backend
```

> *Container lama tetap hidup selama image baru sedang di-build, sehingga downtime sangat minimal.*

### B. Membaca Log & Troubleshooting

```bash
# Log backend secara live
docker compose logs -f backend

# Log Nginx (access & error)
docker compose logs -f nginx

# Log database
docker compose logs -f db
```

**Kode log yang perlu diperhatikan:**

| Kode | Artinya |
|------|---------|
| `ERROR_ZOOM_MEETING` | Gagal membuat Zoom Meeting (cek kredensial Zoom) |
| `ERROR_ZOOM_PARTICIPANT_CONTROL` | Gagal admit/reject peserta via Zoom API |
| `ERROR_LIVESTREAM` | Gagal setup RTMP livestream (cek `zoom_stream_rtmp_url` & `zoom_stream_key`) |
| `WEBHOOK_*` | Event webhook dari Zoom (normal) |

Semua error ini juga tersimpan di tabel `audit_logs` dan dapat dilihat melalui halaman **Audit Log** (`/audit-logs`).

### C. Pencadangan Database (Backup)

**Buat backup manual:**
```bash
docker exec -t ecakra_db pg_dump -U ecakra -F c ecakra \
  > /opt/backup/ecakra_backup_$(date +%Y%m%d_%H%M).dump
```

**Automasi dengan CronJob harian:**
```bash
crontab -e
```
Tambahkan:
```cron
0 2 * * * mkdir -p /opt/backup && docker exec -t ecakra_db pg_dump -U ecakra -F c ecakra > /opt/backup/ecakra_$(date +\%Y\%m\%d).dump && find /opt/backup -name "*.dump" -mtime +30 -delete
```
> Cron di atas: backup setiap pukul 02.00, simpan 30 hari terakhir, hapus yang lebih lama.

**Restore dari backup:**
```bash
cat /opt/backup/ecakra_backup_YYYYMMDD.dump \
  | docker exec -i ecakra_db pg_restore -U ecakra -d ecakra --clean
```

### D. Pembersihan Docker (Storage Management)

Lakukan secara periodik (setiap bulan) untuk mencegah disk penuh:

```bash
# Hapus container/image yang tidak dipakai (hati-hati, baca output dulu)
docker system prune -a

# Cek penggunaan disk Docker
docker system df
```

---

## 3. Token Blacklist Maintenance

Tabel `revoked_tokens` menyimpan token yang sudah di-logout. Cleanup otomatis dilakukan setiap kali user logout (menghapus token expired). Namun jika diperlukan cleanup manual:

```bash
docker exec -it ecakra_backend python -c "
from app.database.session import engine
from sqlmodel import Session, select
from app.database.models import RevokedToken
from datetime import datetime

with Session(engine) as session:
    now = datetime.utcnow()
    expired = session.exec(select(RevokedToken).where(RevokedToken.expires_at < now)).all()
    for t in expired:
        session.delete(t)
    session.commit()
    print(f'Dihapus {len(expired)} token expired dari blacklist.')
"
```

---

## 4. Monitoring Kesehatan Sistem

### Health Check Endpoint
```bash
curl https://sidang.pengadilan.go.id/health
# Expected: {"status":"ok","app":"E-CAKRA"}
```

### Cek Status Container
```bash
docker compose ps
# Semua container harus berstatus "running"
```

### Cek Sertifikat SSL
```bash
echo | openssl s_client -connect sidang.pengadilan.go.id:443 2>/dev/null \
  | openssl x509 -noout -dates
# Pastikan notAfter masih jauh dari tanggal sekarang
```

### Automated Test (Jalankan Sebelum Deploy)
```bash
cd /opt/ecakra/backend
pip install pytest pytest-asyncio
pytest -v
# Semua test harus PASS sebelum ke production
```

---

## 5. Checklist Keamanan Periodik

Lakukan review ini setiap **3-6 bulan**:

- [ ] Rotasi `ZOOM_CLIENT_SECRET` di Zoom Marketplace + update `.env`
- [ ] Rotasi `ZOOM_WEBHOOK_SECRET_TOKEN` di Zoom Marketplace + update `.env`
- [ ] Rotasi `SECRET_KEY` JWT (perlu logout semua user aktif)
- [ ] Rotasi password database `POSTGRES_PASSWORD`
- [ ] Perbarui Docker images ke versi terbaru (`docker compose pull`)
- [ ] Cek apakah ada update keamanan Python/Node.js
- [ ] Verifikasi backup database berjalan (cek folder `/opt/backup`)
- [ ] Cek tanggal kedaluwarsa sertifikat SSL
- [ ] Review audit log untuk aktivitas mencurigakan di halaman `/audit-logs`
- [ ] Pastikan tidak ada user default dengan password lemah
