'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export type MonthlyDataPoint = { label: string; income: number; expenses: number }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
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
      <p style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: p.fill,
              opacity: 0.9,
            }}
          />
          <span style={{ color: '#71717a', textTransform: 'capitalize' }}>{p.dataKey}</span>
          <span style={{ color: '#fff', fontWeight: 600, marginLeft: 'auto', paddingLeft: 16 }}>
            ${p.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyBarChart({ data }: { data: MonthlyDataPoint[] }) {
  const isEmpty = data.every((d) => d.income === 0 && d.expenses === 0)

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-44 text-zinc-700 text-sm">
        No data for this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barGap={2} barCategoryGap="38%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#52525b', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
          width={38}
          tickFormatter={(v) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 4 }}
        />
        <Bar dataKey="income" fill="#10B981" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" fill="#f43f5e" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
