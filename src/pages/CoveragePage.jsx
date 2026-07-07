import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function CoveragePage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [coverage, setCoverage] = useState(null) // [{ requirementRef, testCaseCount }]
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return
    api.get('/api/testcases/coverage', { params: { projectId } })
      .then((res) => setCoverage(res.data))
      .catch(() => setError('Could not load the coverage report.'))
  }, [projectId])

  if (!projectId) {
    return <p className="alert alert-info">Open the coverage report from a project's detail page.</p>
  }

  const untestedCount = coverage?.filter((c) => c.testCaseCount === 0).length ?? 0

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 10"
        title="Coverage report"
        description="Requirements with zero test cases are highlighted — those are your gaps."
      />

      {error && <p className="alert alert-error">{error}</p>}
      {!coverage && !error && <p className="text-muted">Loading…</p>}

      {coverage && coverage.length === 0 && (
        <EmptyState title="No requirements tracked yet" description="Coverage appears once tasks reference a requirement and test cases are added." />
      )}

      {coverage && coverage.length > 0 && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="card stat-card">
              <p className="stat-label">Requirements tracked</p>
              <div className="stat-value">{coverage.length}</div>
            </div>
            <div className="card stat-card">
              <p className="stat-label">Untested requirements</p>
              <div className="stat-value" style={{ color: untestedCount > 0 ? 'var(--rose-600)' : 'var(--ink-900)' }}>
                {untestedCount}
              </div>
            </div>
          </div>

          <div className="card data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Test cases</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((c) => (
                  <tr key={c.requirementRef} className={c.testCaseCount === 0 ? 'row-untested' : ''}>
                    <td className="cell-strong mono">{c.requirementRef}</td>
                    <td>{c.testCaseCount}</td>
                    <td>
                      <div className="coverage-bar-track">
                        <div
                          className="coverage-bar-fill"
                          style={{ width: c.testCaseCount === 0 ? '0%' : '100%' }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}