import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

const CATEGORIES = [
  { key: 'ASSIGNMENT', label: 'Assignments', description: 'When a task or bug is assigned to you' },
  { key: 'APPROVAL', label: 'Approvals', description: 'When something needs your sign-off (e.g. prod deploy)' },
  { key: 'INCIDENT', label: 'Incidents', description: 'Critical bugs and SLA timers' },
  { key: 'MENTION', label: 'Mentions', description: 'When someone @mentions you' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(null)
  const [prefs, setPrefs] = useState(null) // { ASSIGNMENT: { inApp: true, email: true }, ... }
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  function loadAll() {
    api.get('/api/notifications', { params: { limit: 50 } })
      .then((res) => setNotifications(res.data))
      .catch(() => setError('Could not load notifications.'))

    api.get('/api/notifications/preferences')
      .then((res) => setPrefs(res.data))
      .catch(() => {
        // fall back to sensible defaults so the form still renders
        setPrefs(Object.fromEntries(CATEGORIES.map((c) => [c.key, { inApp: true, email: true }])))
      })
  }

  useEffect(loadAll, [])

  function toggle(categoryKey, channel) {
    setPrefs((prev) => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [channel]: !prev[categoryKey][channel] },
    }))
  }

  async function savePrefs() {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await api.put('/api/notifications/preferences', prefs)
      setSuccess('Preferences saved.')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Real-time alerts and email digests for assignments, approvals, incidents, and mentions."
      />

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <div className="card section-card" style={{ marginBottom: 24 }}>
        <h2>Preferences</h2>
        <p>Choose how you want to hear about each type of event.</p>

        {prefs && (
          <div className="notif-prefs-table">
            <div className="notif-prefs-row notif-prefs-header">
              <span></span>
              <span>In-app</span>
              <span>Email</span>
            </div>
            {CATEGORIES.map((c) => (
              <div key={c.key} className="notif-prefs-row">
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{c.label}</p>
                  <p className="text-faint" style={{ margin: '2px 0 0', fontSize: 12 }}>{c.description}</p>
                </div>
                <label className="notif-prefs-checkbox">
                  <input
                    type="checkbox"
                    checked={prefs[c.key]?.inApp ?? true}
                    onChange={() => toggle(c.key, 'inApp')}
                  />
                </label>
                <label className="notif-prefs-checkbox">
                  <input
                    type="checkbox"
                    checked={prefs[c.key]?.email ?? true}
                    onChange={() => toggle(c.key, 'email')}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="section-actions">
          <button onClick={savePrefs} disabled={saving || !prefs} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </div>

      <div className="card section-card">
        <h2>Recent activity</h2>
        {!notifications && <p style={{ marginTop: 12 }}>Loading…</p>}
        {notifications && notifications.length === 0 && (
          <div style={{ marginTop: 12 }}>
            <EmptyState title="Nothing yet" description="Notifications will show up here as things happen." />
          </div>
        )}
        {notifications && notifications.length > 0 && (
          <ul className="notif-list" style={{ marginTop: 12 }}>
            {notifications.map((n) => (
              <li key={n.id} className={`notif-item ${!n.read ? 'notif-item-unread' : ''}`}>
                <span className={`notif-dot notif-dot-${n.category?.toLowerCase()}`} />
                <div>
                  <p className="notif-item-text">{n.message}</p>
                  <p className="text-faint" style={{ fontSize: 12, margin: '2px 0 0' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}