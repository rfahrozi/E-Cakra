import { useEffect, useState } from 'react'
import { auditApi } from '@/features/audit-log/api'
import type { AuditLog } from '@/types/common'
import { RefreshCw } from 'lucide-react'

const ACTION_COLOR: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-gray-100 text-gray-700',
  CREATE_HEARING: 'bg-green-100 text-green-800',
  CREATE_ZOOM_MEETING: 'bg-green-100 text-green-800',
  ERROR_ZOOM_MEETING: 'bg-red-100 text-red-800',
  ADMIT_PARTICIPANT: 'bg-green-100 text-green-800',
  HOLD_PARTICIPANT: 'bg-yellow-100 text-yellow-800',
  REJECT_PARTICIPANT: 'bg-red-100 text-red-800',
  WEBHOOK_PARTICIPANT_JOINED: 'bg-purple-100 text-purple-800',
  WEBHOOK_UNKNOWN_MEETING: 'bg-orange-100 text-orange-800',
  WEBHOOK_PROCESSING_ERROR: 'bg-red-100 text-red-800',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    auditApi
      .list({ limit: 200 })
      .then(setLogs)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-gray-500 text-sm mt-1">Rekam jejak seluruh aktivitas sistem</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Waktu', 'Aktor', 'Aksi', 'Entitas', 'Keterangan'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Belum ada log.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{log.actor}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLOR[log.action] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {log.entity_type}
                  {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}…` : ''}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={log.description}>
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
