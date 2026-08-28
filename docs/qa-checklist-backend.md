# Checklist Verifikasi QA Backend E-CAKRA

**Versi:** 2.0 — Diperbarui 28 Agustus 2026  
**Scope:** Mencakup semua endpoint yang diimplementasikan termasuk fitur baru: Edit Sidang (F-012), RTMP Livestream (F-019), Token Blacklist, Profil & Ganti Password, HTTPS.

---

## A. Prasyarat Uji

Sebelum mulai, siapkan kondisi ini:

- [ ] Minimal 3 akun aktif: `admin`, `panitera`, `operator`
- [ ] Minimal 1 sidang `open` yang sudah dibuat dengan Zoom Meeting terhubung
- [ ] Minimal 1 sidang `closed`
- [ ] Minimal 1 `WaitingParticipant` untuk sidang tersebut
- [ ] Siapkan 2 environment: `APP_ENV=development` & `APP_ENV=production`
- [ ] Siapkan Zoom credentials valid & invalid (untuk tes graceful degradation)
- [ ] Webhook: header signature + timestamp valid & invalid/kadaluarsa
- [ ] Setting `zoom_stream_rtmp_url` & `zoom_stream_key` sudah diisi (untuk tes F-019)

**Status hasil testing:**  
`[PASS]` `[FAIL]` `[BLOCKED]` `[SKIP]`

---

## B. Health Check

### 1. `GET /health`
- **Expected:** Status 200, body `{"status":"ok","app":"E-CAKRA"}`
- [ ] Status 200
- [ ] Body `status = "ok"`
- [ ] Body `app = "E-CAKRA"`

---

## C. Auth Endpoints

### 2. `POST /auth/login` — Login berhasil
- **Expected:** Status 200, `access_token`, `token_type = "bearer"`, data `user` lengkap. Audit log `LOGIN` tercatat.
- [ ] Status 200
- [ ] `access_token` terisi
- [ ] `token_type = bearer`
- [ ] `user.id`, `user.username`, `user.role` terisi benar
- [ ] Audit log `LOGIN` tercatat

### 3. `POST /auth/login` — Password salah
- **Expected:** Status 401, pesan "Username atau password salah"
- [ ] Status 401
- [ ] Pesan error sesuai
- [ ] Tidak ada token dikembalikan

### 4. `POST /auth/login` — User tidak aktif
- **Expected:** Status 403, pesan "Akun tidak aktif"
- [ ] Status 403
- [ ] Pesan error sesuai

### 5. `GET /auth/me` — Token valid
- **Expected:** Status 200, data profil sesuai user login
- [ ] Status 200
- [ ] Data profil sesuai
- [ ] Role sesuai database

### 6. `GET /auth/me` — Token invalid / expired
- **Expected:** Status 401
- [ ] Status 401
- [ ] Tidak ada data user yang bocor

### 7. `POST /auth/logout` — Logout & token blacklist
- **Expected:** Status 200, token masuk blacklist, audit log `LOGOUT` tercatat.
- [ ] Status 200
- [ ] Audit log `LOGOUT` tercatat
- [ ] Pesan logout diterima client

### 8. Token blacklist — Pakai token yang sudah di-logout
- **Expected:** Status 401 "Token sudah tidak berlaku"
- [ ] Status 401 setelah logout
- [ ] Token yang sama tidak bisa dipakai lagi
- [ ] Pesan error mengarahkan user login kembali

### 9. `PATCH /auth/me/password` — Ganti password berhasil
- **Expected:** Status 200, password ter-update, audit log `CHANGE_PASSWORD` tercatat
- [ ] Status 200
- [ ] Login dengan password baru berhasil
- [ ] Login dengan password lama gagal (401)
- [ ] Audit log `CHANGE_PASSWORD` tercatat

### 10. `PATCH /auth/me/password` — Password lama salah
- **Expected:** Status 400, pesan "Password lama tidak sesuai"
- [ ] Status 400
- [ ] Password tidak berubah

### 11. `PATCH /auth/me/password` — Password baru terlalu pendek (< 6 karakter)
- **Expected:** Status 422
- [ ] Status 422

---

## D. Hearing Endpoints

### 12. `POST /hearings` — Create oleh Admin/Panitera (Zoom sukses)
- **Expected:** Status 201, hearing & ZoomMeeting tersimpan, audit log `CREATE_HEARING` + `CREATE_ZOOM_MEETING` tercatat
- [ ] Status 201
- [ ] Hearing tersimpan di database
- [ ] ZoomMeeting tersimpan (join_url, meeting_id, password terisi)
- [ ] Audit log `CREATE_HEARING` tercatat
- [ ] Audit log `CREATE_ZOOM_MEETING` tercatat
- [ ] `zoom_status = "created"`

### 13. `POST /hearings` — Create sidang TERBUKA dengan RTMP tersedia (F-019)
- **Expected:** Setup livestream dipanggil, audit log `SETUP_LIVESTREAM` tercatat
- [ ] Audit log `SETUP_LIVESTREAM` tercatat
- [ ] Tidak ada error yang mengganggu pembuatan sidang

### 14. `POST /hearings` — Create sidang TERTUTUP
- **Expected:** Livestream TIDAK dikonfigurasi, sidang tidak muncul di portal publik
- [ ] Tidak ada audit log `SETUP_LIVESTREAM`
- [ ] Sidang tidak tampil di `GET /public/hearings`

### 15. `POST /hearings` — Create oleh Operator
- **Expected:** Status 403
- [ ] Status 403
- [ ] Hearing tidak tercipta
- [ ] Tidak ada Zoom meeting yang tercipta

### 16. `POST /hearings` — Zoom API gagal (graceful degradation)
- **Expected:** Status 201, hearing tersimpan, `zoom_status = "failed"`, audit log `ERROR_ZOOM_MEETING`
- [ ] Status 201
- [ ] Hearing tetap tersimpan
- [ ] `zoom_meeting = null`
- [ ] `zoom_status = "failed"`
- [ ] Audit log `ERROR_ZOOM_MEETING` tercatat

### 17. `GET /hearings`
- **Expected:** Status 200, array hearing dengan mapping Zoom benar
- [ ] Status 200
- [ ] Array sidang tampil
- [ ] Mapping Zoom ke hearing benar (tidak N+1)

### 18. `GET /hearings/{id}` — ID valid & invalid
- **Expected Valid:** Status 200, detail lengkap
- **Expected Invalid:** Status 404
- [ ] Valid: Status 200, data lengkap
- [ ] Invalid: Status 404, pesan "Sidang tidak ditemukan"

### 19. `GET /hearings/{id}/template`
- **Expected:** Status 200, template teks siap salin
- [ ] Status 200
- [ ] Template memuat nomor perkara, tanggal, Zoom info, format nama peserta

### 20. `GET /hearings/{id}/participants`
- **Expected:** Status 200, array participant urut terbaru
- [ ] Status 200
- [ ] Array participant tampil urut dari terbaru

### 21. `PATCH /hearings/{id}` — Update oleh Panitera/Admin (F-012)
- **Expected:** Status 200, field terupdate, Zoom tersinkronisasi jika jadwal berubah
- [ ] Status 200
- [ ] Field yang diupdate berubah
- [ ] Audit log `UPDATE_HEARING` tercatat
- [ ] Jika tanggal/jam berubah: Zoom tersinkronisasi & audit log `UPDATE_ZOOM_MEETING` tercatat

### 22. `PATCH /hearings/{id}` — Update oleh Operator
- **Expected:** Status 403
- [ ] Status 403
- [ ] Data tidak berubah

### 23. `DELETE /hearings/{id}` — Delete oleh Admin/Panitera
- **Expected:** Status 204, hearing + participant + zoom_meeting terhapus, audit log `DELETE_HEARING`
- [ ] Status 204
- [ ] Hearing tidak ditemukan setelah dihapus (404)
- [ ] WaitingParticipant terkait terhapus
- [ ] ZoomMeeting terkait terhapus
- [ ] Audit log `DELETE_HEARING` tercatat

### 24. `DELETE /hearings/{id}` — Delete oleh Operator
- **Expected:** Status 403
- [ ] Status 403
- [ ] Hearing tidak terhapus

---

## E. Waiting Room / Participant Control

### 25–27. `POST /participants/{id}/[admit|hold|reject]` — Oleh Admin/Operator
- **Expected:** Status 200, `operator_decision` berubah, audit log tercatat, Zoom tersinkronisasi (admit/reject)
- **Admit:**
  - [ ] Status 200
  - [ ] `operator_decision = admit`
  - [ ] Audit log `ADMIT_PARTICIPANT` tercatat
  - [ ] Peserta di Zoom benar-benar masuk (skenario live)
- **Hold:**
  - [ ] Status 200
  - [ ] `operator_decision = hold`
  - [ ] Audit log `HOLD_PARTICIPANT` tercatat
- **Reject:**
  - [ ] Status 200
  - [ ] `operator_decision = reject`
  - [ ] Audit log `REJECT_PARTICIPANT` tercatat
  - [ ] Peserta di Zoom benar-benar keluar (skenario live)

### 28. `POST /participants/{id}/...` — Role tidak berwenang (Panitera)
- **Expected:** Status 403
- [ ] Status 403
- [ ] Data participant tidak berubah

### 29. `POST /participants/{id}/[admit|reject]` — Zoom API gagal
- **Expected:** Status 502, status participant lokal tidak berubah, error log tercatat
- [ ] Status 502
- [ ] `operator_decision` tidak berubah di DB
- [ ] Audit log `ERROR_ZOOM_PARTICIPANT_CONTROL` tercatat

---

## F. Webhook Zoom

### 30. `POST /webhooks/zoom` — URL validation challenge
- **Expected:** Status 200, kembalikan `plainToken` dan `encryptedToken`
- [ ] Status 200
- [ ] Body mengandung `encryptedToken`

### 31. `POST /webhooks/zoom` — Tanpa header signature (production)
- **Expected:** Status 401
- [ ] Status 401, request ditolak

### 32. `POST /webhooks/zoom` — Signature salah
- **Expected:** Status 401, "Signature webhook tidak valid"
- [ ] Status 401
- [ ] Pesan error sesuai

### 33. `POST /webhooks/zoom` — Timestamp terlalu lama (> 5 menit)
- **Expected:** Status 401, replay protection aktif
- [ ] Status 401

### 34. `POST /webhooks/zoom` — Participant waiting event valid
- **Expected:** Status 200, WaitingParticipant tercipta/terupdate, klasifikasi nama benar
- [ ] Status 200
- [ ] Participant tersimpan dengan `display_name` benar
- [ ] `validation_status` sesuai hasil klasifikasi nama
- [ ] Audit log `WEBHOOK_PARTICIPANT_JOINED` tercatat

### 35. `POST /webhooks/zoom` — Meeting ID tidak dikenali
- **Expected:** Status 200, event di-ignore, tidak ada perubahan DB
- [ ] Status 200
- [ ] Tidak ada record baru di `waiting_participants`

---

## G. User Management

### 36. `GET /users` — Oleh Admin
- **Expected:** Status 200, daftar user
- [ ] Status 200
- [ ] Daftar user tampil

### 37. `GET /users` — Oleh Operator/Panitera
- **Expected:** Status 403
- [ ] Status 403

### 38. `POST /users` — Buat user baru oleh Admin
- **Expected:** Status 201, user tersimpan, audit log `CREATE_USER`
- [ ] Status 201
- [ ] User tersimpan
- [ ] Audit log `CREATE_USER` tercatat

### 39. `PATCH /users/{id}` — Update user oleh Admin
- **Expected:** Status 200, data terupdate, audit log `UPDATE_USER`
- [ ] Status 200
- [ ] Audit log `UPDATE_USER` tercatat

### 40. `DELETE /users/{id}` — Hapus user oleh Admin
- **Expected:** Status 204, user terhapus, audit log `DELETE_USER`
- [ ] Status 204
- [ ] Audit log `DELETE_USER` tercatat

---

## H. Settings

### 41. `GET /settings` — Oleh Admin
- **Expected:** Status 200, daftar semua setting
- [ ] Status 200
- [ ] Setting `pengadilan_nama`, `zoom_default_topic`, `public_streaming_url`, `zoom_stream_rtmp_url`, `zoom_stream_key` ada

### 42. `PATCH /settings/{key}` — Update setting oleh Admin
- **Expected:** Status 200, nilai setting berubah, audit log `UPDATE_SETTING`
- [ ] Status 200
- [ ] Nilai setting berubah
- [ ] Audit log `UPDATE_SETTING` tercatat

### 43. `GET /settings` — Oleh Operator/Panitera
- **Expected:** Status 403
- [ ] Status 403

---

## I. Audit Log

### 44. `GET /audit-logs`
- **Expected:** Status 200, daftar log, mendukung filter & pagination
- [ ] Status 200
- [ ] Log tampil dengan field: `actor`, `action`, `entity_type`, `entity_id`, `description`, `created_at`
- [ ] Parameter `limit` & `offset` berfungsi

### 45. `GET /audit-logs` — Tanpa autentikasi
- **Expected:** Status 401
- [ ] Status 401

---

## J. Public Endpoint

### 46. `GET /public/hearings`
- **Expected:** Status 200 tanpa auth, hanya sidang `open` tampil
- [ ] Status 200 tanpa token
- [ ] Hanya sidang `status_transparansi = open` tampil
- [ ] Sidang `closed` TIDAK tampil
- [ ] `public_streaming_url` dari settings ikut dikembalikan

---

## K. Startup & Config Validation (Production)

### 47. Startup dengan `SECRET_KEY` default/kosong
- **Expected:** App gagal start dengan `ValueError`
- [ ] App gagal start

### 48. Startup dengan `ZOOM_WEBHOOK_SECRET_TOKEN` kosong
- **Expected:** App gagal start dengan `ValueError`
- [ ] App gagal start

### 49. Startup production — Auto-seed dimatikan
- **Expected:** App start normal, user default (`admin`, `operator`, `panitera`) TIDAK otomatis dibuat
- [ ] App start normal
- [ ] User default tidak ada di tabel `users`

---

## L. HTTPS & Security Headers

### 50. HTTP request → redirect ke HTTPS
- **Expected:** Status 301, Location header ke HTTPS
- [ ] Status 301
- [ ] `Location` header mengarah ke `https://`

### 51. HTTPS response — Security headers
- **Expected:** Header keamanan ada di setiap response
- [ ] `Strict-Transport-Security` ada (HSTS)
- [ ] `X-Frame-Options: SAMEORIGIN` ada
- [ ] `X-Content-Type-Options: nosniff` ada
- [ ] `X-XSS-Protection: 1; mode=block` ada

### 52. TLS versi yang digunakan
- **Expected:** TLS 1.2 atau 1.3 saja yang diterima
- [ ] TLS 1.2 diterima
- [ ] TLS 1.3 diterima
- [ ] TLS 1.0/1.1 ditolak

---

## M. Frontend — Keselarasan Navigasi

### 53. Sidebar role-based access
- **Expected:** Menu "Buat Sidang" hanya tampil untuk Admin & Panitera
- [ ] Login sebagai `operator` → menu "Buat Sidang" tidak tampil
- [ ] Login sebagai `panitera` → menu "Buat Sidang" tampil
- [ ] Login sebagai `admin` → semua menu tampil

### 54. Halaman Profil (`/profile`)
- **Expected:** Menampilkan nama, username, role + form ganti password
- [ ] Halaman `/profile` dapat diakses semua role
- [ ] Info user tampil benar
- [ ] Form ganti password berfungsi end-to-end

### 55. Halaman Edit Sidang (`/hearings/:id/edit`)
- **Expected:** Hanya Admin & Panitera yang melihat tombol Edit di detail sidang
- [ ] Tombol Edit tampil untuk Admin & Panitera
- [ ] Tombol Edit tidak tampil untuk Operator
- [ ] Form edit terisi data sidang yang ada
- [ ] Perubahan tersimpan dan Zoom tersinkronisasi

---

## N. Session / Token Lifecycle

### 56. Token expiry normal
- **Expected:** Token valid sebelum expire, ditolak (401) setelah expire
- [ ] Token valid saat belum expire
- [ ] Token ditolak (401) setelah expire (default: 60 menit)

### 57. Token blacklist setelah logout
- **Expected:** Token langsung tidak valid setelah logout meskipun belum expire
- [ ] Token tidak valid segera setelah `POST /auth/logout`
- [ ] Pesan error menjelaskan token sudah dinonaktifkan

---

## Automated Test Coverage

Jalankan test suite untuk memverifikasi endpoint kritis secara otomatis:

```bash
cd backend
pip install pytest pytest-asyncio
pytest -v
```

| Test File | Endpoint yang Dicakup | Jumlah Test |
|-----------|----------------------|-------------|
| `test_auth.py` | Login, logout, blacklist, /me | 11 |
| `test_hearings.py` | CRUD sidang, F-012, NF-006 | 14 |
| `test_name_validator.py` | Visual Triage F-005 | 15 |
| `test_audit.py` | Audit log F-006, F-016 | 5 |
| **Total** | | **45** |

Semua test harus `PASS` sebelum deploy ke production.
