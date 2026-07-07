import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RoleGuard from '../components/RoleGuard.jsx'

const STATUS_CLASS = {
  PLANNED: 'badge-pending',
  ACTIVE: 'badge-on-track',
  COMPLETED: 'badge-dev',
}

export default function SprintsPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [sprints, setSprints] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' })

  function loadSprints() {
    api
      .get('/api/sprints', { params: { projectId } })
      .then((res) => setSprints(res.data))
      .catch(() => setError('Could not load sprints.'))
  }

  useEffect(() => {
    if (projectId) loadSprints()
  }, [projectId])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function createSprint(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post('/api/sprints', { ...form, projectId })
      setForm({ name: '', goal: '', startDate: '', endDate: '' })
      setShowForm(false)
      loadSprints()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open sprints from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 05"
        title="Sprints"
        description="Plan sprints and open the board for whichever one is active."
        action={
          <RoleGuard allow={['PROJECT_MANAGER']}>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Cancel' : 'New sprint'}
            </button>
          </RoleGuard>
        }
      />

      {showForm && (
        <form onSubmit={createSprint} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 480 }}>
          <div className="field">
            <label className="field-label">Sprint name</label>
            <input required value={form.name} onChange={update('name')} className="field-input" placeholder="Sprint 4" />
          </div>
          <div className="field">
            <label className="field-label">Goal</label>
            <input value={form.goal} onChange={update('goal')} className="field-input" placeholder="Ship OAuth + fix top 5 bugs" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Start date</label>
              <input type="date" required value={form.startDate} onChange={update('startDate')} className="field-input" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">End date</label>
              <input type="date" required value={form.endDate} onChange={update('endDate')} className="field-input" />
            </div>
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? 'Creating…' : 'Create sprint'}
          </button>
        </form>
      )}

      {!showForm && error && <p className="alert alert-error">{error}</p>}
      {!sprints && !error && <p className="text-muted">Loading…</p>}

      {sprints && sprints.length === 0 && (
        <EmptyState title="No sprints yet" description="Create your first sprint above, then pull backlog items onto its board." />
      )}

      <div className="sprint-list">
        {sprints?.map((s) => (
          <Link key={s.id} to={`/sprints/${s.id}`} className="card sprint-row">
            <div>
              <h3 style={{ margin: 0 }}>{s.name}</h3>
              <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{s.goal}</p>
            </div>
            <div className="sprint-row-meta">
              <span className="text-faint">
                {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
              </span>
              <span className={`badge ${STATUS_CLASS[s.status] || 'badge-dev'}`}>{s.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}