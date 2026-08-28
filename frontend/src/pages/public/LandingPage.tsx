import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi, PublicLandingResponse, PublicHearingItem } from '@/features/public/api'
import { Scale, MonitorPlay, Calendar, Search, LogIn, ChevronRight, User, CalendarDays, Monitor, CheckCircle, Info } from 'lucide-react'

type TabType = 'hari_ini' | 'akan_datang' | 'selesai'

export default function LandingPage() {
  const [data, setData] = useState<PublicLandingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [activeTab, setActiveTab] = useState<TabType>('hari_ini')
  const [searchQuery, setSearchQuery] = useState('')

  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const loadData = () => {
    setLoading(true)
    publicApi.getHearings()
      .then((res) => setData(res))
      .catch(() => setError('Gagal memuat jadwal persidangan publik.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000) // Auto refresh tiap 1 menit
    return () => clearInterval(interval)
  }, [])

  // Fungsi Filter
  const getFilteredHearings = (): PublicHearingItem[] => {
    if (!data) return []

    const todayStr = data.tanggal_hari_ini // format YYYY-MM-DD
    let filtered = data.hearings

    // Filter berdasarkan Tab
    if (activeTab === 'hari_ini') {
      filtered = filtered.filter(h => h.tanggal_sidang === todayStr && h.status_sidang !== 'Selesai')
    } else if (activeTab === 'akan_datang') {
      filtered = filtered.filter(h => h.tanggal_sidang > todayStr && h.status_sidang !== 'Selesai')
    } else if (activeTab === 'selesai') {
      filtered = filtered.filter(h => h.status_sidang === 'Selesai' || h.tanggal_sidang < todayStr)
    }

    // Filter berdasarkan Pencarian (Nomor Perkara atau Terdakwa)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(h =>
        h.nomor_perkara.toLowerCase().includes(q) ||
        (h.terdakwa && h.terdakwa.toLowerCase().includes(q))
      )
    }

    return filtered
  }

  const filteredHearings = getFilteredHearings()
  const isStreamingAvailable = activeTab === 'hari_ini' && filteredHearings.length > 0

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0A1A2F' }}>

      {/* ── BACKGROUND LAYER (Meniru gaya Blur Refrensi) ── */}
      <div
        className="fixed inset-0 z-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop")' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0A1A2F]/80 to-[#0A1A2F] backdrop-blur-md" />

      {/* ── KONTEN UTAMA (Foreground) ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header / Kop */}
        <header className="py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] mb-4">
              <Scale size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">E-PERSIDANGAN</h1>
            <p className="text-sm font-bold text-yellow-400 mt-1 uppercase tracking-[0.2em] drop-shadow-md">
              {data?.pengadilan_nama ?? 'PORTAL JADWAL PERSIDANGAN PUBLIK'}
            </p>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-16">

          {/* ── PANEL KENDALI (Glassmorphism ringan) ── */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-8">

            {/* Top Bar: Navigasi & Pencarian */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">

              {/* Menu Tabs Kiri */}
              <div className="flex bg-[#11253E] border border-slate-600/50 rounded-xl overflow-hidden w-full md:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm transition-colors ${
                    viewMode === 'list' ? 'bg-yellow-500 text-yellow-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Scale size={16} /> Daftar Sidang
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm transition-colors ${
                    viewMode === 'calendar' ? 'bg-yellow-500 text-yellow-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <CalendarDays size={16} /> Kalender Sidang
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari No. Perkara / Terdakwa..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#11253E] border border-slate-600/50 text-white placeholder-slate-400 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm font-medium"
                />
              </div>

              {/* Action Buttons Kanan */}
              <div className="flex gap-3 w-full md:w-auto">
                <a
                  href={isStreamingAvailable ? (data?.public_streaming_url || '#') : '#'}
                  target={isStreamingAvailable ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    isStreamingAvailable
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                      : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' // Selalu aktif karena monitoring
                  }`}
                >
                  <MonitorPlay size={18} /> Monitoring Jadwal
                </a>
                <Link to="/login" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <LogIn size={18} /> Kembali ke Login
                </Link>
              </div>

            </div>

            {/* Sub-Filter Tabs: Waktu */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('hari_ini')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'hari_ini' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🚀 Hari Ini
              </button>
              <button
                onClick={() => setActiveTab('akan_datang')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'akan_datang' ? 'bg-blue-500 text-white shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                📅 Akan Datang
              </button>
              <button
                onClick={() => setActiveTab('selesai')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'selesai' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <CheckCircle size={16} /> Selesai / Putus
              </button>
            </div>
          </div>

          {/* ── KONTEN KARTU PERKARA / KALENDER ── */}
          {loading && !data ? (
            <div className="py-20 text-center flex flex-col items-center text-white/50">
              <RefreshCw size={40} className="animate-spin mb-4" />
              <p className="font-semibold tracking-wider">Memuat Jadwal Sidang...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-3 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl">
                <AlertCircle size={20} />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center shadow-inner">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CalendarDays size={36} className="text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Kalender Persidangan</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Fitur kalender bulanan sedang dalam pengembangan. Silakan gunakan mode "Daftar Sidang" untuk melihat jadwal terperinci.
              </p>
              <button onClick={() => setViewMode('list')} className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-500 hover:bg-blue-400 text-white transition-all">
                Kembali ke Daftar Sidang
              </button>
            </div>
          ) : filteredHearings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center shadow-inner">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar size={36} className="text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Belum ada jadwal persidangan</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Tidak ditemukan jadwal sidang yang cocok dengan kriteria "{
                  activeTab === 'hari_ini' ? 'Hari Ini' : activeTab === 'akan_datang' ? 'Akan Datang' : 'Selesai'
                }" atau pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredHearings.map((h) => (
                <div key={h.id} className="bg-white rounded-2xl p-6 shadow-xl flex flex-col h-full transform hover:-translate-y-1 transition-all duration-300">

                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full truncate max-w-[65%] border border-blue-100">
                      {h.pengadilan_pengirim || 'Tingkat Banding'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                      h.status_sidang === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {h.status_sidang}
                    </span>
                  </div>

                  {/* Perkara Number */}
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-4">
                    {h.nomor_perkara}
                  </h3>

                  {/* Attributes */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Terdakwa / Pemohon</p>
                        <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">{h.terdakwa || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Waktu Sidang</p>
                        <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">
                          {new Date(h.tanggal_sidang).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          <span className="mx-1.5 font-normal text-slate-300">|</span>
                          <span className="text-blue-600">Pukul {h.jam_sidang.slice(0, 5)} WIB</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Monitor size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Ruang Sidang (Virtual)</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded border border-slate-200">Zoom Cloud</span>
                          {h.zoom_meeting_id && (
                            <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded border border-slate-200">ID: {h.zoom_meeting_id}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Scale size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Agenda</p>
                        <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">{h.agenda || 'Pemberitahuan Persidangan'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Button Placeholder */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button className="w-full py-2.5 rounded-xl border-2 border-blue-100 text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                      <Info size={16} /> Detail Perkara
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>

        {/* Footer Minimalist */}
        <footer className="mt-auto py-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} {data?.pengadilan_nama ?? 'Pengadilan Tinggi'}. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="text-slate-500 hover:text-white text-xs">Kebijakan Privasi</a>
            <span className="text-slate-700">&bull;</span>
            <a href="#" className="text-slate-500 hover:text-white text-xs">Syarat & Ketentuan</a>
          </div>
        </footer>

      </div>
    </div>
  )
}
