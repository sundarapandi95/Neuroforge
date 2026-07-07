import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RoleGuard from '../components/RoleGuard.jsx'
import HealthBadge from '../components/HealthBadge.jsx'

const METHODOLOGY_LABEL = {
  AGILE: 'Agile',
  WATERFALL: 'Waterfall',
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/projects')
      .then((res) => setProjects(res.data))
      .catch(() => setError('Could not load projects.'))
  }, [])

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 03"
        title="Projects"
        description="Portfolio view across every project you have access to."
        action={
          <RoleGuard allow={['PROJECT_MANAGER']}>
            <Link to="/projects/new" className="btn btn-primary">New project</Link>
          </RoleGuard>
        }
      />

      {error && <p className="alert alert-error">{error}</p>}
      {!projects && !error && <p className="text-muted">Loading…</p>}

      {projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description={
            user?.role === 'PROJECT_MANAGER'
              ? 'Create your first project to start planning sprints and tracking delivery.'
              : 'No projects have been created for your organization yet.'
          }
        />
      )}

      <div className="project-grid">
        {projects?.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="card project-card">
            <div className="project-card-header">
              <h3>{p.name}</h3>
              <HealthBadge health={p.health} />
            </div>
            <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>
              {METHODOLOGY_LABEL[p.methodology] || p.methodology} · {p.teamName || 'No team assigned'}
            </p>
            <div className="tag-row">
              {p.techStack?.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
            <div className="project-card-footer">
              <span className="text-faint">
                {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}