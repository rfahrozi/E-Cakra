# Sprint Detail Pengembangan E-CAKRA — Format Jira Ready

## Dokumen
- **Produk:** E-CAKRA (Electronic Command & Access for Court Room Administration)
- **Versi acuan:** PRD v1.0
- **Target:** MVP operasional dalam 2 minggu
- **Tujuan dokumen:** Menyediakan backlog Jira-ready yang terperinci agar tim pengembang bisa langsung mulai membangun dan menyiapkan rilis ke production.

---

## 1. Ringkasan Sprint

MVP E-CAKRA difokuskan pada 5 alur inti end-to-end:
1. Login admin/operator
2. Pembuatan sidang dari form
3. Pembuatan Zoom meeting otomatis
4. Waiting room management melalui webhook Zoom
5. Audit log untuk seluruh aksi inti

> **Catatan penting:** MVP belum dianggap selesai bila salah satu dari alur inti tersebut belum berjalan end-to-end.

---

## 2. Struktur Board Jira yang Disarankan

### Kolom Board
- Backlog
- Selected for Development
- In Progress
- In Review
- QA / UAT
- Ready for Release
- Done

### Labels
- `mvp`
- `backend`
- `frontend`
- `devops`
- `integration`
- `security`
- `uat`
- `production`
- `zoom`
- `audit`
- `waiting-room`

### Components
- Auth
- Hearings
- Zoom Integration
- Waiting Room
- Audit Log
- Dashboard
- Deployment
- Documentation

### Priority Guideline
- **Highest:** item yang memblokir alur inti
- **High:** item yang menyempurnakan alur inti
- **Medium:** item pendukung production readiness

---

## 3. Sprint Plan 2 Minggu

### Sprint Window 1 — Hari 1 sampai 5
**Goal:** Fondasi, autentikasi, hearing creation, Zoom meeting automation, template distribusi.

**Exit Criteria:**
- Login berjalan
- Sidang dapat dibuat
- Zoom meeting valid berhasil dibuat
- Template distribusi tersedia dan dapat disalin

### Sprint Window 2 — Hari 6 sampai 10
**Goal:** Waiting room, webhook Zoom, validasi peserta, aksi operator, audit log, dashboard dasar.

**Exit Criteria:**
- Event webhook masuk ke sistem
- Peserta waiting room tampil di dashboard
- Operator dapat Admit / Hold / Reject
- Audit log seluruh aksi inti tampil

### Release Window — Hari 11 sampai 14
**Goal:** Hardening, deployment, HTTPS, dokumentasi, UAT, dan handover.

**Exit Criteria:**
- Aplikasi berjalan di Ubuntu VPS
- HTTPS aktif
- Dokumentasi instalasi tersedia
- UAT lolos untuk seluruh alur inti

---

## 4. Epic dan Backlog Jira Ready

# EPIC 1 — Fondasi Proyek & Environment
**Epic Key:** ECAKRA-EPIC-01  
**Epic Name:** Fondasi MVP  
**Objective:** Menyiapkan repository, environment, container, dan database awal.

## Story 1.1 — Inisialisasi repository dan struktur proyek
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Deployment

**Summary**  
Siapkan repository dan struktur proyek backend E-CAKRA.

**Description**  
Membuat struktur proyek backend modular untuk modul inti: `auth`, `hearings`, `waiting_room`, dan `audit`.

**Sub-tasks**
- Buat repository dan branch policy dasar
- Buat struktur folder backend modular
- Buat file environment example
- Buat konfigurasi startup aplikasi

**Acceptance Criteria**
- Struktur proyek tersedia dan dapat dijalankan lokal
- Modul inti dipisah sesuai kebutuhan MVP
- Konfigurasi environment tidak hardcoded
- Tim dapat clone dan run project tanpa setup manual yang tidak terdokumentasi

**Definition of Done**
- Repository aktif
- Struktur folder committed
- README setup lokal minimal tersedia

**Dependency**  
None

---

## Story 1.2 — Setup Docker Compose untuk aplikasi
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `devops`, `backend`
- **Component:** Deployment

**Summary**  
Siapkan Docker Compose untuk FastAPI, PostgreSQL, dan Nginx.

**Description**  
Menyiapkan environment containerized untuk local/dev dan dasar deployment ke Ubuntu VPS.

**Sub-tasks**
- Buat `docker-compose.yml`
- Tambahkan service aplikasi backend
- Tambahkan service PostgreSQL
- Tambahkan service Nginx
- Tambahkan volume dan network yang diperlukan
- Verifikasi seluruh service dapat naik bersamaan

**Acceptance Criteria**
- Semua service dapat start via Docker Compose
- Backend dapat terhubung ke database
- Nginx dapat meneruskan request ke aplikasi
- Struktur siap dipakai untuk deployment

**Definition of Done**
- `docker compose up` berhasil
- Service sehat dan dapat diuji
- Tidak ada konfigurasi rahasia yang di-hardcode

**Dependency**  
Story 1.1

---

## Story 1.3 — Konfigurasi environment variables
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `security`, `integration`
- **Component:** Deployment

**Summary**  
Siapkan environment variables untuk aplikasi dan integrasi Zoom.

**Description**  
Semua kredensial dan konfigurasi sensitif diambil dari environment variables.

**Sub-tasks**
- Definisikan daftar env yang wajib
- Tambahkan env untuk database
- Tambahkan env untuk auth/session
- Tambahkan env untuk Zoom API credentials
- Tambahkan env untuk webhook verification
- Tambahkan env untuk domain/base URL aplikasi

**Acceptance Criteria**
- Semua secret dibaca dari env
- Tidak ada secret yang tertulis di source code
- Aplikasi gagal dengan pesan jelas jika env penting belum tersedia

**Definition of Done**
- File `.env.example` tersedia
- Dokumentasi env tersedia
- Startup check env berjalan

**Dependency**  
Story 1.1

---

## Story 1.4 — Migrasi database awal
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Deployment

**Summary**  
Buat skema database awal untuk MVP.

**Description**  
Membuat tabel inti: `User`, `Hearing`, `ZoomMeeting`, `WaitingParticipant`, `AuditLog`.

**Sub-tasks**
- Buat migration tabel User
- Buat migration tabel Hearing
- Buat migration tabel ZoomMeeting
- Buat migration tabel WaitingParticipant
- Buat migration tabel AuditLog
- Tambahkan relasi antar tabel
- Tambahkan index dasar untuk query operasional

**Acceptance Criteria**
- Semua tabel inti berhasil dibuat
- Relasi hearing ke meeting tersedia
- Relasi hearing ke waiting participant tersedia
- Audit log dapat menyimpan event inti dengan timestamp

**Definition of Done**
- Migration bisa dijalankan dari nol
- Schema tervalidasi
- Database dapat dipakai service lain

**Dependency**  
Story 1.2, Story 1.3

---

## Story 1.5 — Verifikasi koneksi database
- **Issue Type:** Task
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Deployment

**Summary**  
Pastikan aplikasi dapat terkoneksi ke PostgreSQL.

**Acceptance Criteria**
- Health check koneksi database berhasil
- Aplikasi gagal secara aman jika database tidak tersedia
- Log startup menunjukkan status koneksi

**Definition of Done**
- Endpoint atau verifikasi startup tersedia
- Uji konektivitas berhasil pada Docker Compose

**Dependency**  
Story 1.4

---

# EPIC 2 — Autentikasi Internal
**Epic Key:** ECAKRA-EPIC-02  
**Epic Name:** Authentication  
**Objective:** Menyediakan autentikasi internal untuk admin/operator.

## Story 2.1 — Endpoint login
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`, `security`
- **Component:** Auth

**Summary**  
Implementasi `POST /auth/login`.

**Sub-tasks**
- Buat model request login
- Implementasi verifikasi username/password
- Hash password sesuai standar aman
- Kembalikan token/session
- Tangani login gagal
- Catat audit log login berhasil

**Acceptance Criteria**
- User valid dapat login
- Kredensial salah ditolak
- Password tidak disimpan plaintext
- Login berhasil tercatat di audit log

**Definition of Done**
- Endpoint berfungsi
- Uji login berhasil dan gagal lulus
- Event login tercatat

**Dependency**  
Story 1.4

---

## Story 2.2 — Endpoint logout
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`
- **Component:** Auth

**Summary**  
Implementasi `POST /auth/logout`.

**Acceptance Criteria**
- Sesi aktif dapat dihapus
- Setelah logout, akses terproteksi tidak bisa dipakai dengan sesi yang sama

**Definition of Done**
- Endpoint berjalan
- Uji logout selesai

**Dependency**  
Story 2.1

---

## Story 2.3 — Endpoint identitas user aktif
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`
- **Component:** Auth

**Summary**  
Implementasi `GET /auth/me`.

**Acceptance Criteria**
- User yang sudah login dapat melihat identitasnya
- Request tanpa autentikasi ditolak

**Definition of Done**
- Endpoint berjalan
- Proteksi auth tervalidasi

**Dependency**  
Story 2.1

---

## Story 2.4 — UI login sederhana
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `frontend`
- **Component:** Auth

**Summary**  
Buat halaman login internal berbahasa Indonesia.

**Sub-tasks**
- Form username/password
- Tombol Login eksplisit
- Tampilan error sederhana
- Redirect setelah login berhasil

**Acceptance Criteria**
- User dapat login melalui UI
- Navigasi Bahasa Indonesia
- Form sederhana dan operasional

**Definition of Done**
- Halaman login bisa dipakai admin/operator
- Error state tampil jelas

**Dependency**  
Story 2.1

---

# EPIC 3 — Manajemen Sidang & Pembuatan Meeting Zoom
**Epic Key:** ECAKRA-EPIC-03  
**Epic Name:** Hearings & Zoom Meeting  
**Objective:** Panitera dapat membuat sidang, sistem otomatis membuat Zoom meeting, lalu menyimpan hasilnya.

## Story 3.1 — Endpoint buat sidang
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Hearings

**Summary**  
Implementasi `POST /hearings`.

**Sub-tasks**
- Buat request schema pembuatan sidang
- Validasi input server-side
- Simpan hearing ke DB
- Panggil service Zoom create meeting
- Simpan hasil Zoom meeting
- Catat audit log create hearing
- Catat audit log create meeting
- Kembalikan response lengkap

**Acceptance Criteria**
- Panitera dapat membuat sidang dari form
- Hearing tersimpan di DB
- Meeting Zoom valid terbentuk
- Data meeting tersimpan terhubung ke hearing
- Audit log create hearing dan create meeting tercatat

**Definition of Done**
- Endpoint berjalan end-to-end
- Pengujian berhasil
- Meeting ID valid di akun Zoom

**Dependency**  
Story 1.4, Story 1.3

---

## Story 3.2 — Integrasi Zoom create meeting
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `integration`, `zoom`, `backend`
- **Component:** Zoom Integration

**Summary**  
Implementasi service integrasi Zoom untuk pembuatan meeting standar.

**Sub-tasks**
- Siapkan auth Zoom API
- Implementasi create meeting
- Mapping request internal ke format Zoom
- Mapping response Zoom ke model internal
- Tangani timeout dan error respons dasar

**Acceptance Criteria**
- Service dapat membuat meeting
- Response meeting berisi ID dan join URL yang dapat disimpan
- Error integrasi dapat ditangani tanpa crash

**Definition of Done**
- Service berhasil dipanggil dari `POST /hearings`
- Error integration tercatat di log

**Dependency**  
Story 1.3

---

## Story 3.3 — Endpoint daftar sidang
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`
- **Component:** Hearings

**Summary**  
Implementasi `GET /hearings`.

**Acceptance Criteria**
- Daftar sidang dapat diambil
- Data cukup untuk kebutuhan dashboard operasional

**Definition of Done**
- Endpoint berjalan
- Dapat diuji via UI atau API client

**Dependency**  
Story 3.1

---

## Story 3.4 — Endpoint detail sidang
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`
- **Component:** Hearings

**Summary**  
Implementasi `GET /hearings/{id}`.

**Acceptance Criteria**
- Detail sidang dan meeting terkait dapat dilihat
- Hearing yang tidak ada menghasilkan respons error yang benar

**Definition of Done**
- Endpoint berjalan
- Error handling tersedia

**Dependency**  
Story 3.1

---

## Story 3.5 — Form pembuatan sidang
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `frontend`
- **Component:** Hearings

**Summary**  
Buat halaman form pembuatan sidang.

**Sub-tasks**
- Form input data sidang
- Validasi client sederhana
- Submit ke `POST /hearings`
- Tampilkan hasil pembuatan
- Tampilkan link dan template hasil sidang

**Acceptance Criteria**
- Panitera dapat mengisi form dan submit
- Jika berhasil, sidang dan meeting tercipta
- Jika gagal, pesan error tampil jelas

**Definition of Done**
- Form dapat dipakai operasional
- Alur UI ke API berfungsi

**Dependency**  
Story 3.1

---

## Story 3.6 — Unit test endpoint hearings
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`, `qa`
- **Component:** Hearings

**Summary**  
Buat unit/integration test untuk endpoint hearings.

**Acceptance Criteria**
- Skenario berhasil membuat sidang diuji
- Skenario input invalid diuji
- Skenario gagal integrasi Zoom tertangani diuji

**Definition of Done**
- Test dapat dijalankan otomatis
- Hasil test terdokumentasi

**Dependency**  
Story 3.1, Story 3.2

---

# EPIC 4 — Template Distribusi Sidang
**Epic Key:** ECAKRA-EPIC-04  
**Epic Name:** Distribution Template  
**Objective:** Menyediakan output template sidang siap salin sesuai format operasional.

## Story 4.1 — Endpoint template sidang
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Hearings

**Summary**  
Implementasi `GET /hearings/{id}/template`.

**Sub-tasks**
- Bentuk response template terstruktur
- Mapping data hearing dan Zoom meeting
- Pastikan output lengkap
- Tangani hearing yang belum memiliki meeting

**Acceptance Criteria**
- Output template lengkap dan akurat
- Template bisa disalin untuk distribusi
- Field wajib tersedia dan konsisten

**Definition of Done**
- Endpoint tersedia
- Output tervalidasi dengan data uji

**Dependency**  
Story 3.1

---

## Story 4.2 — Panel output template di UI
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `frontend`
- **Component:** Hearings

**Summary**  
Tampilkan template distribusi di halaman sidang.

**Sub-tasks**
- Tampilkan hasil template setelah sidang dibuat
- Tambahkan tombol salin
- Tampilkan format nama peserta
- Tampilkan status sidang

**Acceptance Criteria**
- User dapat melihat template dari UI
- User dapat menyalin template dengan mudah
- Data template konsisten dengan backend

**Definition of Done**
- Panel output berjalan
- Uji tampilan berhasil

**Dependency**  
Story 4.1, Story 3.5

---

## Story 4.3 — Validasi output template
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `qa`, `uat`
- **Component:** Documentation

**Summary**  
Validasi output template dengan kasus nyata internal.

**Acceptance Criteria**
- Format output sesuai kebutuhan distribusi
- Field nomor perkara, join link, format nama, dan status tervalidasi

**Definition of Done**
- Hasil validasi terdokumentasi
- Perbaikan minor selesai jika ada temuan

**Dependency**  
Story 4.1, Story 4.2

---

# EPIC 5 — Webhook Zoom & Waiting Room
**Epic Key:** ECAKRA-EPIC-05  
**Epic Name:** Waiting Room Automation  
**Objective:** Peserta yang masuk waiting room Zoom diproses ke sistem melalui webhook, divalidasi, lalu tampil di dashboard.

## Story 5.1 — Endpoint webhook Zoom
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `integration`, `zoom`, `backend`
- **Component:** Waiting Room

**Summary**  
Implementasi `POST /webhooks/zoom`.

**Sub-tasks**
- Buat endpoint webhook
- Parsing payload Zoom
- Tangani request valid dan invalid
- Pastikan sistem tidak crash saat event gagal diproses

**Acceptance Criteria**
- Endpoint menerima event Zoom
- Event invalid tidak menyebabkan crash
- Sistem mencatat error bila pemrosesan gagal

**Definition of Done**
- Endpoint tersedia
- Skenario dasar event masuk berhasil

**Dependency**  
Story 3.2

---

## Story 5.2 — Verifikasi signature webhook Zoom
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `security`, `integration`
- **Component:** Waiting Room

**Summary**  
Tambahkan verifikasi signature webhook untuk keamanan.

**Acceptance Criteria**
- Webhook hanya diproses jika signature valid
- Signature invalid ditolak
- Credential verifikasi diambil dari env

**Definition of Done**
- Verifikasi aktif
- Uji valid dan invalid lulus

**Dependency**  
Story 5.1, Story 1.3

---

## Story 5.3 — Mapping event webhook ke hearing
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`, `zoom`
- **Component:** Waiting Room

**Summary**  
Hubungkan event Zoom ke sidang berdasarkan meeting ID.

**Acceptance Criteria**
- Event dengan meeting ID valid dapat dipetakan ke hearing
- Event yang tidak memiliki hearing terkait dicatat sebagai error atau log operasional

**Definition of Done**
- Mapping berjalan
- Kasus meeting ID tidak ditemukan tertangani

**Dependency**  
Story 5.1, Story 3.1

---

## Story 5.4 — Simpan peserta waiting room
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Simpan peserta dari webhook ke tabel WaitingParticipant.

**Acceptance Criteria**
- Peserta dari event tersimpan ke database
- Peserta terkait ke hearing yang benar
- Data cukup untuk ditampilkan di dashboard operasional

**Definition of Done**
- Record peserta tersimpan
- Dapat diambil kembali lewat API participants

**Dependency**  
Story 5.3

---

## Story 5.5 — Validasi nama otomatis
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Tambahkan klasifikasi nama `valid`, `review`, atau `invalid`.

**Acceptance Criteria**
- Sistem memberi status validasi nama
- Kasus ambigu diberi status `review`
- Hasil validasi disimpan bersama peserta

**Definition of Done**
- Logic validasi aktif
- Status tampil konsisten di data peserta

**Dependency**  
Story 5.4

---

## Story 5.6 — Audit log event peserta dari webhook
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `audit`, `backend`
- **Component:** Audit Log

**Summary**  
Catat event peserta yang diterima dari webhook ke audit log.

**Acceptance Criteria**
- Peserta yang masuk via webhook menghasilkan audit log
- Log memiliki timestamp

**Definition of Done**
- Event tercatat
- Dapat dilihat melalui halaman audit log

**Dependency**  
Story 5.4

---

# EPIC 6 — Aksi Operator pada Waiting Room
**Epic Key:** ECAKRA-EPIC-06  
**Epic Name:** Operator Control  
**Objective:** Operator dapat melihat daftar peserta dan melakukan Admit, Hold, Reject.

## Story 6.1 — Endpoint daftar peserta waiting room
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Implementasi `GET /hearings/{id}/participants`.

**Acceptance Criteria**
- Daftar peserta untuk satu hearing dapat diambil
- Data memuat status validasi dan status keputusan operator

**Definition of Done**
- Endpoint berjalan
- Data siap dipakai UI

**Dependency**  
Story 5.4, Story 5.5

---

## Story 6.2 — Endpoint admit peserta
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Implementasi `POST /participants/{id}/admit`.

**Acceptance Criteria**
- Operator dapat mengubah status peserta menjadi admit
- Perubahan tersimpan di database
- Audit log admit tercatat

**Definition of Done**
- Endpoint berfungsi
- Perubahan terlihat di UI dan DB

**Dependency**  
Story 6.1

---

## Story 6.3 — Endpoint hold peserta
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Implementasi `POST /participants/{id}/hold`.

**Acceptance Criteria**
- Operator dapat mengubah status peserta menjadi hold
- Perubahan tersimpan di database
- Audit log hold tercatat

**Definition of Done**
- Endpoint berfungsi
- Perubahan terlihat di UI dan DB

**Dependency**  
Story 6.1

---

## Story 6.4 — Endpoint reject peserta
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`
- **Component:** Waiting Room

**Summary**  
Implementasi `POST /participants/{id}/reject`.

**Acceptance Criteria**
- Operator dapat mengubah status peserta menjadi reject
- Perubahan tersimpan di database
- Audit log reject tercatat

**Definition of Done**
- Endpoint berfungsi
- Perubahan terlihat di UI dan DB

**Dependency**  
Story 6.1

---

## Story 6.5 — Halaman waiting room operasional
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `frontend`
- **Component:** Waiting Room

**Summary**  
Buat halaman waiting room dengan tombol Admit, Hold, Reject.

**Sub-tasks**
- Tampilkan daftar peserta per hearing
- Tampilkan status valid/review/invalid
- Tambahkan tombol Admit
- Tambahkan tombol Hold
- Tambahkan tombol Reject
- Refresh data setelah aksi
- Tampilkan pesan sukses/gagal

**Acceptance Criteria**
- Operator dapat melihat daftar peserta
- Operator dapat melakukan Admit, Hold, Reject dari UI
- Perubahan status terlihat setelah aksi

**Definition of Done**
- Halaman dapat dipakai operasional
- Seluruh tombol aksi tersambung ke endpoint

**Dependency**  
Story 6.2, Story 6.3, Story 6.4

---

# EPIC 7 — Audit Log & Monitoring
**Epic Key:** ECAKRA-EPIC-07  
**Epic Name:** Audit Trail  
**Objective:** Seluruh aksi inti tercatat dan dapat ditampilkan untuk akuntabilitas operasional.

## Story 7.1 — Model audit log terpadu
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `audit`, `backend`
- **Component:** Audit Log

**Summary**  
Standarkan pencatatan audit log untuk semua aksi inti.

**Acceptance Criteria**
- Semua event inti memiliki record audit log
- Setiap log memiliki timestamp UTC
- Log dapat dikonversi untuk tampilan operasional

**Definition of Done**
- Service atau helper audit log dipakai lintas modul
- Event inti ter-cover

**Dependency**  
Story 1.4

---

## Story 7.2 — Endpoint daftar audit log
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `backend`, `audit`
- **Component:** Audit Log

**Summary**  
Implementasi `GET /audit-logs`.

**Acceptance Criteria**
- Audit log dapat diambil dari backend
- Mendukung filter opsional jika dibutuhkan pada implementasi MVP

**Definition of Done**
- Endpoint aktif
- Hasil dapat dipakai UI audit log

**Dependency**  
Story 7.1

---

## Story 7.3 — Halaman audit log
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `frontend`, `audit`
- **Component:** Audit Log

**Summary**  
Buat halaman daftar audit log.

**Acceptance Criteria**
- Admin/operator dapat melihat daftar audit event
- Timestamp tampil jelas
- Halaman dapat dipakai untuk verifikasi operasional

**Definition of Done**
- Halaman tersedia
- Tersambung ke `GET /audit-logs`

**Dependency**  
Story 7.2

---

# EPIC 8 — Dashboard Operasional
**Epic Key:** ECAKRA-EPIC-08  
**Epic Name:** Dashboard  
**Objective:** Menyediakan dashboard sederhana yang fokus operasional dan minim klik.

## Story 8.1 — Dashboard ringkasan
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `frontend`
- **Component:** Dashboard

**Summary**  
Buat dashboard ringkasan operasional.

**Sub-tasks**
- Tampilkan kartu ringkasan sidang hari ini
- Tampilkan kartu peserta menunggu
- Tampilkan kartu jumlah event audit
- Tambahkan link navigasi ke waiting room, audit log, dan form sidang

**Acceptance Criteria**
- Ringkasan operasional tampil
- Navigasi antar halaman tersedia
- Dashboard sederhana dan fokus operasional

**Definition of Done**
- Halaman dashboard tersedia
- Data ringkasan tampil dengan benar

**Dependency**  
Story 3.3, Story 6.1, Story 7.2

---

## Story 8.2 — Status visual konsisten
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `frontend`, `ux`
- **Component:** Dashboard

**Summary**  
Terapkan warna status valid/review/invalid dan admit/hold/reject.

**Acceptance Criteria**
- Hijau = valid/admit
- Kuning = review/hold
- Merah = reject/tertutup
- Konsisten di seluruh UI

**Definition of Done**
- Warna status konsisten lintas halaman
- Tidak ada konflik tampilan

**Dependency**  
Story 5.5, Story 6.5, Story 8.1

---

## Story 8.3 — Navigasi Bahasa Indonesia
- **Issue Type:** Task
- **Priority:** Medium
- **Labels:** `mvp`, `frontend`, `ux`
- **Component:** Dashboard

**Summary**  
Pastikan seluruh navigasi dan tombol inti memakai Bahasa Indonesia.

**Acceptance Criteria**
- Tombol aksi eksplisit: Login, Buat Sidang, Admit, Hold, Reject
- Label navigasi dalam Bahasa Indonesia

**Definition of Done**
- Seluruh halaman utama konsisten

**Dependency**  
Story 2.4, Story 3.5, Story 6.5, Story 7.3, Story 8.1

---

# EPIC 9 — Hardening, Error Handling, dan Keamanan
**Epic Key:** ECAKRA-EPIC-09  
**Epic Name:** Production Readiness  
**Objective:** Memastikan aplikasi siap dipakai operasional dan tahan terhadap error dasar.

## Story 9.1 — Validasi input server-side
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `backend`, `security`
- **Component:** Security

**Summary**  
Tambahkan validasi input server-side untuk form dan endpoint inti.

**Acceptance Criteria**
- Input invalid ditolak dengan pesan yang jelas
- Data hearing tidak dapat tersimpan bila field wajib tidak valid

**Definition of Done**
- Validasi aktif di endpoint penting
- Kasus invalid diuji

**Dependency**  
Story 3.1, Story 2.1

---

## Story 9.2 — Error handling Zoom API
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `integration`, `zoom`, `backend`
- **Component:** Zoom Integration

**Summary**  
Tangani timeout, rate limit, dan error integrasi Zoom.

**Acceptance Criteria**
- Timeout ditangani tanpa crash
- Rate limit ditangani dengan respons yang aman
- Error integrasi Zoom dicatat ke audit/log

**Definition of Done**
- Kegagalan integrasi tidak mematikan aplikasi
- Log error tersedia untuk troubleshooting

**Dependency**  
Story 3.2

---

## Story 9.3 — Hardening webhook failure handling
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `backend`, `integration`
- **Component:** Waiting Room

**Summary**  
Pastikan kegagalan pemrosesan webhook tidak membuat sistem crash.

**Acceptance Criteria**
- Event gagal diproses dicatat
- Service tetap hidup
- Error dapat ditelusuri dari log

**Definition of Done**
- Uji failure path webhook berhasil

**Dependency**  
Story 5.1

---

# EPIC 10 — Deployment, HTTPS, dan Handover
**Epic Key:** ECAKRA-EPIC-10  
**Epic Name:** Release to Production  
**Objective:** Deploy ke Ubuntu VPS, aktifkan HTTPS, dan siapkan dokumentasi instalasi serta handover.

## Story 10.1 — Konfigurasi reverse proxy Nginx
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `devops`, `production`
- **Component:** Deployment

**Summary**  
Konfigurasi Nginx untuk reverse proxy aplikasi.

**Acceptance Criteria**
- Nginx meneruskan request ke backend
- Routing aplikasi berjalan dari domain atau host yang ditentukan

**Definition of Done**
- Konfigurasi tervalidasi di environment target

**Dependency**  
Story 1.2

---

## Story 10.2 — Aktivasi HTTPS
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `devops`, `security`, `production`
- **Component:** Deployment

**Summary**  
Aktifkan HTTPS melalui Nginx dan SSL/TLS.

**Acceptance Criteria**
- Aplikasi dapat diakses via HTTPS
- Kredensial dan trafik login tidak dikirim tanpa proteksi

**Definition of Done**
- HTTPS aktif di environment target
- Uji akses aman berhasil

**Dependency**  
Story 10.1

---

## Story 10.3 — Deploy ke Ubuntu VPS
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `devops`, `production`
- **Component:** Deployment

**Summary**  
Deploy aplikasi ke Ubuntu VPS menggunakan Docker Compose.

**Acceptance Criteria**
- Aplikasi berjalan di Ubuntu VPS
- Seluruh service naik tanpa error
- Endpoint utama dapat diakses

**Definition of Done**
- Deployment berhasil
- Verifikasi dasar pasca deploy selesai

**Dependency**  
Story 10.1, Story 10.2

---

## Story 10.4 — Dokumentasi instalasi dasar
- **Issue Type:** Story
- **Priority:** High
- **Labels:** `mvp`, `documentation`, `production`
- **Component:** Documentation

**Summary**  
Tulis README atau INSTALL.md untuk instalasi dan operasional awal.

**Acceptance Criteria**
- Dokumen menjelaskan prasyarat
- Dokumen menjelaskan env yang dibutuhkan
- Dokumen menjelaskan langkah menjalankan aplikasi
- Dokumen cukup untuk diikuti Tim TI

**Definition of Done**
- README atau INSTALL.md tersedia
- Di-review oleh minimal satu anggota tim selain penulis

**Dependency**  
Story 1.2, Story 1.3, Story 10.3

---

## Story 10.5 — Handover ke Tim TI
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `production`, `handover`
- **Component:** Documentation

**Summary**  
Lakukan serah terima aplikasi dan instruksi operasional dasar.

**Acceptance Criteria**
- Tim TI menerima artefak deployment
- Tim TI menerima dokumentasi instalasi
- Tim TI menerima env checklist dan prosedur startup/shutdown dasar

**Definition of Done**
- Handover selesai
- Bukti penerimaan atau sign-off internal tersedia

**Dependency**  
Story 10.4

---

# EPIC 11 — QA, UAT, dan Release Gate
**Epic Key:** ECAKRA-EPIC-11  
**Epic Name:** Validation & Go-Live  
**Objective:** Memastikan seluruh acceptance criteria MVP terpenuhi sebelum production.

## Story 11.1 — Uji alur inti end-to-end
- **Issue Type:** Story
- **Priority:** Highest
- **Labels:** `mvp`, `qa`, `uat`
- **Component:** Documentation

**Summary**  
Jalankan uji skenario login → buat sidang → webhook → admit/reject → audit log.

**Acceptance Criteria**
- Login berhasil
- Sidang dapat dibuat
- Meeting Zoom valid terbentuk
- Webhook peserta masuk dan tampil
- Operator dapat admit/hold/reject
- Semua event inti tercatat di audit log

**Definition of Done**
- Skenario lengkap diuji
- Evidence hasil uji tersimpan

**Dependency**  
Semua epic inti selesai

---

## Story 11.2 — Validasi output template dengan kasus nyata
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `uat`
- **Component:** Documentation

**Summary**  
Validasi template distribusi dengan kebutuhan operasional nyata.

**Acceptance Criteria**
- Template dipandang siap dipakai distribusi internal
- Tidak ada field penting yang hilang

**Definition of Done**
- Validasi terdokumentasi
- Perbaikan minor selesai

**Dependency**  
Epic 4 selesai

---

## Story 11.3 — Pengumpulan feedback Panitera dan Operator
- **Issue Type:** Task
- **Priority:** High
- **Labels:** `mvp`, `uat`
- **Component:** Documentation

**Summary**  
Kumpulkan feedback pengguna internal terhadap alur operasional.

**Acceptance Criteria**
- Feedback dari Panitera tersedia
- Feedback dari Operator tersedia
- Temuan blocker diperbaiki sebelum release

**Definition of Done**
- Feedback tercatat
- Keputusan release jelas

**Dependency**  
Story 11.1

---

## Story 11.4 — Release gate terhadap Definition of Done MVP
- **Issue Type:** Task
- **Priority:** Highest
- **Labels:** `mvp`, `production`, `qa`
- **Component:** Documentation

**Summary**  
Verifikasi seluruh acceptance criteria MVP sebelum go-live.

**Acceptance Criteria**
- Login lulus
- Create hearing lulus
- Create Zoom meeting lulus
- Template distribusi lulus
- Webhook ke dashboard lulus
- Admit/Hold/Reject lulus
- Audit log lulus
- Deployment Ubuntu VPS lulus
- Dokumentasi lulus
- Tidak ada alur inti yang mati

**Definition of Done**
- Checklist release disetujui internal
- Siap pindah ke production

**Dependency**  
Semua story release selesai

---

## 5. Pembagian Pekerjaan Tim

### Backend Engineer
- Epic 1
- Epic 2 API
- Epic 3 API + Zoom
- Epic 5
- Epic 6 API
- Epic 7 API
- Epic 9

### Frontend Engineer
- Epic 2 UI login
- Epic 3 form sidang
- Epic 4 panel template
- Epic 6 halaman waiting room
- Epic 7 halaman audit log
- Epic 8 dashboard

### DevOps
- Docker Compose
- Nginx
- HTTPS
- Ubuntu VPS deployment
- Dokumentasi deploy dan handover

### QA / PM / Product Owner
- UAT flow
- Validasi template
- Checklist release
- Sign-off production

---

## 6. Urutan Implementasi yang Direkomendasikan

1. Fondasi proyek
2. Database dan environment variables
3. Login
4. Create hearing
5. Zoom create meeting
6. Template distribusi
7. Webhook Zoom
8. Simpan waiting participant
9. Validasi nama
10. Admit / Hold / Reject
11. Audit log view
12. Dashboard
13. Hardening
14. HTTPS dan VPS deploy
15. UAT dan handover

---

## 7. Release Checklist ke Production

### Functional Gate
- Login berhasil dan gagal sudah diuji
- Sidang dapat dibuat dari form
- Meeting Zoom valid terbentuk
- Template distribusi akurat
- Webhook peserta tampil di dashboard
- Admit/Hold/Reject mengubah status di DB dan UI
- Audit log mencatat semua aksi inti

### Security Gate
- Password tersimpan dalam bentuk hash
- HTTPS aktif
- Semua secret via environment variables
- Webhook signature verification aktif

### Reliability Gate
- Error Zoom API tertangani
- Webhook failure tidak crash
- Log error tersedia

### Deployment Gate
- Docker Compose berjalan di Ubuntu VPS
- Nginx reverse proxy aktif
- Dokumentasi instalasi tersedia
- Handover ke Tim TI selesai

---

## 8. Template Standar untuk Pembuatan Issue Jira

Gunakan template berikut untuk setiap Story atau Task:

**Summary**
[Modul] Nama pekerjaan singkat

**Description**
Sebagai [role], saya butuh [capability], agar [outcome].

**Scope**
- ...
- ...
- ...

**Acceptance Criteria**
- ...
- ...
- ...

**Out of Scope**
- ...
- ...

**Dependency**
- ...

**Labels**
- mvp, backend/frontend/devops, dst.

**Evidence of Completion**
- Screenshot / response API / log / hasil UAT

---

## 9. Penutup

Dokumen ini dirancang agar backlog E-CAKRA dapat langsung dipindahkan ke Jira dan dikerjakan oleh tim secara paralel, dengan fokus utama memastikan seluruh alur inti MVP berjalan end-to-end dan siap masuk tahap production dalam target 2 minggu.