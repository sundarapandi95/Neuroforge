import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

export default function SignupPage() {
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite') || ''

  const [form, setForm] = useState({ fullName: '', email: '', password: '', orgName: '' })
  const [invitePreview, setInvitePreview] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!inviteToken) return
    api
      .get(`/api/invites/${inviteToken}`)
      .then((res) => {
        setInvitePreview(res.data)
        if (res.data.valid) {
          setForm((f) => ({ ...f, email: res.data.invitedEmail }))
        }
      })
      .catch(() => setInvitePreview({ valid: false, reasonIfInvalid: 'Could not load this invite.' }))
  }, [inviteToken])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        orgName: inviteToken ? undefined : form.orgName,
        inviteToken: inviteToken || undefined,
      }
      const res = await api.post('/api/auth/signup', payload)
      setToken(res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const invalidInvite = inviteToken && invitePreview && !invitePreview.valid

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title={inviteToken ? 'Join your team' : 'Create your workspace'}
      subtitle={
        inviteToken
          ? invitePreview?.valid
            ? `You're joining "${invitePreview.orgName}" as ${invitePreview.role.replaceAll('_', ' ').toLowerCase()}`
            : 'Checking your invite…'
          : 'Sets you up as Org Admin for a brand new organization'
      }
    >
      {invalidInvite ? (
        <p className="alert alert-error">{invitePreview.reasonIfInvalid}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Full name</label>
            <input
              required
              placeholder="Jordan Rivera"
              value={form.fullName}
              onChange={update('fullName')}
              className="field-input"
            />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              type="email"
              required
              disabled={!!inviteToken}
              placeholder="you@company.com"
              value={form.email}
              onChange={update('email')}
              className="field-input"
            />
          </div>
          {!inviteToken && (
            <div className="field">
              <label className="field-label">Organization name</label>
              <input
                required
                placeholder="Acme Inc."
                value={form.orgName}
                onChange={update('orgName')}
                className="field-input"
              />
            </div>
          )}
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update('password')}
              className="field-input"
            />
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? 'Creating account…' : inviteToken ? 'Join organization' : 'Create workspace'}
          </button>
        </form>
      )}

      <p className="auth-footer-note">
        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
