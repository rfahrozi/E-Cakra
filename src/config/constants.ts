import { env } from './env'

export const API_BASE_URL = env.API_BASE_URL ?? 'http://localhost:8000'
export const APP_NAME = 'E-CAKRA'
export const APP_VERSION = '1.0.0'

export const VALIDATION_STATUS = {
  VALID: 'valid',
  REVIEW: 'review',
  INVALID: 'invalid',
} as const

export const TRANSPARANSI_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const

export const OPERATOR_DECISION = {
  ADMIT: 'admit',
  HOLD: 'hold',
  REJECT: 'reject',
} as const

export const PARTICIPANT_PREFIXES = [
  'JPU',
  'PENASIHAT HUKUM',
  'SAKSI',
  'TERDAKWA',
  'HAKIM',
  'PANITERA',
]
