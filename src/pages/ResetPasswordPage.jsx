import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', { token, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="RESET PASSWORD" title="Enter your reset code" subtitle="Check your email for the 6-digit code">
      {done ? (
        <p className="alert alert-success">Password updated. Redirecting you to sign in…</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Reset code</label>
            <input
              required
              autoFocus
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="field-input field-input-code"
            />
          </div>
          <div className="field">
            <label className="field-label">New password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field-input"
            />
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}

      <p className="auth-footer-note">
        <Link to="/login" className="auth-link">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
