import { useEffect, useRef, useState } from 'react'
export function useNotificationsSocket(onMessage) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null

    function connect() {
      const token = localStorage.getItem('neuroforge_token')
      if (!token) return

      const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
        .replace(/^http/, 'ws')
      const socket = new WebSocket(`${base}/ws/notifications?token=${token}`)

      socket.onopen = () => {
        if (cancelled) return
        setConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current?.(data)
        } catch {
          // ignore malformed frames
        }
      }

      socket.onclose = () => {
        if (cancelled) return
        setConnected(false)
        retryTimeout = setTimeout(connect, 5000)
      }

      socket.onerror = () => {
        socket.close()
      }

      socketRef.current = socket
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
      socketRef.current?.close()
    }
  }, [])

  return { connected }
}