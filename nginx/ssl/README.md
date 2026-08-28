# Panduan Instalasi Sertifikat SSL/TLS — E-CAKRA

Folder ini adalah tempat menyimpan file sertifikat SSL yang dibutuhkan Nginx.
**Jangan commit file `.pem` ke Git** — tambahkan `*.pem` dan `*.key` ke `.gitignore`.

---

## Pilihan A: Let's Encrypt (Certbot) — Gratis, Direkomendasikan

### Prasyarat
- Server publik dengan domain (misal: `ecakra.pengadilan.go.id`)
- Port 80 terbuka dari internet
- Docker & docker-compose sudah terinstal

### Langkah

```bash
# 1. Install certbot di host (Ubuntu/Debian)
sudo apt install certbot

# 2. Jalankan certbot dalam mode standalone (matikan nginx dulu jika perlu)
sudo certbot certonly --standalone -d ecakra.pengadilan.go.id

# 3. Salin sertifikat ke folder ini
sudo cp /etc/letsencrypt/live/ecakra.pengadilan.go.id/fullchain.pem ./nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/ecakra.pengadilan.go.id/privkey.pem   ./nginx/ssl/privkey.pem
sudo chmod 644 ./nginx/ssl/fullchain.pem
sudo chmod 600 ./nginx/ssl/privkey.pem

# 4. Update server_name di nginx/nginx.conf
#    Ganti: server_name _;
#    Jadi:  server_name ecakra.pengadilan.go.id;

# 5. Jalankan / restart nginx
docker compose restart nginx
```

### Perpanjangan Otomatis (Cron)
```bash
# Tambahkan ke crontab (cek tiap hari, perpanjang jika < 30 hari)
0 3 * * * certbot renew --quiet && \
  cp /etc/letsencrypt/live/ecakra.pengadilan.go.id/fullchain.pem /path/to/project/nginx/ssl/fullchain.pem && \
  cp /etc/letsencrypt/live/ecakra.pengadilan.go.id/privkey.pem /path/to/project/nginx/ssl/privkey.pem && \
  docker compose -f /path/to/project/docker-compose.yml restart nginx
```

---

## Pilihan B: Sertifikat Instansi / Self-Signed (Intranet)

Jika aplikasi hanya diakses di jaringan internal pengadilan:

```bash
# Self-signed (hanya untuk dev/intranet — browser akan memberi peringatan)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out    ./nginx/ssl/fullchain.pem \
  -subj "/C=ID/ST=Jakarta/O=Pengadilan Tinggi/CN=ecakra.local"
```

Untuk sertifikat resmi instansi (dari BSrE / CA pemerintah), tempatkan file:
- `fullchain.pem` — sertifikat server + chain (format PEM)
- `privkey.pem`   — private key (format PEM, jaga kerahasiaannya)

---

## Struktur File yang Diharapkan

```
nginx/
├── nginx.conf
├── ssl/
│   ├── README.md       ← file ini
│   ├── fullchain.pem   ← sertifikat (TIDAK di-commit ke Git)
│   └── privkey.pem     ← private key (TIDAK di-commit ke Git)
└── certbot/
    └── www/            ← webroot untuk ACME challenge
```

---

## Pengujian

```bash
# Uji konfigurasi nginx
docker compose exec nginx nginx -t

# Cek sertifikat yang aktif
echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -dates

# Cek rating SSL (perlu domain publik)
# https://www.ssllabs.com/ssltest/
```
