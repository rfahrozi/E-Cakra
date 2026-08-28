import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { hearingsApi } from '@/features/hearings/api'
import type { Hearing } from '@/types/common'
import { AlertCircle, Save, ArrowLeft } from 'lucide-react'

interface FormData {
  nomor_perkara: string
  tanggal_sidang: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: 'open' | 'closed'
  terdakwa: string
  pengadilan_pengirim: string
  kejaksaan_negeri: string
  lapas_rutan: string
  agenda: string
  status_sidang: 'Terjadwal' | 'Selesai'
}

const JENIS_OPTIONS = [
  'Pidana Biasa',
  'Pidana Khusus',
  'Pidana Anak',
  'Perdata',
  'Perdata Khusus',
  'Tata Usaha Negara',
  'Agama',
  'Lainnya',
]

export default function HearingEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [zoomSyncWarning, setZoomSyncWarning] = useState('')
  const [hearing, setHearing] = useState<Hearing | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (!id) return
    hearingsApi
      .get(id)
      .then((h) => {
        setHearing(h)
        reset({
          nomor_perkara: h.nomor_perkara,
          tanggal_sidang: h.tanggal_sidang,
          jam_sidang: h.jam_sidang.slice(0, 5),
          jenis_sidang: h.jenis_sidang,
          status_transparansi: h.status_transparansi,
          terdakwa: h.terdakwa ?? '',
          pengadilan_pengirim: h.pengadilan_pengirim ?? '',
          kejaksaan_negeri: h.kejaksaan_negeri ?? '',
          lapas_rutan: h.lapas_rutan ?? '',
          agenda: h.agenda ?? '',
          status_sidang: (h.status_sidang as 'Terjadwal' | 'Selesai') ?? 'Terjadwal',
        })
      })
      .catch(() => setError('Gagal memuat data sidang.'))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setError('')
    setZoomSyncWarning('')
    setSaving(true)
    try {
      const updated = await hearingsApi.update(id!, {
        nomor_perkara: data.nomor_perkara,
        tanggal_sidang: data.tanggal_sidang,
        jam_sidang: data.jam_sidang,
        jenis_sidang: data.jenis_sidang,
        status_transparansi: data.status_transparansi,
        terdakwa: data.terdakwa || undefined,
        pengadilan_pengirim: data.pengadilan_pengirim || undefined,
        kejaksaan_negeri: data.kejaksaan_negeri || undefined,
        lapas_rutan: data.lapas_rutan || undefined,
        agenda: data.agenda || undefined,
        status_sidang: data.status_sidang,
      })

      // Tampilkan peringatan jika Zoom gagal sinkronisasi
      if (updated.zoom_status === 'sync_failed') {
        setZoomSyncWarning(
          `Sidang berhasil diperbarui, namun sinkronisasi ke Zoom gagal: ${updated.zoom_error ?? 'Error tidak diketahui'}. Peserta yang sudah menerima link lama tetap dapat bergabung.`
        )
      } else {
        navigate(`/hearings/${id}`)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? 'Gagal menyimpan perubahan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Memuat data sidang...</div>
  if (!hearing) return <div className="p-8 text-red-600">Sidang tidak ditemukan.</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/hearings/${id}`)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Sidang</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Perubahan jadwal akan disinkronisasikan ke Zoom secara otomatis
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {zoomSyncWarning && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Sidang tersimpan, Zoom tidak tersinkronisasi</p>
            <p>{zoomSyncWarning}</p>
            <button
              onClick={() => navigate(`/hearings/${id}`)}
              className="mt-2 underline text-yellow-900 hover:text-yellow-700"
            >
              Kembali ke detail sidang →
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nomor Perkara */}
          <div>
            <label className="form-label">
              Nomor Perkara <span className="text-red-500">*</span>
            </label>
            <input
              {...register('nomor_perkara', { required: 'Nomor perkara wajib diisi' })}
              className="form-input"
              placeholder="Contoh: 123/Pid.B/2026/PT.XXX"
            />
            {errors.nomor_perkara && (
              <p className="text-red-500 text-xs mt-1">{errors.nomor_perkara.message}</p>
            )}
          </div>

          {/* Pihak & Instansi */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-600 mb-3">Pihak dan Instansi Terkait</h4>
            <div className="space-y-3">
              <div>
                <label className="form-label">Terdakwa</label>
                <input {...register('terdakwa')} className="form-input" placeholder="Nama terdakwa..." />
              </div>
              <div>
                <label className="form-label">Pengadilan Negeri Pengirim (PN)</label>
                <input
                  {...register('pengadilan_pengirim')}
                  className="form-input"
                  placeholder="Contoh: Pengadilan Negeri Jakarta Pusat"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Kejaksaan Negeri</label>
                  <input
                    {...register('kejaksaan_negeri')}
                    className="form-input"
                    placeholder="Contoh: Kejari Jakarta Pusat"
                  />
                </div>
                <div>
                  <label className="form-label">Lapas / Rutan</label>
                  <input
                    {...register('lapas_rutan')}
                    className="form-input"
                    placeholder="Contoh: Rutan Salemba"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal & Info Sidang */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-600 mb-3">Jadwal dan Informasi Sidang</h4>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">
                  Tanggal Sidang <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('tanggal_sidang', { required: 'Tanggal wajib diisi' })}
                  className="form-input"
                />
                {errors.tanggal_sidang && (
                  <p className="text-red-500 text-xs mt-1">{errors.tanggal_sidang.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">
                  Jam Sidang <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register('jam_sidang', { required: 'Jam wajib diisi' })}
                  className="form-input"
                />
                {errors.jam_sidang && (
                  <p className="text-red-500 text-xs mt-1">{errors.jam_sidang.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="form-label">Jenis Sidang</label>
                <select {...register('jenis_sidang')} className="form-input">
                  {JENIS_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Agenda</label>
                <input
                  {...register('agenda')}
                  className="form-input"
                  placeholder="Contoh: Pengucapan Putusan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Status Sidang</label>
                <select {...register('status_sidang')} className="form-input">
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div>
                <label className="form-label">Sifat / Transparansi</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="open"
                      {...register('status_transparansi')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">🌐 Terbuka</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="closed"
                      {...register('status_transparansi')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">🔒 Tertutup</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom sync info */}
          {hearing.zoom_meeting && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
              <p className="font-semibold mb-0.5">Info Sinkronisasi Zoom</p>
              <p>
                Perubahan pada <strong>nomor perkara, tanggal, jam, jenis sidang,</strong> atau{' '}
                <strong>transparansi</strong> akan otomatis disinkronisasikan ke Zoom Meeting{' '}
                <span className="font-mono">{hearing.zoom_meeting.zoom_meeting_id}</span>.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/hearings/${id}`)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 flex-1">
              <Save size={16} />
              {saving ? 'Menyimpan & sinkronisasi Zoom...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
