export type ValidationStatus = 'valid' | 'review' | 'invalid'
export type OperatorDecision = 'admit' | 'hold' | 'reject'
export type TransparansiStatus = 'open' | 'closed'

export interface SelectOption {
  label: string
  value: string
}

export interface Hearing {
  id: string
  nomor_perkara: string
  tanggal_sidang: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: TransparansiStatus
  created_by: string
  created_at: string
}

export interface ZoomMeeting {
  id: string
  hearing_id: string
  zoom_meeting_id: string
  join_url: string
  start_url: string
  password: string
  waiting_room_enabled: boolean
  mute_upon_entry: boolean
  created_at: string
}

export interface WaitingParticipant {
  id: string
  hearing_id: string
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
