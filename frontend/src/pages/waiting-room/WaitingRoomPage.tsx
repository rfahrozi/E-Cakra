import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { hearingsApi, participantsApi } from '@/features/hearings/api'
import type { WaitingParticipant, Hearing } from '@/types/common'
import { VALIDATION_LABELS, DECISION_LABELS } from '@/constants/routes'
import { RefreshCw, AlertCircle } from 'lucide-react'

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

export default function WaitingRoomPage() {
  const { id } = useParams<{ id: string }>()
  const [hearing,       setHearing]       = useState<Hearing | null>(null)
  const [participants,  setParticipants]  = useState<WaitingParticipant[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError,   setActionError]   = useState('')

  const loadData = useCallback(async () => {
    if (!id) return
    setError('')
    try {
      const [h, p] = await Promise.all([
        hearingsApi.get(id),
        hearingsApi.participants(id),
      ])
      setHearing(h)
      setParticipants(p)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Gagal memuat data waiting room.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000) // auto-refresh 15 detik
    return () => clearInterval(interval)
  }, [loadData])

  const handleAction = async (participantId: string, action: 'admit' | 'hold' | 'reject') => {
    setActionLoading(participantId + action)
    setActionError('')
    try {
      await participantsApi[action](participantId)
      await loadData()
    } catch (err: any) {
      setActionError(err.response?.data?.detail ?? 'Aksi gagal. Coba lagi.')
    } finally {
      setActionLoading(null)
    }
  }

  const pending = participants.filter((p: WaitingParticipant) => !p.operator_decision)
  const decided = participants.filter((p: WaitingParticipant) =>  p.operator_decision)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waiting Room</h2>
          {hearing && (
            <p className="text-gray-500 text-sm mt-1">
              {hearing.nomor_perkara} · {hearing.jenis_sidang}
            </p>
          )}
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Error aksi operator */}
      {actionError && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} />
          <span className="text-sm">{actionError}</span>
        </div>
      )}

      {loading && <p className="text-gray-500">Memuat peserta...</p>}

      {!loading && !error && (
        <>
          {/* Peserta menunggu keputusan */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Menunggu Keputusan
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </h3>
            {pending.length === 0 ? (
              <p className="text-gray-400 text-sm">Tidak ada peserta yang menunggu.</p>
            ) : (
              <div className="space-y-3">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">{p.display_name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Masuk: {new Date(p.joined_at).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={VALIDATION_CLASS[p.validation_status]}>
                        {VALIDATION_LABELS[p.validation_status]}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(p.id, 'admit')}
                          disabled={!!actionLoading}
                          className="btn-success"
                        >
                          Admit
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'hold')}
                          disabled={!!actionLoading}
                          className="btn-warning"
                        >
                          Hold
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          disabled={!!actionLoading}
                          className="btn-danger"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peserta sudah diputuskan */}
          {decided.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">
                Sudah Diputuskan
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {decided.length}
                </span>
              </h3>
              <div className="divide-y divide-gray-100">
                {decided.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-gray-700">{p.display_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={VALIDATION_CLASS[p.validation_status]}>
                        {VALIDATION_LABELS[p.validation_status]}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DECISION_CLASS[p.operator_decision!]}`}>
                        {DECISION_LABELS[p.operator_decision!]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
