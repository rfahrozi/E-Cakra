# Backend Blueprint — Practical, Ready-to-Build

Dokumen ini adalah rancangan backend yang sengaja dibuat **sederhana, jelas, dan siap dibangun**. Asumsi yang dipakai adalah aplikasi web/mobile modern dengan kebutuhan umum: autentikasi pengguna, manajemen profil, role-based access, dan modul data utama yang bisa dikembangkan bertahap.

## 1. Prinsip Desain

- Mulai dengan **modular monolith**, bukan microservices.
- Satu database utama relasional.
- API berbasis REST + JSON.
- JWT untuk autentikasi aplikasi internal/frontend.
- RBAC sederhana: `admin`, `staff`, `user`.
- Observability cukup: structured logging, health check, metrics dasar.
- Deployment awal: container tunggal + managed database.

Pendekatan ini cukup untuk fase awal hingga menengah, dan masih mudah dipisah menjadi service terpisah jika trafik serta kompleksitas meningkat.

## 2. Diagram Arsitektur Backend

flowchart LR
  C[Client Web/Mobile] --> G[API Server]
  G --> A[Auth Module]
  G --> U[User Module]
  G --> B[Business Module]
  G --> F[File Module]
  G --> DB[(PostgreSQL)]
  G --> R[(Redis Cache / Rate Limit)]
  G --> S[Object Storage]
  G --> Q[Background Job Worker]
  Q --> DB
  Q --> S
  G --> O[External Services]

  subgraph Scaling
    G
    Q
  end

### Komponen utama

- **Client Web/Mobile**: konsumen API.
- **API Server**: proses utama yang menangani request, validasi, auth, bisnis, dan response.
- **Auth Module**: login, refresh token, password reset, role check.
- **User Module**: profil, user management, role assignment terbatas.
- **Business Module**: modul inti aplikasi sesuai domain.
- **File Module**: upload metadata dan integrasi object storage.
- **PostgreSQL**: sumber data utama.
- **Redis**: cache ringan, rate limiting, session blacklist bila diperlukan.
- **Background Job Worker**: email, notifikasi, sinkronisasi eksternal, proses async.
- **External Services**: email provider, payment gateway, internal APIs, webhook target.

### Cara scaling

- **Stateless API** → scale horizontal dengan beberapa instance.
- **Database tunggal** di awal, optimasi dengan indexing, pooling, dan read replica bila nanti dibutuhkan.
- **Redis** untuk rate limit dan cache query tertentu.
- **Worker terpisah** untuk pekerjaan berat/async.
- **CDN + object storage** untuk file agar API tidak membebani static serving.

## 3. Diagram Basis Data (ERD)

Skema berikut adalah baseline backend yang umum dan tidak berlebihan.

erDiagram
  USERS ||--o{ SESSIONS : has
  USERS ||--o{ USER_ROLES : has
  ROLES ||--o{ USER_ROLES : assigned_to
  USERS ||--o{ AUDIT_LOGS : creates
  USERS ||--o{ FILES : uploads
  USERS ||--o{ BUSINESS_RECORDS : owns
  BUSINESS_RECORDS ||--o{ BUSINESS_RECORD_ITEMS : contains

  USERS {
    uuid id PK
    varchar email UK
    varchar password_hash
    varchar full_name
    varchar status
    timestamptz email_verified_at
    timestamptz last_login_at
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }

  ROLES {
    uuid id PK
    varchar name UK
    text description
    timestamptz created_at
  }

  USER_ROLES {
    uuid id PK
    uuid user_id FK
    uuid role_id FK
    timestamptz created_at
    unique user_id_role_id
  }

  SESSIONS {
    uuid id PK
    uuid user_id FK
    varchar refresh_token_hash
    varchar ip_address
    text user_agent
    timestamptz expires_at
    timestamptz created_at
    timestamptz revoked_at
  }

  FILES {
    uuid id PK
    uuid uploaded_by FK
    varchar file_name
    varchar mime_type
    bigint file_size
    varchar storage_key
    timestamptz created_at
  }

  BUSINESS_RECORDS {
    uuid id PK
    uuid owner_user_id FK
    varchar code UK
    varchar title
    text description
    varchar status
    numeric total_amount
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }

  BUSINESS_RECORD_ITEMS {
    uuid id PK
    uuid business_record_id FK
    varchar item_name
    integer quantity
    numeric unit_price
    numeric subtotal
    timestamptz created_at
  }

  AUDIT_LOGS {
    uuid id PK
    uuid actor_user_id FK
    varchar action
    varchar entity_type
    uuid entity_id
    jsonb changes
    timestamptz created_at
  }

## 4. Definisi Tabel Inti

### `users`
- `id`: UUID, primary key
- `email`: varchar(255), unique, not null
- `password_hash`: varchar(255), nullable jika login via OAuth nanti
- `full_name`: varchar(150), not null
- `status`: enum sederhana (`active`, `inactive`, `blocked`)
- `email_verified_at`: timestamptz nullable
- `last_login_at`: timestamptz nullable
- `created_at`, `updated_at`: timestamptz not null
- `deleted_at`: soft delete nullable

### `roles`
- default seed: `admin`, `staff`, `user`

### `user_roles`
- tabel pivot untuk RBAC
- unique (`user_id`, `role_id`)

### `sessions`
- simpan hash refresh token, bukan token mentah
- mendukung logout per device / revoke session

### `files`
- hanya metadata file; binary disimpan di object storage

### `business_records`
- mewakili entitas inti domain
- sengaja dibuat generik agar mudah diganti menjadi `orders`, `projects`, `tickets`, atau `applications`

### `audit_logs`
- simpan aktivitas penting: login, create/update/delete, role changes
- jangan log password, token, atau data sensitif mentah

## 5. Definisi API (REST + JSON)

Base path:

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/version`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

### Users

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PATCH /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

### Roles

- `GET /api/v1/roles`
- `POST /api/v1/users/{id}/roles`
- `DELETE /api/v1/users/{id}/roles/{roleId}`

### Business Records

- `GET /api/v1/records`
- `POST /api/v1/records`
- `GET /api/v1/records/{id}`
- `PATCH /api/v1/records/{id}`
- `DELETE /api/v1/records/{id}`
- `POST /api/v1/records/{id}/items`
- `PATCH /api/v1/records/{id}/items/{itemId}`
- `DELETE /api/v1/records/{id}/items/{itemId}`

### Files

- `POST /api/v1/files/upload-url`
- `POST /api/v1/files`
- `GET /api/v1/files/{id}`
- `DELETE /api/v1/files/{id}`

## 6. OpenAPI Ringkas

openapi: 3.0.3
info:
  title: Practical Backend API
  version: 1.0.0
servers:
  - url: https://api.example.com/api/v1
paths:
  /auth/login:
    post:
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: Login success
        '401':
          description: Invalid credentials
  /records:
    get:
      summary: List records
      responses:
        '200':
          description: OK
    post:
      summary: Create record
      responses:
        '201':
          description: Created
  /records/{id}:
    get:
      summary: Get record detail
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: OK
        '404':
          description: Not found

## 7. Contoh Request/Response

### `POST /api/v1/auth/login`

Request:

{
  "email": "user@example.com",
  "password": "secret123"
}

Response 200:

{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Example User",
      "roles": ["user"]
    }
  }
}

### `POST /api/v1/records`

Request:

{
  "title": "Record A",
  "description": "Catatan awal",
  "status": "draft",
  "items": [
    {
      "itemName": "Item 1",
      "quantity": 2,
      "unitPrice": 50000
    }
  ]
}

Response 201:

{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "REC-20260828-0001",
    "title": "Record A",
    "status": "draft",
    "totalAmount": 100000,
    "createdAt": "2026-08-28T10:00:00Z"
  }
}

## 8. Strategi Autentikasi & Otorisasi

### Autentikasi

Gunakan:

- **Access token JWT** durasi pendek, misalnya 15 menit
- **Refresh token** durasi lebih panjang, misalnya 7–30 hari
- Refresh token disimpan sebagai **hash** di tabel `sessions`

Flow sederhana:

1. User login dengan email + password.
2. Server validasi password hash.
3. Server kembalikan access token + refresh token.
4. Access token dipakai pada header `Authorization: Bearer `.
5. Saat expired, client panggil endpoint refresh.
6. Logout akan revoke refresh session.

### Otorisasi

Gunakan **RBAC sederhana**:

- `admin`: kelola semua resource dan role
- `staff`: kelola data operasional tertentu
- `user`: akses data miliknya sendiri

Middleware otorisasi cukup dua lapis:

- `requireAuth`
- `requireRole(['admin'])` atau policy sederhana per resource

Hindari ACL yang terlalu rumit di awal. Tambahkan policy per resource hanya jika kebutuhan bisnis sudah jelas.

## 9. Model Data & Validasi

Gunakan DTO/schema validation di layer request.

### Contoh model `User`

- `id: uuid`
- `email: string(email)`
- `fullName: string(3..150)`
- `status: enum`
- `roles: string[]`

### Contoh model `Record`

- `id: uuid`
- `code: string`
- `title: string(3..200)`
- `description: string <= 2000`
- `status: enum(draft, submitted, approved, rejected)`
- `totalAmount: decimal >= 0`
- `items: RecordItem[]`

### Aturan validasi praktis

- Semua input divalidasi di boundary API.
- Validasi tipe, panjang string, enum, UUID, email, angka minimum.
- Sanitasi input string seperlunya.
- Tolak field tak dikenal jika endpoint sensitif.
- Validasi bisnis dilakukan setelah validasi skema.

## 10. Pertimbangan Keamanan

Ancaman utama dan mitigasi yang wajib:

### SQL Injection
- Gunakan ORM/query builder dengan parameterized query.
- Tidak menyusun query SQL dari string mentah input user.

### XSS
- Backend mengembalikan JSON, bukan HTML render.
- Validasi dan sanitasi input teks jika nanti ditampilkan kembali di frontend.

### Broken Auth
- Hash password dengan Argon2 atau bcrypt.
- Access token pendek umur hidupnya.
- Refresh token bisa di-revoke.
- Batasi percobaan login.

### Broken Access Control
- Selalu cek kepemilikan resource di server.
- Jangan percaya role/claim dari client selain token tervalidasi.

### Sensitive Data Exposure
- Jangan log password, refresh token, OTP, atau full PAN/payment secrets.
- Gunakan HTTPS di semua environment non-local.
- Simpan secret di environment variables / secret manager.

### Abuse / Brute Force
- Rate limiting pada login, register, forgot password, dan endpoint publik.
- CAPTCHA opsional jika abuse mulai tinggi, bukan dari hari pertama.

### File Upload Risk
- Batasi MIME type dan ukuran file.
- Simpan file di object storage, bukan filesystem container.
- Gunakan generated filename/storage key.

## 11. Strategi Logging & Monitoring

### Logging
Gunakan structured JSON logging dengan field minimum:

- `timestamp`
- `level`
- `service`
- `env`
- `requestId`
- `userId` (jika ada)
- `method`
- `path`
- `statusCode`
- `durationMs`
- `message`

Kategori log:

- **info**: request umum, startup, shutdown
- **warn**: invalid auth, retry, external timeout ringan
- **error**: exception, DB failure, dependency down

### Monitoring
Pantau metrik minimum:

- request count
- error rate
- p95 / p99 latency
- CPU / memory usage
- DB connection usage
- slow queries
- queue backlog
- failed jobs

### Health endpoints
- `/health` → proses hidup
- `/ready` → dependency penting siap, misalnya DB dan Redis

Untuk fase awal, cukup kombinasi:
- aplikasi menulis log JSON ke stdout
- platform/container menangkap log
- metrics via Prometheus/OpenTelemetry bila tersedia

## 12. Pilihan Teknologi (Stack)

Agar cepat dibangun dan tidak over-engineered, saya rekomendasikan stack ini:

### Opsi yang direkomendasikan
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: NestJS atau Express + modular structure
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache / Rate Limit**: Redis
- **Queue**: BullMQ hanya jika sudah ada kebutuhan async nyata
- **Validation**: Zod / class-validator
- **Auth**: JWT + refresh token
- **Docs**: OpenAPI / Swagger
- **Testing**: Vitest/Jest + Supertest
- **Container**: Docker
- **Deployment**: Railway / Render / Fly.io / Kubernetes nanti jika perlu

### Kenapa ini tidak over-engineered
- PostgreSQL cukup untuk mayoritas use case awal.
- Satu backend service lebih mudah dibangun dan di-debug.
- Prisma mempercepat migrasi dan query standar.
- Redis opsional bertahap, bukan wajib semua fitur.
- Queue hanya dipakai bila ada email, webhook, atau pekerjaan async berat.

## 13. Strategi Deployment & CI/CD

### Deployment awal
- 1 container untuk API server
- 1 managed PostgreSQL
- 1 managed Redis bila memang dipakai
- object storage untuk file

### Pipeline CI/CD

Tahapan minimum:

1. install dependencies
2. lint
3. unit test
4. integration test ringan
5. build
6. deploy ke staging
7. smoke test staging
8. approval opsional
9. deploy ke production

### Branching sederhana
- `main` → production
- `develop` atau langsung feature branch → staging

### Environment secrets
- disimpan di platform secret manager / CI secrets
- jangan commit `.env`

## 14. Kebutuhan Integrasi

Layanan eksternal yang umumnya perlu dipikirkan:

### Email provider
- untuk verification, reset password, notification
- integrasi via SMTP API / REST API provider

### Object storage
- untuk upload file
- gunakan pre-signed URL agar upload tidak lewat backend langsung jika file besar

### Payment gateway
- jika ada pembayaran
- integrasi via REST API + webhook callback

### Internal service lain
- gunakan REST/HTTP di awal
- event-driven baru ditambahkan jika integrasi makin kompleks

### Webhook
- sediakan endpoint khusus dengan signature verification
- simpan payload masuk untuk audit/debug dasar

## 15. Skema Penanganan Error

Gunakan format error standar yang konsisten:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email"
      }
    ],
    "requestId": "req_123456"
  }
}

### Mapping status code
- `400` bad request / validation error
- `401` unauthenticated
- `403` forbidden
- `404` resource not found
- `409` conflict / duplicate data
- `422` business rule violation bila ingin dibedakan dari validasi input
- `429` too many requests
- `500` internal server error
- `503` dependency unavailable / maintenance

### Kode error standar
- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `INTERNAL_ERROR`
- `DEPENDENCY_ERROR`

## 16. Definisi Lingkungan

### Development
- verbose logging
- swagger aktif
- hot reload aktif
- data dummy / seed boleh dipakai
- service eksternal boleh di-mock

### Staging
- semirip mungkin dengan production
- dipakai untuk QA, UAT, integration testing
- real env vars, tapi data non-produksi
- observability aktif

### Production
- debug dimatikan
- rate limit aktif
- TLS wajib
- monitoring dan alerting aktif
- backup database aktif
- rollback deployment disiapkan

## 17. Struktur Modul Backend yang Disarankan

backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── records/
│   │   ├── files/
│   │   └── health/
│   ├── common/
│   │   ├── middleware/
│   │   ├── guards/
│   │   ├── utils/
│   │   ├── errors/
│   │   └── dto/
│   ├── config/
│   ├── database/
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md

## 18. Urutan Implementasi Agar Cepat Jalan

Urutan bangun yang realistis:

1. setup project, lint, format, config env
2. setup database + migration awal
3. modul auth + users
4. RBAC dasar
5. modul business utama
6. error handling global
7. logging + requestId
8. file upload bila dibutuhkan
9. background jobs bila benar-benar perlu
10. CI/CD + staging deploy

## 19. Keputusan yang Disarankan Sekarang

Agar proyek tidak terlalu rumit, keputusan final yang saya sarankan adalah:

- pakai **modular monolith**
- pakai **PostgreSQL**
- pakai **REST API** dengan **OpenAPI**
- pakai **JWT + refresh token**
- pakai **RBAC sederhana**
- pakai **structured logging**
- pakai **Docker + managed deployment**
- tunda microservices, event bus kompleks, CQRS, dan multi-database sampai benar-benar dibutuhkan

## 20. Kesimpulan

Blueprint ini cukup lengkap untuk memulai pembangunan backend tanpa jatuh ke over-engineering. Kalau domain bisnis nanti makin spesifik, bagian `business_records` bisa langsung diubah menjadi entitas nyata tanpa mengubah fondasi arsitektur, autentikasi, error handling, deployment, dan observability.