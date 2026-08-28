import client from '@/services/http/client'

export interface PublicHearingItem {
  nomor_perkara: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: string
}

export interface PublicLandingResponse {
  pengadilan_nama: string
  public_streaming_url: string
  tanggal_hari_ini: string
  hearings: PublicHearingItem[]
}

export const publicApi = {
  getTodayHearings: async (): Promise<PublicLandingResponse> => {
    const res = await client.get('/public/today')
    return res.data
  }
}
