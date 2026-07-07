import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('neuroforge_token'))
  const [user, setUser] = useState(null) // { userId, email, fullName, orgId, orgName, role, platformRole }
  const [loading, setLoading] = useState(true)

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('neuroforge_token', newToken)
    } else {
      localStorage.removeItem('neuroforge_token')
    }
    setTokenState(newToken)
  }, [])

  const refreshMe = useCallback(async () => {
    // TEMPORARY: lets you click through every page without a real backend.
    // Remove this block (and VITE_MOCK_AUTH from .env) once the backend is ready.
    alert('MOCK AUTH VALUE: ' + import.meta.env.VITE_MOCK_AUTH)
    if (import.meta.env.VITE_MOCK_AUTH === 'true') {
      setUser({
        userId: 'mock-user-1',
        email: 'you@example.com',
        fullName: 'Test User',
        orgId: 'mock-org-1',
        orgName: 'Test Org',
        role: 'ORG_ADMIN', // change this to try other roles
        platformRole: 'STANDARD',
      })
      setToken('mock-token')
      setLoading(false)
      return
    }

    if (!localStorage.getItem('neuroforge_token')) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [setToken])

  useEffect(() => {
    refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [setToken])

  const value = { token, setToken, user, setUser, loading, refreshMe, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}