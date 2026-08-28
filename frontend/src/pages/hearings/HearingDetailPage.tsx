import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hearingsApi } from '@/features/hearings/api'
import type { Hearing, HearingTemplate } from '@/types/common'
import { Copy, CheckCheck, Users } from 'lucide-react'
import { TRANSPARANSI_LABELS } from '@/constants/routes'

export default function HearingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [hearing,  setHearing]  = useState<Hearing | null>(null)
  const [template, setTemplate] = useState<HearingTemplate | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([hearingsApi.get(id), hearingsApi.template(id)])
      .then(([h, t]) => { setHearing(h); setTemplate(t) })
      .finally(() => setLoading(false))
  }, [id])

  const handleCopy = () => {
    if (!template) return
    navigator.clipboard.writeText(template.teks_siap_salin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return <div className="p-8 text-gray-500">Memuat...</div>
  if (!hearing) return <div className="p-8 text-red-600">Sidang tidak ditemukan.</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{hearing.nomor_perkara}</h2>
          <p className="text-gray-500 text-sm mt-1">{hearing.jenis_sidang}</p>
        </div>
        <button
          onClick={() => navigate(`/hearings/${id}/waiting-room`)}
          className="btn-primary flex items-center gap-2"
        >
          <Users size={18} /> Buka Waiting Room
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800 mb-2">Detail Sidang</h3>
          {[
            ['Tanggal', new Date(hearing.tanggal_sidang).toLocaleDateString('id-ID', { dateStyle: 'long' })],
            ['Jam', hearing.jam_sidang.slice(0,5) + ' WIB'],
            ['Jenis', hearing.jenis_sidang],
            ['Status', TRANSPARANSI_LABELS[hearing.status_transparansi]],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
          {hearing.zoom_meeting && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Zoom Meeting</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Meeting ID</span>
                <span className="font-mono text-gray-800">{hearing.zoom_meeting.zoom_meeting_id}</span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Template Distribusi</h3>
            {template && (
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                {copied ? <><CheckCheck size={14} className="text-green-600" /> Tersalin!</> : <><Copy size={14} /> Salin</>}
              </button>
            )}
          </div>
          {template && (
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-72">
              {template.teks_siap_salin}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
