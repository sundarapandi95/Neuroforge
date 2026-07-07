import { useState } from 'react'
import { api, extractErrorMessage } from '../api/client.js'
import RoleGuard from './RoleGuard.jsx'

/**
 * The "one button generates an AI Sprint Health Summary in plain language"
 * feature. `scope` + `scopeId` tell the backend what to summarize
 * (e.g. scope="project", scopeId=projectId).
 */
export default function SprintHealthSummaryPanel({ scope, scopeId, readOnly = false }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function generate() {
    setError('')
    setGenerating(true)
    try {
      const res = await api.post('/api/analytics/sprint-health-summary', { scope, scopeId })
      setSummary(res.data.summary)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  async function exportPdf() {
    setError('')
    setExporting(true)
    try {
      const res = await api.get('/api/analytics/export-pdf', {
        params: { scope, scopeId },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `sprint-health-${scopeId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="card section-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Sprint health summary</h2>
        {!readOnly && (
          <RoleGuard allow={['PROJECT_MANAGER', 'ORG_ADMIN']}>
            <button onClick={generate} disabled={generating} className="btn btn-secondary">
              {generating ? 'Generating…' : summary ? 'Regenerate' : 'Generate summary'}
            </button>
          </RoleGuard>
        )}
      </div>
      <p>Plain-language read on this sprint's risk and recommendations, drafted by AI.</p>

      {error && <p className="alert alert-error">{error}</p>}

      {!summary && !generating && (
        <p className="text-faint" style={{ fontSize: 13 }}>No summary generated yet.</p>
      )}

      {summary && (
        <>
          <div className="summary-box">{summary}</div>
          <RoleGuard allow={['PROJECT_MANAGER', 'ORG_ADMIN']}>
            <div className="section-actions">
              <button onClick={exportPdf} disabled={exporting} className="btn btn-secondary">
                {exporting ? 'Exporting…' : 'Export as PDF'}
              </button>
            </div>
          </RoleGuard>
        </>
      )}
    </div>
  )
}