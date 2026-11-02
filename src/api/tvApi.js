import { API_BASE_URL, TV_ENDPOINTS } from '../config'
import { getTvToken } from '../auth'

const RETRY_ATTEMPTS = 4
const RETRY_DELAY_MS = 350

function buildUrl(path) {
  return `${API_BASE_URL}${path}`
}

/** Authenticated profile photo URL for <img src> (User.faceImage). */
export function getTvEmployeePhotoUrl(userId, token = getTvToken()) {
  if (!userId) return ''
  const id = encodeURIComponent(String(userId))
  const q = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${API_BASE_URL}${TV_ENDPOINTS.PHOTO}/${id}${q}`
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetryStatus(status) {
  // Mixed LB backends: old nodes return HTML 404 for /api/tv/* without CORS.
  return status === 404 || status === 502 || status === 503 || status === 504
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

async function fetchWithLbRetry(url, options = {}, { retries = RETRY_ATTEMPTS } = {}) {
  let lastError = null

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, options)
      if (shouldRetryStatus(res.status) && attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt)
        continue
      }
      return res
    } catch (err) {
      lastError = err
      // Browser surfaces failed CORS / network as TypeError from fetch.
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt)
        continue
      }
    }
  }

  throw lastError || new Error('Unable to reach SamayPal API')
}

/** POST /api/tv/login — returns 1-year JWT session */
export async function loginTvDisplayAPI(password) {
  const res = await fetchWithLbRetry(buildUrl(TV_ENDPOINTS.LOGIN), {
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
  const res = await fetchWithLbRetry(buildUrl(TV_ENDPOINTS.SESSION), {
    method: 'GET',
    headers: authHeaders(token),
  })
  return parseJsonResponse(res)
}

/** GET /api/tv/live — attendance snapshot */
export async function getTvLiveAPI(token = getTvToken()) {
  const res = await fetchWithLbRetry(buildUrl(TV_ENDPOINTS.LIVE), {
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
  const res = await fetchWithLbRetry(
    buildUrl(TV_ENDPOINTS.LIVE_STREAM),
    {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        ...authHeaders(token),
      },
      signal,
    },
    { retries: 3 }
  )
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const error = new Error(json?.message || `Stream unavailable (${res.status})`)
    error.status = res.status
    error.payload = json
    throw error
  }
  return res
}
