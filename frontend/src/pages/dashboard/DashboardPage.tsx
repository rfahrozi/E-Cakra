import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '@/features/dashboard/api'
import { auditApi } from '@/features/audit-log/api'
import { usersApi } from '@/features/users/api'
import { tasksApi } from '@/features/tasks/api'
import type { DashboardSummary, AuditLog, Task } from '@/types/common'
import { useAuthStore } from '@/store/app.store'
import {
  Scale, Users, ClipboardList, Plus, ChevronRight,
  Clock, ShieldCheck, Activity, UserCog, Settings,
  AlertTriangle, CheckCircle2, FileText, Server, Trash2
} from 'lucide-react'
import { TRANSPARANSI_LABELS } from '@/constants/routes'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // State
  const [data, setData]       = useState<DashboardSummary | null>(null)
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([])
  const [usersCount, setUsersCount] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [lastUpdate, setLastUpdate] = useState('')

  const loadData = useCallback(async () => {
    try {
      // Load summary dashboard (dipakai oleh semua)
      const summary = await dashboardApi.summary()
      setData(summary)
      setLastUpdate(new Date().toLocaleTimeString('id-ID'))

      if (user?.role === 'admin') {
        const [audits, users] = await Promise.all([
          auditApi.list({ limit: 5 }),
          usersApi.list().catch(() => [])
        ])
        setRecentAudits(audits)
        setUsersCount(users.length)
      } else {
        // Load tasks untuk panitera/operator
        const userTasks = await tasksApi.list().catch(() => [])
        setTasks(userTasks)
      }

      setError('')
    } catch (err) {
      setError('Gagal memuat data dashboard. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000) // auto-refresh 15 detik
    return () => clearInterval(interval)
  }, [loadData])


  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      await tasksApi.create({ title: newTaskTitle })
      setNewTaskTitle('')
      loadData()
    } catch {}
  }

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await tasksApi.updateStatus(task.id, newStatus)
      loadData()
    } catch {}
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id)
      loadData()
    } catch {}
  }
  if (user?.role === 'admin') {
    return (
      <div className="p-8 max-w-7xl mx-auto font-sans">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pusat Tata Kelola & Keamanan</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Mode Administrator
              </span>
              <span className="text-slate-500 text-sm">Terakhir diperbarui: {lastUpdate} WIB</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/settings')} className="btn-secondary flex items-center gap-2">
              <Settings size={18} /> Konfigurasi Sistem
            </button>
            <button onClick={() => navigate('/users')} className="btn-primary flex items-center gap-2">
              <UserCog size={18} /> Kelola Pengguna
            </button>
          </div>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

        {/* Ringkasan Sistem */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Pengguna</p>
              <p className="text-3xl font-bold text-slate-900">{usersCount || '-'}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
              <Scale size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Sidang Aktif (Hari Ini)</p>
              <p className="text-3xl font-bold text-slate-900">{data?.sidang_hari_ini ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Audit Event (Hari Ini)</p>
              <p className="text-3xl font-bold text-slate-900">{data?.audit_event_hari_ini ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0">
              <Server size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status Layanan</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-sm font-bold text-green-700">Normal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Audit Keamanan */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck size={18} className="text-slate-500" /> Aktivitas Sistem Terbaru
              </h3>
              <button onClick={() => navigate('/audit-logs')} className="text-sm text-blue-600 font-medium hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAudits.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada aktivitas.</div>
              ) : (
                recentAudits.map(log => (
                  <div key={log.id} className="p-4 px-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className="mt-0.5">
                      {log.action.includes('ERROR') || log.action.includes('REJECT') || log.action.includes('DELETE') ? (
                        <AlertTriangle size={18} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={18} className="text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 font-medium">{log.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{log.actor}</span>
                        <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Admin */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-6 text-white h-fit sticky top-6">
            <h3 className="font-bold text-lg mb-6 border-b border-slate-700 pb-3">Akses Cepat Tata Kelola</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/users')} className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
                <div className="flex items-center gap-3">
                  <UserCog size={18} className="text-blue-400" />
                  <span className="font-medium text-sm">Manajemen Pengguna</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-purple-400" />
                  <span className="font-medium text-sm">Konfigurasi & Parameter</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button onClick={() => navigate('/audit-logs')} className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700">
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-teal-400" />
                  <span className="font-medium text-sm">Laporan Audit Kepatuhan</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda masuk sebagai Administrator. Setiap perubahan konfigurasi dan hak akses dicatat dalam audit log permanen.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }


  // ==========================================
  // RENDER: DASHBOARD PANITERA & OPERATOR
  // ==========================================
  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pusat Kerja Hari Ini</h2>
          <p className="text-slate-500 text-sm mt-1">Terakhir diperbarui: {lastUpdate} WIB</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/hearings')} className="btn-secondary flex items-center gap-2">
            <FileText size={18} /> Semua Sidang
          </button>
          <button onClick={() => navigate('/hearings/new')} className="btn-primary flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Buat Sidang Baru
          </button>
        </div>
      </div>

      {loading && !data && <div className="text-slate-500 mb-4 animate-pulse">Memuat ringkasan kerja...</div>}
      {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

      {data && (
        <>
          {/* Summary Cards Operasional */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Scale size={20} /></div>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Agenda Sidang Hari Ini</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-extrabold text-slate-900">{data.sidang_hari_ini}</p>
                <p className="text-sm text-slate-500 mb-1">Perkara</p>
              </div>
            </div>

            <div className={`bg-white rounded-xl border ${data.peserta_menunggu > 0 ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'} p-6 shadow-sm transition-all`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${data.peserta_menunggu > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Users size={20} />
                </div>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Menunggu Validasi</span>
              </div>
              <div className="flex items-end gap-3">
                <p className={`text-4xl font-extrabold ${data.peserta_menunggu > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                  {data.peserta_menunggu}
                </p>
                <p className="text-sm text-slate-500 mb-1">Peserta (Waiting Room)</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><ClipboardList size={20} /></div>
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Tugas Tertunda</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-extrabold text-slate-900">{tasks.filter(t => t.status !== 'completed').length}</p>
                <p className="text-sm text-slate-500 mb-1">Tugas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agenda Sidang (Kasus Prioritas) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Scale size={20} className="text-slate-500" /> Antrian Sidang (Hari Ini)
                </h3>
              </div>

              {data.sidang_list.length === 0 ? (
                <div className="flex-1 p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">Pekerjaan Selesai</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">Tidak ada agenda persidangan yang dijadwalkan untuk sisa hari ini.</p>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => navigate('/hearings')} className="btn-secondary text-sm px-4 py-2">Jadwal Lain</button>
                    <button onClick={() => navigate('/hearings/new')} className="btn-primary text-sm px-4 py-2">Buat Sidang</button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 flex-1 overflow-auto max-h-[500px]">
                  {data.sidang_list.map(s => (
                    <div key={s.id} className="p-5 hover:bg-blue-50/30 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="w-16 shrink-0 pt-1 text-center">
                          <p className="text-sm font-bold text-slate-800">{s.jam_sidang.slice(0, 5)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">WIB</p>
                        </div>
                        <div className="border-l-2 border-blue-200 pl-4 flex-1">
                          <h4 className="font-bold text-blue-900 text-lg group-hover:text-blue-700 cursor-pointer transition-colors" onClick={() => navigate(`/hearings/${s.id}`)}>
                            {s.nomor_perkara}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-3">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{s.jenis_sidang}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.status_transparansi === 'open' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                              {TRANSPARANSI_LABELS[s.status_transparansi]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => navigate(`/hearings/${s.id}/waiting-room`)} className="text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5">
                              <Users size={14} /> Waiting Room
                            </button>
                            <button onClick={() => navigate(`/hearings/${s.id}`)} className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline px-2 py-1.5">
                              Lihat Detail &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modul Tugas Saya */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={20} className="text-slate-500" /> Daftar Tugas Saya
                  </div>
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </h3>
              </div>

              <div className="p-4 border-b border-slate-100 bg-white">
                <form onSubmit={handleCreateTask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik tugas baru (Enter untuk simpan)..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" disabled={!newTaskTitle.trim()} className="btn-primary px-4 py-2">
                    Tambah
                  </button>
                </form>
              </div>

              <div className="flex-1 overflow-auto bg-slate-50/30">
                {tasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <ClipboardList size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-500">Belum ada tugas.</p>
                    <p className="text-xs mt-1">Tambahkan tugas baru untuk mulai melacak pekerjaan Anda hari ini.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {tasks.map(t => (
                      <li key={t.id} className="p-4 bg-white hover:bg-slate-50 flex items-start gap-3 group transition-colors">
                        <button
                          onClick={() => handleToggleTaskStatus(t)}
                          className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${t.status === 'completed' ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 hover:border-blue-400'}`}
                        >
                          {t.status === 'completed' && <CheckCircle2 size={14} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${t.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {t.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Dibuat: {new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded transition-all"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
