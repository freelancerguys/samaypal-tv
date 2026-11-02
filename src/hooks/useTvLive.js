import { useEffect, useRef, useState } from 'react'
import { clearTvSession, getTvToken } from '../auth'
import { getTvLiveAPI, openTvLiveStreamAPI } from '../api/tvApi'

const POLL_MS = 8000

export function useTvLive() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let pollTimer = null
    let usingStream = false
    const token = getTvToken()

    const applyPayload = (payload) => {
      if (cancelled || !payload?.success) return
      setData(payload)
      setUpdatedAt(new Date())
      setError('')
      setConnected(true)
    }

    const handleAuthFailure = (message) => {
      clearTvSession()
      setConnected(false)
      setError(message || 'Session expired. Refresh and sign in again.')
      window.setTimeout(() => {
        window.location.reload()
      }, 1200)
    }

    const fetchSnapshot = async () => {
      try {
        const json = await getTvLiveAPI(token)
        applyPayload(json)
      } catch (err) {
        if (cancelled) return
        if (err.status === 401) {
          handleAuthFailure(err.message)
          return
        }
        setConnected(false)
        setError(err.message || 'Unable to reach live attendance feed')
      }
    }

    const startPolling = () => {
      usingStream = false
      void fetchSnapshot()
      pollTimer = setInterval(fetchSnapshot, POLL_MS)
    }

    const startStream = async () => {
      if (!token) {
        setError('Not signed in')
        return
      }

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await openTvLiveStreamAPI(token, controller.signal)
        if (!res.body) {
          throw new Error('Stream unavailable')
        }

        usingStream = true
        setConnected(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() || ''
          for (const chunk of chunks) {
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data:')) continue
              const raw = line.slice(5).trim()
              if (!raw) continue
              try {
                applyPayload(JSON.parse(raw))
              } catch {
                /* ignore malformed frames */
              }
            }
          }
        }

        if (!cancelled) startPolling()
      } catch (err) {
        if (cancelled || err?.name === 'AbortError') return
        if (err.status === 401) {
          handleAuthFailure(err.message)
          return
        }
        if (!usingStream) {
          startPolling()
        } else {
          setError(err.message || 'Live stream disconnected — retrying…')
          startPolling()
        }
      }
    }

    void startStream()

    return () => {
      cancelled = true
      if (pollTimer) clearInterval(pollTimer)
      abortRef.current?.abort()
    }
  }, [])

  return { data, error, connected, updatedAt }
}
