import client from '@/services/http/client'
import type { Hearing, HearingTemplate, WaitingParticipant } from '@/types/common'

export const hearingsApi = {
  list: async (): Promise<Hearing[]> => {
    const res = await client.get('/hearings')
    return res.data
  },
  get: async (id: string): Promise<Hearing> => {
    const res = await client.get(`/hearings/${id}`)
    return res.data
  },
  create: async (data: {
    nomor_perkara: string
    tanggal_sidang: string
    jam_sidang: string
    jenis_sidang: string
    status_transparansi: string
    terdakwa?: string
    pengadilan_pengirim?: string
    kejaksaan_negeri?: string
    lapas_rutan?: string
    agenda?: string
    status_sidang?: string
  }): Promise<Hearing> => {
    const res = await client.post('/hearings', data)
    return res.data
  },
  template: async (id: string): Promise<HearingTemplate> => {
    const res = await client.get(`/hearings/${id}/template`)
    return res.data
  },
  participants: async (id: string): Promise<WaitingParticipant[]> => {
    const res = await client.get(`/hearings/${id}/participants`)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/hearings/${id}`)
  },
}

export const participantsApi = {
  admit: async (id: string) => (await client.post(`/participants/${id}/admit`)).data,
  hold: async (id: string) => (await client.post(`/participants/${id}/hold`)).data,
  reject: async (id: string) => (await client.post(`/participants/${id}/reject`)).data,
}
