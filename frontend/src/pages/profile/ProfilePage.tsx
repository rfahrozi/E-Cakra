import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/app.store'
import { authApi } from '@/features/auth/api'
import { UserCircle, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PasswordForm {
  old_password: string
  new_password: string
  confirm_password: string
}

const ROLE_LABEL: Record<string, string> = {
  admin: '👑 Administrator',
  panitera: '⚖️ Panitera',
  operator: '🖥️ Operator Sidang',
}

export default function ProfilePage() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>()

  const newPassword = watch('new_password')

  const onSubmit = async (data: PasswordForm) => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await authApi.changePassword(data.old_password, data.new_password)
      setSuccess('Password berhasil diubah. Anda akan diarahkan ke halaman login...')
      reset()
      // Setelah ganti password, logout otomatis (token lama masih valid tapi best practice)
      setTimeout(async () => {
        try { await authApi.logout() } catch (_) {}
        clearAuth()
        navigate('/login')
      }, 2500)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e.response?.data?.detail ?? 'Gagal mengubah password. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profil Saya</h2>
        <p className="text-gray-500 text-sm mt-1">Informasi akun dan pengaturan keamanan</p>
      </div>

      {/* Info Akun */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <UserCircle size={36} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.nama}</h3>
            <p className="text-sm text-gray-500 font-mono">@{user?.username}</p>
            <span className="inline-block mt-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Username</span>
            <p className="font-medium text-gray-800 font-mono">{user?.username}</p>
          </div>
          <div>
            <span className="text-gray-400">Role</span>
            <p className="font-medium text-gray-800 capitalize">{user?.role}</p>
          </div>
          <div>
            <span className="text-gray-400">ID Akun</span>
            <p className="font-medium text-gray-500 font-mono text-xs truncate">{user?.id}</p>
          </div>
        </div>
      </div>

      {/* Ganti Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Ganti Password</h3>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4">
            <CheckCircle2 size={18} />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Password Lama</label>
            <input
              type="password"
              {...register('old_password', { required: 'Password lama wajib diisi' })}
              className="form-input"
              placeholder="Masukkan password saat ini"
            />
            {errors.old_password && (
              <p className="text-red-500 text-xs mt-1">{errors.old_password.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Password Baru</label>
            <input
              type="password"
              {...register('new_password', {
                required: 'Password baru wajib diisi',
                minLength: { value: 6, message: 'Minimal 6 karakter' },
              })}
              className="form-input"
              placeholder="Minimal 6 karakter"
            />
            {errors.new_password && (
              <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Konfirmasi Password Baru</label>
            <input
              type="password"
              {...register('confirm_password', {
                required: 'Konfirmasi password wajib diisi',
                validate: (v) => v === newPassword || 'Konfirmasi password tidak cocok',
              })}
              className="form-input"
              placeholder="Ulangi password baru"
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Setelah password diubah, Anda akan otomatis diarahkan ke halaman login.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
