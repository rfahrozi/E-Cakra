import client from '@/services/http/client'

export interface PublicHearingItem {
  id: string
  nomor_perkara: string
  tanggal_sidang: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: string
  terdakwa: string | null
  pengadilan_pengirim: string | null
  agenda: string | null
  status_sidang: string
  zoom_meeting_id: string | null
  join_url: string | null
}

export interface PublicLandingResponse {
  pengadilan_nama: string
  public_streaming_url: string
  tanggal_hari_ini: string
  hearings: PublicHearingItem[]
}

export const publicApi = {
  getHearings: async (): Promise<PublicLandingResponse> => {
    const res = await client.get('/public/hearings')
    return res.data
  },
}
