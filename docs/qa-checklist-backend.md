# Checklist Verifikasi Patch Backend E-Cakra

## A. Prasyarat Uji
Sebelum mulai, siapkan kondisi ini:

- Ada minimal 4 akun: `admin`, `panitera`, `operator`, `user` (atau role non-admin/non-operator/non-panitera)
- Ada 1 sidang yang sudah dibuat
- Ada 1 sidang dengan ZoomMeeting terhubung
- Ada minimal 1 WaitingParticipant untuk sidang tersebut
- Siapkan 2 mode environment: `APP_ENV=development` & `APP_ENV=production`
- Siapkan 2 kondisi kredensial Zoom: valid & invalid/sengaja salah
- Siapkan 2 kondisi webhook: header signature + timestamp valid & header hilang / timestamp lama / signature salah

**Status hasil testing gunakan salah satu:**
`[PASS]`, `[FAIL]`, `[BLOCKED]`

---

## B. Health Check
### 1. `GET /health`
- **Tujuan**: memastikan service backend hidup.
- **Langkah uji**: Kirim `GET /health`
- **Expected**: Status 200. Body mengandung `status = "ok"` dan `app = "E-CAKRA"`
- **Checklist**:
  - [ ] Status 200
  - [ ] Body status bernilai ok
  - [ ] Body app terisi benar

---

## C. Auth Endpoints
### 2. `POST /auth/login` — login berhasil
- **Tujuan**: memastikan login normal masih berjalan setelah patch.
- **Expected**: Status 200, return `access_token`, `token_type = "bearer"`, objek `user`. Audit log `LOGIN` tercatat.
- **Checklist**:
  - [ ] Status 200
  - [ ] access_token terisi
  - [ ] token_type = bearer
  - [ ] Data user.id, user.username, user.role terisi
  - [ ] Audit log LOGIN tercatat

### 3. `POST /auth/login` — password salah
- **Tujuan**: memastikan autentikasi gagal dengan benar.
- **Expected**: Status 401. Detail: Username atau password salah.
- **Checklist**:
  - [ ] Status 401
  - [ ] Pesan error sesuai
  - [ ] Tidak ada token yang dikembalikan

### 4. `POST /auth/login` — user tidak aktif
- **Tujuan**: memastikan akun nonaktif ditolak.
- **Expected**: Status 403. Detail: Akun tidak aktif.
- **Checklist**:
  - [ ] Status 403
  - [ ] Pesan error sesuai

### 5. `GET /auth/me`
- **Tujuan**: memastikan token valid bisa membaca profil sendiri.
- **Expected**: Status 200.
- **Checklist**:
  - [ ] Status 200
  - [ ] Data profil sesuai user login
  - [ ] Role sesuai database

### 6. `GET /auth/me` — token invalid / expired
- **Tujuan**: memastikan session invalid ditolak.
- **Expected**: Status 401.
- **Checklist**:
  - [ ] Status 401
  - [ ] Tidak ada data user yang bocor
  - [ ] Frontend dapat memetakan ini ke "sesi berakhir"

### 7. `POST /auth/logout`
- **Tujuan**: memastikan logout endpoint tetap berjalan.
- **Expected**: Status 200. Audit log logout tercatat. Respons menjelaskan logout berhasil.
- **Checklist**:
  - [ ] Status 200
  - [ ] Audit log LOGOUT tercatat
  - [ ] Respons logout diterima client

---

## D. Hearing Endpoints
### 8. `POST /hearings` — create hearing oleh role berwenang
- **Tujuan**: memastikan hanya role yang diizinkan bisa membuat sidang (admin/panitera).
- **Expected**: Status 201. Hearing tersimpan, audit log `CREATE_HEARING` tercatat.
- **Checklist**:
  - [ ] Status 201
  - [ ] Hearing tersimpan di database
  - [ ] Audit log CREATE_HEARING tercatat
  - [ ] Response memuat data sidang lengkap

### 9. `POST /hearings` — create hearing oleh role tidak berwenang
- **Tujuan**: memastikan RBAC create hearing aktif. (Login sebagai operator)
- **Expected**: Status 403. Detail: hanya admin/panitera yang boleh membuat sidang.
- **Checklist**:
  - [ ] Status 403
  - [ ] Hearing tidak tercipta
  - [ ] Tidak ada Zoom meeting yang tercipta

### 10. `POST /hearings` — create hearing saat Zoom valid
- **Tujuan**: memastikan integrasi Zoom normal.
- **Expected**: Status 201. Hearing & ZoomMeeting tercipta. Audit log `CREATE_ZOOM_MEETING` tercatat.
- **Checklist**:
  - [ ] Status 201
  - [ ] Record ZoomMeeting tersimpan (Join URL / meeting ID / password terisi)
  - [ ] Audit log CREATE_ZOOM_MEETING tercatat

### 11. `POST /hearings` — create hearing saat Zoom gagal
- **Tujuan**: memastikan kegagalan Zoom tidak menghancurkan create hearing.
- **Expected**: Hearing tetap tercipta, Zoom meeting tidak tercipta, audit log `ERROR_ZOOM_MEETING` tercatat, `zoom_status = failed`.
- **Checklist**:
  - [ ] Hearing tetap tercipta
  - [ ] Zoom meeting tidak tercipta
  - [ ] Audit log ERROR_ZOOM_MEETING tercatat
  - [ ] Error Zoom terbaca jelas di response/log

### 12. `GET /hearings`
- **Tujuan**: memastikan daftar sidang tetap tampil normal.
- **Expected**: Status 200. Return array hearing.
- **Checklist**:
  - [ ] Status 200
  - [ ] Array sidang tampil
  - [ ] Mapping Zoom ke hearing benar (tidak ada masalah N+1)

### 13. `GET /hearings/{hearing_id}` & 14. Invalid ID
- **Expected Valid**: Status 200, detail lengkap.
- **Expected Invalid**: Status 404, Pesan: "Sidang tidak ditemukan".
- **Checklist**:
  - [ ] Valid: ID sesuai
  - [ ] Invalid: Status 404 & Pesan error sesuai

### 15. `GET /hearings/{hearing_id}/template`
- **Tujuan**: memastikan template sidang tetap bisa dipakai operasional.
- **Checklist**:
  - [ ] Status 200
  - [ ] Template teks terbentuk (termasuk zoom info & format nama peserta)

### 16. `GET /hearings/{hearing_id}/participants`
- **Checklist**:
  - [ ] Status 200
  - [ ] Array participant tampil urut dari terbaru

### 17. `DELETE /hearings/{hearing_id}` — delete oleh role berwenang
- **Tujuan**: memastikan delete hearing berjalan end-to-end dan bug WaitingParticipant/NameError hilang. (Oleh admin/panitera).
- **Checklist**:
  - [ ] Status 204
  - [ ] Hearing terhapus dari database
  - [ ] Participant & ZoomMeeting terkait ikut terhapus
  - [ ] Audit log DELETE_HEARING tercatat
  - [ ] Tidak ada error runtime (NameError)

### 18. `DELETE /hearings/{hearing_id}` — delete oleh role tidak berwenang
- **Tujuan**: memastikan RBAC delete hearing aktif. (Oleh operator).
- **Checklist**:
  - [ ] Status 403
  - [ ] Hearing tidak terhapus

---

## E. Waiting Room / Participant Control
### 19-21. `POST /participants/{id}/[admit|hold|reject]` — oleh operator/admin
- **Tujuan**: memastikan control participant berhasil untuk role sah.
- **Checklist Admit/Reject**:
  - [ ] Status 200
  - [ ] `operator_decision` berubah
  - [ ] Audit log tercatat
  - [ ] Participant di Zoom benar-benar admitted/rejected (bila skenario live)
- **Checklist Hold**:
  - [ ] Status 200
  - [ ] `operator_decision = hold`, Audit log tercatat

### 22. `POST /participants/{id}/...` — role tidak berwenang
- **Tujuan**: memastikan RBAC participant control aktif setelah patch. (Bukan admin/operator).
- **Checklist**:
  - [ ] Status 403
  - [ ] Data participant tidak berubah

### 23. `POST /participants/{id}/[admit|reject]` — Zoom API gagal
- **Tujuan**: memastikan tidak ada "sukses palsu" ketika sinkronisasi Zoom gagal.
- **Checklist**:
  - [ ] Status 502
  - [ ] Status participant lokal tidak berubah
  - [ ] Ada log error sinkronisasi Zoom

---

## F. Webhook Zoom
### 25. `POST /webhooks/zoom` — URL validation challenge
- **Checklist**:
  - [ ] Status 200, mengembalikan `plainToken` dan `encryptedToken`

### 26. `POST /webhooks/zoom` — production tanpa header
- **Checklist**:
  - [ ] Status 401, request ditolak

### 27. `POST /webhooks/zoom` — signature salah
- **Checklist**:
  - [ ] Status 401, pesan error "Signature webhook tidak valid"

### 28. `POST /webhooks/zoom` — timestamp terlalu lama
- **Checklist**:
  - [ ] Status 401, replay protection aktif

### 29. `POST /webhooks/zoom` — participant waiting valid
- **Checklist**:
  - [ ] Status 200
  - [ ] Participant baru tercipta/terupdate (`display_name` & `validation_status` benar)
  - [ ] Audit log `WEBHOOK_PARTICIPANT_JOINED` tercatat

### 30. `POST /webhooks/zoom` — meeting tidak dikenali
- **Checklist**:
  - [ ] Status 200
  - [ ] Event di-ignore
  - [ ] Tidak ada perubahan database

---

## G. Startup / Config Validation
### 31. Startup production dengan SECRET_KEY default
- **Checklist**:
  - [ ] App gagal start (ValueError)

### 32. Startup production dengan ZOOM_WEBHOOK_SECRET_TOKEN kosong
- **Checklist**:
  - [ ] App gagal start (ValueError)

### 33. Startup production tidak seed default users
- **Checklist**:
  - [ ] App start normal (jika secrets diatur benar)
  - [ ] User default (admin, operator, panitera) TIDAK tercipta di tabel `users`

---

## H. Session / Token Lifecycle
### 34. Token expiry
- **Tujuan**: memastikan expiry token benar setelah dipendekkan (15 menit untuk prod).
- **Checklist**:
  - [ ] Token valid sebelum expiry
  - [ ] Token ditolak (401) setelah expiry
