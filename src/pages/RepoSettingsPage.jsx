import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function RepoSettingsPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [connection, setConnection] = useState(null) // { repoUrl, connected, lastSyncedAt } or null
  const [commits, setCommits] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [repoUrl, setRepoUrl] = useState('')
  const [token, setToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  function loadConnection() {
    api
      .get('/api/repo/connection', { params: { projectId } })
      .then((res) => setConnection(res.data))
      .catch(() => setConnection(null))
  }

  function loadCommits() {
    api
      .get('/api/repo/commits', { params: { projectId } })
      .then((res) => setCommits(res.data))
      .catch(() => setCommits([]))
  }

  useEffect(() => {
    if (!projectId) return
    loadConnection()
    loadCommits()
  }, [projectId])

  async function connectRepo(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setConnecting(true)
    try {
      await api.post('/api/repo/connect', { projectId, repoUrl, token })
      setSuccess('Repository connected.')
      setRepoUrl('')
      setToken('')
      loadConnection()
      loadCommits()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setConnecting(false)
    }
  }

  async function syncNow() {
    setError('')
    setSuccess('')
    setSyncing(true)
    try {
      await api.post('/api/repo/sync', { projectId })
      setSuccess('Sync complete.')
      loadConnection()
      loadCommits()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSyncing(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open repository settings from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 07"
        title="Repository"
        description="Connect a GitHub repo to auto-link commits to tasks by their NF-123 reference."
      />

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <RoleGuard allow={['PROJECT_MANAGER']}>
        <form onSubmit={connectRepo} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 520 }}>
          <div className="field">
            <label className="field-label">Repository URL</label>
            <input
              required
              placeholder="https://github.com/your-org/your-repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="field-input"
            />
          </div>
          <div className="field">
            <label className="field-label">Access token</label>
            <input
              type="password"
              required
              placeholder="GitHub personal access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="field-input"
            />
            <p className="text-faint" style={{ fontSize: 12, marginTop: 6 }}>
              Stored encrypted on the server — never shown again after saving.
            </p>
          </div>
          <button type="submit" disabled={connecting} className="btn btn-primary">
            {connecting ? 'Connecting…' : connection?.connected ? 'Update connection' : 'Connect repository'}
          </button>
        </form>
      </RoleGuard>

      {connection?.connected && (
        <div className="card section-card" style={{ marginBottom: 24 }}>
          <h2>Connection status</h2>
          <p>
            Connected to <span className="mono">{connection.repoUrl}</span>
            {connection.lastSyncedAt && (
              <> · last synced {new Date(connection.lastSyncedAt).toLocaleString()}</>
            )}
          </p>
          <div className="section-actions">
            <button onClick={syncNow} disabled={syncing} className="btn btn-secondary">
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
          </div>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 12 }}>
            Auto-syncs every 10 minutes in the background. Commit messages containing
            an <span className="mono">NF-123</span>-style reference are linked to that task automatically.
          </p>
        </div>
      )}

      <div className="card section-card">
        <h2>Recent commits</h2>
        {!commits && <p>Loading…</p>}
        {commits && commits.length === 0 && (
          <EmptyState title="No commits yet" description="Connect a repo and sync to see commits here." />
        )}
        {commits && commits.length > 0 && (
          <ul className="commit-list">
            {commits.map((c) => (
              <li key={c.sha} className="commit-row">
                <div>
                  <p className="commit-message">{c.message}</p>
                  <p className="text-faint" style={{ fontSize: 12 }}>
                    {c.author} · {new Date(c.date).toLocaleDateString()}
                    {c.linkedTaskId && <> · linked to <span className="mono">{c.linkedTaskRef}</span></>}
                  </p>
                </div>
                <a href={c.url} target="_blank" rel="noreferrer" className="text-faint mono" style={{ fontSize: 12 }}>
                  {c.sha.slice(0, 7)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}