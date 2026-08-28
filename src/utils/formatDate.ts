/**
 * Format tanggal ke string Indonesia
 * @example formatDate('2026-08-28') → '28 Agustus 2026'
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Format waktu ke HH:MM WIB
 * @example formatTime('09:00:00') → '09:00 WIB'
 */
export const formatTime = (timeStr: string): string => {
  return timeStr.slice(0, 5) + ' WIB'
}

/**
 * Format datetime ISO ke tanggal dan jam Indonesia
 */
export const formatDateTime = (iso: string): string => {
  const date = new Date(iso)
  return date.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB'
}
