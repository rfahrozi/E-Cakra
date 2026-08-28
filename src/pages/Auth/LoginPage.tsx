import { useState, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setError('Username atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="card" style={{ width: 360 }}>
        <h2 style={{ marginBottom: 8 }}>E-CAKRA</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Masuk ke portal sidang elektronik</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          {error && <p style={{ color: 'var(--color-invalid)', marginBottom: 12 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
