const COMPLICATION_COLORS = {
  tourbillon: '#f5c842',
  minute_repeater: '#ef4444',
  quarter_repeater: '#f97316',
  grande_sonnerie: '#dc2626',
  westminster_chime: '#b91c1c',
  chronograph: '#22c55e',
  flyback_chronograph: '#16a34a',
  rattrapante: '#15803d',
  perpetual_calendar: '#3b82f6',
  annual_calendar: '#60a5fa',
  moon_phase: '#a855f7',
  equation_of_time: '#c084fc',
  sky_chart: '#7c3aed',
  sidereal_time: '#6d28d9',
  gmt: '#06b6d4',
  world_time: '#0891b2',
  power_reserve: '#64748b',
  dead_seconds: '#94a3b8',
  automata: '#ec4899',
  default: '#6b7280',
}

const POSITION_ANGLES = {
  '12h': -Math.PI / 2,
  '3h': 0,
  '6h': Math.PI / 2,
  '9h': Math.PI,
  'center': null,
  '1h': -Math.PI / 2 + (Math.PI / 6),
  '2h': -Math.PI / 2 + (Math.PI / 3),
  '4h': Math.PI / 6,
  '5h': Math.PI / 3,
  '7h': Math.PI / 2 + Math.PI / 6,
  '8h': Math.PI / 2 + Math.PI / 3,
  '10h': Math.PI + Math.PI / 6,
  '11h': Math.PI + Math.PI / 3,
}

export default function MovementCanvas({ complications = [] }) {
  const cx = 200
  const cy = 200
  const R = 160
  const moduleR = complications.length > 8 ? 18 : 24

  const positioned = []
  const centerItems = []

  complications.forEach((c, i) => {
    const pos = c.position?.toLowerCase()
    if (pos === 'center') {
      centerItems.push({ ...c, index: i })
    } else {
      const angle = POSITION_ANGLES[pos]
      if (angle !== undefined && angle !== null) {
        const dist = R * 0.6
        positioned.push({ ...c, x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) })
      } else {
        const autoAngle = (i / complications.length) * 2 * Math.PI - Math.PI / 2
        positioned.push({ ...c, x: cx + R * 0.6 * Math.cos(autoAngle), y: cy + R * 0.6 * Math.sin(autoAngle) })
      }
    }
  })

  // Generate gear teeth for the outer ring
  const teeth = 60
  const teethPath = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * 2 * Math.PI
    const r1 = R
    const r2 = R + 8
    const da = Math.PI / teeth
    return `M ${cx + r1 * Math.cos(a - da * 0.3)} ${cy + r1 * Math.sin(a - da * 0.3)}
            L ${cx + r2 * Math.cos(a - da * 0.15)} ${cy + r2 * Math.sin(a - da * 0.15)}
            L ${cx + r2 * Math.cos(a + da * 0.15)} ${cy + r2 * Math.sin(a + da * 0.15)}
            L ${cx + r1 * Math.cos(a + da * 0.3)} ${cy + r1 * Math.sin(a + da * 0.3)} Z`
  }).join(' ')

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
        </defs>

        {/* Outer gear ring */}
        <path d={teethPath} fill="#e6b800" opacity="0.4" />

        {/* Movement plate */}
        <circle cx={cx} cy={cy} r={R} fill="url(#bg)" stroke="#e6b800" strokeWidth="1" opacity="0.8" />

        {/* Inner decorative rings */}
        <circle cx={cx} cy={cy} r={R * 0.85} fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={R * 0.5} fill="none" stroke="#222" strokeWidth="0.5" />

        {/* Hour markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI - Math.PI / 2
          const x1 = cx + (R - 5) * Math.cos(a)
          const y1 = cy + (R - 5) * Math.sin(a)
          const x2 = cx + (R - 14) * Math.cos(a)
          const y2 = cy + (R - 14) * Math.sin(a)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e6b800" strokeWidth={i % 3 === 0 ? 2 : 1} opacity="0.5" />
        })}

        {/* Bridges (decorative lines) */}
        {positioned.map((c, i) => (
          <line key={`bridge-${i}`} x1={cx} y1={cy} x2={c.x} y2={c.y} stroke="#333" strokeWidth="1" strokeDasharray="3 3" />
        ))}

        {/* Center stack */}
        {centerItems.map((c, i) => {
          const color = COMPLICATION_COLORS[c.type] || COMPLICATION_COLORS.default
          const offset = i * 6 - centerItems.length * 3
          return (
            <g key={`center-${i}`}>
              <circle cx={cx + offset} cy={cy + offset} r={moduleR} fill={color} opacity="0.85" />
              <circle cx={cx + offset} cy={cy + offset} r={moduleR - 6} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
            </g>
          )
        })}

        {/* Positioned complications */}
        {positioned.map((c, i) => {
          const color = COMPLICATION_COLORS[c.type] || COMPLICATION_COLORS.default
          return (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={moduleR} fill={color} opacity="0.85" />
              <circle cx={c.x} cy={c.y} r={moduleR - 5} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
              <text x={c.x} y={c.y + moduleR + 12} textAnchor="middle" fill="#ccc" fontSize="8" fontFamily="sans-serif">
                {c.type?.replace(/_/g, ' ').slice(0, 14)}
              </text>
            </g>
          )
        })}

        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={4} fill="#e6b800" />
        <circle cx={cx} cy={cy} r={2} fill="#0a0a0a" />
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
        {[['🟡 Tourbillon', '#f5c842'], ['🔴 Sonnerie', '#ef4444'], ['🟢 Chronographe', '#22c55e'], ['🔵 Calendrier', '#3b82f6'], ['🟣 Astronomique', '#a855f7'], ['🩵 Temps mondial', '#06b6d4']].map(([label]) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
