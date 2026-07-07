import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="RESET PASSWORD" title="Forgot your password?" subtitle="We'll email you a 6-digit reset code">
      {sent ? (
        <div>
          <p className="alert alert-success">
            If an account exists for <strong>{email}</strong>, a reset code is on its way.
          </p>
          <Link to="/reset-password" className="btn btn-primary btn-block">I have a code</Link>
        </div>
      ) : (
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
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      )}

      <p className="auth-footer-note">
        <Link to="/login" className="auth-link">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
