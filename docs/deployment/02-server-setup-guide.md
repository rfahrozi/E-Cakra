# Panduan Setup Server Produksi

Dokumen ini berisi panduan *step-by-step* untuk men-*deploy* E-CAKRA ke lingkungan Production (VPS Ubuntu). Metode ini menggunakan **Nginx di dalam Docker** dengan sertifikat SSL yang di-mount sebagai volume — pendekatan yang lebih sederhana dan tidak memerlukan Nginx terpisah di host.

---

## Prasyarat

1. VPS dengan OS **Ubuntu 22.04 LTS / 24.04 LTS**
2. Akses SSH dengan user berhak `sudo`
3. Domain/subdomain (contoh: `sidang.pengadilan.go.id`) dengan DNS A-Record diarahkan ke IP VPS
4. Port **80** dan **443** terbuka di firewall VPS
5. Akun Zoom Marketplace dengan **Server-to-Server OAuth App** yang sudah dikonfigurasi

---

## Langkah 1: Persiapan Server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git ufw -y
```

**Konfigurasi Firewall (UFW):**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## Langkah 2: Instalasi Docker & Docker Compose

```bash
# Install Docker Engine resmi
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user ke grup docker
sudo usermod -aG docker $USER
newgrp docker

# Verifikasi
docker --version
docker compose version
```

---

## Langkah 3: Clone Repositori

```bash
sudo mkdir -p /opt/ecakra
sudo chown -R $USER:$USER /opt/ecakra
cd /opt/ecakra

git clone https://github.com/NAMA_ORG/E-Cakra.git .
```

---

## Langkah 4: Konfigurasi Environment (`.env`)

```bash
cp .env.example .env
nano .env
```

Isi variabel berikut dengan nilai yang sesuai:

```env
# ── Umum ───────────────────────────────────────────────
APP_ENV=production
APP_NAME=E-CAKRA
CORS_ORIGINS=https://sidang.pengadilan.go.id

# ── Database ────────────────────────────────────────────
POSTGRES_DB=ecakra
POSTGRES_USER=ecakra
POSTGRES_PASSWORD=GANTI_DENGAN_PASSWORD_KUAT_MIN_20_KARAKTER

# ── Backend ─────────────────────────────────────────────
DATABASE_URL=postgresql://ecakra:GANTI_PASSWORD_SAMA_SEPERTI_ATAS@db:5432/ecakra

# Generate dengan: openssl rand -hex 32
SECRET_KEY=ISI_STRING_ACAK_64_KARAKTER_MINIMAL

ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

# ── Zoom API (dari Zoom Marketplace → Server-to-Server App) ──
ZOOM_ACCOUNT_ID=isi_account_id
ZOOM_CLIENT_ID=isi_client_id
ZOOM_CLIENT_SECRET=isi_client_secret
ZOOM_WEBHOOK_SECRET_TOKEN=isi_webhook_secret_token   # WAJIB DI PRODUCTION
ZOOM_HOST_USER_ID=email_host_zoom@institusi.go.id

# ── Frontend ─────────────────────────────────────────────
VITE_API_BASE_URL=https://sidang.pengadilan.go.id/api
VITE_APP_NAME=E-CAKRA
VITE_APP_VERSION=1.0.0
```

> ⚠️ **PENTING:** Jangan *commit* file `.env` ke Git. Pastikan `SECRET_KEY` dan `ZOOM_WEBHOOK_SECRET_TOKEN` diisi — app akan gagal start (*fail-fast*) jika kosong.

---

## Langkah 5: Setup Sertifikat SSL/TLS

E-CAKRA menggunakan **Nginx di dalam Docker** dengan sertifikat yang di-mount via volume `./nginx/ssl/`.

### Opsi A: Let's Encrypt dengan Certbot (Rekomendasi)

```bash
# Install certbot di host Ubuntu
sudo apt install certbot -y

# Dapatkan sertifikat (mode standalone — matikan container nginx dulu jika sudah jalan)
sudo certbot certonly --standalone -d sidang.pengadilan.go.id

# Salin sertifikat ke folder project
sudo cp /etc/letsencrypt/live/sidang.pengadilan.go.id/fullchain.pem /opt/ecakra/nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/sidang.pengadilan.go.id/privkey.pem   /opt/ecakra/nginx/ssl/privkey.pem

# Set permissions
sudo chown $USER:$USER /opt/ecakra/nginx/ssl/*.pem
chmod 644 /opt/ecakra/nginx/ssl/fullchain.pem
chmod 600 /opt/ecakra/nginx/ssl/privkey.pem
```

### Opsi B: Sertifikat dari CA Instansi / BSrE

Tempatkan file sertifikat:
```bash
# Pastikan format PEM
cp /path/ke/fullchain.pem /opt/ecakra/nginx/ssl/fullchain.pem
cp /path/ke/privkey.pem   /opt/ecakra/nginx/ssl/privkey.pem
```

### Update `server_name` di Nginx

```bash
nano /opt/ecakra/nginx/nginx.conf
```

Cari baris `server_name _;` dan ganti dengan:
```nginx
server_name sidang.pengadilan.go.id;
```
(lakukan di **kedua** server block: HTTP port 80 dan HTTPS port 443)

---

## Langkah 6: Jalankan Aplikasi

```bash
cd /opt/ecakra

# Build & jalankan semua container
docker compose up -d --build

# Cek status container
docker compose ps

# Pantau log backend
docker compose logs -f backend
```

Jika log backend menampilkan `Application startup complete.`, instalasi berhasil!

**Uji koneksi HTTPS:**
```bash
curl -I https://sidang.pengadilan.go.id/health
# Expected: HTTP/2 200
```

---

## Langkah 7: Pembuatan Akun Administrator Pertama

Di environment production, auto-seed user default **dimatikan**. Buat akun Admin pertama secara manual:

```bash
docker exec -it ecakra_backend python -c "
from app.database.session import engine
from sqlmodel import Session
from app.database.models import User, UserRole
from app.core.security import hash_password

with Session(engine) as session:
    admin = User(
        nama='Administrator',
        username='admin',
        password_hash=hash_password('GANTI_PASSWORD_KUAT_SEGERA'),
        role=UserRole.admin,
        is_active=True,
    )
    session.add(admin)
    session.commit()
    print('Akun admin berhasil dibuat!')
"
```

> Setelah login pertama, segera ganti password melalui halaman **Profil** (`/profile`) menggunakan fitur *Ganti Password*.

---

## Langkah 8: Konfigurasi System Settings

Login sebagai Admin, buka halaman **Pengaturan** (`/settings`) dan isi:

| Key | Nilai | Keterangan |
|-----|-------|-----------|
| `pengadilan_nama` | Nama resmi pengadilan | Tampil di header portal publik |
| `zoom_default_topic` | Template judul meeting | Gunakan `{nomor_perkara}`, `{jenis_sidang}` |
| `public_streaming_url` | URL kanal YouTube | Link untuk publik di halaman utama |
| `zoom_stream_rtmp_url` | RTMP Ingest URL | Dari YouTube Studio (misal: `rtmp://a.rtmp.youtube.com/live2`) |
| `zoom_stream_key` | Stream Key rahasia | Dari YouTube Studio → Go Live → Stream Key |

---

## Langkah 9: Perpanjangan Sertifikat Otomatis (Let's Encrypt)

Tambahkan cron job di server host untuk perpanjangan otomatis:

```bash
crontab -e
```

Tambahkan baris:
```cron
0 3 * * * certbot renew --quiet --standalone --pre-hook "docker compose -f /opt/ecakra/docker-compose.yml stop nginx" --post-hook "cp /etc/letsencrypt/live/sidang.pengadilan.go.id/fullchain.pem /opt/ecakra/nginx/ssl/fullchain.pem && cp /etc/letsencrypt/live/sidang.pengadilan.go.id/privkey.pem /opt/ecakra/nginx/ssl/privkey.pem && docker compose -f /opt/ecakra/docker-compose.yml start nginx"
```

---

## Langkah 10: Verifikasi Akhir

```bash
# Cek semua container berjalan
docker compose ps

# Cek konfigurasi Nginx valid
docker compose exec nginx nginx -t

# Cek rating SSL (perlu domain publik)
# https://www.ssllabs.com/ssltest/

# Jalankan automated test (dari mesin developer)
cd backend && pytest -v
```

**Checklist deployment selesai:**
- [ ] Semua 4 container berstatus `running`
- [ ] `https://domain/health` mengembalikan `{"status":"ok"}`
- [ ] Login dengan akun admin berhasil
- [ ] System settings sudah diisi
- [ ] Password default sudah diganti
- [ ] Zoom webhook URL dikonfigurasi di Zoom Marketplace
- [ ] SSL rating minimal A di ssllabs.com
