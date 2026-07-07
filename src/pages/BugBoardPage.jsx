import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import BugCard from '../components/BugCard.jsx'

const COLUMNS = [
  { key: 'OPEN', label: 'Open' },
  { key: 'TRIAGED', label: 'Triaged' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'FIXED', label: 'Fixed' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'CLOSED', label: 'Closed' },
]

export default function BugBoardPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [bugs, setBugs] = useState([])
  const [error, setError] = useState('')
  const [dragOverCol, setDragOverCol] = useState(null)

  function loadBugs() {
    api.get('/api/bugs', { params: { projectId } }).then((res) => setBugs(res.data)).catch(() => setError('Could not load bugs.'))
  }

  useEffect(() => {
    if (projectId) loadBugs()
  }, [projectId])

  async function moveBug(bugId, newStatus) {
    setError('')

    // Client-side hint matching the spec's rule - real enforcement is on the backend.
    if (newStatus === 'VERIFIED' && user?.role !== 'QA_TESTER') {
      setError('Only QA/Testers can move a bug to Verified.')
      return
    }

    setBugs((prev) => prev.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)))
    try {
      await api.patch(`/api/bugs/${bugId}/status`, { status: newStatus })
    } catch (err) {
      setError(extractErrorMessage(err))
      loadBugs()
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open the bug board from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader eyebrow="MODULE 11" title="Bug board" description="Drag a bug to change its status." />

      {error && <p className="alert alert-error">{error}</p>}

      <div className="kanban-board" style={{ gridTemplateColumns: 'repeat(6, minmax(180px, 1fr))' }}>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`kanban-column ${dragOverCol === col.key ? 'kanban-column-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key) }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault()
              const bugId = e.dataTransfer.getData('text/plain')
              setDragOverCol(null)
              moveBug(bugId, col.key)
            }}
          >
            <div className="kanban-column-header">
              <span>{col.label}</span>
              <span className="text-faint">{bugs.filter((b) => b.status === col.key).length}</span>
            </div>
            <div className="kanban-column-body">
              {bugs.filter((b) => b.status === col.key).map((b) => (
                <BugCard key={b.id} bug={b} onOpen={(id) => navigate(`/bugs/${id}`)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}