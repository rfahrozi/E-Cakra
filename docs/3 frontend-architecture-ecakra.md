# Front-End Architecture Document — E-CAKRA

## 1. Ringkasan

Dokumen ini mendefinisikan arsitektur front-end untuk aplikasi **E-CAKRA**, sebuah portal internal untuk operasional persidangan. Arsitektur ini dirancang agar:

- cepat diimplementasikan untuk target MVP,
- mudah dipahami dan dirawat oleh tim,
- tidak over-engineered,
- siap dipakai pada lingkungan production internal.

Pendekatan utama yang digunakan adalah **React minimal + TypeScript + Vite**, dengan fokus pada **desktop-first internal operations UI**.

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
- mobile-first optimization mendalam,
- state management enterprise-scale,
- offline/PWA,
- realtime frontend architecture yang kompleks.

---

## 3. Karakteristik Produk

Berdasarkan kebutuhan produk, front-end E-CAKRA memiliki karakteristik berikut:

- aplikasi **internal**,
- penggunaan utama di **desktop/laptop**,
- antarmuka harus **jelas, cepat dipakai, minim klik**,
- bahasa utama adalah **Bahasa Indonesia**,
- halaman inti relatif terbatas,
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
| State management | Zustand |
| Styling | Tailwind CSS |
| Form handling | React Hook Form |
| HTTP access | fetch wrapper sederhana / axios |
| Unit & integration testing | Vitest + React Testing Library |
| E2E testing | Playwright |
| Linting | ESLint |
| Formatting | Prettier |

### 4.2 Alasan pemilihan

#### React
Dipilih karena cukup ringan untuk membangun halaman operasional berbasis komponen seperti dashboard, form sidang, waiting room, dan audit log.

#### TypeScript
Digunakan untuk menjaga konsistensi kontrak data API, mengurangi bug, dan mempermudah scale-up setelah MVP.

#### Vite
Dipilih karena setup cepat, dev server ringan, dan cocok untuk proyek MVP yang harus segera produktif.

#### Zustand
Dipilih untuk kebutuhan global state yang ringan seperti sesi user, auth state, dan UI state. Menghindari boilerplate berlebih yang biasanya muncul pada Redux.

#### Tailwind CSS
Dipilih karena mempercepat pembuatan layout dan komponen UI operasional tanpa overhead styling besar.

---

## 5. Arsitektur Aplikasi

### 5.1 Gaya arsitektur

Aplikasi menggunakan pendekatan:

- **feature-oriented structure**,
- **page-based routing**,
- **thin global state**,
- **API layer per feature**,
- **reusable UI components secukupnya**.

Arsitektur ini dipilih agar tim bisa bekerja paralel tanpa membangun abstraksi yang belum diperlukan.

### 5.2 Prinsip desain arsitektur

1. **Keep the core simple** — utamakan alur kerja utama.
2. **Local state first** — state global hanya untuk kebutuhan lintas halaman.
3. **Feature ownership jelas** — setiap fitur memiliki API, types, hooks, dan components sendiri.
4. **Composition over complexity** — rakit UI dari komponen kecil yang jelas fungsinya.
5. **Operational UX over decorative UI** — prioritaskan keterbacaan dan kecepatan kerja operator.

---

## 6. Struktur Direktori

src/
  app/
    router/
      index.tsx
      guards.tsx
    providers/
      AppProviders.tsx
    layouts/
      MainLayout.tsx
      AuthLayout.tsx

  pages/
    login/
      LoginPage.tsx
    dashboard/
      DashboardPage.tsx
    hearings/
      HearingCreatePage.tsx
      HearingDetailPage.tsx
    waiting-room/
      WaitingRoomPage.tsx
    audit-log/
      AuditLogPage.tsx

  features/
    auth/
      api.ts
      store.ts
      hooks.ts
      types.ts
      components/
        LoginForm.tsx
    hearings/
      api.ts
      hooks.ts
      types.ts
      components/
        HearingForm.tsx
        HearingTemplatePanel.tsx
        HearingStatusBadge.tsx
    waiting-room/
      api.ts
      hooks.ts
      types.ts
      components/
        ParticipantTable.tsx
        ParticipantActions.tsx
        ValidationStatusBadge.tsx
    audit-log/
      api.ts
      hooks.ts
      types.ts
      components/
        AuditLogTable.tsx
    dashboard/
      api.ts
      hooks.ts
      types.ts
      components/
        SummaryCard.tsx

  components/
    ui/
      Button.tsx
      Input.tsx
      Select.tsx
      Table.tsx
      Badge.tsx
      Modal.tsx
      Spinner.tsx
      EmptyState.tsx
      ErrorState.tsx
    feedback/
      Toast.tsx
      ConfirmDialog.tsx

  services/
    http/
      client.ts
      interceptors.ts
    utils/
      date.ts
      format.ts
      guards.ts

  store/
    app.store.ts

  constants/
    routes.ts
    labels.ts
    colors.ts

  styles/
    index.css
    tokens.css

  types/
    api.ts
    common.ts

  test/
    setup.ts

### 6.1 Penjelasan struktur

- `app/` berisi fondasi aplikasi seperti router, layout, dan provider.
- `pages/` berisi komponen level halaman untuk route.
- `features/` berisi modul domain per fitur.
- `components/ui/` berisi komponen UI generik reusable.
- `services/` berisi HTTP client dan utilitas umum.
- `store/` berisi state global lintas fitur.
- `constants/` berisi nilai tetap yang digunakan berulang.
- `types/` berisi tipe umum lintas fitur.

---

## 7. Routing

### 7.1 Daftar route utama

| Route | Halaman | Proteksi |
|---|---|---|
| `/login` | Login | Public |
| `/dashboard` | Dashboard | Private |
| `/hearings/new` | Buat Sidang | Private |
| `/hearings/:id` | Detail Sidang | Private |
| `/hearings/:id/waiting-room` | Waiting Room | Private |
| `/audit-logs` | Audit Log | Private |

### 7.2 Strategi routing

- Gunakan **React Router**.
- Gunakan **layout terpisah** untuk auth dan main app.
- Terapkan **route guard** untuk halaman yang memerlukan login.
- Jika sesi invalid, arahkan user kembali ke `/login`.

### 7.3 Prinsip routing

- Hindari nested routing yang terlalu dalam.
- Struktur route harus mudah dibaca tim dan konsisten dengan domain fitur.
- Gunakan konstanta route agar tidak terjadi string duplication.

---

## 8. State Management

### 8.1 Prinsip umum

Gunakan **state lokal sebagai default**. Global state hanya dipakai untuk data yang benar-benar digunakan lintas halaman.

### 8.2 Global state yang direkomendasikan

- informasi user login,
- status autentikasi,
- session/token state,
- toast/global notification,
- state UI global ringan jika diperlukan.

### 8.3 State lokal yang direkomendasikan

- state form,
- loading state per halaman,
- modal open/close,
- filter tabel lokal,
- pagination lokal.

### 8.4 Alasan memilih Zustand

- ringan,
- minim boilerplate,
- mudah dipahami tim,
- cukup untuk MVP,
- tidak memaksa arsitektur kompleks.

---

## 9. Data Flow dan Layering

### 9.1 Pola data flow

Pola yang digunakan:

**Page → Hook → API module → HTTP client → Backend API**

Contoh:

- `WaitingRoomPage.tsx`
- `useParticipants()`
- `features/waiting-room/api.ts`
- `services/http/client.ts`

### 9.2 Tujuan layering

- memisahkan tanggung jawab UI dan data access,
- mempermudah testing,
- memudahkan refactor endpoint,
- menjaga file page tidak terlalu gemuk.

### 9.3 Aturan implementasi

- page bertanggung jawab pada orkestrasi halaman,
- hook bertanggung jawab pada state view-level dan pemanggilan API,
- API module bertanggung jawab pada kontrak request/response,
- HTTP client bertanggung jawab pada header, auth, dan error normalization.

---

## 10. Kontrak Data

Type minimal yang harus tersedia:

- `User`
- `AuthSession`
- `Hearing`
- `HearingTemplate`
- `WaitingParticipant`
- `AuditLog`
- `ApiError`
- `PaginatedResponse` jika backend memakai pagination

### 10.1 Aturan type

- semua response API diberi type,
- hindari `any`,
- definisikan mapping enum/status secara eksplisit,
- buat helper formatter untuk tampilan tanggal, status, dan label.

---

## 11. Standar UI dan Komponen

### 11.1 Komponen reusable minimum

- `Button`
- `Input`
- `Select`
- `Table`
- `Badge`
- `Modal`
- `Spinner`
- `EmptyState`
- `ErrorState`
- `Toast`
- `ConfirmDialog`

### 11.2 Aturan penamaan

- Gunakan **PascalCase** untuk komponen.
- Gunakan suffix sesuai fungsi: `Page`, `Form`, `Table`, `Card`, `Badge`, `Dialog`.
- Gunakan prefix `use` untuk custom hook.

### 11.3 Aturan desain visual

- sederhana,
- fokus pada keterbacaan,
- minim dekorasi,
- status operasional harus jelas,
- gunakan satu bahasa UI: **Bahasa Indonesia**.

---

## 12. Styling Strategy

### 12.1 Pendekatan yang dipilih

Gunakan **Tailwind CSS** sebagai strategi styling utama.

### 12.2 Alasan pemilihan

- cepat untuk delivery,
- cocok untuk dashboard dan form internal,
- konsisten,
- mengurangi kebutuhan file CSS terpisah,
- memudahkan reusable component styling.

### 12.3 Aturan penggunaan

- buat reusable component untuk pola yang sering dipakai,
- warna status dipusatkan di constant/theme ringan,
- hindari styling inline acak yang sulit dirawat,
- gunakan utility class secukupnya, bukan berlebihan.

### 12.4 Layout

- gunakan **CSS Grid** untuk layout dashboard dan area utama,
- gunakan **Flexbox** untuk alignment toolbar, action bar, dan form row,
- desain **desktop-first**,
- untuk layar kecil, cukup pastikan layout tetap usable, tidak perlu pengalaman mobile yang kompleks.

---

## 13. Halaman Inti MVP

### 13.1 Login

Fungsi:
- autentikasi user.

Elemen minimum:
- username,
- password,
- tombol masuk,
- pesan error autentikasi.

### 13.2 Dashboard

Fungsi:
- menampilkan ringkasan operasional.

Elemen minimum:
- jumlah sidang hari ini,
- jumlah peserta menunggu,
- jumlah audit event,
- shortcut aksi utama.

### 13.3 Buat Sidang

Fungsi:
- membuat sidang baru dan menampilkan template yang siap dipakai.

Elemen minimum:
- nomor perkara,
- tanggal,
- jam,
- jenis sidang,
- status terbuka/tertutup,
- tombol submit,
- panel template hasil.

### 13.4 Waiting Room

Fungsi:
- memantau peserta yang masuk dan memberi aksi Admit/Hold/Reject.

Elemen minimum:
- tabel peserta,
- status validasi,
- waktu masuk,
- action buttons.

### 13.5 Audit Log

Fungsi:
- menampilkan histori aktivitas sistem.

Elemen minimum:
- waktu,
- aktor,
- aksi,
- entitas/deskripsi,
- filter ringan bila diperlukan.

---

## 14. Error Handling dan User Feedback

### 14.1 Kategori error

#### Form validation error
Ditampilkan inline di bawah field.

#### Action error
Ditampilkan melalui toast atau alert di area halaman.

#### Data loading error
Ditampilkan melalui `ErrorState` dengan tombol retry.

#### Authentication/session error
User diarahkan kembali ke halaman login.

### 14.2 Aturan feedback

- tampilkan loading pada tombol saat submit,
- disable aksi saat request berjalan,
- tampilkan pesan sukses singkat,
- gunakan dialog konfirmasi untuk aksi sensitif.

---

## 15. Performa

### 15.1 Target praktis

Front-end harus menjaga pengalaman tetap responsif untuk:

- load dashboard,
- pembuatan sidang,
- render waiting room,
- tampilan audit log.

### 15.2 Strategi yang digunakan

- route-based code splitting,
- lazy loading untuk halaman non-kritis,
- memoization hanya bila benar-benar perlu,
- debounce untuk search/filter bila ada,
- payload API tetap ringkas.

### 15.3 Yang tidak dilakukan pada MVP

- optimasi ekstrem,
- cache architecture kompleks,
- service worker,
- prefetching agresif yang sulit dirawat.

---

## 16. Aksesibilitas

### 16.1 Minimum standard

- semua input memiliki label,
- tombol memiliki teks yang jelas,
- focus state terlihat,
- kontras warna memadai,
- status tidak hanya dibedakan dengan warna,
- dialog dapat digunakan via keyboard,
- error form mudah dikenali.

### 16.2 Target implementasi

Target realistis adalah memenuhi praktik dasar **WCAG AA** pada area yang paling sering dipakai.

---

## 17. Asset Management

### 17.1 Ikon

Gunakan satu library ikon yang konsisten, misalnya Lucide atau Heroicons.

### 17.2 Font

Gunakan font sistem atau satu font utama saja untuk menjaga performa dan konsistensi.

### 17.3 Gambar

Batasi penggunaan gambar. Portal internal tidak memerlukan aset visual berat.

### 17.4 Prinsip umum

- SVG lebih diutamakan untuk ikon,
- hindari aset dekoratif yang tidak mendukung operasional,
- branding cukup sederhana.

---

## 18. Workflow Pengembangan

### 18.1 Version control

Gunakan **trunk-based development** dengan branch pendek.

Contoh branch:
- `feat/login-page`
- `feat/hearing-form`
- `feat/waiting-room-table`
- `fix/audit-log-filter`

### 18.2 Pull request rule

- 1 branch = 1 fokus perubahan,
- PR kecil dan mudah direview,
- wajib lulus lint dan test,
- gunakan squash merge.

### 18.3 Linting dan formatting

Gunakan:
- ESLint,
- Prettier,
- EditorConfig,
- optional Husky + lint-staged.

### 18.4 Aturan dasar quality gate

Sebelum merge ke `main`:
- lint harus lolos,
- test utama harus lolos,
- build harus sukses.

---

## 19. Testing Strategy

### 19.1 Unit test

Fokus pada:
- util formatter,
- mapping status,
- helper validasi,
- komponen kecil yang penting.

### 19.2 Integration test

Fokus pada:
- login flow,
- submit form sidang,
- render tabel waiting room,
- audit log view.

### 19.3 E2E test

Skenario minimum:
1. login berhasil,
2. buat sidang berhasil,
3. waiting room menampilkan peserta dan aksi berjalan,
4. audit log tampil dengan benar.

### 19.4 Prinsip testing

Lebih baik menguji **alur bisnis inti** daripada mengejar angka coverage tinggi.

---

## 20. Build dan Deployment

### 20.1 Build

Front-end dibangun menggunakan Vite menjadi static assets.

### 20.2 Environment

Gunakan environment minimal:

- `.env.development`
- `.env.production`

Contoh variabel:

- `VITE_API_BASE_URL`
- `VITE_APP_NAME`

### 20.3 Deployment

Hasil build disajikan melalui **Nginx** dan diintegrasikan dengan backend FastAPI dalam environment deployment yang sama.

### 20.4 CI/CD minimum

Pipeline yang direkomendasikan:
1. install dependencies,
2. lint,
3. test,
4. build,
5. deploy.

Platform yang bisa dipakai:
- GitHub Actions,
- GitLab CI,
- Jenkins jika sudah menjadi standar internal.

---

## 21. Dokumentasi yang Wajib Tersedia

### 21.1 README

Harus mencakup:
- tujuan project,
- cara setup lokal,
- environment variables,
- cara run,
- cara build,
- cara test.

### 21.2 Contribution guide

Harus mencakup:
- aturan branching,
- standar PR,
- rule lint/test,
- naming convention.

### 21.3 Front-end architecture summary

Dokumen ringkas yang menjelaskan:
- stack yang dipilih,
- struktur folder,
- pola data flow,
- state management approach.

### 21.4 Dokumentasi komponen

Untuk MVP, dokumentasi komponen dapat dibuat ringan melalui:
- markdown docs,
- JSDoc singkat,
- contoh penggunaan pada file masing-masing.

Storybook bersifat opsional dan tidak boleh menjadi blocker delivery MVP.

---

## 22. Roadmap Implementasi Front-End MVP

### Hari 1–2
- setup project,
- setup router,
- setup auth flow,
- bangun halaman login,
- siapkan layout utama.

### Hari 3–4
- bangun halaman buat sidang,
- integrasi endpoint create hearing,
- tampilkan panel template hasil.

### Hari 5–7
- bangun waiting room,
- integrasi daftar peserta,
- bangun aksi Admit/Hold/Reject,
- tambahkan feedback loading/error.

### Hari 8–9
- bangun audit log,
- bangun dashboard ringkasan,
- rapikan navigasi.

### Hari 10–12
- testing flow utama,
- bug fixing,
- peningkatan UX operasional.

### Hari 13–14
- UAT support,
- stabilisasi,
- build final,
- dokumentasi akhir.

---

## 23. Keputusan Final yang Harus Diikuti Tim

1. Gunakan **React + TypeScript + Vite**.
2. Gunakan **React Router** untuk routing.
3. Gunakan **Zustand** hanya untuk global state ringan.
4. Gunakan **Tailwind CSS** untuk styling.
5. Gunakan **feature-oriented folder structure**.
6. Gunakan **trunk-based development**.
7. Lakukan **lint + test + build** sebelum merge.
8. Fokus hanya pada **halaman inti MVP**.
9. Prioritaskan **kesederhanaan, konsistensi, dan usability operasional**.
10. Hindari keputusan teknis yang menambah kompleksitas tanpa manfaat langsung.

---

## 24. Penutup

Arsitektur ini dirancang agar tim dapat membangun front-end E-CAKRA secara cepat namun tetap tertib. Keputusan teknis yang diambil sengaja konservatif: cukup modern untuk maintainable, tetapi tetap sederhana agar delivery MVP tidak terhambat.

Jika terjadi konflik antara “solusi yang paling elegan” dan “solusi yang paling cepat, stabil, dan mudah dipakai operator”, maka tim harus memilih yang kedua.