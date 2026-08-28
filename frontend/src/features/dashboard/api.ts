import client from '@/services/http/client'
import type { DashboardSummary } from '@/types/common'

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    const res = await client.get('/dashboard/summary')
    return res.data
  },
}
