import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import EmptyState from './EmptyState.jsx'
import HealthBadge from './HealthBadge.jsx'
import SprintHealthSummaryPanel from './SprintHealthSummaryPanel.jsx'

export default function PortfolioHealthPanel() {
  const [portfolio, setPortfolio] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/analytics/portfolio').then((res) => setPortfolio(res.data)).catch(() => setError('Could not load portfolio health.'))
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!portfolio) return <p className="text-muted">Loading…</p>

  const counts = portfolio.projects.reduce(
    (acc, p) => ({ ...acc, [p.health]: (acc[p.health] || 0) + 1 }),
    {}
  )

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="card stat-card">
          <p className="stat-label">On track</p>
          <div className="stat-value" style={{ color: 'var(--emerald-600)' }}>{counts.ON_TRACK || 0}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">At risk</p>
          <div className="stat-value" style={{ color: 'var(--amber-600)' }}>{counts.AT_RISK || 0}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Delayed</p>
          <div className="stat-value" style={{ color: 'var(--rose-600)' }}>{counts.DELAYED || 0}</div>
        </div>
      </div>

      {portfolio.projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Portfolio health appears once projects exist." />
      ) : (
        <div className="card data-table-wrap" style={{ marginBottom: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Health</th>
                <th>Open bugs</th>
                <th>Active sprint</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.projects.map((p) => (
                <tr key={p.id}>
                  <td className="cell-strong">
                    <Link to={`/projects/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link>
                  </td>
                  <td><HealthBadge health={p.health} /></td>
                  <td>{p.openBugCount}</td>
                  <td className="text-faint">{p.activeSprintName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SprintHealthSummaryPanel scope="organization" scopeId={portfolio.orgId} />
    </div>
  )
}