import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'
import BugStatusBadge from '../components/BugStatusBadge.jsx'
import SlaTimer from '../components/SlaTimer.jsx'

const STATUS_FLOW = ['OPEN', 'TRIAGED', 'IN_PROGRESS', 'FIXED', 'VERIFIED', 'CLOSED']

export default function BugDetailPage() {
  const { bugId } = useParams()
  const { user } = useAuth()
  const [bug, setBug] = useState(null)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  function loadBug() {
    api.get(`/api/bugs/${bugId}`).then((res) => setBug(res.data)).catch(() => setError('Could not load this bug.'))
  }

  useEffect(loadBug, [bugId])

  async function transitionTo(newStatus) {
    setError('')
    if (newStatus === 'VERIFIED' && user?.role !== 'QA_TESTER') {
      setError('Only QA/Testers can verify a fix.')
      return
    }
    setUpdating(true)
    try {
      await api.patch(`/api/bugs/${bugId}/status`, { status: newStatus })
      loadBug()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  if (error && !bug) return <p className="alert alert-error">{error}</p>
  if (!bug) return <p className="text-muted">Loading…</p>

  const currentIdx = STATUS_FLOW.indexOf(bug.status)
  const nextStatus = STATUS_FLOW[currentIdx + 1]
  const isResolved = bug.status === 'VERIFIED' || bug.status === 'CLOSED'

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 11"
        title={`${bug.bugRef}: ${bug.title}`}
        description={`Reported ${new Date(bug.createdAt).toLocaleString()} · ${bug.environment.toLowerCase()}`}
        action={<SeverityBadge severity={bug.severity} />}
      />

      {error && <p className="alert alert-error">{error}</p>}

      {bug.severity === 'CRITICAL' && (
        <div className="card" style={{ padding: 20, marginBottom: 24, borderColor: 'var(--rose-400)' }}>
          <h3 style={{ margin: '0 0 8px' }}>Incident SLA</h3>
          <SlaTimer startedAt={bug.createdAt} resolvedAt={isResolved ? bug.resolvedAt : null} />
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stat-card">
          <p className="stat-label">Status</p>
          <BugStatusBadge status={bug.status} />
        </div>
        <div className="card stat-card">
          <p className="stat-label">Reported by</p>
          <div style={{ fontSize: 14 }}>{bug.reportedByName}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Assignee</p>
          <div style={{ fontSize: 14 }}>{bug.assigneeName || 'Unassigned'}</div>
        </div>
      </div>

      <div className="card section-card" style={{ marginBottom: 24 }}>
        <h2>Description</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{bug.description}</p>
      </div>

      {bug.duplicateOfBugRef && (
        <p className="alert alert-info" style={{ marginBottom: 24 }}>
          Flagged as a possible duplicate of <strong>{bug.duplicateOfBugRef}</strong> when reported.
        </p>
      )}

      <div className="card section-card">
        <h2>Move status</h2>
        <p>Current: <BugStatusBadge status={bug.status} /></p>
        {nextStatus ? (
          <button onClick={() => transitionTo(nextStatus)} disabled={updating} className="btn btn-primary" style={{ marginTop: 12 }}>
            {updating ? 'Updating…' : `Move to ${nextStatus.replaceAll('_', ' ').toLowerCase()}`}
          </button>
        ) : (
          <p className="text-faint">This bug is closed.</p>
        )}
      </div>
    </div>
  )
}