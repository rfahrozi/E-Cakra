# Front-End Architecture Document — E-CAKRA

## 1. Ringkasan

Dokumen ini mendefinisikan arsitektur front-end untuk aplikasi **E-CAKRA**, sebuah portal persidangan elektronik yang mencakup informasi publik dan portal operasional internal pengadilan. Arsitektur ini dirancang agar:

- cepat diimplementasikan untuk target MVP,
- mudah dipahami dan dirawat oleh tim,
- tidak over-engineered,
- siap dipakai pada lingkungan production internal maupun akses publik.

Pendekatan utama yang digunakan adalah **React + TypeScript + Vite + Tailwind CSS**, dengan fokus pada **desktop-first internal operations UI** serta satu *Landing Page* publik yang responsif.

---

## 2. Tujuan Arsitektur

### 2.1 Tujuan utama

- Menyediakan struktur front-end yang rapi, modular, dan mudah dikembangkan.
- Mendukung delivery MVP dalam waktu singkat.
- Menjaga konsistensi UI, data flow, dan coding standard.
- Memudahkan integrasi dengan backend FastAPI.
- Menjaga performa, aksesibilitas dasar, dan maintainability.

### 2.2 Non-goals

Hal berikut **bukan prioritas** pada fase MVP:

- micro-frontend,
- SSR/Next.js,
- design system kompleks,
- offline/PWA,
- realtime frontend architecture yang kompleks (WebSocket).

---

## 3. Karakteristik Produk

Berdasarkan kebutuhan produk, front-end E-CAKRA memiliki karakteristik berikut:

- aplikasi **internal (Portal Admin/Panitera/Operator)** dan **Publik (Landing Page)**,
- penggunaan operasional utama di **desktop/laptop**,
- antarmuka operasional harus **jelas, cepat dipakai, minim klik**,
- bahasa utama adalah **Bahasa Indonesia**,
- kebutuhan interaktivitas **sedang**, bukan SPA kompleks berskala besar.

Implikasinya: arsitektur dipilih agar **praktis**, bukan maksimalis.

---

## 4. Keputusan Teknologi

### 4.1 Stack utama

| Area | Pilihan |
|---|---|
| Framework | React |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router |
| State management | Zustand (Zustand + Persist) |
| Styling | Tailwind CSS + CSS murni secukupnya |
| Form handling | React Hook Form |
| HTTP access | Axios dengan interceptors |
| Linting | ESLint |
| Formatting | Prettier |
| Icons | Lucide React |

### 4.2 Alasan pemilihan

#### React & Vite
Dipilih karena cukup ringan, setup cepat, dev server ngebut, dan cocok untuk membangun halaman operasional berbasis komponen.

#### TypeScript
Digunakan untuk menjaga konsistensi kontrak data API, mengurangi bug, dan mempermudah pemeliharaan (dengan model seperti `User`, `Hearing`, `Task`).

#### Zustand
Dipilih untuk kebutuhan global state yang ringan seperti sesi user dan token. Menghindari boilerplate berlebih yang biasanya muncul pada Redux.

#### Tailwind CSS
Dipilih karena mempercepat pembuatan layout dan komponen UI operasional tanpa overhead file CSS besar. Digabungkan dengan beberapa class generik (`.card`, `.btn-primary`) di `index.css`.

---

## 5. Arsitektur Aplikasi

### 5.1 Gaya arsitektur

Aplikasi menggunakan pendekatan:

- **feature-oriented structure**,
- **page-based routing**,
- **thin global state**,
- **API layer per feature**,
- **reusable UI components secukupnya**.

Arsitektur ini dipilih agar tim bisa bekerja teratur tanpa membangun abstraksi yang belum diperlukan.

### 5.2 Prinsip desain arsitektur

1. **Keep the core simple** — utamakan alur kerja utama.
2. **Local state first** — state global (Zustand) hanya untuk auth dan sesi lintas halaman.
3. **Feature ownership jelas** — setiap fitur (auth, hearings, tasks, users) memiliki modul API (`api.ts`) yang terisolasi.
4. **Operational UX over decorative UI** — pada portal internal, prioritaskan keterbacaan, kejelasan error (Alert), dan kecepatan kerja (Refresh manual vs Auto-refresh 15 detik).

---

## 6. Struktur Direktori Frontend

```text
frontend/
├── src/
│   ├── app/
│   │   └── layouts/
│   │       ├── MainLayout.tsx         # Layout portal internal (dengan Sidebar Role-Based)
│   │       └── AuthLayout.tsx         # Layout halaman Login
│   ├── constants/
│   │   └── routes.ts                  # Daftar enumerasi routing
│   ├── features/                      # Logika komunikasi API ke Backend (Axios)
│   │   ├── audit-log/api.ts
│   │   ├── auth/api.ts
│   │   ├── dashboard/api.ts
│   │   ├── hearings/api.ts
│   │   ├── public/api.ts              # API khusus Landing Page Publik
│   │   ├── settings/api.ts
│   │   ├── tasks/api.ts               # API modul tugas Panitera
│   │   └── users/api.ts
│   ├── pages/                         # Komponen antarmuka per halaman
│   │   ├── audit-log/AuditLogPage.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── hearings/
│   │   │   ├── HearingCreatePage.tsx  # Form buat sidang
│   │   │   ├── HearingDetailPage.tsx  # Detail sidang & peserta
│   │   │   └── HearingListPage.tsx    # Tabel daftar seluruh sidang
│   │   ├── login/LoginPage.tsx
│   │   ├── public/LandingPage.tsx     # Portal publik / Jadwal Sidang Terbuka
│   │   ├── settings/SettingsPage.tsx  # Pengaturan admin
│   │   ├── users/UserListPage.tsx     # Manajemen akun admin
│   │   └── waiting-room/WaitingRoomPage.tsx
│   ├── services/
│   │   └── http/client.ts             # Instansiasi Axios & JWT Interceptors
│   ├── store/
│   │   └── app.store.ts               # Zustand store (Auth)
│   ├── styles/
│   │   └── index.css                  # Tailwind base & custom utility classes
│   ├── types/
│   │   └── common.ts                  # Definisi TypeScript Interface terpusat
│   ├── App.tsx                        # Router definitions
│   └── main.tsx                       # React Entry point
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 7. Routing

### 7.1 Daftar route utama

| Route | Halaman | Proteksi | Role |
|---|---|---|---|
| `/` | Landing Page (Jadwal Publik) | Public | Semua |
| `/login` | Login Portal Internal | Public | Semua |
| `/dashboard` | Dashboard Pusat Kerja / Tata Kelola | Private | Semua Role |
| `/hearings` | Daftar Seluruh Sidang | Private | Semua Role |
| `/hearings/new` | Buat Sidang Baru | Private | Semua Role (API dibatasi Panitera/Admin) |
| `/hearings/:id` | Detail Sidang & Peserta | Private | Semua Role |
| `/hearings/:id/waiting-room` | Waiting Room Full View | Private | Semua Role |
| `/audit-logs` | Histori Audit Log | Private | Semua Role |
| `/users` | Manajemen Pengguna | Private | **Admin Only** |
| `/settings` | Pengaturan Sistem (Zoom & Teks) | Private | **Admin Only** |

### 7.2 Strategi routing

- Gunakan **React Router** (`react-router-dom`).
- Komponen `PrivateRoute` akan mengecek state otentikasi. Jika *token* kedaluwarsa atau mendapat HTTP 401 dari backend, interceptor Axios akan otomatis menghapus sesi Zustand dan me-redirect ke `/login`.
- Sidebar menu di `MainLayout.tsx` disembunyikan/dimunculkan berdasarkan pengecekan `user.role` (contoh: menu `/users` hanya muncul jika role adalah `admin`).

---

## 8. Data Flow dan Layering

### 8.1 Pola data flow

Pola yang digunakan:
**Page/Component → Feature API Module → HTTP Client (Axios) → Backend API**

Contoh:
- `HearingCreatePage.tsx` memanggil `hearingsApi.create(data)`
- `features/hearings/api.ts` memparsing *request* dan memanggil `client.post('/hearings', data)`
- `services/http/client.ts` otomatis menyuntikkan *Header* `Authorization: Bearer <token>` dari Zustand.

### 8.2 Tujuan layering

- Memisahkan tanggung jawab UI (React) dan data access (Axios).
- Memudahkan standarisasi penangkapan *Error*. *Catch block* di UI akan mengambil `err.response.data.detail` yang dilempar dari `HTTPException` FastAPI untuk menampilkannya kepada pengguna (misal gagal integrasi Zoom).

---

## 9. Kontrak Data (TypeScript)

Type terpusat di `types/common.ts` menjamin Frontend mengetahui struktur respons Backend:

- `User` (Role admin, panitera, operator)
- `Hearing` (Informasi Perkara, Waktu, Terdakwa, Instansi Terkait, Transparansi)
- `ZoomMeetingBrief` (URL, Password, Meeting ID)
- `HearingTemplate` (Teks siap salin WhatsApp)
- `WaitingParticipant` (Nama, Validasi, Keputusan)
- `AuditLog` (Aksi, Pelaku, Waktu)
- `Task` (Tugas Harian Panitera)
- `DashboardSummary` (Kumpulan statistik)

Semua type ini selaras dengan skema Pydantic (`HearingOut`, `TaskOut`, dll) di backend.

---

## 10. Styling Strategy

- **Tailwind CSS** sebagai strategi styling utama.
- Desain **Desktop-First**: Karena operator bekerja menggunakan PC di ruang sidang.
- Penggunaan warna semantik untuk status:
  - `Valid` / `Admit`: **Hijau**
  - `Review` / `Hold`: **Kuning/Oranye**
  - `Invalid` / `Reject` / `Offline`: **Merah**
  - `Sidang Terbuka`: **Biru**

---

## 11. Halaman Inti

### 11.1 Landing Page Publik (`/`)
Menampilkan jadwal persidangan *hari ini* yang berstatus *Terbuka Untuk Umum*, dan mematikan/menghidupkan tombol *Live Streaming YouTube* tergantung ketersediaan sidang.

### 11.2 Dashboard Internal
Tampilan disesuaikan dengan *Role*:
- **Admin**: Pusat Tata Kelola & Keamanan (Fokus ke pengguna, audit log, status server).
- **Panitera/Operator**: Pusat Kerja Hari Ini (Fokus ke antrian sidang, peserta menunggu, dan `To-Do List` tugas harian).

### 11.3 Buat Sidang (`/hearings/new`)
Form panjang mencakup *Nomor Perkara*, pihak terkait (Terdakwa, Kejaksaan, Lapas), dan jadwal. Langsung berinteraksi dengan API Zoom di belakang layar.

### 11.4 Waiting Room Terpadu (`HearingDetailPage` & `WaitingRoomPage`)
Digunakan oleh Operator untuk memvalidasi nama peserta yang masuk. Menekan tombol "Admit" di sini akan **langsung menarik peserta tersebut dari Waiting Room Zoom asli** via integrasi API Zoom.

---

## 12. Keputusan Final yang Harus Diikuti Tim (Update)

1. Gunakan **React + TypeScript + Vite + Tailwind**.
2. Gunakan **Zustand (Persist)** untuk menyimpan Token JWT dan User Info.
3. Selalu periksa `err.response.data.detail` di *catch block* Axios untuk menampilkan pesan gagal.
4. Jaga agar `LandingPage.tsx` **TIDAK TERPROTEKSI (Public)** dan tidak membutuhkan Token.
5. Pertahankan mekanisme **Auto-refresh `setInterval(loadData, 15000)`** pada halaman Dashboard dan Waiting Room agar operator tidak kehilangan momentum peserta yang baru masuk.
