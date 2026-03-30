"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  startOfMonth, endOfMonth, subDays, subMonths,
  format, startOfWeek, endOfWeek,
} from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Palette ────────────────────────────────────────────────────────────────
const CAT_COLORS = [
  "#10B981","#34D399","#6EE7B7",
  "#3B82F6","#818CF8","#A78BFA",
  "#F59E0B","#F97316","#EF4444","#EC4899",
];
const NEC_COLORS: Record<string, string> = {
  need: "#10B981", want: "#F59E0B", waste: "#EF4444",
};

// ── Shared chart styles ───────────────────────────────────────────────────
const axisStyle  = { fontSize: 11, fill: "rgba(255,255,255,0.28)" };
const gridStroke = "rgba(255,255,255,0.04)";

// ── Date range config ─────────────────────────────────────────────────────
type DateRange = "week" | "month" | "30d" | "90d" | "6m" | "1y" | "all";

const RANGES: { key: DateRange; label: string }[] = [
  { key: "week",  label: "This Week"    },
  { key: "month", label: "This Month"   },
  { key: "30d",   label: "Last 30 Days" },
  { key: "90d",   label: "Last 90 Days" },
  { key: "6m",    label: "6 Months"     },
  { key: "1y",    label: "1 Year"       },
  { key: "all",   label: "All Time"     },
];

function getRangeStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "week":  return startOfWeek(now, { weekStartsOn: 1 });
    case "month": return startOfMonth(now);
    case "30d":   return subDays(now, 30);
    case "90d":   return subDays(now, 90);
    case "6m":    return subMonths(now, 6);
    case "1y":    return subMonths(now, 12);
    case "all":   return new Date(0);
  }
}

// ── Tooltips ──────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
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

// ── Monthly buckets for trend chart ──────────────────────────────────────
function buildMonthlyTrend(
  txns: RawTransaction[],
  range: DateRange,
): Array<{ month: string; income: number; expenses: number; saved: number }> {
  const monthCount =
    range === "week" || range === "month" ? 1 :
    range === "30d"  ? 2  :
    range === "90d"  ? 3  :
    range === "6m"   ? 6  :
    range === "1y"   ? 12 : 24;

  const now = new Date();
  return Array.from({ length: monthCount }, (_, i) => {
    const d     = subMonths(now, monthCount - 1 - i);
    const start = startOfMonth(d);
    const end   = endOfMonth(d);
    const m     = txns.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
    const income   = m.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = m.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return {
      month: format(d, monthCount > 12 ? "MMM yy" : "MMM"),
      income,
      expenses,
      saved: income - expenses,
    };
  });
}

// ── Props ─────────────────────────────────────────────────────────────────
interface RawTransaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
  financeMode: string;
  necessityLabel: string;
  isRecurring: boolean;
  recurringFrequency: string | null;
}

interface Props {
  transactions: RawTransaction[];
}

// ── Component ─────────────────────────────────────────────────────────────
export function AnalyticsClient({ transactions }: Props) {
  const [range, setRange] = useState<DateRange>("month");

  const filtered = useMemo(() => {
    const from = getRangeStart(range);
    return transactions.filter((t) => new Date(t.date) >= from);
  }, [transactions, range]);

  const expenses  = useMemo(() => filtered.filter((t) => t.type === "expense"), [filtered]);
  const incomeArr = useMemo(() => filtered.filter((t) => t.type === "income"),  [filtered]);

  const totalExpenses = useMemo(() => expenses.reduce((s, t)  => s + t.amount, 0), [expenses]);
  const totalIncome   = useMemo(() => incomeArr.reduce((s, t) => s + t.amount, 0), [incomeArr]);
  const netSaved      = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? Math.round((netSaved / totalIncome) * 100) : 0;

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const catTotal = categoryData.reduce((s, c) => s + c.value, 0);

  // Necessity breakdown
  const necessityData = useMemo(() => {
    const nec = { need: 0, want: 0, waste: 0 };
    expenses.forEach((t) => {
      const k = t.necessityLabel as keyof typeof nec;
      if (k in nec) nec[k] += t.amount;
    });
    return [
      { name: "Need",  key: "need",  value: nec.need  },
      { name: "Want",  key: "want",  value: nec.want  },
      { name: "Waste", key: "waste", value: nec.waste },
    ];
  }, [expenses]);

  const necTotal = necessityData.reduce((s, n) => s + n.value, 0);

  // Personal vs business
  const personalExp = expenses.filter((t) => t.financeMode === "personal").reduce((s, t) => s + t.amount, 0);
  const businessExp = expenses.filter((t) => t.financeMode === "business").reduce((s, t) => s + t.amount, 0);

  // Monthly trend (uses full transaction list for context, filtered by range window)
  const monthlyTrend = useMemo(() => buildMonthlyTrend(transactions, range), [transactions, range]);

  // Average monthly spend
  const avgMonthly = (() => {
    const active = monthlyTrend.filter((m) => m.expenses > 0);
    return active.length > 0 ? active.reduce((s, m) => s + m.expenses, 0) / active.length : 0;
  })();

  const hasData = transactions.length > 0;
  const hasFiltered = filtered.length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-500/60 mb-1">Insights</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">A deeper look at your money over time.</p>
        </div>
        {/* Date range tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl p-1" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                range === r.key
                  ? { background: "rgba(16,185,129,0.18)", color: "#10B981", border: "1px solid rgba(16,185,129,0.35)" }
                  : { background: "transparent", color: "#6B7280", border: "1px solid transparent" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Income",
            value: formatCurrency(totalIncome),
            sub: RANGES.find((r) => r.key === range)?.label,
            color: "#10B981",
            accent: false,
          },
          {
            label: "Total Expenses",
            value: formatCurrency(totalExpenses),
            sub: RANGES.find((r) => r.key === range)?.label,
            color: "#EF4444",
            accent: false,
          },
          {
            label: "Net Saved",
            value: formatCurrency(Math.abs(netSaved)),
            sub: netSaved >= 0 ? "surplus" : "deficit",
            color: netSaved >= 0 ? "#10B981" : "#EF4444",
            accent: false,
          },
          {
            label: "Savings Rate",
            value: `${savingsRate}%`,
            sub: "of income saved",
            color: savingsRate >= 20 ? "#10B981" : savingsRate >= 10 ? "#F59E0B" : "#EF4444",
            accent: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5"
            style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500 mb-3">
              {card.label}
            </p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!hasData ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.08)" }}>
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
      ) : !hasFiltered ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <h3 className="text-sm font-semibold text-white mb-1">No transactions in this period</h3>
          <p className="text-sm text-zinc-600">Try a wider date range to see data.</p>
        </div>
      ) : (
        <>
          {/* ── Income vs Expenses trend ─────────────────────────────────── */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">Income vs Expenses</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Monthly breakdown · avg spend {formatCurrency(avgMonthly)}/mo
              </p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend} margin={{ top: 4, right: 0, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="income"   name="Income"   fill="#10B981" fillOpacity={0.7} radius={[3,3,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" fillOpacity={0.6} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center gap-5">
              {[{ label: "Income", color: "#10B981" }, { label: "Expenses", color: "#EF4444" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-xs text-zinc-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Savings trend area chart ──────────────────────────────────── */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">Savings trend</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Amount saved per month</p>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyTrend} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="saved" name="Saved"
                  stroke="#10B981" strokeWidth={1.5} fill="url(#savedGrad)"
                  dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Category breakdown ───────────────────────────────────────── */}
          {categoryData.length > 0 && (
            <div className="rounded-2xl p-4 sm:p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">Top spending categories</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Expenses by category · {categoryData.length} categories</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                {/* Category list */}
                <div className="space-y-3">
                  {categoryData.slice(0, 8).map((item, i) => {
                    const pct = catTotal > 0 ? (item.value / catTotal) * 100 : 0;
                    const color = CAT_COLORS[i % CAT_COLORS.length];
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
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
                        <div className="h-[3px] w-full rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Donut chart */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={categoryData.slice(0, 8)} cx="50%" cy="50%"
                          innerRadius={64} outerRadius={92} paddingAngle={2}
                          dataKey="value" strokeWidth={0}
                        >
                          {categoryData.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={
                          ({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 shadow-2xl text-xs">
                                <p className="font-semibold text-white">{payload[0].name}</p>
                                <p className="text-zinc-400 mt-0.5 tabular-nums">{formatCurrency(payload[0].value as number)}</p>
                              </div>
                            ) : null
                        } />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">Total</p>
                      <p className="text-lg font-semibold text-white tabular-nums">{formatCurrency(catTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Spending quality + Personal vs Business ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Need / Want / Waste */}
            <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-white">Spending quality</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Need · Want · Waste breakdown</p>
              </div>

              <div className="space-y-3">
                {necessityData.map((item) => {
                  const pct = necTotal > 0 ? Math.round((item.value / necTotal) * 100) : 0;
                  const color = NEC_COLORS[item.key];
                  return (
                    <div key={item.key} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-sm font-medium text-zinc-300">{item.name}</span>
                        </div>
                        <span className="text-xs text-zinc-600 tabular-nums">{pct}%</span>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <p className="text-xl font-semibold tabular-nums text-white">
                          {formatCurrency(item.value)}
                        </p>
                        <div className="flex-1 h-[3px] rounded-full self-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: color, opacity: 0.65 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Waste insight */}
              {necessityData[2].value > 0 && necTotal > 0 && (
                <div className="mt-3 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-xs" style={{ color: "rgba(239,68,68,0.8)" }}>
                    ⚠ {formatCurrency(necessityData[2].value)} ({Math.round((necessityData[2].value / necTotal) * 100)}%) of your spending is waste this period.
                  </p>
                </div>
              )}
            </div>

            {/* Personal vs Business */}
            <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-white">Personal vs Business</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Expense split by finance mode</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Personal", value: personalExp, color: "#10B981" },
                  { label: "Business", value: businessExp, color: "#3B82F6" },
                ].map((item) => {
                  const total = personalExp + businessExp;
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-sm text-zinc-300">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600">{pct}%</span>
                          <span className="text-sm font-semibold text-white tabular-nums">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: item.color, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-zinc-600 mb-0.5">Total income</p>
                      <p className="text-base font-semibold text-emerald-400 tabular-nums">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-0.5">Total expenses</p>
                      <p className="text-base font-semibold text-red-400 tabular-nums">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-0.5">Net saved</p>
                      <p className={`text-base font-semibold tabular-nums ${netSaved >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {netSaved >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netSaved))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-0.5">Savings rate</p>
                      <div className="flex items-center gap-1.5">
                        <p className={`text-base font-semibold tabular-nums ${savingsRate >= 20 ? "text-emerald-400" : savingsRate >= 10 ? "text-amber-400" : "text-red-400"}`}>
                          {savingsRate}%
                        </p>
                        {savingsRate >= 20
                          ? <TrendingUp size={14} className="text-emerald-400" />
                          : savingsRate >= 10
                          ? <Minus size={14} className="text-amber-400" />
                          : <TrendingDown size={14} className="text-red-400" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
