export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  HEARINGS_NEW: '/hearings/new',
  HEARING_DETAIL: (id: string) => `/hearings/${id}`,
  WAITING_ROOM: (id: string) => `/hearings/${id}/waiting-room`,
  AUDIT_LOGS: '/audit-logs',
} as const

export const VALIDATION_LABELS: Record<string, string> = {
  valid: 'Valid',
  review: 'Perlu Review',
  invalid: 'Tidak Valid',
}

export const DECISION_LABELS: Record<string, string> = {
  admit: 'Diizinkan',
  hold: 'Ditahan',
  reject: 'Ditolak',
}

export const TRANSPARANSI_LABELS: Record<string, string> = {
  open: 'Terbuka',
  closed: 'Tertutup',
}
