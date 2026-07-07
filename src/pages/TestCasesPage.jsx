import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RoleGuard from '../components/RoleGuard.jsx'

const TYPE_LABEL = { POSITIVE: 'Positive', NEGATIVE: 'Negative', EDGE_CASE: 'Edge case' }

export default function TestCasesPage() {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [testCases, setTestCases] = useState(null)
  const [error, setError] = useState('')

  // Manual creation
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualForm, setManualForm] = useState({ title: '', requirementRef: '', steps: '' })
  const [creatingManual, setCreatingManual] = useState(false)

  // AI generation
  const [showAiForm, setShowAiForm] = useState(false)
  const [aiForm, setAiForm] = useState({ requirementRef: '', requirementText: '', acceptanceCriteria: '' })
  const [generating, setGenerating] = useState(false)
  const [candidates, setCandidates] = useState(null) // AI-suggested test cases, pending review
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState([])
  const [importing, setImporting] = useState(false)

  function loadTestCases() {
    api.get('/api/testcases', { params: { projectId } })
      .then((res) => setTestCases(res.data))
      .catch(() => setError('Could not load test cases.'))
  }

  useEffect(() => {
    if (projectId) loadTestCases()
  }, [projectId])

  function updateManual(field) {
    return (e) => setManualForm((f) => ({ ...f, [field]: e.target.value }))
  }
  function updateAi(field) {
    return (e) => setAiForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function createManual(e) {
    e.preventDefault()
    setError('')
    setCreatingManual(true)
    try {
      await api.post('/api/testcases', {
        projectId,
        title: manualForm.title,
        requirementRef: manualForm.requirementRef,
        type: 'POSITIVE',
        steps: manualForm.steps.split('\n').map((s) => s.trim()).filter(Boolean),
      })
      setManualForm({ title: '', requirementRef: '', steps: '' })
      setShowManualForm(false)
      loadTestCases()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setCreatingManual(false)
    }
  }

  async function generateWithAi(e) {
    e.preventDefault()
    setError('')
    setGenerating(true)
    setCandidates(null)
    try {
      const res = await api.post('/api/testcases/generate', {
        projectId,
        requirementRef: aiForm.requirementRef,
        requirementText: aiForm.requirementText,
        acceptanceCriteria: aiForm.acceptanceCriteria,
      })
      setCandidates(res.data) // [{ title, type, steps: [...] }, ...]
      setSelectedCandidateIdx(res.data.map((_, i) => i)) // pre-select all
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  function toggleCandidate(idx) {
    setSelectedCandidateIdx((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

  async function importSelected() {
    setError('')
    setImporting(true)
    try {
      const toImport = candidates.filter((_, i) => selectedCandidateIdx.includes(i))
      await api.post('/api/testcases/import', {
        projectId,
        requirementRef: aiForm.requirementRef,
        testCases: toImport,
      })
      setCandidates(null)
      setShowAiForm(false)
      setAiForm({ requirementRef: '', requirementText: '', acceptanceCriteria: '' })
      loadTestCases()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setImporting(false)
    }
  }

  if (!projectId) {
    return <p className="alert alert-info">Open test cases from a project's detail page.</p>
  }

  return (
    <div>
      <PageHeader
        eyebrow="MODULE 10"
        title="Test Cases"
        description="Test cases mapped to requirements, created manually or with AI assistance."
        action={
          <RoleGuard allow={['QA_TESTER']}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowManualForm((s) => !s)}>
                {showManualForm ? 'Cancel' : 'New test case'}
              </button>
              <button className="btn btn-primary" onClick={() => setShowAiForm((s) => !s)}>
                {showAiForm ? 'Cancel' : 'Generate with AI'}
              </button>
            </div>
          </RoleGuard>
        }
      />

      {error && <p className="alert alert-error">{error}</p>}

      {showManualForm && (
        <form onSubmit={createManual} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 560 }}>
          <div className="field">
            <label className="field-label">Title</label>
            <input required value={manualForm.title} onChange={updateManual('title')} className="field-input" placeholder="Login fails with wrong password" />
          </div>
          <div className="field">
            <label className="field-label">Requirement reference</label>
            <input required value={manualForm.requirementRef} onChange={updateManual('requirementRef')} className="field-input" placeholder="NF-12" />
          </div>
          <div className="field">
            <label className="field-label">Steps (one per line)</label>
            <textarea
              required
              value={manualForm.steps}
              onChange={updateManual('steps')}
              className="field-input release-notes-textarea"
              rows={5}
              placeholder={'Go to login page\nEnter valid email + wrong password\nSubmit\nExpect: error message shown, no session created'}
            />
          </div>
          <button type="submit" disabled={creatingManual} className="btn btn-primary">
            {creatingManual ? 'Adding…' : 'Add test case'}
          </button>
        </form>
      )}

      {showAiForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <form onSubmit={generateWithAi}>
            <div className="field">
              <label className="field-label">Requirement reference</label>
              <input required value={aiForm.requirementRef} onChange={updateAi('requirementRef')} className="field-input" placeholder="NF-12" />
            </div>
            <div className="field">
              <label className="field-label">Requirement text</label>
              <textarea
                required
                value={aiForm.requirementText}
                onChange={updateAi('requirementText')}
                className="field-input release-notes-textarea"
                rows={3}
                placeholder="Users must be able to reset their password via a 6-digit email code."
              />
            </div>
            <div className="field">
              <label className="field-label">Acceptance criteria</label>
              <textarea
                required
                value={aiForm.acceptanceCriteria}
                onChange={updateAi('acceptanceCriteria')}
                className="field-input release-notes-textarea"
                rows={3}
                placeholder="Code expires in 15 minutes. Code is single-use. Wrong code shows an error without revealing if the email exists."
              />
            </div>
            <button type="submit" disabled={generating} className="btn btn-primary">
              {generating ? 'Generating…' : 'Generate test cases'}
            </button>
          </form>

          {candidates && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--ink-100)', paddingTop: 16 }}>
              <p style={{ marginBottom: 10 }}>
                Review the AI's suggestions below — uncheck any you don't want, then import the rest.
              </p>
              <ul className="checklist" style={{ maxHeight: 320 }}>
                {candidates.map((c, i) => (
                  <li key={i}>
                    <label className="checklist-item" style={{ alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={selectedCandidateIdx.includes(i)}
                        onChange={() => toggleCandidate(i)}
                        style={{ marginTop: 3 }}
                      />
                      <div>
                        <div>
                          <strong>{c.title}</strong>{' '}
                          <span className="text-faint">({TYPE_LABEL[c.type] || c.type})</span>
                        </div>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--ink-500)' }}>
                          {c.steps.map((s, si) => <li key={si}>{s}</li>)}
                        </ul>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                onClick={importSelected}
                disabled={importing || selectedCandidateIdx.length === 0}
                className="btn btn-primary"
                style={{ marginTop: 12 }}
              >
                {importing ? 'Importing…' : `Import ${selectedCandidateIdx.length} selected`}
              </button>
            </div>
          )}
        </div>
      )}

      {!testCases && !error && <p className="text-muted">Loading…</p>}

      {testCases && testCases.length === 0 && (
        <EmptyState title="No test cases yet" description="Add one manually or generate a set with AI, above." />
      )}

      {testCases && testCases.length > 0 && (
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Requirement</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc.id}>
                  <td className="cell-strong">{tc.title}</td>
                  <td className="mono text-faint">{tc.requirementRef}</td>
                  <td className="text-muted">{TYPE_LABEL[tc.type] || tc.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-actions" style={{ marginTop: 20 }}>
        <Link to={`/coverage?projectId=${projectId}`} className="btn btn-secondary">View coverage report</Link>
      </div>
    </div>
  )
}