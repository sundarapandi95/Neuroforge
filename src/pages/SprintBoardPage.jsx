import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TaskCard from '../components/TaskCard.jsx'
import BurndownChart from '../components/BurndownChart.jsx'
import { useNavigate, useParams } from 'react-router-dom'
const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'CODE_REVIEW', label: 'Code Review' },
  { key: 'TESTING', label: 'Testing' },
  { key: 'DONE', label: 'Done' },
]

export default function SprintBoardPage() {
  const { sprintId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sprint, setSprint] = useState(null)
  const [tasks, setTasks] = useState([])
  const [burndown, setBurndown] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('board') // 'board' | 'burndown'
  const [dragOverCol, setDragOverCol] = useState(null)

  function loadBoard() {
    api.get(`/api/sprints/${sprintId}`)
      .then((res) => {
        setSprint(res.data)
        setTasks(res.data.tasks || [])
      })
      .catch(() => setError('Could not load this sprint.'))

    api.get(`/api/sprints/${sprintId}/burndown`)
      .then((res) => setBurndown(res.data))
      .catch(() => {}) // burndown is a nice-to-have, don't block the board on it
  }

  useEffect(() => {
    loadBoard()
    // NOTE: this module's spec calls for live WebSocket sync across everyone's
    // board. That needs backend support (a WebSocket endpoint broadcasting
    // status changes) which isn't built yet - for now the board reloads
    // whenever you make a change yourself, and other users need to refresh
    // to see updates. Swap this effect for a WebSocket subscription once
    // that endpoint exists.
  }, [sprintId])

  async function moveTask(taskId, newStatus) {
    setError('')

    // Client-side hint only, matching the spec's "only QA can move to Done"
    // rule - the real enforcement has to live on the backend too.
    if (newStatus === 'DONE' && user?.role !== 'QA_TESTER') {
      setError('Only QA/Testers can move a task to Done.')
      return
    }

    // Optimistic UI update - flip it locally right away, then confirm with the server.
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus })
    } catch (err) {
      setError(extractErrorMessage(err))
      loadBoard() // roll back to server truth if the update was rejected
    }
  }

  if (error && !sprint) return <p className="alert alert-error">{error}</p>
  if (!sprint) return <p className="text-muted">Loading…</p>

  return (
    <div>
      <PageHeader eyebrow="MODULE 05" title={sprint.name} description={sprint.goal} />

      <div className="tab-row">
        <button className={tab === 'board' ? 'tab-btn tab-btn-active' : 'tab-btn'} onClick={() => setTab('board')}>
          Board
        </button>
        <button className={tab === 'burndown' ? 'tab-btn tab-btn-active' : 'tab-btn'} onClick={() => setTab('burndown')}>
          Burndown
        </button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {tab === 'board' ? (
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`kanban-column ${dragOverCol === col.key ? 'kanban-column-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverCol(col.key)
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData('text/plain')
                setDragOverCol(null)
                moveTask(taskId, col.key)
              }}
            >
              <div className="kanban-column-header">
                <span>{col.label}</span>
                <span className="text-faint">{tasks.filter((t) => t.status === col.key).length}</span>
              </div>
              <div className="kanban-column-body">
                {tasks
  .filter((t) => t.status === col.key)
  .map((t) => (
    <TaskCard key={t.id} task={t} onOpen={(id) => navigate(`/tasks/${id}`)} />
  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <BurndownChart data={burndown} />
        </div>
      )}
    </div>
  )
}