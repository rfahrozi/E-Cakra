import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hearingsApi } from '@/features/hearings/api'
import type { Hearing } from '@/types/common'
import { Search, Filter, ChevronRight, Video } from 'lucide-react'
import { TRANSPARANSI_LABELS } from '@/constants/routes'

export default function HearingListPage() {
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // States untuk filter
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    hearingsApi.list()
      .then(setHearings)
      .catch(() => setError('Gagal memuat daftar sidang'))
      .finally(() => setLoading(false))
  }, [])

  // Logika filter
  const filteredHearings = hearings.filter(h => {
    const matchSearch = h.nomor_perkara.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        h.jenis_sidang.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDate   = dateFilter ? h.tanggal_sidang === dateFilter : true
    return matchSearch && matchDate
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Sidang</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola dan pantau seluruh jadwal persidangan</p>
        </div>
        <button onClick={() => navigate('/hearings/new')} className="btn-primary">
          + Buat Sidang
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="card mb-6 p-4 flex gap-4 bg-white shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nomor perkara atau jenis sidang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm text-blue-600 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Daftar Sidang */}
      <div className="card p-0 overflow-hidden shadow-sm border border-gray-200">
        {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}

        {!loading && !error && filteredHearings.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-700">Tidak ada sidang ditemukan</p>
            <p className="text-sm mt-1">Coba sesuaikan filter pencarian atau buat sidang baru.</p>
          </div>
        )}

        {!loading && !error && filteredHearings.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Perkara</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis Sidang</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom Meeting</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHearings.map(hearing => (
                <tr
                  key={hearing.id}
                  onClick={() => navigate(`/hearings/${hearing.id}`)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(hearing.tanggal_sidang).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{hearing.jam_sidang.slice(0, 5)} WIB</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-blue-700 group-hover:underline">{hearing.nomor_perkara}</p>
                    <span className={`inline-block mt-1 ${hearing.status_transparansi === 'open' ? 'badge-open' : 'badge-closed'}`}>
                      {TRANSPARANSI_LABELS[hearing.status_transparansi]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{hearing.jenis_sidang}</span>
                  </td>
                  <td className="px-6 py-4">
                    {hearing.zoom_meeting ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Video size={16} className="text-blue-500" />
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {hearing.zoom_meeting.zoom_meeting_id}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tidak ada Zoom</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 inline-block transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
