import { useEffect, useState } from 'react'
import KpiStrip from './components/KpiStrip'
import OfficerBoard from './components/OfficerBoard'
import LoginScreen from './components/LoginScreen'
import { useTvLive } from './hooks/useTvLive'
import { isTvAuthenticated } from './auth'
import { BRAND_NAME, WORKSHOP_NAME, WORKSHOP_NAME_HI } from './config'
import { formatClock, formatClockDate } from './utils/formatTime'
import './App.css'

function LiveDashboard() {
  const { data, error, connected, updatedAt } = useTvLive()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="tv">
      <header className="tv__header">
        <div className="tv__header-left">
          <img
            className="tv__seal"
            src="/indian-railways.png"
            alt="Indian Railways"
          />
          <img
            className="tv__seal"
            src="/kpa-logo.png"
            alt="Kanchrapara Workshop"
          />
          <img
            className="tv__seal"
            src="/samaypal-logo.png"
            alt="SamayPal"
          />
        </div>

        <div className="tv__brand">
          <h1>
            <span className="tv__brand-hi">समयपाल</span>
            <span className="tv__brand-sep">:</span>
            <span className="tv__brand-en">{BRAND_NAME}</span>
          </h1>
          <p className="tv__workshop tv__workshop--hi">{WORKSHOP_NAME_HI}</p>
          <p className="tv__workshop">{WORKSHOP_NAME}</p>
        </div>

        <div className="tv__header-right">
          <p className="tv__display-label">
            <span>Attendance</span>
            <span>Display</span>
          </p>
          <div className="tv__gov-wrap">
            <img
              className="tv__gov"
              src="/gov-logo.png"
              alt="Azadi Ka Amrit Mahotsav and Emblem of India"
              width={414}
              height={147}
            />
          </div>
        </div>
      </header>

      <div className="tv__meta">
        <div>
          <span className="tv__section-title">Workshop Attendance Record</span>
        </div>
        <div className="tv__clock-block">
          <span className="tv__clock">
            <span className="tv__clock-date">
              <svg className="tv__meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                />
              </svg>
              {formatClockDate(now)}
            </span>
            <span className="tv__clock-time">
              <svg className="tv__meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
                />
              </svg>
              {formatClock(now)}
            </span>
          </span>
        </div>
      </div>

      {error ? <div className="tv__banner">{error}</div> : null}

      <main className="tv__main">
        <KpiStrip kpis={data?.kpis} />
        <OfficerBoard board={data?.board} />
      </main>

      <footer className="tv__footer">
        <span>{WORKSHOP_NAME}</span>
        <span className={`tv__live ${connected ? 'is-on' : 'is-off'}`}>
          <i />
          {connected ? 'Live' : 'Reconnecting'}
        </span>
        <span>
          Last updated:{' '}
          {updatedAt
            ? updatedAt.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })
            : '—'}
        </span>
      </footer>
    </div>
  )
}

function App() {
  const [authed, setAuthed] = useState(() => isTvAuthenticated())

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />
  }

  return <LiveDashboard />
}

export default App
