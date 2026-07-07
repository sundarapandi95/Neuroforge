import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setToken } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const data = res.data

      if (data.requiresOrgSelection) {
        // Stash the short-lived pre-auth token + org options for the select-org screen.
        sessionStorage.setItem('neuroforge_preauth_token', data.token)
        sessionStorage.setItem('neuroforge_org_options', JSON.stringify(data.orgs))
        navigate('/select-org')
        return
      }

      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="WELCOME BACK" title="Sign in" subtitle="Use your NeuroForge account credentials">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            autoFocus
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </div>
        <div className="field">
          <div className="field-row-between">
            <label className="field-label">Password</label>
            <Link to="/forgot-password" className="link-small">Forgot password?</Link>
          </div>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-footer-note">
        Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
      </p>
    </AuthLayout>
  )
}
