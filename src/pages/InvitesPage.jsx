import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { RoleBadge, InviteStatusBadge } from '../components/RoleBadge.jsx'

const ROLE_OPTIONS = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'QA_TESTER', label: 'QA / Tester' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'ORG_ADMIN', label: 'Org Admin' },
]

export default function InvitesPage() {
  const [invites, setInvites] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('DEVELOPER')
  const [sending, setSending] = useState(false)

  function loadInvites() {
    api.get('/api/org/invites').then((res) => setInvites(res.data)).catch(() => setError('Could not load invites.'))
  }

  useEffect(loadInvites, [])

  async function sendInvite(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)
    try {
      await api.post('/api/org/invites', { email, role })
      setSuccess(`Invite sent to ${email}.`)
      setEmail('')
      loadInvites()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function revoke(inviteId) {
    setError('')
    try {
      await api.delete(`/api/org/invites/${inviteId}`)
      loadInvites()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 02 · ORG ADMIN"
        title="Invites"
        description="Invite new people into this organization by email."
      />

      <form onSubmit={sendInvite} className="card inline-form">
        <input
          type="email"
          required
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="field-input" style={{ maxWidth: 200 }}>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button type="submit" disabled={sending} className="btn btn-primary">
          {sending ? 'Sending…' : 'Send invite'}
        </button>
      </form>

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      {!invites && !error && <p className="text-muted">Loading…</p>}

      {invites && invites.length === 0 && (
        <EmptyState title="No invites yet" description="Send your first invite using the form above." />
      )}

      {invites && invites.length > 0 && (
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id}>
                  <td className="cell-strong">{inv.email}</td>
                  <td><RoleBadge role={inv.role} /></td>
                  <td><InviteStatusBadge status={inv.status} /></td>
                  <td className="text-faint">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {inv.status === 'PENDING' && (
                      <button onClick={() => revoke(inv.id)} className="btn-link-danger">Revoke</button>
                    )}
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
