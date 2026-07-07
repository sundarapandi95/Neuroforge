import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'
import BugStatusBadge from '../components/BugStatusBadge.jsx'

export default function BugsPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [bugs, setBugs] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [duplicateWarnings, setDuplicateWarnings] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    environment: 'STAGING',
  })

  function loadBugs() {
    api.get('/api/bugs', { params: { projectId } })
      .then((res) => setBugs(res.data))
      .catch(() => setError('Could not load bugs.'))
  }

  useEffect(() => {
    if (projectId) loadBugs()
  }, [projectId])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  // Debounced check as the title/description are typed - mirrors the spec's
  // "async duplicate check compares title+description similarity" behavior.
  useEffect(() => {
    if (!form.title || form.title.length < 8) {
      setDuplicateWarnings([])
      return
    }
    const timeout = setTimeout(() => {
      setCheckingDuplicates(true)
      api.post('/api/bugs/check-duplicates', { projectId, title: form.title, description: form.description })
        .then((res) => setDuplicateWarnings(res.data))
        .catch(() => setDuplicateWarnings([]))
        .finally(() => setCheckingDuplicates(false))
    }, 600)
    return () => clearTimeout(timeout)
  }, [form.title, form.description, projectId])

  async function reportBug(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post('/api/bugs', { ...form, projectId })
      setForm({ title: '', description: '', severity: 'MEDIUM', environment: 'STAGING' })
      setDuplicateWarnings([])
      setShowForm(false)
      loadBugs()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open bugs from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 11"
        title="Bugs"
        description="Full lifecycle: Open → Triaged → In Progress → Fixed → Verified → Closed."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/bugs/board?projectId=${projectId}`} className="btn btn-secondary">Board view</Link>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Cancel' : 'Report a bug'}
            </button>
          </div>
        }
      />

      {showForm && (
        <form onSubmit={reportBug} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 560 }}>
          <div className="field">
            <label className="field-label">Title</label>
            <input required value={form.title} onChange={update('title')} className="field-input" placeholder="Login button unresponsive on Safari" />
          </div>

          {checkingDuplicates && <p className="text-faint" style={{ fontSize: 12, marginTop: -8, marginBottom: 12 }}>Checking for duplicates…</p>}

          {duplicateWarnings.length > 0 && (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <strong>Possible duplicate{duplicateWarnings.length > 1 ? 's' : ''}:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {duplicateWarnings.map((d) => (
                  <li key={d.bugId}>
                    <Link to={`/bugs/${d.bugId}`} className="auth-link">{d.bugRef}: {d.title}</Link>
                    {' '}<span className="text-faint">({Math.round(d.similarity * 100)}% similar)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="field">
            <label className="field-label">Description</label>
            <textarea
              required
              value={form.description}
              onChange={update('description')}
              className="field-input release-notes-textarea"
              rows={4}
              placeholder="Steps to reproduce, expected vs actual behavior..."
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Severity</label>
              <select value={form.severity} onChange={update('severity')} className="field-input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Environment</label>
              <select value={form.environment} onChange={update('environment')} className="field-input">
                <option value="DEV">Dev</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>
          </div>
          {form.severity === 'CRITICAL' && (
            <p className="alert alert-error" style={{ marginBottom: 12 }}>
              Marking this Critical will trigger incident mode: a team-wide alert banner and an SLA timer, immediately on submit.
            </p>
          )}
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? 'Reporting…' : 'Report bug'}
          </button>
        </form>
      )}

      {!showForm && error && <p className="alert alert-error">{error}</p>}
      {!bugs && !error && <p className="text-muted">Loading…</p>}

      {bugs && bugs.length === 0 && (
        <EmptyState title="No bugs reported yet" description="Nice — or nobody's found one. Report one above if needed." />
      )}

      {bugs && bugs.length > 0 && (
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.id}>
                  <td className="mono text-faint">{b.bugRef}</td>
                  <td className="cell-strong">
                    <Link to={`/bugs/${b.id}`} style={{ color: 'inherit' }}>{b.title}</Link>
                  </td>
                  <td><SeverityBadge severity={b.severity} /></td>
                  <td><BugStatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}