import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import HealthBadge from '../components/HealthBadge.jsx'
import { Link } from 'react-router-dom'
const METHODOLOGY_LABEL = { AGILE: 'Agile', WATERFALL: 'Waterfall' }

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/api/projects/${projectId}`)
      .then((res) => setProject(res.data))
      .catch(() => setError('Could not load this project.'))
  }, [projectId])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!project) return <p className="text-muted">Loading…</p>

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 03"
        title={project.name}
        description={`${METHODOLOGY_LABEL[project.methodology] || project.methodology} · ${project.teamName || 'No team assigned'}`}
        action={<HealthBadge health={project.health} />}
      />

      <div className="stat-grid">
        <div className="card stat-card">
          <p className="stat-label">Timeline</p>
          <div style={{ fontSize: 14 }}>
            {new Date(project.startDate).toLocaleDateString()} → {new Date(project.endDate).toLocaleDateString()}
          </div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Milestones</p>
          <div className="stat-value">{project.milestones?.length ?? 0}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Tech stack</p>
          <div className="tag-row">
            {project.techStack?.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        </div>
      </div>
       <div className="card section-card" style={{ marginBottom: 16 }}>
  <h2>Delivery</h2>
  <p>Jump into the backlog or an active sprint for this project.</p>
  <div className="section-actions">
  <Link to={`/backlog?projectId=${project.id}`} className="btn btn-secondary">View backlog</Link>
  <Link to={`/sprints?projectId=${project.id}`} className="btn btn-secondary">View sprints</Link>
  <Link to={`/repo?projectId=${project.id}`} className="btn btn-secondary">Repository</Link>
  <Link to={`/pipelines?projectId=${project.id}`} className="btn btn-secondary">Pipelines</Link>
  <Link to={`/releases?projectId=${project.id}`} className="btn btn-secondary">Releases</Link>
  <Link to={`/testcases?projectId=${project.id}`} className="btn btn-secondary">Test Cases</Link>
  <Link to={`/testruns?projectId=${project.id}`} className="btn btn-secondary">New Test Run</Link>
  <Link to={`/bugs?projectId=${project.id}`} className="btn btn-secondary">Bugs</Link>
</div>
</div>
      <div className="card section-card">
        <h2>Milestones</h2>
        {(!project.milestones || project.milestones.length === 0) ? (
          <p>No milestones added yet.</p>
        ) : (
          <ul className="team-member-list">
            {project.milestones.map((m) => (
              <li key={m.id} className="team-member-row">
                <span>{m.name}</span>
                <span className="text-faint">{new Date(m.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}