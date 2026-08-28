/**
 * Potong teks panjang dan tambahkan ellipsis
 */
export const truncate = (text: string, maxLength: number = 50): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text

/**
 * Capitalize huruf pertama
 */
export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

/**
 * Konversi status validasi ke label Indonesia
 */
export const validasiLabel = (status: 'valid' | 'review' | 'invalid'): string => {
  const map = { valid: 'Valid', review: 'Perlu Review', invalid: 'Tidak Valid' }
  return map[status] ?? status
}

/**
 * Konversi status transparansi ke label Indonesia
 */
export const transparansiLabel = (status: 'open' | 'closed'): string =>
  status === 'open' ? 'Terbuka' : 'Tertutup'

/**
 * Generate placeholder template distribusi sidang
 */
export const buildTemplate = (data: {
  nomorPerkara: string
  tanggal: string
  jam: string
  jenisSidang: string
  status: string
  meetingId: string
  joinUrl: string
}): string => `
📋 INFORMASI SIDANG ELEKTRONIK — E-CAKRA

Nomor Perkara : ${data.nomorPerkara}
Tanggal       : ${data.tanggal}
Jam           : ${data.jam}
Jenis Sidang  : ${data.jenisSidang}
Status        : ${data.status.toUpperCase()}

🔗 Zoom Meeting ID : ${data.meetingId}
🔗 Join URL        : ${data.joinUrl}

📌 FORMAT NAMA PESERTA:
   JPU - [Nama Lengkap]
   PENASIHAT HUKUM - [Nama]
   SAKSI - [Nama]
   TERDAKWA - [Nama]
   HAKIM - [Nama]
   PANITERA - [Nama]

⚠️  Masukkan nama sesuai format di atas sebelum bergabung.
`.trim()
