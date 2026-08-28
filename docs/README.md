# Dokumentasi E-CAKRA

Selamat datang di direktori dokumentasi **E-CAKRA (Electronic Command & Access for Court Room Administration)**. Direktori ini berisi seluruh dokumen pendukung, mulai dari Product Requirements Document (PRD), perancangan arsitektur sistem, perencanaan *sprint*, hingga panduan *Quality Assurance* dan *Deployment*.

Semua dokumen di bawah ini telah diperbarui untuk merefleksikan arsitektur dan *tech stack* aktual yang digunakan pada implementasi terakhir (yaitu **FastAPI + PostgreSQL + React + Vite + Tailwind**).

## Daftar Isi Dokumentasi

### 1. Spesifikasi Produk & Perencanaan
- [**PRD (Product Requirements Document)**](./1%20prd.md)  
  Berisi latar belakang bisnis, kebutuhan pengguna, ruang lingkup MVP, spesifikasi fungsional dan non-fungsional, hingga kontrak API dasar.
- [**Sprint Plan & Backlog**](./2%20ecakra-jira-ready-sprint-plan.md)  
  Rencana rilis MVP yang dibagi ke dalam Epic dan Story (Jira Ready), mencakup alur kerja untuk *backend*, *frontend*, dan *DevOps*.

### 2. Arsitektur & Implementasi
- [**Arsitektur Frontend**](./3%20frontend-architecture-ecakra.md)  
  Panduan desain arsitektur React, struktur `pages` dan `features`, *state management* (Zustand), serta panduan layout (Tailwind CSS) untuk Dashboard dan Portal Publik.
- [**Struktur Direktori Proyek**](./4%20struktur%20direktori.md)  
  Pemetaan lengkap struktur *Containerized Modular Monolith* antara `backend/` dan `frontend/`.
- [**Blueprint Backend**](./5%20backend-blueprint.md)  
  Diagram alur data (Flowchart & ERD), *schema database* (SQLModel), *Role-Based Access Control (RBAC)*, serta integrasi kunci seperti Zoom Server-to-Server OAuth.
- [**Rencana Implementasi Backend**](./6%20backend-implementation-plan.md)  
  Langkah demi langkah (*step-by-step*) tahapan pengembangan FastAPI yang telah diselesaikan hingga status keamanan level produksi (*Production Hardening*).

### 3. Standar Penulisan Kode (Coding Standards)
- [**Standar Kode**](./coding-standards.md)  
  Aturan konvensi penamaan fungsi, variabel, komponen React, pengelolaan struktur modul API, hingga konvensi Git Commit.

### 4. Quality Assurance & Testing
- [**Checklist Verifikasi QA (Backend)**](./qa-checklist-backend.md)  
  Sebanyak 34 poin pengujian manual dan end-to-end yang krusial untuk memvalidasi integrasi Zoom Webhook, autentikasi sesi, dan manajemen *Role-Based Access*.

### 5. Deployment & Operasional
Semua file terkait deployment berada di dalam folder [`deployment/`](./deployment/):
- **`01-architecture-overview.md`**: Diagram jaringan VPS dan Docker Compose, *Proxy Pass*, dan *Networking Isolation*.
- **`02-server-setup-guide.md`**: Panduan *step-by-step* instalasi dari nol ke VPS Ubuntu, pengaturan Nginx, Sertifikat SSL (Certbot), dan `.env` production.
- **`03-security-and-maintenance.md`**: Best-practice rotasi kredensial rahasia, *Rate Limiting*, pencegahan *Replay Attack*, dan panduan Backup/Restore Database.

---

## Ringkasan *Tech Stack* Terkini

> *Dokumen lama mungkin menyebutkan Node.js/Express, namun proyek ini berhasil direalisasikan secara lebih ringkas, aman, dan efisien dengan teknologi berikut:*

### Backend
- **Python 3.12**
- **FastAPI** (Web Framework asinkron berkinerja tinggi)
- **SQLModel** (Gabungan SQLAlchemy & Pydantic untuk ORM)
- **PostgreSQL 16** (Database relasional)
- **Passlib & Python-Jose** (Keamanan *Bcrypt* & JWT Stateless)
- **Httpx** (Klien HTTP asinkron untuk Zoom API)

### Frontend
- **React 18**
- **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Utility-first styling)
- **Zustand** (Global state management)
- **React Hook Form** (Validasi Form)

### Infrastruktur / DevOps
- **Docker & Docker Compose** (Containerization)
- **Nginx** (Reverse Proxy, Rate Limiting, HTTP Security Headers)

---
*Tim E-CAKRA — Terakhir Diperbarui: Agustus 2026*
