import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { hearingsApi } from '@/features/hearings/api'
import type { HearingTemplate } from '@/types/common'
import { Copy, CheckCheck } from 'lucide-react'

interface FormData {
  nomor_perkara: string
  tanggal_sidang: string
  jam_sidang: string
  jenis_sidang: string
  status_transparansi: 'open' | 'closed'
}

const JENIS_OPTIONS = [
  'Pidana Biasa', 'Pidana Khusus', 'Pidana Anak', 'Perdata',
  'Perdata Khusus', 'Tata Usaha Negara', 'Agama', 'Lainnya',
]

export default function HearingCreatePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { status_transparansi: 'open', jenis_sidang: 'Pidana Biasa' },
  })
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [template,   setTemplate]   = useState<HearingTemplate | null>(null)
  const [hearingId,  setHearingId]  = useState('')
  const [copied,     setCopied]     = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    setError('')
    setLoading(true)
    try {
      const hearing = await hearingsApi.create(data)
      setHearingId(hearing.id)
      const tmpl = await hearingsApi.template(hearing.id)
      setTemplate(tmpl)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Gagal membuat sidang. Periksa konfigurasi Zoom.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!template) return
    navigator.clipboard.writeText(template.teks_siap_salin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Buat Sidang Baru</h2>
        <p className="text-gray-500 text-sm mt-1">Isi data sidang dan sistem akan membuat Zoom meeting secara otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5">Data Sidang</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Nomor Perkara <span className="text-red-500">*</span></label>
              <input
                {...register('nomor_perkara', { required: 'Nomor perkara wajib diisi' })}
                className="form-input"
                placeholder="Contoh: 123/Pid.B/2026/PT.XXX"
              />
              {errors.nomor_perkara && <p className="text-red-500 text-xs mt-1">{errors.nomor_perkara.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Tanggal Sidang <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  {...register('tanggal_sidang', { required: 'Tanggal wajib diisi' })}
                  className="form-input"
                />
                {errors.tanggal_sidang && <p className="text-red-500 text-xs mt-1">{errors.tanggal_sidang.message}</p>}
              </div>
              <div>
                <label className="form-label">Jam Sidang <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  {...register('jam_sidang', { required: 'Jam wajib diisi' })}
                  className="form-input"
                />
                {errors.jam_sidang && <p className="text-red-500 text-xs mt-1">{errors.jam_sidang.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Jenis Sidang</label>
              <select {...register('jenis_sidang')} className="form-input">
                {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Status Transparansi</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="open"   {...register('status_transparansi')} className="text-blue-600" />
                  <span className="text-sm">🌐 Terbuka (Publik)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="closed" {...register('status_transparansi')} className="text-blue-600" />
                  <span className="text-sm">🔒 Tertutup</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Membuat sidang & Zoom meeting...' : 'Buat Sidang'}
              </button>
              {hearingId && (
                <button
                  type="button"
                  onClick={() => navigate(`/hearings/${hearingId}/waiting-room`)}
                  className="btn-secondary"
                >
                  Buka Waiting Room
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Template panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Template Distribusi</h3>
            {template && (
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                {copied ? <><CheckCheck size={15} className="text-green-600" /> Tersalin!</> : <><Copy size={15} /> Salin Semua</>}
              </button>
            )}
          </div>

          {!template ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Scale size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Template akan muncul setelah sidang berhasil dibuat</p>
            </div>
          ) : (
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
              {template.teks_siap_salin}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
