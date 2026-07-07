import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import TestResultBadge from '../components/TestResultBadge.jsx'

const RESULT_OPTIONS = ['NOT_RUN', 'PASS', 'FAIL', 'BLOCKED']

export default function TestRunPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [buildLabel, setBuildLabel] = useState('')
  const [started, setStarted] = useState(false)
  const [testCases, setTestCases] = useState([])
  const [results, setResults] = useState({}) // { testCaseId: 'PASS' | 'FAIL' | ... }
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!projectId) return
    api.get('/api/testcases', { params: { projectId } }).then((res) => setTestCases(res.data)).catch(() => {})
  }, [projectId])

  function startRun(e) {
    e.preventDefault()
    const initial = {}
    testCases.forEach((tc) => { initial[tc.id] = 'NOT_RUN' })
    setResults(initial)
    setStarted(true)
  }

  function setResult(testCaseId, result) {
    setResults((prev) => ({ ...prev, [testCaseId]: result }))
  }

  async function submitRun() {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await api.post('/api/testruns', {
        projectId,
        buildLabel,
        results: Object.entries(results).map(([testCaseId, result]) => ({ testCaseId, result })),
      })
      setSuccess('Test run saved. Any failed cases have automatically opened a bug.')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open a test run from a project's detail page.</p>
  }

  if (!started) {
    return (
      <div>
        <PageHeader eyebrow="MODULE 10" title="New test run" description="Record pass/fail/blocked results for a build." />
        {testCases.length === 0 ? (
          <EmptyState title="No test cases to run" description="Add test cases first, then start a run." />
        ) : (
          <form onSubmit={startRun} className="card" style={{ padding: 20, maxWidth: 420 }}>
            <div className="field">
              <label className="field-label">Build label</label>
              <input required value={buildLabel} onChange={(e) => setBuildLabel(e.target.value)} className="field-input" placeholder="v1.4.0-rc1" />
            </div>
            <button type="submit" className="btn btn-primary">Start run ({testCases.length} test cases)</button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader eyebrow="MODULE 10" title={`Test run — ${buildLabel}`} description="Mark each test case, then save the run." />

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <div className="card data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Test case</th>
              <th>Requirement</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => (
              <tr key={tc.id}>
                <td className="cell-strong">{tc.title}</td>
                <td className="mono text-faint">{tc.requirementRef}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={results[tc.id]}
                      onChange={(e) => setResult(tc.id, e.target.value)}
                      className="field-input"
                      style={{ width: 130 }}
                    >
                      {RESULT_OPTIONS.map((r) => <option key={r} value={r}>{r.replaceAll('_', ' ')}</option>)}
                    </select>
                    <TestResultBadge result={results[tc.id]} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-actions" style={{ marginTop: 20 }}>
        <button onClick={submitRun} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save test run'}
        </button>
      </div>
    </div>
  )
}