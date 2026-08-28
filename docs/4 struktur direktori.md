# Struktur Direktori E-CAKRA

Proyek E-CAKRA dirancang sebagai **Containerized Modular Monolith**, yang memisahkan antara frontend dan backend dalam dua direktori utama di dalam satu *repository*.

Berikut adalah struktur lengkap file dan folder (*tree*) dari akar proyek:

```text
E-Cakra/
├── backend/                        # Aplikasi Backend (FastAPI / Python)
│   ├── app/
│   │   ├── core/                   # Konfigurasi sistem dan Keamanan (JWT)
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── database/               # Koneksi PostgreSQL dan Model Data
│   │   │   ├── init_db.py          # Skrip penyemaian data awal (seed)
│   │   │   ├── models.py           # SQLModel Schema
│   │   │   └── session.py
│   │   ├── modules/                # Logika Bisnis & Endpoint (REST API)
│   │   │   ├── audit/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── hearings/           # CRUD Sidang & Integrasi Zoom
│   │   │   ├── public/             # API Landing Page tanpa otentikasi
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   ├── waiting_room/       # Aksi admit/hold/reject
│   │   │   └── webhook/            # Verifikasi HMAC dari Zoom
│   │   ├── utils/
│   │   │   ├── audit.py            # Helper pencatat log
│   │   │   └── name_validator.py   # Regex penganalisis format nama peserta
│   │   └── main.py                 # Entry point FastAPI
│   ├── migrations/                 # (Opsional) Berkas migrasi database Alembic
│   ├── tests/                      # Rencana direktori untuk Pytest
│   ├── Dockerfile                  # Image Docker untuk Production
│   ├── Dockerfile.dev              # Image Docker untuk Development (Hot-reload)
│   └── requirements.txt            # Dependensi Python
│
├── frontend/                       # Aplikasi Frontend (React / TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   └── layouts/            # Template tampilan tata letak (Main & Auth)
│   │   ├── constants/
│   │   │   └── routes.ts           # Definisi path React Router
│   │   ├── features/               # Pembungkus logika panggilan Axios per domain
│   │   │   ├── audit-log/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── hearings/
│   │   │   ├── public/
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   └── users/
│   │   ├── pages/                  # Komponen Visual UI (Pages)
│   │   │   ├── audit-log/
│   │   │   ├── dashboard/
│   │   │   ├── hearings/
│   │   │   ├── login/
│   │   │   ├── public/             # LandingPage.tsx
│   │   │   ├── settings/
│   │   │   ├── users/
│   │   │   └── waiting-room/
│   │   ├── services/
│   │   │   └── http/               # Konfigurasi instance Axios
│   │   ├── store/
│   │   │   └── app.store.ts        # Zustand (Global State Management)
│   │   ├── styles/
│   │   │   └── index.css           # Konfigurasi Tailwind & Utility Classes
│   │   ├── types/
│   │   │   └── common.ts           # Antarmuka (Interface) TypeScript
│   │   ├── App.tsx                 # Routing Utama React
│   │   └── main.tsx                # React DOM Mount
│   ├── Dockerfile                  # Image Docker Production (Nginx + static build)
│   ├── Dockerfile.dev              # Image Docker Development (Vite Dev Server)
│   ├── index.html                  # Berkas HTML utama
│   ├── nginx-fe.conf               # Aturan Nginx internal untuk routing SPA
│   ├── package.json                # Dependensi NPM
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                           # Seluruh Dokumen Pendukung & Arsitektur
│   ├── deployment/                 # Dokumen Arsitektur VPS dan Keamanan
│   │   ├── 01-architecture-overview.md
│   │   ├── 02-server-setup-guide.md
│   │   └── 03-security-and-maintenance.md
│   ├── 1 prd.md                    # Product Requirement Document
│   ├── 2 ecakra-jira-ready-sprint-plan.md
│   ├── 3 frontend-architecture-ecakra.md
│   ├── 4 struktur direktori.md
│   ├── 5 backend-blueprint.md
│   ├── 6 backend-implementation-plan.md
│   ├── coding-standards.md
│   ├── qa-checklist-backend.md     # Panduan Quality Assurance
│   └── README.md
│
├── nginx/                          # Konfigurasi Reverse Proxy Utama Server
│   └── nginx.conf                  # Pengaturan Port 80, Security Headers, Rate Limit
│
├── scripts/                        # (Opsional) Bash Utilities Tambahan
│
├── .env.example                    # Template Environment Variabel Publik
├── .env.dev                        # Environment Variabel khusus Development
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── docker-compose.yml              # Orkestrasi Container Production
├── docker-compose.dev.yml          # Orkestrasi Container Development
├── LICENSE
└── README.md                       # Panduan Cara Menginstall Aplikasi
```

Struktur ini mendemonstrasikan pemisahan batas (separation of concern) yang sangat baik, di mana `backend` menangani logika sistem, `frontend` menangani pengalaman pengguna, dan *Reverse Proxy* `nginx` di root proyek berfungsi untuk menyatukan dan melindungi keduanya.
