import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi, PublicLandingResponse } from '@/features/public/api'
import { Scale, MonitorPlay, Clock, AlertCircle, Info, RefreshCw, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const [data, setData] = useState<PublicLandingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const loadData = () => {
    setLoading(true)
    publicApi.getTodayHearings()
      .then((res) => {
        setData(res)
        setLastUpdate(new Date().toLocaleTimeString('id-ID'))
      })
      .catch(() => setError('Gagal memuat jadwal persidangan publik.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000) // Auto refresh tiap 1 menit
    return () => clearInterval(interval)
  }, [])

  const hasHearings = data && data.hearings.length > 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── HEADER PUBLIK ── */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">E-CAKRA</h1>
              <p className="text-xs text-blue-200 font-medium mt-1 uppercase tracking-wider">
                {data?.pengadilan_nama ?? 'Portal Informasi Persidangan'}
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#jadwal" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">Jadwal Sidang</a>
            <a href="#panduan" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">Panduan</a>
            <Link to="/login" className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition-all">
              Portal Internal &rarr;
            </Link>
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full">

        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              Layanan Informasi Publik
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Jadwal Sidang Terbuka
            </h2>
            <p className="text-slate-500 text-base lg:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Pantau jadwal sidang yang terbuka untuk umum, cek status siaran langsung, dan akses informasi publik pengadilan secara transparan dalam satu halaman.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section id="jadwal" className="max-w-6xl mx-auto px-6 py-10">

          {/* Trust Signal & Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-8">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tanggal Sidang</p>
                <p className="font-bold text-slate-800">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Sidang Terbuka</p>
                <p className="font-bold text-blue-700">{data?.hearings.length ?? 0} Perkara</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock size={14} /> Diperbarui: {lastUpdate} WIB
              </span>
              <button onClick={loadData} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors" title="Muat ulang data">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Grid Layout Utama */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Kolom Kiri: Daftar Sidang (2/3 ruang) */}
            <div className="lg:col-span-2 space-y-4">

              {loading && !data && (
                <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <RefreshCw size={32} className="animate-spin" />
                    <p className="font-medium">Memuat jadwal dari sistem...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 text-red-700 bg-red-50 px-5 py-4 rounded-xl border border-red-200">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {!loading && !error && data && !hasHearings && (
                /* Empty State yang Actionable */
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Scale size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Belum ada sidang terbuka hari ini</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    Saat ini tidak ada persidangan yang dijadwalkan dengan status "Terbuka Untuk Umum". Silakan cek kembali nanti atau lihat jadwal hari berikutnya.
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <a href="https://sipp.mahkamahagung.go.id/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm">
                      Cek Jadwal di SIPP <ChevronRight size={16}/>
                    </a>
                  </div>
                </div>
              )}

              {!loading && !error && data && hasHearings && (
                <div className="space-y-4">
                  {data.hearings.map((h, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{h.jenis_sidang}</p>
                        </div>
                        <h3 className="font-extrabold text-blue-900 text-xl group-hover:text-blue-700 transition-colors">{h.nomor_perkara}</h3>
                      </div>
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-3 sm:mt-0">
                        <div className="flex flex-col sm:items-end">
                          <span className="text-xs text-slate-400 font-medium uppercase mb-0.5">Waktu (WIB)</span>
                          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg font-bold">
                            <Clock size={16} className="text-blue-600" />
                            {h.jam_sidang.slice(0, 5)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Live Streaming & Info (1/3 ruang) */}
            <div className="lg:col-span-1 space-y-6">

              {/* Card Live Streaming */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">Siaran Langsung</h3>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${hasHearings ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {hasHearings && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                    {hasHearings ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Ikuti jalannya persidangan terbuka hari ini secara virtual melalui kanal resmi pengadilan.
                </p>

                <a
                  href={hasHearings ? (data?.public_streaming_url || '#') : '#'}
                  target={hasHearings ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm ${
                    hasHearings
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  aria-disabled={!hasHearings}
                >
                  <MonitorPlay size={20} />
                  {hasHearings ? 'Tonton Live Streaming' : 'Belum Ada Siaran Aktif'}
                </a>

                <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-2.5">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Tayangan ini <strong>hanya tersedia</strong> untuk sidang dengan status Terbuka Untuk Umum sesuai undang-undang.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ / Panduan Section */}
        <section id="panduan" className="bg-slate-100 border-t border-slate-200 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900">Informasi Akses Publik</h3>
              <p className="text-slate-500 mt-2">Ketentuan dasar yang perlu Anda ketahui</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Prinsip Sidang Terbuka</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Sidang dinyatakan terbuka untuk umum dapat dipantau oleh masyarakat. Perkara sensitif (anak/asusila) dinyatakan tertutup dan tidak disiarkan.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Akses Tanpa Login</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Masyarakat tidak perlu melakukan pendaftaran atau login ke dalam portal ini. Cukup klik tombol siaran langsung jika jadwal tersedia.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Jadwal & Akurasi</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Data pada halaman ini ditarik langsung secara otomatis dari sistem jadwal ruang sidang E-CAKRA sesuai waktu nyata (WIB).</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER RESMI ── */}
      <footer className="bg-slate-900 py-10 mt-auto border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Scale size={24} className="text-slate-600" />
            <p className="text-slate-400 font-medium text-sm">
              &copy; {new Date().getFullYear()} {data?.pengadilan_nama ?? 'Sistem Pengadilan'}.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Hubungi Helpdesk</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
