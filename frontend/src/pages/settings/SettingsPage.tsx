import { useEffect, useState } from 'react'
import { settingsApi } from '@/features/settings/api'
import type { SystemSetting } from '@/features/settings/api'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // Menyimpan key yang sedang di-save
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // State untuk form local per key
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const loadSettings = () => {
    setLoading(true)
    settingsApi
      .list()
      .then((data) => {
        setSettings(data)
        const initialValues: Record<string, string> = {}
        data.forEach((s) => {
          initialValues[s.key] = s.value
        })
        setFormValues(initialValues)
      })
      .catch(() => setError('Gagal memuat pengaturan sistem.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleUpdate = async (key: string) => {
    setSaving(key)
    setError('')
    setSuccess('')
    try {
      await settingsApi.update(key, formValues[key])
      setSuccess(`Pengaturan "${key}" berhasil disimpan.`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? `Gagal menyimpan "${key}".`)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h2>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi dasar E-CAKRA (Hanya untuk Admin)</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 transition-opacity duration-300">
          <CheckCircle size={18} />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="card p-0 overflow-hidden shadow-sm border border-gray-200">
        {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}

        {!loading && settings.length === 0 && (
          <div className="p-8 text-center text-gray-500">Belum ada pengaturan tersedia.</div>
        )}

        {!loading && settings.length > 0 && (
          <div className="divide-y divide-gray-100">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 font-mono text-sm mb-1">
                    {setting.key}
                  </h3>
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Terakhir diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex-1 w-full flex items-center gap-3">
                  <input
                    type="text"
                    value={formValues[setting.key] ?? ''}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                    }
                    className="form-input bg-white"
                  />
                  <button
                    onClick={() => handleUpdate(setting.key)}
                    disabled={saving === setting.key || formValues[setting.key] === setting.value}
                    className="btn-primary py-2 px-3 flex items-center gap-2 whitespace-nowrap min-w-24 justify-center"
                  >
                    {saving === setting.key ? (
                      <span className="text-sm">Menyimpan...</span>
                    ) : (
                      <>
                        <Save size={16} />
                        <span className="text-sm">Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
