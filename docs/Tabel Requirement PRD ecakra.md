## Tabel Requirement PRD: E-CAKRA (Versi Final)

| ID | Jenis (F/NF) | Deskripsi | Prioritas | Status |
|---|---|---|---|---|
| **F-001** | F | Sistem harus menyediakan mekanisme login untuk pengguna internal sebelum mengakses fitur pengelolaan sidang elektronik. | High | Confirmed PRD |
| **F-002** | F | Sistem harus mendukung penjadwalan sesi persidangan elektronik sebagai workflow inti. | High | Confirmed PRD |
| **F-003** | F | Sistem harus dapat membuat meeting Zoom dari aplikasi untuk mengurangi proses pembuatan meeting manual. | High | Confirmed PRD |
| **F-004** | F | Sistem harus mendukung pengelolaan waiting room sebagai workflow inti operasional. | High | Confirmed PRD |
| **F-005** | F | Sistem harus mendukung validasi partisipan melalui klasifikasi visual (*Visual Triage*) di dashboard, sebelum peserta diizinkan masuk ke ruang sidang virtual secara manual oleh Panitera. | High | Confirmed PRD |
| **F-006** | F | Sistem harus mencatat audit logging atas aksi penting yang terkait dengan sesi persidangan elektronik. | High | Confirmed PRD |
| **F-007** | F | Sistem harus membantu menstandarkan distribusi informasi sesi untuk mengurangi inkonsistensi informasi (menghasilkan teks baku E-Berpadu/SIPP). | High | Confirmed PRD |
| **F-008** | F | Sistem harus memperkuat kontrol akses peserta ke ruang sidang virtual. | High | Confirmed PRD |
| **F-009** | F | Sistem harus menyimpan entitas sesi internal yang terhubung dengan meeting Zoom yang dibuat. | High | Assumption |
| **F-010** | F | Sistem harus menampilkan daftar sesi persidangan beserta status dasar sesi. | Medium | Assumption |
| **F-011** | F | Sistem harus menampilkan detail sesi yang memuat jadwal, keterkaitan perkara, status, dan informasi akses yang relevan. | Medium | Assumption |
| **F-012** | F | Sistem sebaiknya memungkinkan perubahan sesi sebelum sesi berlangsung dan menyelaraskan perubahan itu dengan integrasi Zoom. | Medium | Assumption |
| **F-013** | F | Sistem sebaiknya memungkinkan pembatalan sesi dan mencatat hasil pembatalan tersebut pada audit log. | Medium | Assumption |
| **F-014** | F | Sistem harus menyediakan jalur operasional bagi petugas internal untuk membuka atau memulai sesi Zoom yang sudah dibuat. | Medium | Assumption |
| **F-015** | F | Sistem harus menampilkan tindakan eksekusi *waiting room* (seperti *admit* atau *reject/kick*) melalui integrasi API bagi petugas yang berwenang. | Medium | Assumption |
| **F-016** | F | Sistem harus mencatat siapa, kapan, dan aksi apa yang dilakukan pada sesi untuk mendukung legal audit trail. | High | Confirmed PRD |
| **F-017** | F | Sistem sebaiknya mencatat kegagalan integrasi penting dengan Zoom sebagai bagian dari audit operasional. | Medium | Assumption |
| **F-018** | F | Sistem sebaiknya menyediakan sumber informasi tunggal untuk data sesi agar distribusi informasi tetap konsisten. | Medium | Assumption |
| **F-019** | F | Sistem harus dapat memicu *API Custom Live Streaming (RTMP)* ke kanal YouTube resmi secara otomatis untuk perkara "Terbuka Untuk Umum". | High | Confirmed PRD |
| **F-020** | F | Sistem harus mengunci fitur penyiaran/publikasi secara otomatis untuk perkara yang dikategorikan "Sidang Tertutup" (contoh: perkara anak/asusila). | High | Confirmed PRD |
| **NF-001** | NF | Sistem harus menjaga keamanan ruang sidang virtual sebagai salah satu tujuan utama produk. | High | Confirmed PRD |
| **NF-002** | NF | Sistem harus mendukung legal audit trail yang dapat dipakai untuk kebutuhan akuntabilitas hukum. | High | Confirmed PRD |
| **NF-003** | NF | Sistem harus cukup ringan dan fokus untuk dapat dioperasionalkan dalam target MVP 2 minggu. | High | Confirmed PRD |
| **NF-004** | NF | Fitur pengelolaan Zoom hanya boleh diakses oleh pengguna internal yang terautentikasi. | High | Assumption |
| **NF-005** | NF | Informasi akses sesi harus diperlakukan sebagai data sensitif operasional. | High | Assumption |
| **NF-006** | NF | Kegagalan integrasi dengan Zoom tidak boleh menghilangkan data sesi internal yang sudah tercatat. | High | Assumption |
| **NF-007** | NF | Sistem harus memberikan penanganan error yang dapat ditindaklanjuti ketika integrasi Zoom gagal atau tidak sinkron. | High | Assumption |
| **NF-008** | NF | Sistem harus cukup responsif untuk dipakai operator dalam penjadwalan sesi dan pengelolaan waiting room. | Medium | Assumption |
| **NF-009** | NF | Desain sistem harus dapat berkembang mengikuti peningkatan jumlah sesi, peserta, dan audit event. | Medium | Assumption |
| **NF-010** | NF | Antarmuka operator harus sederhana dan meminimalkan langkah manual pada workflow inti. | Medium | Assumption |
| **NF-011** | NF | Status sesi, status validasi partisipan, dan status audit harus ditampilkan secara jelas bagi operator. | Medium | Assumption |
| **NF-012** | NF | Sistem sebaiknya mampu membedakan status internal sesi dan status sinkronisasi integrasi Zoom. | Medium | Assumption |