# Deployment Architecture Overview

Dokumen ini menjelaskan rancangan arsitektur *deployment* E-CAKRA untuk environment *Production*. Sistem didesain menggunakan pendekatan *Containerized Modular Monolith* yang stabil, mudah di-_deploy_, dan aman dari eksposur langsung ke internet.

## 1. Topologi Komponen (Docker Compose)

Aplikasi dijalankan dalam satu Virtual Private Server (VPS) atau Mesin Cloud (contoh: AWS EC2, DigitalOcean Droplet, atau Ubuntu Server On-Premise) menggunakan Docker Compose yang mengatur 4 (empat) *container* utama.

```text
[ INTERNET PUBLIK ]
         │
         ▼
  [ Firewall / Port 80 & 443 ]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ DOCKER HOST (VPS Ubuntu)                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ecakra_nginx (Nginx Reverse Proxy)                │  │
│  │ - Port 80 (HTTP) di-bind ke Host                  │  │
│  │ - Port 443 (HTTPS) dengan Certbot (Let's Encrypt) │  │
│  │ - SSL Termination, Security Headers, Rate Limiter │  │
│  └─────────┬──────────────────────────────┬──────────┘  │
│            │ (Proxy Pass /)               │ (Proxy Pass /api)
│            ▼                              ▼             │
│  ┌──────────────────────┐       ┌────────────────────┐  │
│  │ ecakra_frontend      │       │ ecakra_backend     │  │
│  │ (React + Vite static)│       │ (FastAPI + Python) │  │
│  │ - Nginx internal     │       │ - Uvicorn (Port 8000) │
│  │ - Port 80 (Internal) │       │ - Worker Processes │  │
│  └──────────────────────┘       └─────────┬──────────┘  │
│                                           │             │
│                                           ▼             │
│                                 ┌────────────────────┐  │
│                                 │ ecakra_db          │  │
│                                 │ (PostgreSQL 16)    │  │
│                                 │ - Port 5432        │  │
│                                 │   (Terisolasi)     │  │
│                                 └────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 2. Rincian Container

### A. Reverse Proxy (`ecakra_nginx`)
- **Image**: `nginx:alpine`
- **Tanggung Jawab**: 
  - Menerima semua *request* dari internet (Port 80/443).
  - Melakukan *routing*: request `/api/` dan `/webhooks/` diarahkan ke backend, sedangkan request `/` diarahkan ke frontend.
  - Membatasi *Rate Limiting* (contoh: 10 req/s) untuk mencegah serangan DDoS atau *brute-force* pada halaman login dan webhook.
  - Menyuntikkan *Security Headers* (X-XSS-Protection, X-Frame-Options).
- **Keamanan**: Bertindak sebagai tembok (*shield*) pertama. Port aplikasi lain tidak boleh di-bind ke *host machine*.

### B. Frontend (`ecakra_frontend`)
- **Image**: `nginx:alpine` (hasil multi-stage build dari `node:20-alpine`)
- **Tanggung Jawab**: Menyajikan file HTML, CSS, dan JS statis yang sudah di-*build* (Vite/React).
- **Keamanan**: Tidak dapat diakses dari port luar host. Hanya `ecakra_nginx` yang dapat membaca asetnya melalui internal network Docker (`ecakra_net`).

### C. Backend (`ecakra_backend`)
- **Image**: Kustom (berbasis `python:3.12-slim`)
- **Tanggung Jawab**: 
  - Memproses logika bisnis (FastAPI).
  - Integrasi dengan Zoom API (Server-to-Server OAuth).
  - Menerima dan memvalidasi HMAC Webhook dari Zoom.
- **Konfigurasi Startup**: Di environment `production`, fitur *auto-seed* akun default **dimatikan**, dan aplikasi akan menolak (*fail-fast*) untuk *startup* jika `SECRET_KEY` atau `ZOOM_WEBHOOK_SECRET_TOKEN` tidak dikonfigurasi. Swagger UI (`/docs`) otomatis dimatikan.

### D. Database (`ecakra_db`)
- **Image**: `postgres:16-alpine`
- **Tanggung Jawab**: Menyimpan data relasional (Users, Hearings, Settings, dll).
- **Keamanan**: Port 5432 **tidak di-expose** ke host. Data disimpan secara persisten di host machine menggunakan Docker Volume (`postgres_data`).

## 3. Alur Data Jaringan (Networking)

Seluruh kontainer dihubungkan melalui *user-defined bridge network* milik Docker bernama `ecakra_net`.
Koneksi `ecakra_backend` ke `ecakra_db` menggunakan resolusi DNS internal Docker dengan alamat URL:
`postgresql://USER:PASSWORD@db:5432/DATABASE_NAME`

## 4. Requirement Perangkat Keras (VPS)

Untuk menampung beban operasional Pengadilan Tinggi:
- **Minimum**: 2 vCPU, 2 GB RAM, 30 GB SSD (cukup untuk ±50 sidang/hari).
- **Direkomendasikan**: 4 vCPU, 4 GB RAM, 50 GB SSD (untuk keandalan jangka panjang dan penambahan fitur).
- **OS**: Ubuntu Server 22.04 LTS atau 24.04 LTS.
