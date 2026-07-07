import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import PageHeader from '../components/PageHeader.jsx'

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    methodology: 'AGILE',
    startDate: '',
    endDate: '',
    teamId: '',
    techStack: '',
  })

  useEffect(() => {
    api.get('/api/org/teams').then((res) => setTeams(res.data)).catch(() => {})
  }, [])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        techStack: form.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      const res = await api.post('/api/projects', payload)
      navigate(`/projects/${res.data.id}`)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="MODULE 03" title="New project" description="Set up a project shell — you can add milestones after." />

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, maxWidth: 520 }}>
        <div className="field">
          <label className="field-label">Project name</label>
          <input required placeholder="Customer Portal Revamp" value={form.name} onChange={update('name')} className="field-input" />
        </div>

        <div className="field">
          <label className="field-label">Methodology</label>
          <select value={form.methodology} onChange={update('methodology')} className="field-input">
            <option value="AGILE">Agile</option>
            <option value="WATERFALL">Waterfall</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Start date</label>
            <input type="date" required value={form.startDate} onChange={update('startDate')} className="field-input" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">End date</label>
            <input type="date" required value={form.endDate} onChange={update('endDate')} className="field-input" />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Team</label>
          <select required value={form.teamId} onChange={update('teamId')} className="field-input">
            <option value="">Select a team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Tech stack (comma-separated)</label>
          <input placeholder="React, Java, MongoDB" value={form.techStack} onChange={update('techStack')} className="field-input" />
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
          {submitting ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </div>
  )
}