import { useState } from 'react'
import { BRAND_NAME, BRAND_NAME_HI, WORKSHOP_NAME } from '../config'
import { saveTvSession } from '../auth'
import { loginTvDisplayAPI } from '../api/tvApi'

export default function LoginScreen({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const json = await loginTvDisplayAPI(password)
      if (!json?.data?.token) {
        throw new Error(json?.message || 'Invalid password')
      }
      saveTvSession(json.data)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tv-login">
      <form className="tv-login__card" onSubmit={handleSubmit}>
        <div className="tv-login__logos">
          <img src="/indian-railways.png" alt="" />
          <img src="/samaypal-logo.png" alt="" />
          <img src="/kpa-logo.png" alt="" />
        </div>
        <p className="tv-login__eyebrow">Attendance display</p>
        <h1>
          <span className="tv__brand-hi">{BRAND_NAME_HI}</span>
          <span className="tv__brand-sep">:</span>
          <span>{BRAND_NAME}</span>
        </h1>
        <p className="tv-login__workshop">{WORKSHOP_NAME}</p>
        <label className="tv-login__label" htmlFor="tv-password">
          Display password
        </label>
        <input
          id="tv-password"
          className="tv-login__input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          disabled={loading}
          required
        />
        {error ? <div className="tv-login__error">{error}</div> : null}
        <button className="tv-login__button" type="submit" disabled={loading || !password}>
          {loading ? 'Signing in…' : 'Unlock display'}
        </button>
        <p className="tv-login__hint">After sign-in, this device stays unlocked for 1 year.</p>
      </form>
    </div>
  )
}
