import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import { Link, useSearchParams } from 'react-router-dom'
export default function BacklogPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    title: '',
    storyPoints: 3,
    priority: 'MEDIUM',
    labels: '',
    requirementRef: '',
  })

  function loadBacklog() {
    api
      .get('/api/backlog', { params: { projectId } })
      .then((res) => setTasks(res.data))
      .catch(() => setError('Could not load the backlog.'))
  }

  useEffect(() => {
    if (projectId) loadBacklog()
  }, [projectId])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function createTask(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post('/api/tasks', {
        ...form,
        projectId,
        storyPoints: Number(form.storyPoints),
        labels: form.labels.split(',').map((l) => l.trim()).filter(Boolean),
      })
      setForm({ title: '', storyPoints: 3, priority: 'MEDIUM', labels: '', requirementRef: '' })
      setShowForm(false)
      loadBacklog()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open the backlog from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 05"
        title="Backlog"
        description="Unscheduled tasks, ready to be pulled into a sprint."
        action={
          <RoleGuard allow={['PROJECT_MANAGER']}>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Cancel' : 'New task'}
            </button>
          </RoleGuard>
        }
      />

      {showForm && (
        <form onSubmit={createTask} className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="field">
            <label className="field-label">Title</label>
            <input required value={form.title} onChange={update('title')} className="field-input" placeholder="Add OAuth login support" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ width: 120 }}>
              <label className="field-label">Story points</label>
              <input type="number" min="1" max="21" value={form.storyPoints} onChange={update('storyPoints')} className="field-input" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Priority</label>
              <select value={form.priority} onChange={update('priority')} className="field-input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Labels (comma-separated)</label>
            <input value={form.labels} onChange={update('labels')} className="field-input" placeholder="backend, auth" />
          </div>
          <div className="field">
            <label className="field-label">Requirement reference (optional)</label>
            <input value={form.requirementRef} onChange={update('requirementRef')} className="field-input" placeholder="REQ-014" />
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? 'Adding…' : 'Add to backlog'}
          </button>
        </form>
      )}

      {!showForm && error && <p className="alert alert-error">{error}</p>}
      {!tasks && !error && <p className="text-muted">Loading…</p>}

      {tasks && tasks.length === 0 && (
        <EmptyState title="Backlog is empty" description="Add tasks above to start building out sprint-ready work." />
      )}

      {tasks && tasks.length > 0 && (
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Points</th>
                <th>Priority</th>
                <th>Labels</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="cell-strong">
  <Link to={`/tasks/${t.id}`} style={{ color: 'inherit' }}>{t.title}</Link>
</td>
                  <td>{t.storyPoints}</td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td>
                    <div className="tag-row">
                      {t.labels?.map((l) => <span key={l} className="tag-pill">{l}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}