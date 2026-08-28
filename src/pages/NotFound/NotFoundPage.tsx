import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-text-muted)' }}>404</h1>
      <p style={{ fontSize: '1.25rem' }}>Halaman tidak ditemukan</p>
      <Link to="/" className="btn-primary" style={{ padding: '10px 24px' }}>Kembali ke Beranda</Link>
    </div>
  )
}

export default NotFoundPage
