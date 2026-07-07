import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, extractErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

/**
 * Landing point for an invite link (/invite/:token).
 *  - Logged out -> preview the invite, then send them to Signup with ?invite=token
 *  - Logged in with matching email -> one-click accept
 *  - Logged in with a different email -> tell them plainly, no silent auto-accept
 */
export default function AcceptInvitePage() {
  const { token } = useParams()
  const { token: authToken, user } = useAuth()
  const navigate = useNavigate()

  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    api
      .get(`/api/invites/${token}`)
      .then((res) => setPreview(res.data))
      .catch(() => setPreview({ valid: false, reasonIfInvalid: 'Could not load this invite.' }))
  }, [token])

  async function accept() {
    setError('')
    setAccepting(true)
    try {
      await api.post(`/api/invites/${token}/accept`)
      setAccepted(true)
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setAccepting(false)
    }
  }

  if (!preview) {
    return <AuthLayout eyebrow="INVITATION" title="Loading invite…"><div /></AuthLayout>
  }

  if (!preview.valid) {
    return (
      <AuthLayout eyebrow="INVITATION" title="This invite isn't valid">
        <p className="alert alert-error">{preview.reasonIfInvalid}</p>
      </AuthLayout>
    )
  }

  const roleLabel = preview.role.replaceAll('_', ' ').toLowerCase()

  if (accepted) {
    return (
      <AuthLayout eyebrow="INVITATION" title={`Welcome to ${preview.orgName}`}>
        <p className="alert alert-success">You're in. Redirecting to your dashboard…</p>
      </AuthLayout>
    )
  }

  if (!authToken) {
    return (
      <AuthLayout eyebrow="INVITATION" title={`Join ${preview.orgName}`} subtitle={`You've been invited as ${roleLabel}`}>
        <button className="btn btn-primary btn-block" onClick={() => navigate(`/signup?invite=${token}`)}>
          Create your account to accept
        </button>
      </AuthLayout>
    )
  }

  if (user && user.email.toLowerCase() !== preview.invitedEmail.toLowerCase()) {
    return (
      <AuthLayout eyebrow="INVITATION" title="Wrong account">
        <p className="alert alert-info">
          This invite was sent to <strong>{preview.invitedEmail}</strong>, but you're signed in as{' '}
          <strong>{user.email}</strong>. Log out and sign in with the invited email to accept.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="INVITATION" title={`Join ${preview.orgName}`} subtitle={`You've been invited as ${roleLabel}`}>
      {error && <p className="alert alert-error">{error}</p>}
      <button onClick={accept} disabled={accepting} className="btn btn-primary btn-block">
        {accepting ? 'Joining…' : `Accept & join ${preview.orgName}`}
      </button>
    </AuthLayout>
  )
}
