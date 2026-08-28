# Panduan Setup Server Produksi

Dokumen ini berisi panduan *step-by-step* untuk mem-publish (deploy) E-CAKRA ke lingkungan Production (VPS Ubuntu).

## Prasyarat

1. Mesin VPS dengan OS **Ubuntu 22.04 LTS / 24.04 LTS**.
2. Akses Terminal (SSH) dengan *user* berhak akses `sudo`.
3. Memiliki Domain/Subdomain (contoh: `sidang.pengadilan.go.id`) yang DNS A-Record-nya telah diarahkan ke IP Public VPS.
4. Port `80` (HTTP) dan `443` (HTTPS) terbuka di *Firewall* VPS (Security Groups).

---

## Langkah 1: Persiapan Server

Update server dan install utilitas dasar:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git ufw nano -y
```

**Konfigurasi Firewall (UFW):**
Sangat penting untuk hanya mengizinkan port yang dibutuhkan.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Langkah 2: Instalasi Docker & Docker Compose

Jalankan perintah resmi Docker untuk instalasi:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Verifikasi instalasi:

```bash
docker --version
docker compose version
```

Tambahkan *user* Anda ke dalam grup Docker agar tidak perlu mengetik `sudo` terus menerus:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Langkah 3: Clone Repositori E-CAKRA

Buat folder direktori di `/opt` dan *clone* repositori:

```bash
sudo mkdir -p /opt/ecakra
sudo chown -R $USER:$USER /opt/ecakra
cd /opt/ecakra

git clone https://github.com/rfahrozi/E-Cakra.git .
```

---

## Langkah 4: Konfigurasi Environment (`.env`)

Salin file *template environment*:

```bash
cp .env.example .env
nano .env
```

**PENTING! Isi variabel-variabel berikut di dalam file `.env`**:

```env
APP_ENV=production
APP_NAME=E-CAKRA
CORS_ORIGINS=https://sidang.pengadilan.go.id

# DATABASE (Ganti password default dengan yang sangat kuat)
POSTGRES_DB=ecakra
POSTGRES_USER=ecakra
POSTGRES_PASSWORD=GANTI_DENGAN_PASSWORD_DB_YANG_KUAT

# BACKEND
DATABASE_URL=postgresql://ecakra:GANTI_DENGAN_PASSWORD_DB_YANG_KUAT@db:5432/ecakra
SECRET_KEY=GENERATE_STRING_ACAK_MINIMAL_32_KARAKTER  # Gunakan openssl rand -hex 32
ACCESS_TOKEN_EXPIRE_MINUTES=15
ALGORITHM=HS256

# ZOOM API (Dapatkan dari Zoom Marketplace Server-to-Server App)
ZOOM_ACCOUNT_ID=kode_account_id
ZOOM_CLIENT_ID=kode_client_id
ZOOM_CLIENT_SECRET=kode_client_secret
ZOOM_WEBHOOK_SECRET_TOKEN=kode_secret_webhook  # WAJIB DIISI DI PRODUCTION
ZOOM_HOST_USER_ID=email_host_zoom_institusi@domain.com

# FRONTEND
VITE_API_BASE_URL=https://sidang.pengadilan.go.id/api
VITE_APP_NAME=E-CAKRA
VITE_APP_VERSION=1.0.0
```

> **Catatan:** Jangan *commit* file `.env` ke Git! Pastikan `SECRET_KEY` dan `ZOOM_WEBHOOK_SECRET_TOKEN` terisi, jika tidak aplikasi akan gagal dijalankan (*Fail-fast guard*).

---

## Langkah 5: Setup Nginx Reverse Proxy (SSL/HTTPS)

Sebelum menaikkan container aplikasi, kita perlu melakukan setup HTTPS. Karena Nginx kita berada di *dalam* Docker, kita bisa menggunakan pendekatan *Reverse Proxy* berlapis atau menginstal Nginx dan Certbot langsung di Host. 

**Metode Rekomendasi (Host Nginx Proxy):**

Hapus port mapping `80:80` pada file `docker-compose.yml` di bagian `nginx`, ubah menjadi port internal misal `8080:80`:

```yaml
  nginx:
    # ...
    ports:
      - "127.0.0.1:8080:80"  # Hanya ekspos ke internal host
```

Lalu install Nginx & Certbot di server host Ubuntu Anda:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Buat *Server Block* (Virtual Host) di host:

```bash
sudo nano /etc/nginx/sites-available/ecakra
```

Isikan:

```nginx
server {
    listen 80;
    server_name sidang.pengadilan.go.id;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan *Server Block* dan minta sertifikat SSL:

```bash
sudo ln -s /etc/nginx/sites-available/ecakra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Generate SSL
sudo certbot --nginx -d sidang.pengadilan.go.id
```

---

## Langkah 6: Jalankan Aplikasi (Docker Compose)

Setelah konfigurasi siap, bangun dan jalankan semua container E-CAKRA:

```bash
cd /opt/ecakra
docker compose up -d --build
```

Cek status container:

```bash
docker compose ps
docker compose logs -f backend
```

Jika log backend menunjukkan `Application startup complete.`, maka instalasi berhasil!

---

## Langkah 7: Pembuatan Akun Administrator Pertama

Karena *auto-seed* dimatikan pada `production`, Anda harus membuat akun Admin pertama secara manual melalui skrip lokal di dalam container:

```bash
docker exec -it ecakra_backend python -c "
from app.database.session import engine
from sqlmodel import Session
from app.database.models import User, UserRole
from app.core.security import hash_password

with Session(engine) as session:
    admin = User(
        nama='Super Admin',
        username='admin_super',
        password_hash=hash_password('GANTI_PASSWORD_KUAT'),
        role=UserRole.admin
    )
    session.add(admin)
    session.commit()
    print('Akun admin berhasil dibuat!')
"
```

Silakan coba login menggunakan akun tersebut di Portal Internal. Selesai!