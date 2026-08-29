export type ValidationStatus = 'valid' | 'review' | 'invalid'
export type OperatorDecision = 'admit' | 'hold' | 'reject'
export type TransparansiStatus = 'open' | 'closed'
export type UserRole = 'admin' | 'operator' | 'panitera'

export interface User {
  id: string
  nama: string
  username: string
  role: UserRole
  is_active?: boolean
}

export interface Hearing {
  id: string
  nomor_perkara: string
  tanggal_sidang: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: TransparansiStatus
  terdakwa?: string | null
  pengadilan_pengirim?: string | null
  kejaksaan_negeri?: string | null
  lapas_rutan?: string | null
  agenda?: string | null
  status_sidang?: string
  majelis_hakim?: string | null
  panitera_pengganti?: string | null
  created_by: string | null
  created_at: string
  zoom_meeting: ZoomMeetingBrief | null
  zoom_status?: string
  zoom_error?: string | null
}

export interface ZoomMeetingBrief {
  zoom_meeting_id: string
  join_url: string
  password: string
}

export interface HearingTemplate {
  nomor_perkara: string
  tanggal: string
  jam: string
  jenis_sidang: string
  status: string
  zoom_meeting_id: string | null
  join_url: string | null
  password: string | null
  format_nama: string
  catatan: string
  teks_siap_salin: string
}

export interface WaitingParticipant {
  id: string
  display_name: string
  validation_status: ValidationStatus
  operator_decision: OperatorDecision | null
  joined_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  entity_type: string
  entity_id: string
  description: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  created_at: string
  assigned_to: string | null
}

export interface DashboardSummary {
  sidang_hari_ini: number
  peserta_menunggu: number
  audit_event_hari_ini: number
  sidang_list: Array<{
    id: string
    nomor_perkara: string
    jam_sidang: string
    jenis_sidang: string
    status_transparansi: TransparansiStatus
  }>
}

export interface ApiError {
  detail: string
}
