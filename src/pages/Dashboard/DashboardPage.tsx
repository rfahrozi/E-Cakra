import { useFetch } from '../../hooks/useFetch'

interface DashboardSummary {
  sidang_hari_ini: number
  peserta_menunggu: number
  audit_event_hari_ini: number
}

const DashboardPage = () => {
  const { data, loading, error } = useFetch<DashboardSummary>('/dashboard/summary')

  return (
    <div style={{ padding: 'var(--space-xl)' }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Dashboard</h2>
      {loading && <p>Memuat data...</p>}
      {error && <p style={{ color: 'var(--color-invalid)' }}>Gagal memuat data: {error}</p>}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
          <div className="card">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Sidang Hari Ini</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{data.sidang_hari_ini}</h3>
          </div>
          <div className="card">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Peserta Menunggu</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-review)' }}>{data.peserta_menunggu}</h3>
          </div>
          <div className="card">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Audit Event Hari Ini</p>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-valid)' }}>{data.audit_event_hari_ini}</h3>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
