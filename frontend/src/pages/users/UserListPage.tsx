import { useEffect, useState } from 'react'
import { usersApi } from '@/features/users/api'
import type { User } from '@/types/common'
import { Plus, Edit2, Trash2, Shield, ShieldAlert, User as UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface FormData {
  nama: string
  username: string
  password?: string
  role: 'admin' | 'operator' | 'panitera'
  is_active: boolean
}

export default function UserListPage() {
  const [users, setUsers]       = useState<User[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadUsers = () => {
    setLoading(true)
    usersApi.list()
      .then(setUsers)
      .catch(() => setError('Gagal memuat daftar pengguna'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  const openModalNew = () => {
    setEditingUser(null)
    reset({ nama: '', username: '', password: '', role: 'operator', is_active: true })
    setFormError('')
    setIsModalOpen(true)
  }

  const openModalEdit = (u: User) => {
    setEditingUser(u)
    reset({ nama: u.nama, username: u.username, password: '', role: u.role, is_active: u.is_active ?? true })
    setFormError('')
    setIsModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setFormError('')
    try {
      if (editingUser) {
        // Hapus password jika kosong (jangan diupdate)
        const payload = { ...data }
        if (!payload.password) delete payload.password
        await usersApi.update(editingUser.id, payload)
      } else {
        if (!data.password) {
          setFormError('Password wajib diisi untuk pengguna baru')
          setSaving(false)
          return
        }
        await usersApi.create(data)
      }
      setIsModalOpen(false)
      loadUsers()
    } catch (err: any) {
      setFormError(err.response?.data?.detail ?? 'Gagal menyimpan pengguna.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Hapus pengguna "${username}"?`)) return
    try {
      await usersApi.delete(id)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Gagal menghapus pengguna.')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola akun dan role admin, operator, dan panitera</p>
        </div>
        <button onClick={openModalNew} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="card p-0 overflow-hidden shadow-sm border border-gray-200">
        {loading && <div className="p-8 text-center text-gray-500">Memuat data...</div>}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        <UserIcon size={16} />
                      </div>
                      <span className="font-medium text-gray-900">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{u.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {u.role === 'admin' ? <ShieldAlert size={14} className="text-red-500" /> : <Shield size={14} className="text-blue-500" />}
                      <span className="text-sm capitalize font-medium">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active !== false ? (
                      <span className="badge-valid">Aktif</span>
                    ) : (
                      <span className="badge-invalid">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModalEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.username)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="form-label">Nama Lengkap</label>
                <input {...register('nama', { required: 'Nama wajib diisi' })} className="form-input" />
                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
              </div>

              <div>
                <label className="form-label">Username</label>
                <input {...register('username', { required: 'Username wajib diisi' })} className="form-input" />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="form-label">Password {editingUser && <span className="text-xs font-normal text-gray-400">(Kosongkan jika tidak diubah)</span>}</label>
                <input type="password" {...register('password', { minLength: { value: 6, message: 'Minimal 6 karakter' }})} className="form-input" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label">Role</label>
                <select {...register('role')} className="form-input capitalize">
                  <option value="operator">Operator</option>
                  <option value="panitera">Panitera</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isActive" {...register('is_active')} className="w-4 h-4 text-blue-600" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Akun Aktif</label>
              </div>

              {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formError}</div>}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary min-w-24">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
