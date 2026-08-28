import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hearingsApi, participantsApi } from '@/features/hearings/api'
import type { Hearing, HearingTemplate, WaitingParticipant } from '@/types/common'
import { useAuthStore } from '@/store/app.store'
import { Copy, CheckCheck, Users, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { TRANSPARANSI_LABELS, VALIDATION_LABELS, DECISION_LABELS } from '@/constants/routes'

const VALIDATION_CLASS: Record<string, string> = {
  valid:   'badge-valid',
  review:  'badge-review',
  invalid: 'badge-invalid',
}

const DECISION_CLASS: Record<string, string> = {
  admit:  'text-green-700 bg-green-50',
  hold:   'text-yellow-700 bg-yellow-50',
  reject: 'text-red-700 bg-red-50',
}

export default function HearingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [hearing,  setHearing]  = useState<Hearing | null>(null)
  const [template, setTemplate] = useState<HearingTemplate | null>(null)
  const [participants, setParticipants] = useState<WaitingParticipant[]>([])

  const [loading,  setLoading]  = useState(true)
  const [copied,   setCopied]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    setError('')
    try {
      const [h, t, p] = await Promise.all([
        hearingsApi.get(id),
        hearingsApi.template(id),
        hearingsApi.participants(id)
      ])
      setHearing(h)
      setTemplate(t)
      setParticipants(p)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Gagal memuat detail sidang.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000) // auto-refresh 15 detik
    return () => clearInterval(interval)
  }, [loadData])

  const handleCopy = () => {
    if (!template) return
    navigator.clipboard.writeText(template.teks_siap_salin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus sidang ini beserta semua data pesertanya? Aksi ini tidak dapat dibatalkan.')) return

    setDeleting(true)
    try {
      await hearingsApi.delete(id!)
      navigate('/hearings')
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Gagal menghapus sidang.')
      setDeleting(false)
    }
  }

  const handleAction = async (participantId: string, action: 'admit' | 'hold' | 'reject') => {
    setActionLoading(participantId + action)
    try {
      await participantsApi[action](participantId)
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Aksi gagal. Coba lagi.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading && !hearing) return <div className="p-8 text-gray-500">Memuat...</div>
  if (!hearing) return <div className="p-8 text-red-600">Sidang tidak ditemukan.</div>

  const pending = participants.filter(p => !p.operator_decision)
  const decided = participants.filter(p =>  p.operator_decision)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{hearing.nomor_perkara}</h2>
          <p className="text-gray-500 text-sm mt-1">{hearing.jenis_sidang}</p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'panitera') && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={18} /> {deleting ? 'Menghapus...' : 'Hapus Sidang'}
            </button>
          )}
          <button
            onClick={() => navigate(`/hearings/${id}/waiting-room`)}
            className="btn-primary flex items-center gap-2"
          >
            <Users size={18} /> Mode Waiting Room Penuh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
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

        <div className="lg:col-span-2">
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                Daftar Peserta
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {participants.length}
                </span>
              </h3>
              <button onClick={loadData} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-auto pr-2">
              {participants.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  <Users size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Belum ada peserta yang bergabung ke Zoom</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Menunggu Keputusan */}
                  {pending.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Menunggu Keputusan ({pending.length})
                      </h4>
                      <div className="space-y-2">
                        {pending.map(p => (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-yellow-200 bg-yellow-50/30 rounded-lg p-3 gap-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{p.display_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={VALIDATION_CLASS[p.validation_status]}>
                                  {VALIDATION_LABELS[p.validation_status]}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(p.joined_at).toLocaleTimeString('id-ID')}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(p.id, 'admit')} disabled={!!actionLoading} className="btn-success text-xs px-2.5 py-1">Admit</button>
                              <button onClick={() => handleAction(p.id, 'hold')} disabled={!!actionLoading} className="btn-warning text-xs px-2.5 py-1">Hold</button>
                              <button onClick={() => handleAction(p.id, 'reject')} disabled={!!actionLoading} className="btn-danger text-xs px-2.5 py-1">Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sudah Diputuskan */}
                  {decided.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-2">
                        Sudah Diputuskan ({decided.length})
                      </h4>
                      <div className="space-y-2">
                        {decided.map(p => (
                          <div key={p.id} className="flex items-center justify-between border border-gray-100 bg-gray-50 rounded-lg p-2.5">
                            <p className="text-sm font-medium text-gray-700 truncate mr-3">{p.display_name}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={VALIDATION_CLASS[p.validation_status]}>
                                {VALIDATION_LABELS[p.validation_status]}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DECISION_CLASS[p.operator_decision!]}`}>
                                {DECISION_LABELS[p.operator_decision!]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
