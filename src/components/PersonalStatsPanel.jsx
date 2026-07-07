import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import EmptyState from './EmptyState.jsx'

export default function PersonalStatsPanel() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/analytics/personal').then((res) => setStats(res.data)).catch(() => setError('Could not load your stats.'))
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!stats) return <p className="text-muted">Loading…</p>

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="card stat-card">
          <p className="stat-label">In progress</p>
          <div className="stat-value">{stats.tasksInProgress}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Completed this sprint</p>
          <div className="stat-value">{stats.tasksCompletedThisSprint}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Your avg cycle time</p>
          <div className="stat-value">{stats.avgCycleTimeDays}d</div>
        </div>
      </div>

      <div className="card section-card">
        <h2>Upcoming deadlines</h2>
        {(!stats.upcomingDeadlines || stats.upcomingDeadlines.length === 0) ? (
          <EmptyState title="Nothing due soon" description="Tasks assigned to you with a due date will show up here." />
        ) : (
          <ul className="team-member-list">
            {stats.upcomingDeadlines.map((t) => (
              <li key={t.id} className="team-member-row">
                <span>{t.title}</span>
                <span className="text-faint">{new Date(t.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}