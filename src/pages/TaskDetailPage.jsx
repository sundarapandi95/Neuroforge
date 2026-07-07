import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [commits, setCommits] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/tasks/${taskId}`).then((res) => setTask(res.data)).catch(() => setError('Could not load this task.'))
    api.get(`/api/tasks/${taskId}/commits`).then((res) => setCommits(res.data)).catch(() => setCommits([]))
  }, [taskId])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!task) return <p className="text-muted">Loading…</p>

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 05 / 07"
        title={task.title}
        description={`${task.storyPoints} points · ${task.status.replaceAll('_', ' ').toLowerCase()}`}
        action={<PriorityBadge priority={task.priority} />}
      />

      <div className="stat-grid">
        <div className="card stat-card">
          <p className="stat-label">Assignee</p>
          <div style={{ fontSize: 14 }}>{task.assigneeName || 'Unassigned'}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Requirement</p>
          <div className="mono" style={{ fontSize: 14 }}>{task.requirementRef || '—'}</div>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Labels</p>
          <div className="tag-row">
            {task.labels?.map((l) => <span key={l} className="tag-pill">{l}</span>)}
            {(!task.labels || task.labels.length === 0) && <span className="text-faint">None</span>}
          </div>
        </div>
      </div>

      <div className="card section-card">
        <h2>Linked commits</h2>
        <p>Commits whose message references this task's ID (e.g. <span className="mono">NF-{task.shortId}</span>).</p>
        {!commits && <p style={{ marginTop: 12 }}>Loading…</p>}
        {commits && commits.length === 0 && (
          <div style={{ marginTop: 12 }}>
            <EmptyState title="No linked commits yet" description="Once a commit message references this task, it'll show up here after the next sync." />
          </div>
        )}
        {commits && commits.length > 0 && (
          <ul className="commit-list" style={{ marginTop: 12 }}>
            {commits.map((c) => (
              <li key={c.sha} className="commit-row">
                <div>
                  <p className="commit-message">{c.message}</p>
                  <p className="text-faint" style={{ fontSize: 12 }}>{c.author} · {new Date(c.date).toLocaleDateString()}</p>
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