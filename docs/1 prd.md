# PRD — E-CAKRA
## Electronic Command & Access for Court Room Administration

**Versi:** 1.0  
**Tanggal:** 28 Agustus 2026  
**Status:** Draft Final — Siap Implementasi MVP  
**Institusi Target:** Pengadilan Tinggi  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Kebutuhan Bisnis](#2-latar-belakang--kebutuhan-bisnis)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Ruang Lingkup](#4-ruang-lingkup)
5. [Pengguna Sasaran](#5-pengguna-sasaran)
6. [Persyaratan Fungsional](#6-persyaratan-fungsional)
7. [Persyaratan Non-Fungsional](#7-persyaratan-non-fungsional)
8. [Persyaratan Data](#8-persyaratan-data)
9. [Persyaratan Antarmuka & UX](#9-persyaratan-antarmuka--ux)
10. [Arsitektur & Persyaratan Teknis](#10-arsitektur--persyaratan-teknis)
11. [Kontrak API Minimum](#11-kontrak-api-minimum)
12. [Batasan Implementasi](#12-batasan-implementasi)
13. [Asumsi & Ketergantungan](#13-asumsi--ketergantungan)
14. [Rencana Implementasi 2 Minggu](#14-rencana-implementasi-2-minggu)
15. [Kriteria Penerimaan (Definition of Done)](#15-kriteria-penerimaan-definition-of-done)
16. [Risiko & Mitigasi](#16-risiko--mitigasi)

---

## 1. Ringkasan Eksekutif

E-CAKRA adalah portal internal berbasis web untuk Pengadilan Tinggi yang mengotomatisasi dan menstandarkan pengelolaan persidangan elektronik melalui Zoom. Sistem ini dirancang untuk menyelesaikan lima masalah operasional utama: pembuatan meeting manual yang rawan kesalahan, distribusi informasi sidang yang tidak seragam, ketidakkonsistenan konfigurasi keamanan ruang sidang virtual, tidak adanya sistem validasi peserta, dan absennya audit trail hukum yang dapat dipertanggungjawabkan.

**Target MVP:** Sistem dapat digunakan secara operasional dalam **2 minggu** tanpa over-engineering. Lima alur inti harus berjalan end-to-end sebelum MVP dinyatakan selesai.

---

## 2. Latar Belakang & Kebutuhan Bisnis

### BR001 — Otomatisasi Proses Sidang
Sistem harus menghilangkan proses manual dalam:
- Pembuatan meeting Zoom per sidang
- Distribusi join link ke pihak terkait
- Verifikasi identitas peserta di waiting room
- Pengelolaan admit/reject peserta
- Pencatatan aktivitas operator secara manual

### BR002 — Standarisasi Konfigurasi Ruang Sidang
Setiap sidang yang dibuat melalui sistem **wajib** menggunakan konfigurasi standar berikut secara otomatis:
- Waiting room: **aktif**
- Mute upon entry: **aktif**
- Penamaan meeting: **format seragam** berdasarkan nomor perkara
- Akses peserta: **terkontrol melalui waiting room**

### BR003 — Kepatuhan Hukum Sidang Terbuka/Tertutup
Sistem harus mendukung prinsip hukum acara:
- Sidang terbuka sebagai **default** (public trial principle)
- Sidang tertutup untuk perkara sensitif (misal: kesusilaan, anak)
- Pemisahan akses publik dari ruang interaksi utama
- Audit trail untuk kebutuhan legalitas dan pertanggungjawaban

### BR004 — Transparansi Publik Terkelola
Untuk sidang terbuka, publik **tidak masuk ke ruang Zoom utama**, melainkan mengakses siaran publik melalui kanal resmi (YouTube). Sistem cukup menandai status transparansi; orkestrasi streaming penuh ditunda ke fase berikutnya.

### BR005 — Kontrol Akses Ruang Sidang Virtual
Sistem harus membantu mencegah peserta tidak berwenang memasuki ruang sidang dengan:
- Validasi identitas berdasarkan format nama peserta
- Filtering otomatis di level waiting room
- Keputusan akhir tetap di tangan operator

---

## 3. Tujuan Produk

### OBJ001 — Tujuan Utama MVP
Dalam 2 minggu, sistem menyediakan portal internal yang dapat:
1. Membuat sidang dan meeting Zoom secara otomatis
2. Menyimpan data sidang ke database
3. Menampilkan daftar peserta di waiting room secara real-time
4. Memproses keputusan operator (admit / hold / reject)
5. Mencatat seluruh aktivitas inti ke audit log

### OBJ002 — Target Terukur
| Metrik | Target |
|--------|--------|
| Sidang dibuat via sistem mengikuti konfigurasi standar | 100% |
| Peserta eksternal tervalidasi otomatis dengan aturan nama dasar | ≥ 90% |
| Aktivitas inti admin/operator tercatat di audit log | 100% |
| MVP dapat dipakai operasional tanpa menunggu fitur lanjutan | ✓ |

### OBJ003 — Nilai Bisnis
- Mengurangi beban manual Panitera dalam pembuatan sidang
- Mempercepat distribusi informasi sidang ke semua pihak
- Mengurangi human error konfigurasi Zoom
- Menyediakan fondasi audit hukum yang dapat dipertanggungjawabkan
- Memberi fondasi modular untuk pengembangan fase berikutnya

---

## 4. Ruang Lingkup

### 4.1 Yang Termasuk dalam MVP

| Kode | Fitur | Keterangan |
|------|-------|------------|
| SCP001 | Login Internal | Form login username/password untuk admin dan operator |
| SCP002 | Form Penjadwalan Sidang | Input: nomor perkara, tanggal, jam, jenis sidang, status transparansi |
| SCP003 | Pembuatan Meeting Zoom | Otomatis via Zoom API Server-to-Server OAuth |
| SCP004 | Template Distribusi Sidang | Output siap salin untuk E-Berpadu/SIPP |
| SCP005 | Waiting Room Dashboard | Real-time via Zoom Webhook |
| SCP006 | Keputusan Operator | Admit / Hold / Reject per peserta |
| SCP007 | Audit Log Dasar | Semua aksi inti dengan timestamp |
| SCP008 | Status Transparansi Sidang | Terbuka / Tertutup, disimpan dan ditampilkan |

### 4.2 Yang Tidak Termasuk dalam MVP

| Kode | Fitur Ditunda |
|------|---------------|
| OOS001 | Integrasi dua arah penuh dengan E-Berpadu/SIPP |
| OOS002 | Sistem video conference pengganti Zoom |
| OOS003 | RBAC kompleks multi-level |
| OOS004 | Aplikasi mobile native |
| OOS005 | Arsip video jangka panjang |
| OOS006 | Analytics lanjutan |
| OOS007 | AI transcription / speech analysis |
| OOS008 | Notifikasi WhatsApp/email otomatis |
| OOS009 | HA multi-region / arsitektur enterprise |
| OOS010 | Integrasi perangkat keras ruang sidang fisik |
| OOS011 | Streaming RTMP otomatis penuh (MVP: status/placeholder saja) |

---

## 5. Pengguna Sasaran

### USR001 — Panitera
- **Peran:** Membuat jadwal sidang; menyalin template distribusi resmi
- **Kebutuhan:** Cepat, sederhana, minim risiko salah input
- **Konteks:** Menggunakan laptop/desktop di kantor pengadilan

### USR002 — Operator Sidang
- **Peran:** Memonitor waiting room; memutuskan admit/hold/reject; memantau event operasional
- **Kebutuhan:** Tampilan real-time, status peserta jelas, aksi cepat dan aman
- **Konteks:** Bertugas aktif saat sidang berlangsung, tekanan waktu tinggi

### USR003 — Admin TI
- **Peran:** Konfigurasi sistem, deployment, pemeliharaan
- **Kebutuhan:** Sistem mudah dipasang, modular, dapat diaudit
- **Konteks:** Tidak selalu hadir saat sidang; mengelola infrastruktur

### USR004 — Pengguna Eksternal (bukan pengguna portal)
Kejaksaan, penasihat hukum, saksi, lapas/rutan, dan pihak lain adalah **peserta sidang**, bukan pengguna portal. Identitas mereka divalidasi melalui format nama di waiting room.

### USR005 — Publik (bukan pengguna portal)
Pada sidang terbuka, publik hanya mengakses siaran publik (kanal YouTube resmi), tidak masuk ke portal atau ruang Zoom utama.

---

## 6. Persyaratan Fungsional

### 6.1 Autentikasi

| Kode | Persyaratan |
|------|-------------|
| FR001 | Sistem mengizinkan admin/operator login dengan akun internal (username + password) |
| FR002 | Sistem menyediakan mekanisme logout yang aman |
| FR003 | Sistem dapat menampilkan/mengenali user yang sedang login (identitas sesi aktif) |
| FR004 | Semua endpoint internal dilindungi; hanya pengguna terautentikasi yang dapat mengakses |

### 6.2 Penjadwalan Sidang

| Kode | Persyaratan |
|------|-------------|
| FR005 | Sistem menerima input: nomor perkara, tanggal sidang, jam sidang, jenis sidang/kamar, status transparansi |
| FR006 | Sistem membuat meeting Zoom berdasarkan data sidang yang diinput |
| FR007 | Saat membuat meeting, sistem **memaksa** konfigurasi standar: waiting room aktif, mute upon entry aktif, nama meeting terstandar |
| FR008 | Data sidang (hearing) disimpan ke database |
| FR009 | Hasil pembuatan Zoom meeting (join URL, meeting ID, password) disimpan ke database |
| FR010 | Sistem menghasilkan template siap salin berisi: nomor perkara, tanggal/jam, join link, meeting ID, format nama peserta, status transparansi |
| FR011 | Sistem mendukung dua mode sidang: `open` (terbuka) dan `closed` (tertutup) |
| FR012 | Mode `open`: sistem menandai sidang bersifat terbuka untuk publik |
| FR013 | Mode `closed`: sistem menandai sidang tertutup dan akses publik dinonaktifkan |

### 6.3 Waiting Room & Validasi Peserta

| Kode | Persyaratan |
|------|-------------|
| FR014 | Sistem menerima event webhook dari Zoom untuk waiting room |
| FR015 | Sistem mencocokkan event Zoom ke sidang/meeting yang relevan berdasarkan meeting ID |
| FR016 | Sistem menyimpan data peserta yang masuk waiting room |
| FR017 | Sistem menilai nama peserta menjadi: `valid`, `review`, atau `invalid` |
| FR018 | Sistem mendukung pola nama valid berikut: `JPU - Nama`, `PENASIHAT HUKUM - Nama`, `SAKSI - Nama`, `TERDAKWA - Nama`, `HAKIM - Nama`, `PANITERA - Nama` |
| FR019 | Nama yang tidak sepenuhnya cocok pola tetapi tampak mengandung identitas → status `review` |
| FR020 | Nama anonim/generik/perangkat (contoh: "Galaxy A15", "User123") → otomatis `invalid` |
| FR021 | Dashboard menampilkan daftar peserta waiting room beserta status validasi |
| FR022 | Operator dapat mengadmit peserta dari dashboard |
| FR023 | Operator dapat menahan (hold) peserta untuk verifikasi manual |
| FR024 | Operator dapat menolak (reject) peserta |

### 6.4 Audit & Logging

| Kode | Persyaratan |
|------|-------------|
| FR025 | Log tercatat saat sidang dibuat (create hearing) |
| FR026 | Log tercatat saat Zoom meeting berhasil dibuat |
| FR027 | Log tercatat saat peserta diterima dari webhook |
| FR028 | Log tercatat saat operator mengadmit peserta |
| FR029 | Log tercatat saat operator menahan (hold) peserta |
| FR030 | Log tercatat saat operator menolak (reject) peserta |
| FR031 | Log tercatat saat login berhasil |
| FR032 | Log tercatat jika terjadi error integrasi Zoom |
| FR033 | Setiap audit log memiliki timestamp (UTC, dapat dikonversi ke WIB untuk tampilan) |

### 6.5 Dashboard & Monitoring

| Kode | Persyaratan |
|------|-------------|
| FR034 | Dashboard menampilkan ringkasan: jumlah sidang hari ini, jumlah peserta menunggu, jumlah event audit |
| FR035 | Halaman daftar audit log tersedia |
| FR036 | Halaman waiting room khusus tersedia dengan daftar peserta dan tombol aksi operator |
| FR037 | Halaman form pembuatan sidang tersedia beserta panel output template |

---

## 7. Persyaratan Non-Fungsional

### 7.1 Performa

| Kode | Persyaratan |
|------|-------------|
| NFR001 | Waktu respons pembuatan meeting dan pemuatan dashboard ≤ 3 detik pada kondisi normal |
| NFR002 | Sistem mampu melayani minimal 5 operator aktif bersamaan pada tahap awal |

### 7.2 Keamanan

| Kode | Persyaratan |
|------|-------------|
| NFR003 | Sistem menggunakan autentikasi internal (username/password) |
| NFR004 | Password disimpan dalam bentuk hash (bcrypt atau argon2) |
| NFR005 | Akses aplikasi menggunakan HTTPS pada deployment |
| NFR006 | Kredensial Zoom/API disimpan via environment variables, **tidak hardcoded** |
| NFR007 | Aplikasi ditujukan untuk jaringan internal atau akses terbatas lembaga |

### 7.3 Keandalan

| Kode | Persyaratan |
|------|-------------|
| NFR008 | Target uptime MVP minimal 95% pada jam kerja |
| NFR009 | Jika webhook gagal diproses, sistem mencatat log error dan tidak crash |
| NFR010 | Sistem memiliki penanganan error dasar untuk integrasi Zoom dan operasi utama |

### 7.4 Kemudahan Penggunaan

| Kode | Persyaratan |
|------|-------------|
| NFR011 | Antarmuka sederhana, fokus operasional, minim klik |
| NFR012 | Navigasi dalam Bahasa Indonesia |
| NFR013 | Tombol aksi eksplisit: Admit, Hold, Reject, Buat Sidang, Login |
| NFR014 | Status visual konsisten: hijau = valid/admit, kuning = review/hold, merah = reject/tertutup |

### 7.5 Skalabilitas

| Kode | Persyaratan |
|------|-------------|
| NFR015 | Kode modular agar fitur lanjutan dapat ditambahkan tanpa rewrite total |
| NFR016 | Skema database dan service rapi untuk ekspansi setelah MVP |

### 7.6 Pemeliharaan

| Kode | Persyaratan |
|------|-------------|
| NFR017 | Backend dipisah per modul inti: `auth`, `hearings`, `waiting_room`, `audit` |
| NFR018 | Deployment dengan Docker Compose; mudah dipasang dan dipelihara |

---

## 8. Persyaratan Data

### 8.1 Entitas Data Utama

#### DR001 — User
```
id              UUID / int (PK)
nama            string
username        string (unique)
password_hash   string
role            enum: admin | operator | panitera
is_active       boolean
created_at      timestamp
```

#### DR002 — HearingSchedule (Sidang)
```
id                  UUID / int (PK)
nomor_perkara       string (required)
tanggal_sidang      date (required)
jam_sidang          time (required)
jenis_sidang        string
status_transparansi enum: open | closed
created_by          FK → User.id
created_at          timestamp
```

#### DR003 — ZoomMeeting
```
id                  UUID / int (PK)
hearing_id          FK → HearingSchedule.id
zoom_meeting_id     string
join_url            string
start_url           string
password            string
waiting_room_enabled boolean
mute_upon_entry     boolean
created_at          timestamp
```

#### DR004 — WaitingParticipant
```
id                  UUID / int (PK)
hearing_id          FK → HearingSchedule.id
display_name        string
validation_status   enum: valid | review | invalid
operator_decision   enum: admit | hold | reject | null
source_event_id     string (Zoom event ID)
joined_at           timestamp
updated_at          timestamp
```

#### DR005 — AuditLog
```
id              UUID / int (PK)
actor           string (username atau "system")
action          string (contoh: CREATE_HEARING, ADMIT_PARTICIPANT)
entity_type     string (contoh: hearing, participant, meeting)
entity_id       string
description     text
created_at      timestamp
```

#### DR006 — SystemSettings *(Opsional)*
```
id      int (PK)
key     string (unique)
value   text
```

### 8.2 Aturan Validasi Data

| Kode | Aturan |
|------|--------|
| DR007 | Nomor perkara wajib diisi dan tidak boleh kosong |
| DR008 | Tanggal dan jam sidang wajib valid (format dan nilai) |
| DR009 | Status transparansi hanya boleh: `open` atau `closed` |
| DR010 | Keputusan operator hanya boleh: `admit`, `hold`, atau `reject` |
| DR011 | Status validasi peserta hanya boleh: `valid`, `review`, atau `invalid` |

### 8.3 Retensi Data

| Kode | Aturan |
|------|--------|
| DR012 | Audit log disimpan minimal **1 tahun** atau mengikuti kebijakan internal pengadilan |

---

## 9. Persyaratan Antarmuka & UX

### UI001 — Halaman Login
- Field: Username, Password
- Tombol: Masuk
- Pesan error jika kredensial salah

### UI002 — Halaman Dashboard
Menampilkan ringkasan:
- Jumlah sidang hari ini
- Jumlah peserta menunggu di waiting room
- Jumlah audit event hari ini

### UI003 — Halaman Buat Sidang
- Form input: nomor perkara, tanggal, jam, jenis sidang, status terbuka/tertutup
- Tombol: Buat Sidang
- Panel output: template distribusi siap salin

### UI004 — Halaman Waiting Room
- Daftar peserta dengan kolom: nama, status validasi, waktu masuk
- Status validasi ditampilkan dengan warna (hijau/kuning/merah)
- Tombol aksi per peserta: **Admit**, **Hold**, **Reject**

### UI005 — Halaman Audit Log
Tabel dengan kolom:
- Waktu
- Aktor
- Aksi
- Entitas / Deskripsi

### UI006 — Prinsip Desain UI
- Tidak perlu kompleks atau estetis berlebihan pada tahap awal
- **Jelas, cepat dipakai, cocok untuk desktop/laptop operator**
- Bahasa Indonesia di seluruh antarmuka
- Navigasi sidebar atau header yang konsisten

---

## 10. Arsitektur & Persyaratan Teknis

### Stack Teknis

| Kode | Komponen | Pilihan |
|------|----------|---------|
| TECH001 | Language Backend | Python |
| TECH002 | Framework Backend | FastAPI |
| TECH003 | Database | PostgreSQL |
| TECH004 | ORM | SQLAlchemy atau SQLModel |
| TECH005 | Infrastruktur | Ubuntu VPS atau AWS instance sederhana |
| TECH006 | Containerization | Docker Compose |
| TECH007 | Reverse Proxy | Nginx |
| TECH008 | Zoom Auth | Server-to-Server OAuth (bukan static API key) |
| TECH009 | Event Zoom | Webhook |
| TECH010 | RTMP/Streaming | Placeholder/field status saja pada MVP; orkestrasi penuh di fase berikutnya |

### Diagram Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────┐
│              PENGGUNA INTERNAL              │
│    (Panitera / Operator / Admin TI)         │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
         ┌─────────▼──────────┐
         │    Nginx (Proxy)   │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │   FastAPI Backend  │
         │  ┌──────────────┐  │
         │  │    auth      │  │
         │  │   hearings   │  │
         │  │ waiting_room │  │
         │  │    audit     │  │
         │  └──────────────┘  │
         └──┬──────────┬──────┘
            │          │
   ┌────────▼──┐  ┌────▼──────────┐
   │ PostgreSQL│  │   Zoom API    │
   │  Database │  │ (Create Mtg)  │
   └───────────┘  └───────────────┘
                        │
               ┌────────▼────────┐
               │  Zoom Webhook   │
               │ (Waiting Room   │
               │   Events)       │
               └─────────────────┘
```

---

## 11. Kontrak API Minimum

### API001 — Autentikasi
```
POST   /auth/login          Login, return token/session
POST   /auth/logout         Hapus sesi aktif
GET    /auth/me             Identitas user yang sedang login
```

### API002 — Sidang (Hearings)
```
POST   /hearings                    Buat sidang baru + Zoom meeting
GET    /hearings                    Daftar semua sidang
GET    /hearings/{id}               Detail sidang
GET    /hearings/{id}/template      Template distribusi siap salin
```

### API003 — Waiting Room
```
GET    /hearings/{id}/participants       Daftar peserta waiting room
POST   /participants/{id}/admit         Admit peserta
POST   /participants/{id}/hold          Hold peserta
POST   /participants/{id}/reject        Reject peserta
```

### API004 — Audit Log
```
GET    /audit-logs          Daftar semua audit log (dengan filter opsional)
```

### API005 — Webhook Zoom
```
POST   /webhooks/zoom       Endpoint penerima event dari Zoom
```

### Contoh Response — Template Sidang
```json
{
  "nomor_perkara": "123/Pid.B/2026/PT.XXX",
  "tanggal": "2026-09-01",
  "jam": "09:00 WIB",
  "jenis_sidang": "Pidana Biasa",
  "status": "TERBUKA",
  "zoom_meeting_id": "123 456 7890",
  "join_url": "https://zoom.us/j/1234567890?pwd=xxx",
  "format_nama": "JPU - [Nama Lengkap] / PENASIHAT HUKUM - [Nama]",
  "catatan": "Masukkan nama sesuai format yang ditentukan"
}
```

---

## 12. Batasan Implementasi

| Kode | Batasan |
|------|---------|
| CON001 | MVP harus selesai dan dapat digunakan dalam **2 minggu** |
| CON002 | Hindari over-engineering; fokus pada alur inti yang berjalan |
| CON003 | Alur end-to-end yang berjalan lebih penting dari banyak fitur setengah jadi |
| CON004 | Lima alur inti wajib hidup: login → buat sidang → Zoom meeting → waiting room → audit log |
| CON005 | Streaming penuh, integrasi eksternal dua arah, dan analytics ditunda jika menghambat MVP |
| CON006 | Frontend tahap awal boleh sederhana; tidak perlu framework frontend berat |
| CON007 | Asumsi penggunaan di laptop/desktop internal; mobile bukan prioritas |

---

## 13. Asumsi & Ketergantungan

### Asumsi

| Kode | Asumsi |
|------|--------|
| ASM001 | Akun Zoom institusi tersedia dan aktif |
| ASM002 | Akun Zoom mendukung Server-to-Server OAuth |
| ASM003 | Webhook Zoom dapat diaktifkan di akun institusi |
| ASM004 | Server Ubuntu VPS atau AWS instance tersedia |
| ASM005 | Operator menggunakan perangkat desktop/laptop |
| ASM006 | Volume sidang tahap awal masih dapat ditangani arsitektur sederhana |
| ASM007 | Tim TI internal dapat menyediakan akses lingkungan dan konfigurasi |
| ASM008 | Kanal YouTube resmi pengadilan tersedia untuk fase streaming publik berikutnya |

### Ketergantungan Eksternal

| Kode | Ketergantungan |
|------|----------------|
| DEP001 | Zoom API (Server-to-Server OAuth) |
| DEP002 | Zoom Webhook untuk event waiting room |
| DEP003 | Docker / Docker Compose |
| DEP004 | PostgreSQL |
| DEP005 | RTMP + YouTube resmi (fase berikutnya, bukan MVP) |

---

## 14. Rencana Implementasi 2 Minggu

### Hari 1–2: Fondasi
- [ ] Init repository dan struktur proyek
- [ ] Setup Docker Compose (FastAPI + PostgreSQL + Nginx)
- [ ] Konfigurasi environment variables
- [ ] Migrasi database awal (tabel User, Hearing, ZoomMeeting, WaitingParticipant, AuditLog)
- [ ] Endpoint login sederhana + session/token
- [ ] Verifikasi koneksi database

### Hari 3–4: Sidang & Zoom
- [ ] Model dan endpoint `POST /hearings`
- [ ] Integrasi Zoom API: create meeting dengan konfigurasi standar
- [ ] Simpan hasil meeting ke database
- [ ] Audit log: create hearing + create meeting
- [ ] Unit test endpoint hearings

### Hari 5: Template Distribusi
- [ ] Endpoint `GET /hearings/{id}/template`
- [ ] Format template siap salin (nomor perkara, join link, format nama, status)
- [ ] Validasi output template

### Hari 6–7: Webhook Waiting Room
- [ ] Endpoint `POST /webhooks/zoom`
- [ ] Verifikasi signature webhook Zoom
- [ ] Mapping event ke hearing berdasarkan meeting ID
- [ ] Simpan peserta ke WaitingParticipant
- [ ] Validasi nama otomatis (valid/review/invalid)
- [ ] Audit log: webhook event peserta

### Hari 8–9: Aksi Operator & UI Dasar
- [ ] Endpoint admit / hold / reject
- [ ] Update database keputusan operator
- [ ] Audit log: aksi operator
- [ ] Dashboard HTML sederhana (Jinja2 atau React minimal)
- [ ] Halaman waiting room dengan tombol aksi
- [ ] Halaman audit log

### Hari 10: Dashboard Ringkasan
- [ ] Halaman dashboard: jumlah sidang hari ini, peserta menunggu, audit event
- [ ] Navigasi antar halaman
- [ ] Status visual (warna valid/review/invalid)

### Hari 11–12: Penguatan & Bug Fix
- [ ] Validasi input form (server-side)
- [ ] Error handling Zoom API (timeout, rate limit)
- [ ] Bug fixing hasil pengujian internal
- [ ] HTTPS via Nginx + SSL/TLS

### Hari 13: UAT Internal
- [ ] Skenario uji: login → buat sidang → webhook → admit/reject → cek audit log
- [ ] Validasi output template dengan kasus nyata
- [ ] Feedback dari Panitera dan Operator

### Hari 14: Deployment & Dokumentasi
- [ ] Deploy ke Ubuntu VPS
- [ ] Konfigurasi reverse proxy Nginx
- [ ] Aktifkan HTTPS
- [ ] Tulis dokumentasi instalasi singkat (README/INSTALL.md)
- [ ] Serahkan kepada Tim TI untuk handover

---

## 15. Kriteria Penerimaan (Definition of Done)

MVP dinyatakan **selesai** hanya jika **semua** kriteria berikut terpenuhi:

| Kode | Kriteria | Verifikasi |
|------|----------|------------|
| ACC001 | Admin/operator dapat login | Uji login berhasil dan gagal |
| ACC002 | Panitera dapat membuat sidang dari form | Sidang tersimpan di DB |
| ACC003 | Sistem benar-benar membuat meeting Zoom | Meeting ID valid di akun Zoom |
| ACC004 | Template sidang tampil dan dapat disalin | Output template lengkap dan akurat |
| ACC005 | Peserta waiting room masuk ke dashboard via webhook | Event webhook terproses dan tampil |
| ACC006 | Operator dapat melakukan hold, admit, dan reject | Status peserta berubah di DB dan UI |
| ACC007 | Semua aksi inti masuk audit log dengan timestamp | Log tersimpan dan dapat dilihat |
| ACC008 | Aplikasi berjalan di Ubuntu VPS dengan Docker Compose | Deployment berhasil tanpa error |
| ACC009 | Dokumentasi instalasi dasar tersedia | README/INSTALL.md dapat diikuti |
| **ACC010** | **Jika salah satu alur inti belum jalan, MVP belum selesai** | — |

---

## 16. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Akun Zoom tidak support Server-to-Server OAuth | Rendah | Tinggi | Verifikasi kapabilitas akun di Hari 1; siapkan fallback JWT |
| Webhook Zoom tidak bisa menjangkau server lokal | Sedang | Tinggi | Gunakan ngrok saat development; VPS publik untuk production |
| Format nama peserta sangat variatif | Tinggi | Sedang | Aturan nama awal cukup longgar; status `review` untuk kasus abu-abu |
| Integrasi Zoom melebihi rate limit | Rendah | Sedang | Tambah retry logic sederhana + audit error |
| Tim belum familiar dengan Docker | Sedang | Sedang | Sertakan docker-compose.yml siap pakai + instruksi step-by-step |
| Jadwal 2 minggu terlalu ketat | Sedang | Tinggi | Prioritaskan 5 alur inti; fitur lain ditunda |

---

## Lampiran: Alur Inti End-to-End

```
[Panitera] Isi form sidang
        ↓
[Sistem] Validasi input → Simpan hearing ke DB
        ↓
[Sistem] Panggil Zoom API → Buat meeting dengan konfigurasi standar
        ↓
[Sistem] Simpan ZoomMeeting → Catat audit log CREATE_HEARING + CREATE_MEETING
        ↓
[Panitera] Lihat & salin template distribusi sidang
        ↓
[Peserta] Join via link Zoom → Masuk waiting room
        ↓
[Zoom] Kirim webhook event ke POST /webhooks/zoom
        ↓
[Sistem] Proses event → Validasi nama → Simpan WaitingParticipant → Audit log
        ↓
[Operator] Lihat daftar peserta di dashboard
        ↓
[Operator] Klik Admit / Hold / Reject
        ↓
[Sistem] Update keputusan di DB → Catat audit log ADMIT/HOLD/REJECT_PARTICIPANT
        ↓
[Admin] Lihat audit log kapan saja untuk keperluan hukum/akuntabilitas
```

---

*Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk implementasi E-CAKRA MVP. Setiap perubahan persyaratan harus diperbarui di dokumen ini dan dikomunikasikan ke seluruh tim.*

**Dibuat:** 28 Agustus 2026  
**Dibuat oleh:** Tim Pengembang E-CAKRA  
**Status:** Disetujui untuk Implementasi MVP
