# Backend Blueprint — Practical, Ready-to-Build (Revisi)

Dokumen ini adalah rancangan backend E-CAKRA yang **telah disesuaikan secara aktual** dengan kerangka arsitektur yang sudah terbangun di dalam proyek saat ini.

## 1. Prinsip Desain

- **Modular Monolith**: Tidak memecahnya ke microservices demi kecepatan MVP, namun modul (`auth`, `hearings`, `waiting_room`, dll.) dipisahkan dalam folder tersendiri.
- **Single Database**: PostgreSQL 16 untuk sumber kebenaran data tunggal.
- **REST API + JSON**: Seluruh komunikasi antara React frontend dan backend berjalan di atas format JSON.
- **Authentication via JWT**: Otentikasi aplikasi menggunakan model Token statis pendek usia (15 menit untuk *production*).
- **Role-Based Access Control (RBAC)**: Kontrol level `admin`, `operator`, dan `panitera` diterapkan ketat sebagai penapis di FastAPI (`Depends`).
- **Fail-Fast Security**: Menolak *startup* jika konfigurasi rahasia (*secret*) kosong.

## 2. Diagram Arsitektur Backend (FastAPI)

```mermaid
flowchart LR
  C[Client React Frontend] --> N[Nginx Proxy]
  Z[Zoom Cloud] -- Webhook --> N
  N --> G[FastAPI Server :8000]

  G --> A[Modul Auth & Users]
  G --> B[Modul Hearings & Zoom_Service]
  G --> W[Modul Waiting Room & Webhook]
  G --> T[Modul Tasks & Dashboard]
  
  B -- Server-to-Server OAuth --> Z
  W -- PUT admit/deny --> Z

  G --> DB[(PostgreSQL)]
```

### Komponen utama

- **FastAPI Server**: Proses utama yang menangani request, routing berbasis *async*, integrasi Zoom API, dan *schema validation* (Pydantic).
- **Modul Auth & Users**: Manajemen identitas lokal dan verifikasi *password hashing* bcrypt.
- **Modul Hearings**: Otomatisasi persidangan dan pembuatan *Zoom Meeting* terikat, serta penghasilan teks *template WhatsApp*.
- **Modul Webhook**: Menangkap *event* kedatangan peserta dari Zoom, memvalidasinya dengan *HMAC-SHA256 signature*, dan mencegah serangan ulangan (Replay Attack).
- **Modul Waiting Room**: Mengatur instruksi pengadilan (Admit, Hold, Reject) yang diteruskan secara nyata kepada API Zoom untuk mengubah status peserta di awan.
- **PostgreSQL**: Sumber data persisten yang dihubungkan melalui *SQLModel (SQLAlchemy)*.

## 3. Diagram Basis Data (ERD) Aktual

Sesuai dengan `app/database/models.py`, berikut adalah arsitektur model dan relasinya yang mengutamakan struktur minimal namun komprehensif:

```mermaid
erDiagram
  USERS ||--o{ HEARINGS : creates
  USERS ||--o{ AUDIT_LOGS : performs
  USERS ||--o{ TASKS : assigned_to
  HEARINGS ||--o| ZOOM_MEETINGS : has_one
  HEARINGS ||--o{ WAITING_PARTICIPANTS : contains

  USERS {
    string id PK
    string nama
    string username UK
    string password_hash
    enum role "admin/operator/panitera"
    boolean is_active
  }

  HEARINGS {
    string id PK
    string nomor_perkara
    date tanggal_sidang
    time jam_sidang
    string jenis_sidang
    string terdakwa
    string pengadilan_pengirim
    string kejaksaan_negeri
    string lapas_rutan
    string agenda
    enum status_sidang "Terjadwal/Selesai"
    enum status_transparansi "open/closed"
    string created_by FK
  }

  ZOOM_MEETINGS {
    string id PK
    string hearing_id FK
    string zoom_meeting_id UK
    string join_url
    string password
  }

  WAITING_PARTICIPANTS {
    string id PK
    string hearing_id FK
    string display_name
    string source_event_id "Zoom Participant UUID"
    enum validation_status "valid/review/invalid"
    enum operator_decision "admit/hold/reject"
  }

  TASKS {
    string id PK
    string title
    enum priority "high/medium/low"
    enum status "pending/in_progress/completed"
    string assigned_to FK
  }

  AUDIT_LOGS {
    string id PK
    string action
    string actor
    string entity_type
    string entity_id
    string description
    timestamp created_at
  }
  
  SYSTEM_SETTINGS {
    string key PK
    string value
    string description
  }
```

## 4. Definisi Modul Lanjutan & Keamanan

### A. Zoom API & Webhook (Fail-Fast Validation)
Modul Webhook kami difokuskan untuk keamanan tingkat lanjut karena diekspos secara publik.
1. Setiap pesan dari `/webhooks/zoom` diperiksa keberadaan *Header*-nya (tidak dapat dilewati pada `production`).
2. *Timestamp* kedaluwarsa divalidasi dengan toleransi 300 detik.
3. Fungsi `HMAC-SHA256` digunakan untuk membandingkan *signature* asli Zoom dengan payload.

### B. Validasi Nama Cerdas (Regex Heuristics)
Data yang masuk dari Zoom diproses menggunakan `name_validator.py` untuk menilai apakah:
- `invalid`: Berisi merek HP (Samsung, iPhone) atau anonim (User123).
- `valid`: Terdapat awalan standar pengadilan (JPU -, SAKSI -, HAKIM -).
- `review`: Ada nama, tapi tidak memenuhi sintaks yang sempurna.

### C. Audit Trail Wajib (Non-Repudiation)
Tak satupun tindakan pengubah basis data luput dari pencatatan log. Fungsi `log_action()` secara asinkron (dalam alur *router*) memastikan semua interaksi seperti *Admit Peserta*, *Hapus Sidang*, atau *Gagal Memanggil Zoom API* tercatat di tabel `AuditLog` sebelum mengembalikan respons ke React Frontend.

### D. Nginx Rate Limiting
Nginx telah ditambahkan di level *reverse proxy* Docker Compose untuk menetapkan batas laju (10 *request* per detik, *burst* 20) agar meminimalisir kemungkinan *Denial-of-Service* (DDoS) ke backend Python.

---

Dengan blueprint ini, E-CAKRA membuktikan dirinya sebagai MVP yang tak sekadar memajang antarmuka yang cantik, namun juga tangguh dalam ekosistem peradilan siber karena fondasi struktur datanya, audit trail, serta keamanannya.
