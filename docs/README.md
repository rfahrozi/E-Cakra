# Dokumentasi E-CAKRA

Selamat datang di direktori dokumentasi **E-CAKRA (Electronic Command & Access for Court Room Administration)**. Direktori ini berisi seluruh dokumen pendukung, mulai dari Product Requirements Document (PRD), perancangan arsitektur sistem, perencanaan *sprint*, hingga panduan *Quality Assurance*, *Deployment*, dan laporan evaluasi implementasi.

---

## Daftar Isi Dokumentasi

### 1. Spesifikasi Produk & Perencanaan
- [**PRD (Product Requirements Document)**](./1%20prd.md)
  Latar belakang bisnis, kebutuhan pengguna, ruang lingkup MVP, spesifikasi fungsional dan non-fungsional, kontrak API dasar.
- [**Tabel Requirement PRD**](./Tabel%20Requirement%20PRD%20ecakra.md)
  Tabel ringkas seluruh requirement F-001 s/d F-020 dan NF-001 s/d NF-012 beserta prioritas.
- [**Sprint Plan & Backlog**](./2%20ecakra-jira-ready-sprint-plan.md)
  Rencana rilis MVP yang dibagi ke dalam Epic dan Story (Jira Ready), mencakup alur kerja untuk *backend*, *frontend*, dan *DevOps*.
- [**Backlog Dashboard**](./Backlog%20dashboard.md)
  Backlog fitur tambahan dashboard dan task management.

### 2. Arsitektur & Implementasi
- [**Arsitektur Frontend**](./3%20frontend-architecture-ecakra.md)
  Desain arsitektur React, struktur `pages` dan `features`, *state management* (Zustand), layout (Tailwind CSS), Dashboard, dan Portal Publik.
- [**Struktur Direktori Proyek**](./4%20struktur%20direktori.md)
  Pemetaan lengkap *Containerized Modular Monolith* antara `backend/` dan `frontend/`.
- [**Blueprint Backend**](./5%20backend-blueprint.md)
  Diagram alur data (Flowchart & ERD), *schema database* (SQLModel), *Role-Based Access Control (RBAC)*, integrasi Zoom Server-to-Server OAuth.
- [**Rencana Implementasi Backend**](./6%20backend-implementation-plan.md)
  Tahapan pengembangan FastAPI dari awal hingga *Production Hardening*.

### 3. Standar Penulisan Kode
- [**Coding Standards**](./coding-standards.md)
  Konvensi penamaan fungsi, variabel, komponen React, struktur modul API, konvensi Git Commit.

### 4. Quality Assurance & Testing
- [**Checklist QA Backend**](./qa-checklist-backend.md)
  Checklist pengujian manual end-to-end untuk semua endpoint kritis — diperbarui dengan item token blacklist, edit sidang, RTMP livestream, profil, dan ganti password.

### 5. Evaluasi & Status Implementasi
- [**EVALUATION_REPORT.md**](./EVALUATION_REPORT.md)
  Laporan evaluasi mendalam perbandingan PRD vs implementasi aktual, termasuk semua gap yang ditemukan dan perbaikan yang dilakukan (Tahap 1 & 2). **Status akhir: ~97% requirement terpenuhi.**

### 6. Deployment & Operasional
Semua file terkait deployment berada di folder [`deployment/`](./deployment/):
- [**01-architecture-overview.md**](./deployment/01-architecture-overview.md): Diagram jaringan VPS dan Docker Compose, Proxy Pass, Networking Isolation, dan requirement hardware.
- [**02-server-setup-guide.md**](./deployment/02-server-setup-guide.md): Panduan *step-by-step* instalasi ke VPS Ubuntu — termasuk setup HTTPS langsung via Nginx dalam container (metode baru), konfigurasi `.env`, dan pembuatan akun admin pertama.
- [**03-security-and-maintenance.md**](./deployment/03-security-and-maintenance.md): Best-practice rotasi kredensial, Rate Limiting, pencegahan Replay Attack, Token Blacklist, Backup/Restore Database, dan pemeliharaan rutin.

---

## Ringkasan *Tech Stack* Terkini

### Backend
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Language | Python | 3.12 |
| Framework | FastAPI | 0.111.0 |
| ORM | SQLModel | 0.0.19 |
| Database | PostgreSQL | 16 |
| Auth | Python-Jose (JWT HS256) + Passlib (bcrypt) | — |
| HTTP Client | Httpx | 0.27.0 |
| Testing | Pytest + Pytest-Asyncio | 8.2.2 / 0.23.7 |

### Frontend
| Komponen | Teknologi | Keterangan |
|----------|-----------|-----------|
| UI Framework | React 18 + TypeScript | — |
| Build Tool | Vite | — |
| Styling | Tailwind CSS | Utility-first |
| State Management | Zustand (+ persist) | localStorage |
| Form | React Hook Form | Validasi client-side |
| HTTP Client | Axios | Auto-inject JWT |

### Infrastruktur / DevOps
| Komponen | Teknologi | Keterangan |
|----------|-----------|-----------|
| Containerization | Docker + Docker Compose | 4 container |
| Reverse Proxy | Nginx Alpine | HTTPS, Rate Limit, Security Headers |
| SSL/TLS | Let's Encrypt / Sertifikat Instansi | TLS 1.2/1.3 |

---

## Status Implementasi PRD (Per 28 Agustus 2026)

| Modul | Requirement | Status |
|-------|-------------|--------|
| Autentikasi & Akses | F-001, NF-004 | ✅ 100% |
| Penjadwalan Sidang | F-002, F-009–F-014 | ✅ 100% |
| Integrasi Zoom | F-003, F-019, F-020 | ✅ 100% |
| Waiting Room | F-004, F-005, F-015 | ✅ 100% |
| Audit Logging | F-006, F-016, F-017, NF-002 | ✅ 100% |
| Distribusi Informasi | F-007, F-018 | ✅ 100% |
| Keamanan | F-008, NF-001, NF-005–NF-007 | ✅ 100% |
| Dashboard & UX | NF-003, NF-008–NF-012 | ✅ 100% |
| **TOTAL** | **32 requirement** | **~97%** |

---

## Sebelum Menjalankan di Production

| Langkah | Keterangan |
|---------|-----------|
| 1. Pasang sertifikat SSL | Ikuti `nginx/ssl/README.md` atau `deployment/02-server-setup-guide.md` |
| 2. Isi `.env` lengkap | Termasuk `ZOOM_*`, `SECRET_KEY`, `POSTGRES_PASSWORD` |
| 3. Isi Zoom RTMP settings | `zoom_stream_rtmp_url` + `zoom_stream_key` di halaman `/settings` |
| 4. Jalankan test | `cd backend && pytest -v` |
| 5. Ganti password default | `admin123`, `operator123`, `panitera123` wajib diganti |
| 6. Update `server_name` Nginx | Ganti `_` dengan domain resmi di `nginx/nginx.conf` |

---

*Tim E-CAKRA — Terakhir Diperbarui: 28 Agustus 2026*
E2E dengan Playwright + Pytest