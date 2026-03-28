'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export type CategoryDataPoint = { name: string; value: number; percentage: number }

const COLORS = [
  '#10B981',
  '#6366f1',
  '#f59e0b',
  '#0ea5e9',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryDataPoint
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ color: '#fff', fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: '#71717a', marginTop: 3 }}>
        ${d.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} · {d.percentage}%
      </p>
    </div>
  )
}

export default function CategoryPieChart({
  data,
  total,
}: {
  data: CategoryDataPoint[]
  total: number
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-zinc-700 text-sm">
        No expenses recorded
      </div>
    )
  }

  const fmtTotal =
    total >= 1000
      ? `$${(total / 1000).toFixed(1)}k`
      : `$${total.toFixed(0)}`

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-center">
      {/* Donut */}
      <div className="relative flex-shrink-0" style={{ width: 150, height: 150 }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.88} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <p className="text-[10px] text-zinc-600 font-medium">Total</p>
          <p className="text-sm font-semibold text-white tabular-nums">{fmtTotal}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2 min-w-0">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: COLORS[i % COLORS.length], opacity: 0.88 }}
            />
            <span className="text-xs text-zinc-500 flex-1 truncate min-w-0">{d.name}</span>
            <span className="text-[10px] text-zinc-700 tabular-nums flex-shrink-0 w-8 text-right">
              {d.percentage}%
            </span>
            <span className="text-xs font-medium text-white tabular-nums flex-shrink-0 w-16 text-right">
              ${d.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
