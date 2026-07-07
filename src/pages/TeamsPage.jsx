import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState(null)
  const [members, setMembers] = useState([]) // org members, for the "add member" picker
  const [error, setError] = useState('')

  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)

  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [addUserId, setAddUserId] = useState('')
  const [busy, setBusy] = useState(false)

  function loadTeams() {
    api.get('/api/org/teams').then((res) => setTeams(res.data)).catch(() => setError('Could not load teams.'))
  }

  useEffect(() => {
    loadTeams()
    api.get('/api/org/members').then((res) => setMembers(res.data)).catch(() => {})
  }, [])

  async function createTeam(e) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post('/api/org/teams', { name: newTeamName })
      setNewTeamName('')
      loadTeams()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  async function addMember(teamId) {
    if (!addUserId) return
    setBusy(true)
    setError('')
    try {
      await api.post(`/api/org/teams/${teamId}/members`, { userId: addUserId })
      setAddUserId('')
      loadTeams()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function removeMember(teamId, userId) {
    setBusy(true)
    setError('')
    try {
      await api.delete(`/api/org/teams/${teamId}/members/${userId}`)
      loadTeams()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const isOrgAdmin = user?.role === 'ORG_ADMIN'

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 02"
        title="Teams"
        description="Group members into teams to assign work and manage access together."
      />

      <RoleGuard allow={['ORG_ADMIN']}>
        <form onSubmit={createTeam} className="card inline-form">
          <input
            required
            placeholder="New team name, e.g. Platform Engineering"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="field-input"
          />
          <button type="submit" disabled={creating} className="btn btn-primary">
            {creating ? 'Creating…' : 'Create team'}
          </button>
        </form>
      </RoleGuard>

      {error && <p className="alert alert-error">{error}</p>}
      {!teams && !error && <p className="text-muted">Loading…</p>}

      {teams && teams.length === 0 && (
        <EmptyState
          title="No teams yet"
          description={
            isOrgAdmin
              ? 'Create your first team above to start grouping members.'
              : "An Org Admin hasn't created any teams yet."
          }
        />
      )}

      <div className="team-grid">
        {teams?.map((team) => (
          <div key={team.id} className="card team-card">
            <div className="team-card-header">
              <h3>{team.name}</h3>
              <span className="text-faint" style={{ fontSize: 12 }}>{team.members.length} members</span>
            </div>

            <ul className="team-member-list">
              {team.members.map((m) => (
                <li key={m.userId} className="team-member-row">
                  <span>
                    {m.fullName} <RoleBadge role={m.role} />
                  </span>
                  <RoleGuard allow={['ORG_ADMIN']}>
                    <button
                      disabled={busy}
                      onClick={() => removeMember(team.id, m.userId)}
                      className="btn-link-danger"
                    >
                      Remove
                    </button>
                  </RoleGuard>
                </li>
              ))}
              {team.members.length === 0 && (
                <li className="text-faint" style={{ fontStyle: 'italic' }}>No members on this team yet.</li>
              )}
            </ul>

            <RoleGuard allow={['ORG_ADMIN']}>
              <div className="team-add-row">
                <select
                  value={selectedTeamId === team.id ? addUserId : ''}
                  onChange={(e) => {
                    setSelectedTeamId(team.id)
                    setAddUserId(e.target.value)
                  }}
                  className="field-input"
                >
                  <option value="">Add a member…</option>
                  {members
                    .filter((m) => !team.members.some((tm) => tm.userId === m.userId))
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} · {m.role}
                      </option>
                    ))}
                </select>
                <button
                  disabled={busy || selectedTeamId !== team.id || !addUserId}
                  onClick={() => addMember(team.id)}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </RoleGuard>
          </div>
        ))}
      </div>
    </div>
  )
}
