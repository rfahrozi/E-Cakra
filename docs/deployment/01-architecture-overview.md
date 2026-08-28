# Deployment Architecture Overview

Dokumen ini menjelaskan rancangan arsitektur *deployment* E-CAKRA untuk environment *Production*. Sistem didesain menggunakan pendekatan *Containerized Modular Monolith* yang stabil, mudah di-*deploy*, dan aman.

---

## 1. Topologi Komponen (Docker Compose)

Aplikasi dijalankan dalam satu VPS (Virtual Private Server) menggunakan Docker Compose yang mengatur **4 container** utama.

```text
[ INTERNET PUBLIK ]
         │
         ▼
  [ Firewall / Port 80 & 443 ]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ DOCKER HOST (VPS Ubuntu 22.04/24.04 LTS)                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ecakra_nginx (Nginx Alpine — Reverse Proxy)       │  │
│  │ - Port 80  → redirect 301 ke HTTPS               │  │
│  │ - Port 443 → SSL Termination (TLS 1.2/1.3)       │  │
│  │ - HSTS, Security Headers, Rate Limiter (10r/s)   │  │
│  │ - Certbot ACME challenge (/.well-known/)          │  │
│  └─────────┬──────────────────────────────┬──────────┘  │
│            │ Proxy Pass /                 │ Proxy Pass /api/ & /webhooks/
│            ▼                              ▼             │
│  ┌──────────────────────┐       ┌────────────────────┐  │
│  │ ecakra_frontend      │       │ ecakra_backend     │  │
│  │ (React + Vite static)│       │ (FastAPI + Python) │  │
│  │ - Nginx Alpine       │       │ - Uvicorn (8000)   │  │
│  │ - Port 80 (Internal) │       │ - Async workers    │  │
│  └──────────────────────┘       └─────────┬──────────┘  │
│                                           │             │
│                                           ▼             │
│                                 ┌────────────────────┐  │
│                                 │ ecakra_db          │  │
│                                 │ (PostgreSQL 16)    │  │
│                                 │ - Port 5432        │  │
│                                 │   (Terisolasi)     │  │
│                                 └────────────────────┘  │
│                                                         │
│  Volume: postgres_data (persisten di host)              │
│  Volume: ./nginx/ssl (sertifikat TLS)                   │
│  Network: ecakra_net (bridge, isolated)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Container

### A. Reverse Proxy (`ecakra_nginx`)
- **Image**: `nginx:alpine`
- **Port Host**: `80` dan `443`
- **Tanggung Jawab**:
  - Redirect semua HTTP (port 80) ke HTTPS (port 443) dengan kode 301
  - SSL Termination: TLS 1.2 / TLS 1.3, cipher suite aman (ECDHE/DHE)
  - Header keamanan: `Strict-Transport-Security` (HSTS 2 tahun), `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`
  - Rate Limiting: 10 req/s dengan burst 20 untuk endpoint `/api/` dan `/webhooks/`
  - Routing: `/api/` → backend, `/webhooks/` → backend, `/` → frontend
  - Dukungan Certbot ACME challenge via `/.well-known/acme-challenge/`
- **Volume yang di-mount**:
  - `./nginx/nginx.conf` → `/etc/nginx/conf.d/default.conf`
  - `./nginx/ssl/` → `/etc/nginx/ssl/` (sertifikat TLS)
  - `./nginx/certbot/www/` → `/var/www/certbot/` (ACME challenge)

### B. Frontend (`ecakra_frontend`)
- **Image**: Kustom — multi-stage build (`node:20-alpine` → `nginx:alpine`)
- **Tanggung Jawab**: Menyajikan aset statis React (HTML, CSS, JS) hasil build Vite
- **Keamanan**: Tidak dapat diakses dari luar host. Hanya `ecakra_nginx` yang dapat berkomunikasi melalui `ecakra_net`

### C. Backend (`ecakra_backend`)
- **Image**: Kustom (`python:3.12-slim`)
- **Tanggung Jawab**:
  - Memproses logika bisnis melalui FastAPI (27 endpoint)
  - Integrasi Zoom API (Server-to-Server OAuth): create/update/delete meeting, admit/reject participant, setup RTMP livestream
  - Validasi HMAC-SHA256 webhook Zoom + anti-replay (max 5 menit)
  - Token JWT blacklist via tabel `revoked_tokens`
- **Fitur Production Hardening**:
  - Swagger UI (`/docs`) dan OpenAPI JSON dinonaktifkan otomatis
  - App gagal start (*fail-fast*) jika `SECRET_KEY` atau `ZOOM_WEBHOOK_SECRET_TOKEN` belum dikonfigurasi
  - Auto-seed user default **dimatikan** di environment production

### D. Database (`ecakra_db`)
- **Image**: `postgres:16-alpine`
- **Port**: 5432 — **tidak di-expose ke host**, hanya dapat diakses internal via `ecakra_net`
- **Data Persisten**: Docker volume `postgres_data` pada host machine
- **Tabel-tabel utama**: `users`, `hearings`, `zoom_meetings`, `waiting_participants`, `audit_logs`, `system_settings`, `tasks`, `revoked_tokens`

---

## 3. Alur Data per Skenario

### Skenario 1: Operator Login
```
Browser → HTTPS/443 → Nginx → /api/auth/login → FastAPI → bcrypt verify → JWT token
```

### Skenario 2: Buat Sidang + Zoom Meeting
```
Panitera → POST /api/hearings → FastAPI:
  1. Simpan Hearing ke PostgreSQL
  2. Server-to-Server OAuth → Zoom API → create_meeting()
  3. Jika sidang 'terbuka': setup_zoom_livestream() (RTMP ke YouTube)
  4. Simpan ZoomMeeting ke PostgreSQL
  5. Catat audit log → return response
```

### Skenario 3: Waiting Room via Webhook
```
Zoom → POST /webhooks/zoom → Nginx → FastAPI:
  1. Verifikasi HMAC-SHA256 + timestamp (anti-replay)
  2. Buat/update WaitingParticipant
  3. Klasifikasi nama otomatis (valid/review/invalid)
  4. Catat audit log
  ↓
Operator di WaitingRoomPage → POST /api/participants/{id}/admit
  → Zoom API: PUT /meetings/{id}/participants/events (action: admit)
```

### Skenario 4: Logout + Token Blacklist
```
User → POST /api/auth/logout → FastAPI:
  1. Decode token → extract JTI (SHA-256 sub+exp)
  2. Simpan ke tabel revoked_tokens
  3. Cleanup token yang sudah expired
  4. Catat audit log LOGOUT
  ↓
Request berikutnya dengan token yang sama → get_current_user() cek blacklist → 401 Unauthorized
```

---

## 4. Networking & Isolasi

| Komunikasi | Mekanisme | Port |
|-----------|-----------|------|
| Internet → Nginx | Host port binding | 80, 443 |
| Nginx → Frontend | Docker internal DNS (`ecakra_frontend`) | 80 |
| Nginx → Backend | Docker internal DNS (`ecakra_backend`) | 8000 |
| Backend → Database | Docker internal DNS (`db`) | 5432 |
| Backend → Zoom API | Outbound HTTPS via internet | 443 |
| Zoom → Backend (Webhook) | Inbound via Nginx `/webhooks/` | 443 |

---

## 5. Requirement Perangkat Keras (VPS)

| Tier | CPU | RAM | Storage | Kapasitas |
|------|-----|-----|---------|----------|
| **Minimum (Pilot)** | 2 vCPU | 2 GB | 30 GB SSD | ±50 sidang/hari |
| **Rekomendasi (Produksi)** | 4 vCPU | 4 GB | 50 GB SSD | Jangka panjang |
| **OS** | Ubuntu Server 22.04 LTS atau 24.04 LTS | | | |

---

## 6. Struktur File Infrastruktur

```
E-Cakra/
├── docker-compose.yml          ← Orkestrasi 4 container (port 80 & 443)
├── docker-compose.dev.yml      ← Mode development (hot-reload)
├── .env                        ← Secrets production (JANGAN di-commit)
├── .env.example                ← Template variabel environment
├── nginx/
│   ├── nginx.conf              ← Konfigurasi Nginx (HTTP→HTTPS, routing, TLS)
│   ├── ssl/
│   │   ├── README.md           ← Panduan instalasi sertifikat SSL
│   │   ├── fullchain.pem       ← Sertifikat (tidak di-commit, ada .gitignore)
│   │   └── privkey.pem         ← Private key (tidak di-commit)
│   └── certbot/
│       └── www/                ← Webroot ACME challenge Let's Encrypt
├── backend/
│   ├── Dockerfile              ← Image production (python:3.12-slim)
│   └── Dockerfile.dev          ← Image development (hot-reload)
└── frontend/
    └── Dockerfile              ← Multi-stage build (node → nginx)
```
