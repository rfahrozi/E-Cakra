# Rencana Bertahap Perancangan File Backend

Dokumen ini merangkum tahapan implementasi backend secara **praktis, terstruktur, dan siap dibangun**. Pendekatan yang dipakai sengaja dibuat sederhana agar tidak over-engineered.

## Baseline Stack yang Direkomendasikan

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + Refresh Token
- **Testing**: Vitest/Jest + Supertest
- **Deployment**: Docker + managed hosting

## Struktur Target Proyek

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.schema.ts
│   │   │   └── users.types.ts
│   │   └── records/
│   │       ├── records.controller.ts
│   │       ├── records.service.ts
│   │       ├── records.routes.ts
│   │       ├── records.schema.ts
│   │       └── records.types.ts
│   ├── database/
│   │   ├── prisma.ts
│   │   └── seed.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── authorize.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   └── validate.middleware.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── password.ts
│   ├── types/
│   │   ├── common.types.ts
│   │   └── express.d.ts
│   └── routes/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.yaml
│   └── architecture.md
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

---

## Tahap 1: Struktur Proyek Dasar

Fokus tahap ini adalah menyiapkan fondasi proyek dan file konfigurasi inti.

### Tujuan

- Menentukan struktur direktori utama.
- Inisialisasi project dengan package manager.
- Menyiapkan konfigurasi dasar environment dan TypeScript.

### Direktori dan file awal

```text
backend/
├── src/
├── prisma/
├── tests/
├── docs/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Pekerjaan

- Jalankan inisialisasi project dengan `npm init`.
- Pasang dependency inti dan dependency development.
- Siapkan `tsconfig.json`.
- Buat `.env` dan `.env.example`.
- Tentukan standar penamaan file dan folder.

### Output file

- `package.json`
- `tsconfig.json`
- `.env`
- `.env.example`
- `.gitignore`
- `README.md`

### Hasil akhir

Project sudah bisa di-install, dijalankan secara dasar, dan punya struktur awal yang jelas.

---

## Tahap 2: Kerangka Aplikasi Inti

Tahap ini membuat aplikasi backend bisa berjalan dan menerima request.

### Tujuan

- Memilih dan mengonfigurasi framework backend.
- Menyiapkan entry point aplikasi.
- Menambahkan routing dasar.
- Mengaktifkan middleware esensial.

### File yang dibuat

```text
src/
├── app.ts
├── server.ts
├── routes/
│   └── index.ts
├── middlewares/
│   └── error.middleware.ts
└── utils/
    └── logger.ts
```

### Pekerjaan

- Inisialisasi Express app.
- Buat file `app.ts` untuk konfigurasi aplikasi.
- Buat file `server.ts` untuk menjalankan server.
- Tambahkan route dasar seperti health check.
- Konfigurasikan JSON parser, request logging, not found handler, dan error handler.

### Endpoint awal

- `GET /health`
- `GET /api/v1/version`

### Output file

- `src/app.ts`
- `src/server.ts`
- `src/routes/index.ts`
- `src/middlewares/error.middleware.ts`
- `src/utils/logger.ts`

### Hasil akhir

Aplikasi backend sudah hidup dan dapat merespons request dasar.

---

## Tahap 3: Manajemen Data dan Basis Data

Tahap ini menghubungkan aplikasi ke database dan mendefinisikan model inti.

### Tujuan

- Memilih dan mengonfigurasi ORM.
- Menentukan skema data inti.
- Menyiapkan koneksi database.
- Menjalankan migrasi awal.

### File yang dibuat

```text
prisma/
├── schema.prisma
└── migrations/

src/database/
├── prisma.ts
└── seed.ts
```

### Model inti yang disarankan

- `User`
- `Role`
- `UserRole`
- `Session`
- `Record`
- `RecordItem`

### Pekerjaan

- Konfigurasikan koneksi PostgreSQL.
- Definisikan model dan relasi di `schema.prisma`.
- Jalankan migration pertama.
- Buat data seed awal seperti role default.

### Output file

- `prisma/schema.prisma`
- `src/database/prisma.ts`
- `src/database/seed.ts`

### Hasil akhir

Database siap dipakai dan model inti sudah tersedia.

---

## Tahap 4: API dan Controller/Handler

Tahap ini membuat endpoint API nyata sesuai kebutuhan aplikasi.

### Tujuan

- Merancang endpoint API utama.
- Membuat controller/handler untuk tiap endpoint.
- Menambahkan validasi input.
- Menyusun format response yang konsisten.

### Struktur per modul

```text
src/modules/users/
├── users.controller.ts
├── users.routes.ts
├── users.schema.ts
└── users.types.ts
```

Struktur yang sama dipakai untuk modul `auth` dan `records`.

### Endpoint minimal

#### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

#### Users
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`

#### Records
- `GET /records`
- `POST /records`
- `GET /records/:id`
- `PATCH /records/:id`
- `DELETE /records/:id`

### Format response standar

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

### Output file

- `src/modules/auth/auth.routes.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.schema.ts`
- `src/modules/users/users.routes.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.schema.ts`
- `src/modules/records/records.routes.ts`
- `src/modules/records/records.controller.ts`
- `src/modules/records/records.schema.ts`

### Hasil akhir

API dasar sudah tersedia dengan pola request dan response yang konsisten.

---

## Tahap 5: Layanan dan Logika Bisnis

Tahap ini memisahkan logika bisnis dari controller ke service layer.

### Tujuan

- Menjaga controller tetap tipis.
- Memindahkan logika bisnis ke service.
- Membuat layanan yang independen dan mudah diuji.

### File yang dibuat

- `src/modules/auth/auth.service.ts`
- `src/modules/users/users.service.ts`
- `src/modules/records/records.service.ts`

### Pekerjaan

- Pindahkan query database dan aturan bisnis ke service.
- Gunakan controller hanya untuk menerima request dan mengembalikan response.
- Simpan fungsi lintas modul di `utils/` bila memang generik.

### Utility yang biasanya diperlukan

```text
src/utils/
├── api-response.ts
├── password.ts
├── jwt.ts
└── logger.ts
```

### Hasil akhir

Struktur aplikasi menjadi lebih bersih, modular, dan mudah diuji.

---

## Tahap 6: Otentikasi dan Otorisasi

Tahap ini menambahkan kontrol akses ke endpoint.

### Tujuan

- Mengimplementasikan autentikasi pengguna.
- Menambahkan otorisasi berbasis role.
- Melindungi route yang sensitif.

### File yang dibuat

```text
src/middlewares/
├── auth.middleware.ts
└── authorize.middleware.ts

src/utils/
├── jwt.ts
└── password.ts
```

### Pekerjaan

- Implementasi login dengan JWT.
- Tambahkan refresh token untuk perpanjangan sesi.
- Buat middleware validasi token.
- Buat middleware role-based authorization.
- Lindungi route tertentu agar hanya bisa diakses oleh role tertentu.

### Role minimum yang disarankan

- `admin`
- `staff`
- `user`

### File tambahan bila perlu

- `src/types/express.d.ts`

### Hasil akhir

Route sensitif sudah terlindungi dan kontrol akses sudah tersedia.

---

## Tahap 7: Pengujian

Tahap ini memastikan fungsi penting backend bekerja stabil.

### Tujuan

- Menulis unit test.
- Menulis integration test.
- Menyediakan skrip untuk test otomatis.

### Struktur test

```text
tests/
├── unit/
│   ├── auth.service.test.ts
│   ├── users.service.test.ts
│   └── records.service.test.ts
├── integration/
│   ├── auth.api.test.ts
│   └── records.api.test.ts
└── e2e/
    └── app.e2e.test.ts
```

### Prioritas pengujian

- Hashing password
- Token helper
- Service logic penting
- Login flow
- Create/read/update/delete record
- Access control

### Script test di `package.json`

- `test`
- `test:unit`
- `test:integration`
- `test:e2e`

### Hasil akhir

Backend memiliki jaring pengaman yang cukup untuk perubahan kode berikutnya.

---

## Tahap 8: Penanganan Kesalahan dan Logging Lanjutan

Tahap ini merapikan error handling dan observability.

### Tujuan

- Menstandarkan respons error.
- Menambahkan logging yang mudah dianalisis.
- Menyertakan request ID untuk tracing.

### File yang dibuat

```text
src/middlewares/
├── error.middleware.ts
└── request-id.middleware.ts

src/utils/
└── logger.ts
```

### Pekerjaan

- Buat class error standar jika dibutuhkan.
- Pisahkan error validasi, auth, not found, dan internal error.
- Tambahkan request ID pada setiap request.
- Gunakan logging dalam format JSON.

### Format error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}
```

### Hasil akhir

Error handling lebih konsisten dan proses debugging lebih cepat.

---

## Tahap 9: Keamanan Tambahan dan Optimasi

Tahap ini berisi hardening yang cukup untuk aplikasi siap staging atau production ringan.

### Tujuan

- Menambahkan perlindungan keamanan tambahan.
- Melakukan optimasi awal pada query dan endpoint.
- Menyiapkan deployment dasar.

### File yang mungkin ditambahkan

```text
src/middlewares/
├── rate-limit.middleware.ts
└── security.middleware.ts

Dockerfile
```

### Pekerjaan

- Tambahkan rate limiting untuk login dan endpoint publik.
- Atur CORS dan security headers.
- Sanitasi input dasar.
- Tinjau query database dan indexing.
- Tambahkan pagination untuk endpoint list.
- Siapkan Dockerfile untuk deployment.

### Hasil akhir

Backend lebih aman, lebih stabil, dan lebih siap dipasang di environment staging/production.

---

## Tahap 10: Dokumentasi

Tahap ini menyiapkan dokumentasi agar tim mudah membangun, menjalankan, dan memelihara backend.

### Tujuan

- Mendokumentasikan API.
- Menjelaskan struktur proyek.
- Menjelaskan konfigurasi dan cara menjalankan aplikasi.

### File yang dibuat

```text
docs/
├── api.yaml
├── architecture.md
└── setup.md
```

### Isi dokumentasi minimum

- daftar endpoint API
- skema request/response
- flow autentikasi
- struktur folder proyek
- variabel environment yang wajib
- cara migration dan seed
- cara test
- cara build dan deploy

### Hasil akhir

Project lebih mudah dipahami, di-onboard, dan diserahkan ke anggota tim lain.

---

## Urutan Implementasi yang Direkomendasikan

Agar pembangunan cepat dan stabil, urutan kerja yang direkomendasikan adalah:

1. Tahap 1 — Struktur Proyek Dasar
2. Tahap 2 — Kerangka Aplikasi Inti
3. Tahap 3 — Manajemen Data dan Basis Data
4. Tahap 4 — API dan Controller/Handler
5. Tahap 5 — Layanan dan Logika Bisnis
6. Tahap 6 — Otentikasi dan Otorisasi
7. Tahap 7 — Pengujian
8. Tahap 8 — Penanganan Kesalahan dan Logging Lanjutan
9. Tahap 9 — Keamanan Tambahan dan Optimasi
10. Tahap 10 — Dokumentasi

---

## Prinsip Agar Tidak Over-Engineered

Untuk menjaga backend tetap sederhana namun siap dibangun, gunakan prinsip berikut:

- Pakai **modular monolith**, bukan microservices.
- Pakai **REST API**, bukan GraphQL jika belum dibutuhkan.
- Gunakan **satu database utama PostgreSQL**.
- Gunakan **Prisma** untuk schema dan migration.
- Gunakan **JWT + refresh token** untuk autentikasi.
- Gunakan **RBAC sederhana**.
- Logging cukup ke stdout dalam format JSON.
- Tambahkan Redis, queue, worker, dan caching hanya saat kebutuhan nyata muncul.

---

## Ringkasan Output File per Tahap

### Tahap 1
- `package.json`
- `tsconfig.json`
- `.env`
- `.env.example`
- `.gitignore`
- `README.md`

### Tahap 2
- `src/app.ts`
- `src/server.ts`
- `src/routes/index.ts`
- `src/middlewares/error.middleware.ts`
- `src/utils/logger.ts`

### Tahap 3
- `prisma/schema.prisma`
- `src/database/prisma.ts`
- `src/database/seed.ts`

### Tahap 4
- `src/modules/*/*.routes.ts`
- `src/modules/*/*.controller.ts`
- `src/modules/*/*.schema.ts`

### Tahap 5
- `src/modules/*/*.service.ts`
- `src/utils/api-response.ts`
- `src/utils/jwt.ts`
- `src/utils/password.ts`

### Tahap 6
- `src/middlewares/auth.middleware.ts`
- `src/middlewares/authorize.middleware.ts`
- `src/types/express.d.ts`

### Tahap 7
- `tests/unit/*`
- `tests/integration/*`
- `tests/e2e/*`

### Tahap 8
- `src/middlewares/request-id.middleware.ts`
- `src/middlewares/error.middleware.ts`
- `src/utils/logger.ts`

### Tahap 9
- `src/middlewares/rate-limit.middleware.ts`
- `src/middlewares/security.middleware.ts`
- `Dockerfile`

### Tahap 10
- `docs/api.yaml`
- `docs/architecture.md`
- `docs/setup.md`
- `README.md`

---

## Kesimpulan

Rencana ini dirancang agar tim bisa mulai dari fondasi yang sederhana, lalu bertahap menambahkan modul, database, auth, testing, dan deployment tanpa membangun kompleksitas yang belum diperlukan. Dengan urutan ini, backend akan lebih cepat siap dibangun, lebih mudah dipelihara, dan tetap skalabel untuk pengembangan selanjutnya.
