import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import BarChart from './BarChart.jsx'
import TrendLineChart from './TrendLineChart.jsx'
import SprintHealthSummaryPanel from './SprintHealthSummaryPanel.jsx'
import HealthBadge from './HealthBadge.jsx'

export default function ProjectAnalyticsPanel({ projectId }) {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const isClient = user?.role === 'CLIENT'

  useEffect(() => {
    api.get(`/api/analytics/project/${projectId}`).then((res) => setData(res.data)).catch(() => setError('Could not load analytics for this project.'))
  }, [projectId])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!data) return <p className="text-muted">Loading…</p>

  // Clients get the simplified view: health + plain-language summary only,
  // no velocity/cycle-time/DORA detail.
  if (isClient) {
    return (
      <div>
        <div className="card stat-card" style={{ marginBottom: 24, maxWidth: 240 }}>
          <p className="stat-label">Project health</p>
          <HealthBadge health={data.health} />
        </div>
        <SprintHealthSummaryPanel scope="project" scopeId={projectId} readOnly />
      </div>
    )
  }

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="card stat-card">
          <p className="stat-label">Project health</p>
          <HealthBadge health={data.health} />
        </div>
        <div className="card stat-card">
          <p className="stat-label">Avg cycle time</p>
          <div className="stat-value">{data.avgCycleTimeDays}d</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Deploy frequency</p>
          <div className="stat-value">{data.deploysPerWeek}/wk</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Change failure rate</p>
          <div className="stat-value" style={{ color: data.changeFailureRate > 15 ? 'var(--rose-600)' : 'var(--ink-900)' }}>
            {data.changeFailureRate}%
          </div>
        </div>
      </div>

      <div className="card section-card" style={{ marginBottom: 24 }}>
        <h2>Velocity by sprint</h2>
        <p>Story points completed per sprint.</p>
        <BarChart data={data.velocityBySprint} />
      </div>

      <div className="card section-card" style={{ marginBottom: 24 }}>
        <h2>Bug trend</h2>
        <p>Opened vs resolved bugs over the last several weeks.</p>
        <TrendLineChart
          labels={data.bugTrend.labels}
          series={[
            { name: 'Opened', color: 'var(--rose-400)', values: data.bugTrend.opened },
            { name: 'Resolved', color: 'var(--emerald-400)', values: data.bugTrend.resolved },
          ]}
        />
      </div>

      <SprintHealthSummaryPanel scope="project" scopeId={projectId} />
    </div>
  )
}