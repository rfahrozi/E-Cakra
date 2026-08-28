import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi, PublicLandingResponse, PublicHearingItem } from '@/features/public/api'
import { Scale, MonitorPlay, Calendar, Search, ArrowRight, User, CalendarDays, Monitor, PlayCircle, Info } from 'lucide-react'

type TabType = 'hari_ini' | 'akan_datang' | 'selesai'

export default function LandingPage() {
  const [data, setData] = useState<PublicLandingResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<TabType>('hari_ini')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = () => {
      publicApi.getHearings()
        .then((res: PublicLandingResponse) => setData(res))
        .finally(() => setLoading(false))
    }
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  const getFilteredHearings = (): PublicHearingItem[] => {
    if (!data) return []
    const todayStr = data.tanggal_hari_ini
    let filtered = data.hearings

    if (activeTab === 'hari_ini') {
      filtered = filtered.filter(h => h.tanggal_sidang === todayStr && h.status_sidang !== 'Selesai')
    } else if (activeTab === 'akan_datang') {
      filtered = filtered.filter(h => h.tanggal_sidang > todayStr && h.status_sidang !== 'Selesai')
    } else if (activeTab === 'selesai') {
      filtered = filtered.filter(h => h.status_sidang === 'Selesai' || h.tanggal_sidang < todayStr)
    }

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
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Scale size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">E-CAKRA</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Jadwal Sidang</a>
            <a href="#guide" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Panduan</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">
              Log in
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors">
              Portal Internal
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
          Layanan Keterbukaan Informasi Publik
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Pantau Jadwal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Persidangan</span> Secara Real-time.
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          {data?.pengadilan_nama ?? 'Pengadilan Tinggi'} menyediakan akses mudah bagi masyarakat untuk melihat jadwal sidang terbuka, memantau agenda perkara, dan menonton siaran langsung persidangan tanpa harus hadir ke ruang sidang.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#jadwal" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-all">
            Lihat Jadwal Sidang
          </a>
          <a
            href={isStreamingAvailable ? (data?.public_streaming_url || '#') : '#'}
            target={isStreamingAvailable ? "_blank" : "_self"}
            rel="noreferrer"
            className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium border rounded-md transition-all ${
              isStreamingAvailable
                ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:text-blue-600'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <PlayCircle size={18} className="mr-2" />
            {isStreamingAvailable ? 'Live Streaming' : 'Belum Ada Siaran'}
          </a>
        </div>
      </section>

      {/* ── BORDER SEPARATOR ── */}
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="w-full h-px bg-slate-200"></div>
      </div>

      {/* ── JADWAL SIDANG (TAB & CARDS) ── */}
      <section id="jadwal" className="py-20 px-6 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Informasi Perkara</h2>
            <p className="text-slate-600">Temukan informasi persidangan berdasarkan waktu atau cari langsung menggunakan nomor perkara dan nama terdakwa.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari perkara / terdakwa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tab Filters (Shadcn style tabs) */}
        <div className="flex p-1 bg-slate-100 rounded-lg w-full md:w-fit mb-8">
          {[
            { id: 'hari_ini', label: 'Sidang Hari Ini' },
            { id: 'akan_datang', label: 'Akan Datang' },
            { id: 'selesai', label: 'Selesai / Putus' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading & Empty States */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">Memuat jadwal...</div>
        ) : filteredHearings.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Tidak ada jadwal ditemukan</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Cobalah mengubah kriteria pencarian atau pilih kategori waktu yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHearings.map(h => (
              <div key={h.id} className="group relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-slate-300 flex flex-col">

                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {h.pengadilan_pengirim || 'Tingkat Banding'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                    h.status_sidang === 'Selesai'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {h.status_sidang}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2" title={h.nomor_perkara}>
                  {h.nomor_perkara}
                </h3>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Terdakwa</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{h.terdakwa || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Waktu Sidang</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {new Date(h.tanggal_sidang).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="mx-1.5 text-slate-300">|</span>
                        <span className="text-blue-600">{h.jam_sidang.slice(0, 5)} WIB</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Monitor size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Ruang</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">Ruang Sidang Virtual (Zoom)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Scale size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Agenda</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{h.agenda || 'Persidangan'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                    <Info size={16} /> Detail Perkara
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── BORDER SEPARATOR ── */}
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="w-full h-px bg-slate-200"></div>
      </div>

      {/* ── PANDUAN SECTION ── */}
      <section id="guide" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Akses Cepat & Transparan</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Kami berkomitmen untuk menyediakan informasi persidangan secara real-time yang dapat diakses oleh siapa saja, di mana saja, tanpa perlu melakukan registrasi akun.
            </p>
            <ul className="space-y-4">
              {[
                'Data jadwal ditarik langsung dari sistem operasional pengadilan.',
                'Siaran langsung hanya berlaku untuk sidang dengan status terbuka.',
                'Perkara sensitif seperti asusila/anak tidak disiarkan untuk publik.'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col justify-center min-h-[300px]">
             <h3 className="text-lg font-bold text-slate-900 mb-3">Ada kendala atau pertanyaan?</h3>
             <p className="text-sm text-slate-600 mb-6">Silakan hubungi helpdesk atau kunjungi portal resmi kami untuk informasi lebih lanjut mengenai tata cara persidangan elektronik.</p>
             <a href="#" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors w-fit">
               Hubungi Bantuan <ArrowRight size={16} className="ml-2" />
             </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-slate-900" />
            <span className="font-bold text-slate-900 text-sm">E-CAKRA</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {data?.pengadilan_nama ?? 'Pengadilan Tinggi'}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
