import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi, PublicLandingResponse } from '@/features/public/api'
import { Scale, Youtube, Clock, AlertCircle } from 'lucide-react'

export default function LandingPage() {
  const [data, setData] = useState<PublicLandingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi.getTodayHearings()
      .then(setData)
      .catch(() => setError('Gagal memuat jadwal persidangan publik.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Publik */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">E-CAKRA</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                {data?.pengadilan_nama ?? 'Portal Informasi Persidangan'}
              </p>
            </div>
          </div>
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Portal Internal &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Jadwal Sidang Terbuka</h2>
          <p className="text-slate-500 mt-2">
            Jadwal persidangan yang terbuka untuk umum pada hari ini, {
              new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            }.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <p className="text-slate-500 font-medium">Memuat jadwal...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* Daftar Sidang (2 kolom) */}
            <div className="md:col-span-2 space-y-4">
              {data.hearings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
                  <Scale size={40} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">Tidak ada jadwal sidang terbuka</h3>
                  <p className="text-slate-500 text-sm mt-1">Belum ada persidangan yang dijadwalkan terbuka untuk umum hari ini.</p>
                </div>
              ) : (
                data.hearings.map((h, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-blue-800 text-lg">{h.nomor_perkara}</h3>
                      <p className="text-slate-600 text-sm mt-1">{h.jenis_sidang}</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        <Clock size={14} className="text-slate-500" />
                        {h.jam_sidang.slice(0, 5)} WIB
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Publik / Live Streaming Info */}
            <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Akses Publik</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Sesuai dengan prinsip peradilan terbuka, publik dapat menyaksikan jalannya persidangan tanpa harus hadir ke ruang sidang virtual.
              </p>

              <a
                href={data.public_streaming_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
              >
                <Youtube size={20} />
                Tonton Live Streaming
              </a>

              <p className="text-xs text-slate-400 mt-4 text-center">
                *Hanya persidangan dengan status Terbuka Untuk Umum yang akan disiarkan.
              </p>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {data?.pengadilan_nama ?? 'Pengadilan Tinggi'}. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
