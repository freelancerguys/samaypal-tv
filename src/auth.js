const STORAGE_KEY = 'samaypal-tv-session'
const YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function getTvSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.expiresAt) return null
    if (Date.now() >= Number(parsed.expiresAt)) {
      clearTvSession()
      return null
    }
    return parsed
  } catch {
    clearTvSession()
    return null
  }
}

export function getTvToken() {
  return getTvSession()?.token || ''
}

export function saveTvSession({ token, expiresAt }) {
  const expiryMs = expiresAt ? new Date(expiresAt).getTime() : Date.now() + YEAR_MS
  const session = {
    token: String(token || ''),
    expiresAt: Number.isFinite(expiryMs) ? expiryMs : Date.now() + YEAR_MS,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export function clearTvSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isTvAuthenticated() {
  return Boolean(getTvToken())
}
