function IconPresent() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.55 17.3 4.8 12.55l1.4-1.4 3.35 3.35 8.25-8.25 1.4 1.4L9.55 17.3Z"
      />
    </svg>
  )
}

function IconLate() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm.75-13h-1.5v5.25l4.5 2.7.75-1.23-3.75-2.22Z"
      />
    </svg>
  )
}

function IconLeave() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Zm-7 4h5v2h-5v3l-4-4 4-4v3Z"
      />
    </svg>
  )
}

function IconHalfDay() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18V4a8 8 0 0 1 0 16Z"
      />
    </svg>
  )
}

const KPIS = [
  {
    key: 'presentToday',
    label: 'Present today',
    tone: 'present',
    Icon: IconPresent,
  },
  {
    key: 'lateToday',
    label: 'Late today',
    tone: 'late',
    Icon: IconLate,
  },
  {
    key: 'leaveToday',
    label: 'Leave today',
    tone: 'leave',
    Icon: IconLeave,
  },
  {
    key: 'halfDayToday',
    label: 'Half-day today',
    tone: 'half',
    Icon: IconHalfDay,
  },
]

export default function KpiStrip({ kpis }) {
  return (
    <section className="kpi-strip" aria-label="Attendance KPIs">
      {KPIS.map(({ key, label, tone, Icon }) => (
        <article key={key} className={`kpi kpi--${tone}`}>
          <div className="kpi__body">
            <p className="kpi__label">{label}</p>
            <p className="kpi__value">{kpis?.[key] ?? 0}</p>
          </div>
          <div className="kpi__icon" aria-hidden="true">
            <Icon />
          </div>
        </article>
      ))}
    </section>
  )
}
