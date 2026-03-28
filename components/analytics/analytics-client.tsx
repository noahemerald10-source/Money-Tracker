"use client";

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// ── Palette ────────────────────────────────────────────────────────────────
const CAT_COLORS = [
  "#10B981", "#34D399", "#6EE7B7",
  "#3B82F6", "#818CF8", "#A78BFA",
  "#F59E0B", "#F97316", "#EF4444",
  "#EC4899",
];
const NEC_COLORS: Record<string, string> = {
  need:  "#10B981",
  want:  "#F59E0B",
  waste: "#EF4444",
};

// ── Shared axis / grid styles ──────────────────────────────────────────────
const axisStyle  = { fontSize: 11, fill: "rgba(255,255,255,0.28)" };
const gridStroke = "rgba(255,255,255,0.04)";

// ── Tooltips ───────────────────────────────────────────────────────────────
function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 shadow-2xl text-xs">
      <p className="text-zinc-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-400">{p.name}</span>
          </div>
          <span className="font-semibold text-white tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 shadow-2xl text-xs">
      <p className="font-semibold text-white">{payload[0].name}</p>
      <p className="text-zinc-400 mt-0.5 tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────
interface Props {
  data: {
    monthly: Array<{ month: string; income: number; expenses: number; saved: number; savingsRate: number }>;
    categoryData: Array<{ name: string; value: number }>;
    necessityData: Array<{ name: string; key: string; value: number }>;
    summary: { totalIncome: number; totalExpenses: number; totalTransactions: number };
  };
}

export function AnalyticsClient({ data }: Props) {
  const { monthly, categoryData, necessityData, summary } = data;

  const hasData        = summary.totalTransactions > 0;
  const totalCategories = categoryData.length;
  const catTotal        = categoryData.reduce((s, c) => s + c.value, 0);
  const avgMonthlySpend = (() => {
    const active = monthly.filter((m) => m.expenses > 0);
    return active.length > 0
      ? active.reduce((s, m) => s + m.expenses, 0) / active.length
      : 0;
  })();

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-500/60 mb-1">
          Insights
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">A deeper look at your money over time.</p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Spend",
            value: formatCurrency(summary.totalExpenses),
            sub: "all time",
            accent: false,
          },
          {
            label: "Categories",
            value: String(totalCategories),
            sub: "distinct",
            accent: false,
          },
          {
            label: "Transactions",
            value: String(summary.totalTransactions),
            sub: "total recorded",
            accent: false,
          },
          {
            label: "Avg Monthly Spend",
            value: formatCurrency(avgMonthlySpend),
            sub: "last 12 months",
            accent: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={card.accent ? "stat-card-positive rounded-2xl p-5" : "stat-card rounded-2xl p-5"}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500 mb-3">
              {card.label}
            </p>
            <p className={`text-2xl font-semibold tabular-nums tracking-tight ${card.accent ? "text-emerald-400" : "text-white"}`}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasData ? (
        <div className="card-section rounded-2xl p-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/6 bg-white/[0.03]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polyline points="3 17 8 10 13 13 18 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20.5" cy="5" r="1.5" fill="#34D399"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No data yet</h3>
          <p className="text-sm text-zinc-600 max-w-xs mx-auto">
            Add transactions and your analytics will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* ── Spending per month ───────────────────────────────────────── */}
          <div className="card-section rounded-2xl p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">Spending per month</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 12 months — expenses only</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Spend"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  fill="url(#spendGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fill="url(#incGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-5">
              {[
                { label: "Spend",  color: "#10B981" },
                { label: "Income", color: "#3B82F6" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-xs text-zinc-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── What you are spending on ─────────────────────────────────── */}
          <div className="card-section rounded-2xl p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">What you are spending on</h2>
              <p className="text-xs text-zinc-500 mt-0.5">All-time expenses by category</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

              {/* Left — category list */}
              <div className="space-y-3">
                {categoryData.slice(0, 8).map((item, i) => {
                  const pct = catTotal > 0 ? (item.value / catTotal) * 100 : 0;
                  const color = CAT_COLORS[i % CAT_COLORS.length];
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: color }}
                          />
                          <span className="text-sm text-zinc-300 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <span className="text-xs text-zinc-600 tabular-nums w-8 text-right">
                            {pct.toFixed(0)}%
                          </span>
                          <span className="text-sm font-medium text-white tabular-nums">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-[3px] w-full rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right — donut chart */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={92}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {categoryData.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centre label */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Total</p>
                    <p className="text-lg font-semibold text-white tabular-nums">
                      {formatCurrency(catTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Spending quality (need / want / waste) ───────────────────── */}
          <div className="card-section rounded-2xl p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">Spending quality</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Need · Want · Waste breakdown</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {necessityData.map((item) => {
                const necTotal = necessityData.reduce((s, d) => s + d.value, 0);
                const pct = necTotal > 0 ? Math.round((item.value / necTotal) * 100) : 0;
                const color = NEC_COLORS[item.key];
                return (
                  <div key={item.key} className="card-inner rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-medium text-zinc-300">{item.name}</span>
                      </div>
                      <span className="text-xs text-zinc-600 tabular-nums">{pct}%</span>
                    </div>
                    <p className="text-xl font-semibold tabular-nums text-white mb-3">
                      {formatCurrency(item.value)}
                    </p>
                    <div className="h-[3px] w-full rounded-full bg-white/[0.04]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
