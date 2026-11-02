import { useEffect, useRef } from 'react'

/** Slow continuous crawl (~28px/sec). */
const SCROLL_PX_PER_MS = 0.028
const LOOP_PAUSE_MS = 1400

function isCurrentlyIn(row) {
  return Boolean(row?.checkIn) && !row?.checkOut
}

function hasPunch(row) {
  return Boolean(row?.checkIn || row?.checkOut)
}

function rowToneClass(row) {
  if (!hasPunch(row)) return 'board__row--absent'
  if (isCurrentlyIn(row)) return 'board__row--in'
  return 'board__row--out'
}

function InOutStatus({ row }) {
  const active = isCurrentlyIn(row) ? 'in' : 'out'

  return (
    <div
      className={`inout-status inout-status--${active}`}
      role="status"
      aria-label={active === 'in' ? 'In' : 'Out'}
    >
      <span className={`inout-status__side ${active === 'in' ? 'is-active is-in' : ''}`}>
        IN
      </span>
      <span className={`inout-status__side ${active === 'out' ? 'is-active is-out' : ''}`}>
        OUT
      </span>
    </div>
  )
}

export default function OfficerBoard({ board }) {
  const officers = Array.isArray(board?.officers) ? board.officers : []
  const wrapRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || officers.length === 0) return undefined

    let rafId = 0
    let lastTs = 0
    let pos = el.scrollTop || 0
    let pauseUntil = 0

    const step = (ts) => {
      if (!lastTs) lastTs = ts
      const dt = Math.min(ts - lastTs, 50)
      lastTs = ts

      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll > 2 && ts >= pauseUntil) {
        pos += SCROLL_PX_PER_MS * dt
        if (pos >= maxScroll) {
          pos = 0
          pauseUntil = ts + LOOP_PAUSE_MS
        }
        el.scrollTop = pos
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [officers.length])

  return (
    <section className="board" aria-label="Officer attendance board">
      <header className="board__head">
        <div>
          <h2>{board?.title || 'Senior Section Engineer — Attendance Status'}</h2>
        </div>
        <div className="live-pill" aria-live="polite">
          <span className="live-pill__dot" />
          Live status
        </div>
      </header>

      <div className="board__table-wrap" ref={wrapRef}>
        <table className="board__table">
          <thead>
            <tr>
              <th>Sl.</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Shop / Office</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {officers.length === 0 ? (
              <tr>
                <td colSpan={5} className="board__empty">
                  No SSE / IC found for today’s board.
                </td>
              </tr>
            ) : (
              officers.map((row, index) => (
                <tr
                  key={row._id || row.employeeId || index}
                  className={`board__row ${rowToneClass(row)}`.trim()}
                >
                  <td>{index + 1}</td>
                  <td>
                    <div className="officer-name">{row.name}</div>
                  </td>
                  <td>{row.designation || '—'}</td>
                  <td>{row.workplace || '—'}</td>
                  <td>
                    <InOutStatus row={row} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
