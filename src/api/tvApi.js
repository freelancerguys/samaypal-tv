import { API_BASE_URL, TV_ENDPOINTS } from '../config'
import { getTvToken } from '../auth'

function buildUrl(path) {
  return `${API_BASE_URL}${path}`
}

function authHeaders(token = getTvToken()) {
  const headers = {
    Accept: 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
    headers['X-TV-Token'] = token
  }
  return headers
}

async function parseJsonResponse(res) {
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(json?.message || `Request failed (${res.status})`)
    error.status = res.status
    error.payload = json
    throw error
  }
  return json
}

/** POST /api/tv/login — returns 1-year JWT session */
export async function loginTvDisplayAPI(password) {
  const res = await fetch(buildUrl(TV_ENDPOINTS.LOGIN), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })
  return parseJsonResponse(res)
}

/** GET /api/tv/session — validate stored session */
export async function getTvSessionAPI(token = getTvToken()) {
  const res = await fetch(buildUrl(TV_ENDPOINTS.SESSION), {
    method: 'GET',
    headers: authHeaders(token),
  })
  return parseJsonResponse(res)
}

/** GET /api/tv/live — attendance snapshot */
export async function getTvLiveAPI(token = getTvToken()) {
  const res = await fetch(buildUrl(TV_ENDPOINTS.LIVE), {
    method: 'GET',
    headers: authHeaders(token),
  })
  return parseJsonResponse(res)
}

/**
 * GET /api/tv/live/stream — SSE live feed
 * Returns the fetch Response so the caller can read the stream body.
 */
export async function openTvLiveStreamAPI(token = getTvToken(), signal) {
  const res = await fetch(buildUrl(TV_ENDPOINTS.LIVE_STREAM), {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...authHeaders(token),
    },
    signal,
  })
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const error = new Error(json?.message || `Stream unavailable (${res.status})`)
    error.status = res.status
    error.payload = json
    throw error
  }
  return res
}
