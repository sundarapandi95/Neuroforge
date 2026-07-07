import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'

const ROLE_BLURB = {
  ORG_ADMIN: 'You manage teams, invites, and org-wide settings.',
  PROJECT_MANAGER: 'You plan sprints, assign work, and track delivery health.',
  DEVELOPER: 'You pick up assigned tasks and link your commits to them.',
  QA_TESTER: 'You write test cases, run them, and report bugs.',
  CLIENT: 'You get a read-only view of progress and releases.',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [memberCount, setMemberCount] = useState(null)
  const [teamCount, setTeamCount] = useState(null)

  useEffect(() => {
    api.get('/api/org/members').then((res) => setMemberCount(res.data.length)).catch(() => {})
    api.get('/api/org/teams').then((res) => setTeamCount(res.data.length)).catch(() => {})
  }, [])

  if (!user) return null

  return (
    <div>
      <PageHeader
        eyebrow="DASHBOARD"
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        description={ROLE_BLURB[user.role]}
      />

      <div className="stat-grid">
        <div className="card stat-card">
          <p className="stat-label">Your role</p>
          <RoleBadge role={user.role} />
        </div>
        <div className="card stat-card">
          <p className="stat-label">Organization members</p>
          <div className="stat-value">{memberCount ?? '—'}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Teams</p>
          <div className="stat-value">{teamCount ?? '—'}</div>
        </div>
      </div>

      <div className="card section-card">
        <h2>This is Modules 1 &amp; 2</h2>
        <p>
          Authentication, RBAC, organizations, and teams are wired up end-to-end.
          Projects, sprints, boards, and the rest of the platform build on top of
          this foundation next.
        </p>
        <div className="section-actions">
          <Link to="/org/members" className="btn btn-secondary">View members</Link>
          <Link to="/org/teams" className="btn btn-secondary">View teams</Link>
        </div>
      </div>
    </div>
  )
}
