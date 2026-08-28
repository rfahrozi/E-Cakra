/**
 * Validasi nomor perkara — tidak boleh kosong
 */
export const isNomorPerkaraValid = (value: string): boolean => value.trim().length > 0

/**
 * Validasi format tanggal YYYY-MM-DD
 */
export const isDateValid = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value))

/**
 * Validasi format jam HH:MM
 */
export const isTimeValid = (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)

/**
 * Validasi status transparansi sidang
 */
export const isStatusTransparansiValid = (value: string): boolean =>
  ['open', 'closed'].includes(value)

/**
 * Validasi username — minimal 3 karakter, alfanumerik
 */
export const isUsernameValid = (value: string): boolean => /^[a-zA-Z0-9_]{3,}$/.test(value)

/**
 * Validasi password — minimal 6 karakter
 */
export const isPasswordValid = (value: string): boolean => value.length >= 6
