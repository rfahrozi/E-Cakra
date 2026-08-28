# README

## Ringkasan Stack
Aplikasi akan dibangun dengan **Node.js + Express + TypeScript** untuk backend dan **React + shadcn/ui** untuk frontend. Kombinasi ini dipilih karena ringan, cepat dikembangkan, mudah dipelihara, dan cocok untuk pendekatan **modular monolith** yang sebelumnya sudah direncanakan. Backend fokus pada API, validasi, otorisasi, dan akses data. Frontend fokus pada pengalaman pengguna, state UI, form, tabel, filter, dan integrasi ke API.

## Kenapa Stack Ini Dipilih
**Node.js** cocok untuk aplikasi web yang membutuhkan produktivitas tinggi dan ekosistem package yang besar. **Express** memberi struktur yang sederhana sehingga arsitektur bisa dibuat rapi tanpa overhead framework yang terlalu besar. **TypeScript** dipakai agar kontrak data, DTO, service, dan response API lebih aman dan mudah dirawat. Di sisi frontend, **React** cocok untuk UI yang dinamis dan berbasis komponen. **shadcn/ui** dipilih karena komponen-komponennya bersih, modern, mudah dikustomisasi, dan enak dipakai untuk dashboard internal maupun aplikasi bisnis.

## Arsitektur Umum
Aplikasi dibagi menjadi dua lapisan utama:

### 1. Backend
Backend menangani:
- autentikasi dan otorisasi pengguna
- manajemen user
- manajemen data utama seperti records
- validasi request
- aturan bisnis
- akses database
- standardisasi response dan error handling

Pola yang dipakai di backend adalah:
**route -> controller -> service -> repository/data-access**

Artinya, route hanya mendefinisikan endpoint, controller menerima request, service berisi logika bisnis, dan repository menangani interaksi ke database. Pola ini penting agar kode tetap modular dan mudah diuji.

### 2. Frontend
Frontend menangani:
- halaman login dan proteksi akses
- layout aplikasi
- daftar data, detail data, create/update form
- pencarian, filter, sorting, pagination
- feedback UI seperti loading, empty state, error state, dan toast

Pola yang dipakai di frontend adalah:
**page -> feature component -> shared ui -> api client**

Dengan pola ini, komponen bisnis dipisahkan dari komponen UI umum sehingga aplikasi lebih mudah dikembangkan bertahap.

## Struktur Folder yang Disarankan
```text
project/
  backend/
    src/
      modules/
        auth/
        users/
        records/
      common/
      config/
      middlewares/
      routes/
      app.ts
      server.ts
  frontend/
    src/
      app/
      pages/
      features/
      components/
      lib/
      services/
      hooks/
```

## Detail Backend: Node.js + Express + TypeScript
Backend akan berisi beberapa bagian inti.

### Auth Module
Menangani login, profile saat ini, dan mekanisme token. Umumnya mencakup validasi kredensial, hashing password, pembuatan token, middleware auth, dan pengecekan role/permission bila dibutuhkan.

### Users Module
Menangani CRUD pengguna, pengaturan role, status aktif/nonaktif, dan data profil. Modul ini penting untuk administrasi aplikasi.

### Records Module
Menangani entitas bisnis utama aplikasi. Isi pastinya mengikuti domain yang sedang dibangun, tetapi struktur modulnya tetap sama: route, controller, service, validator, dan repository.

### Common Layer
Berisi utilitas bersama seperti custom error, response formatter, logger, pagination helper, constants, dan base types.

### Middleware
Digunakan untuk autentikasi, validasi, error handling, request logging, dan pengamanan header/CORS bila diperlukan.

## Detail Frontend: React + shadcn/ui
Frontend akan dibangun sebagai aplikasi berbasis komponen.

### React
Dipakai untuk membangun halaman yang interaktif dan reusable. Setiap halaman akan dipecah menjadi komponen kecil agar mudah dites dan dirawat.

### shadcn/ui
Dipakai untuk komponen seperti button, input, dialog, table, card, badge, tabs, dropdown, sheet, dan toast. Keuntungannya adalah UI konsisten, modern, dan cepat dikembangkan tanpa membuat semuanya dari nol.

### Pola Halaman
Setiap fitur idealnya punya:
- halaman list
- halaman detail bila perlu
- form create/edit
- komponen filter/search
- integrasi API per fitur

## Alur Data Aplikasi
1. User berinteraksi dengan halaman React.
2. Frontend memanggil API backend.
3. Backend memvalidasi request.
4. Service menjalankan logika bisnis.
5. Repository berinteraksi dengan database.
6. Response dikembalikan dalam format konsisten.
7. Frontend menampilkan hasil ke komponen UI.

## Tahapan Implementasi Bertahap
Tahap 1: inisialisasi monorepo atau dua folder terpisah backend/frontend.
Tahap 2: setup backend Express + TypeScript + struktur modular.
Tahap 3: setup frontend React + routing + shadcn/ui.
Tahap 4: implementasi auth end-to-end.
Tahap 5: implementasi users module end-to-end.
Tahap 6: implementasi records module end-to-end.
Tahap 7: integrasi validasi, error handling, dan standard response.
Tahap 8: penyempurnaan UI states, form handling, dan proteksi route.
Tahap 9: testing, hardening, dan dokumentasi environment.
Tahap 10: persiapan deployment.

## Prinsip Pengembangan
- mulai dari fondasi dulu, lalu fitur
- jaga tipe data backend dan frontend tetap konsisten
- buat modul kecil dan terpisah
- hindari business logic di route atau komponen UI
- prioritaskan keterbacaan, bukan abstraksi berlebihan
- gunakan naming yang konsisten sejak awal

## Hasil Akhir yang Ditargetkan
Hasil akhirnya adalah aplikasi full-stack yang modular, mudah dikembangkan, dan realistis untuk dikerjakan bertahap. Backend cukup terstruktur untuk scale menengah, sementara frontend cukup fleksibel untuk dashboard, admin panel, atau aplikasi operasional dengan kebutuhan CRUD dan autentikasi.

## Langkah Berikutnya
Setelah README ini, implementasi sebaiknya dimulai dari **setup folder backend dan frontend**, lalu pembuatan **kerangka dasar backend Express + TypeScript** terlebih dahulu.