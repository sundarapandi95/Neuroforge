import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PortfolioHealthPanel from '../components/PortfolioHealthPanel.jsx'
import ProjectAnalyticsPanel from '../components/ProjectAnalyticsPanel.jsx'
import PersonalStatsPanel from '../components/PersonalStatsPanel.jsx'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '')

  const needsProjectPicker = user?.role === 'PROJECT_MANAGER' || user?.role === 'QA_TESTER' || user?.role === 'CLIENT'

  useEffect(() => {
    if (!needsProjectPicker) return
    api.get('/api/projects').then((res) => {
      setProjects(res.data)
      if (!selectedProjectId && res.data.length > 0) setSelectedProjectId(res.data[0].id)
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsProjectPicker])

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 14"
        title="Analytics"
        description="Delivery intelligence, scoped to what your role needs to see."
        action={
          needsProjectPicker && projects.length > 0 ? (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="field-input"
              style={{ width: 220 }}
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : null
        }
      />

      {user?.role === 'ORG_ADMIN' && <PortfolioHealthPanel />}

      {needsProjectPicker && (
        selectedProjectId
          ? <ProjectAnalyticsPanel projectId={selectedProjectId} />
          : <p className="text-muted">No projects yet — analytics will appear once one exists.</p>
      )}

      {user?.role === 'DEVELOPER' && <PersonalStatsPanel />}
    </div>
  )
}