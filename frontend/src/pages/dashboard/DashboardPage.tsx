import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '@/features/dashboard/api'
import type { DashboardSummary } from '@/types/common'
import { Scale, Users, ClipboardList, Plus, ChevronRight } from 'lucide-react'
import { TRANSPARANSI_LABELS } from '@/constants/routes'

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => {
    dashboardApi.summary()
      .then(setData)
      .catch(() => setError('Gagal memuat data dashboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Ringkasan operasional persidangan hari ini</p>
        </div>
        <button onClick={() => navigate('/hearings/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Buat Sidang
        </button>
      </div>

      {loading && <p className="text-gray-500">Memuat data...</p>}
      {error   && <p className="text-red-600">{error}</p>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Scale className="text-blue-600" size={22} />
                <span className="text-sm text-gray-500 font-medium">Sidang Hari Ini</span>
              </div>
              <p className="text-4xl font-bold text-blue-700">{data.sidang_hari_ini}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-yellow-600" size={22} />
                <span className="text-sm text-gray-500 font-medium">Peserta Menunggu</span>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{data.peserta_menunggu}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="text-green-600" size={22} />
                <span className="text-sm text-gray-500 font-medium">Audit Event Hari Ini</span>
              </div>
              <p className="text-4xl font-bold text-green-600">{data.audit_event_hari_ini}</p>
            </div>
          </div>

          {/* Jadwal hari ini */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Jadwal Sidang Hari Ini</h3>
            {data.sidang_list.length === 0 ? (
              <p className="text-gray-400 text-sm">Tidak ada sidang hari ini.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.sidang_list.map(s => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/hearings/${s.id}/waiting-room`)}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{s.nomor_perkara}</p>
                      <p className="text-gray-500 text-xs">{s.jenis_sidang} · {s.jam_sidang.slice(0,5)} WIB</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={s.status_transparansi === 'open' ? 'badge-open' : 'badge-closed'}>
                        {TRANSPARANSI_LABELS[s.status_transparansi]}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
