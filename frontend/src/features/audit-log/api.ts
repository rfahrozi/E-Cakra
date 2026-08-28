import client from '@/services/http/client'
import type { AuditLog } from '@/types/common'

export const auditApi = {
  list: async (params?: { limit?: number; offset?: number; action?: string }): Promise<AuditLog[]> => {
    const res = await client.get('/audit-logs', { params })
    return res.data
  },
}
