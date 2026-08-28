# Security and Maintenance Guide

Dokumen ini merangkum praktik terbaik untuk menjaga keamanan dan memelihara aplikasi E-CAKRA setelah berhasil *live* di *Production*.

---

## 1. Keamanan Aplikasi (Security Hardening)

### A. Konfigurasi Rahasia (Secrets)
- **Jangan Pernah Menyimpan Secrets di Git**: File `.env` wajib dimasukkan ke `.gitignore`. Gunakan `.env.example` untuk acuan variabel.
- **Kekuatan Kata Sandi**: `SECRET_KEY` pada backend harus berisi string acak yang kuat (min. 32 karakter). 
- **Rotasi API Key**: Sangat disarankan untuk merotasi (mengubah) `ZOOM_CLIENT_SECRET` dan `ZOOM_WEBHOOK_SECRET_TOKEN` secara periodik di Zoom Marketplace (contoh: 6 bulan sekali) dan memperbaruinya di server.

### B. Proteksi Endpoint (Telah Diimplementasikan)
1. **Validasi Webhook Zoom**: Backend memverifikasi `X-Zm-Signature` menggunakan algoritma *HMAC-SHA256* pada endpoint `/webhooks/zoom`. Request liar akan otomatis ditolak dengan kode `401 Unauthorized`.
2. **Anti-Replay Attack**: Terdapat limitasi batas usia *timestamp* (*MAX_WEBHOOK_AGE_SECONDS* = 300 detik). Webhook usang yang dikirim oleh penyerang akan ditolak.
3. **Pembatasan Rate-Limit**: Nginx telah disetel untuk membatasi *request rate* API `10 requests/sec` dengan *burst* 20. Ini mencegah serangan *Brute Force* saat percobaan *login* dan perlindungan DDoS.
4. **Sembunyikan Dokumentasi Swagger**: Akses ke `/api/docs` dan `/api/openapi.json` dinonaktifkan secara otomatis (diarahkan ke `None`) saat variabel `APP_ENV` dikonfigurasikan sebagai `production`.

### C. Keamanan Database & Network
- Pastikan port `5432` PostgreSQL pada `docker-compose.yml` **tidak di-*bind* (diarahkan) ke host**. Database hanya boleh berkomunikasi di jaringan isolasi virtual `ecakra_net`.
- Jangan menggunakan *user* `postgres` default. Gunakan *user* aplikasi (contoh: `ecakra`).

---

## 2. Pemeliharaan Sistem (Maintenance)

### A. Pembaruan Aplikasi (Deploy Ulang)
Jika terdapat perubahan kode *source*, berikut cara aman untuk menarik (*pull*) pembaruan dan menjalankannya tanpa *downtime* panjang:

```bash
cd /opt/ecakra

# Ambil pembaruan dari repository
git pull origin main

# Lakukan rebuild kontainer tanpa menghentikan yang sedang berjalan
docker compose up -d --build
```
*Note: Proses instalasi depedency (npm/pip) akan memakan waktu saat build, tetapi kontainer lama tetap hidup hingga image baru selesai.*

### B. Membaca Log Kesalahan (Troubleshooting)
Semua aktivitas internal (gagal *Zoom API*, kesalahan koneksi *Database*) dilog oleh Docker.

```bash
# Melihat log backend secara live (terus memantau)
docker compose logs -f backend

# Melihat log Nginx Proxy
docker compose logs -f nginx
```

Cari log dengan awalan `ERROR_` untuk melakukan *debugging* atas kegagalan integrasi.

### C. Pencadangan Database (Backup)
Karena database berjalan di dalam kontainer Docker, proses pencadangan (*backup*) data dapat dilakukan menggunakan `pg_dump`.

**Cara membuat Backup (Dump):**
```bash
docker exec -t ecakra_db pg_dump -U ecakra -F c ecakra > /path/ke/folder/backup/ecakra_backup_$(date +%Y%m%d).dump
```

*Sangat disarankan membuat skrip `CronJob` pada Ubuntu host Anda untuk menjalankan perintah di atas secara harian dan menyimpannya ke server Cloud lain.*

**Cara melakukan Pemulihan (Restore):**
```bash
cat /path/ke/folder/backup/ecakra_backup_xxx.dump | docker exec -i ecakra_db pg_restore -U ecakra -d ecakra --clean
```

---

## 3. Manajemen Kapasitas Storage Docker

Kontainer Docker dan Image lama yang sudah tidak terpakai sering kali menumpuk dan membuat ruang disk penuh. Secara periodik (contoh: setiap bulan), Anda dapat membersihkannya.

```bash
# Menghapus kontainer/image mati (YANG SEDANG TIDAK BERJALAN)
docker system prune -a

# Mengecek ukuran volume disk
docker system df
```

Ikuti panduan di atas untuk memastikan E-CAKRA beroperasi tanpa gangguan dan tetap aman dari celah siber.
