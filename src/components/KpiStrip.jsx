const KPIS = [
  {
    key: 'presentToday',
    label: 'Present today',
    tone: 'present',
    icon: '✓',
  },
  {
    key: 'lateToday',
    label: 'Late today',
    tone: 'late',
    icon: '◷',
  },
  {
    key: 'leaveToday',
    label: 'Leave today',
    tone: 'leave',
    icon: '↗',
  },
  {
    key: 'halfDayToday',
    label: 'Half-day today',
    tone: 'half',
    icon: '◐',
  },
]

export default function KpiStrip({ kpis }) {
  return (
    <section className="kpi-strip" aria-label="Attendance KPIs">
      {KPIS.map((item) => (
        <article key={item.key} className={`kpi kpi--${item.tone}`}>
          <div className="kpi__body">
            <p className="kpi__label">{item.label}</p>
            <p className="kpi__value">{kpis?.[item.key] ?? 0}</p>
          </div>
          <div className="kpi__icon" aria-hidden="true">
            {item.icon}
          </div>
        </article>
      ))}
    </section>
  )
}
