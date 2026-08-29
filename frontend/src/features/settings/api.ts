import client from '@/services/http/client'

export interface SystemSetting {
  key: string
  value: string
  description: string | null
  updated_at: string
}

export const settingsApi = {
  list: async (): Promise<SystemSetting[]> => {
    const res = await client.get('/settings')
    return res.data
  },
  getGeneral: async (): Promise<Record<string, string>> => {
    const res = await client.get('/settings/general')
    return res.data
  },
  update: async (key: string, value: string): Promise<SystemSetting> => {
    const res = await client.patch(`/settings/${key}`, { value })
    return res.data
  },
}
