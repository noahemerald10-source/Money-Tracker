"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
const NECESSITY_COLORS: Record<string, string> = { need: "#6366f1", want: "#f59e0b", waste: "#ef4444" };
const axisStyle = { fontSize: 11, fill: "hsl(215 20% 42%)" };
const gridColor = "hsl(222 35% 12%)";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xl text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-semibold text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xl text-xs">
      <p className="font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

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
  const allTimeSaved = summary.totalIncome - summary.totalExpenses;
  const hasData = summary.totalTransactions > 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">Insights</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground/70 mt-0.5">A deeper look at your money over time</p>
      </div>

      {/* All-time summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total earned (all time)", value: formatCurrency(summary.totalIncome), color: "text-emerald-400" },
          { label: "Total spent (all time)", value: formatCurrency(summary.totalExpenses), color: "text-red-400" },
          { label: "Net saved (all time)", value: formatCurrency(allTimeSaved), color: allTimeSaved >= 0 ? "text-blue-400" : "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
            <p className="text-xs text-muted-foreground/60 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center shadow-card">
          <p className="text-4xl mb-4">📈</p>
          <h3 className="text-base font-semibold text-foreground mb-1">No data to show yet</h3>
          <p className="text-sm text-muted-foreground/60">Add some transactions and your analytics will appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* Income vs Spending */}
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-1">Income vs Spending — Last 12 Months</h3>
            <p className="text-xs text-muted-foreground/60 mb-5">Month-by-month comparison</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly} barGap={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="expenses" name="Spending" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Savings rate trend */}
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-1">Savings Rate Over Time</h3>
            <p className="text-xs text-muted-foreground/60 mb-5">How much of your income you kept each month</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xl text-xs">
                        <p className="font-semibold text-foreground mb-1">{label}</p>
                        <p className="text-blue-400">{payload[0].value}% saved</p>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "rgba(99,102,241,0.2)" }}
                />
                <Line type="monotone" dataKey="savingsRate" name="Savings Rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category + Necessity */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-1">Where Your Money Goes</h3>
              <p className="text-xs text-muted-foreground/60 mb-4">All-time spending by category</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {categoryData.slice(0, 5).map((item, i) => {
                  const total = categoryData.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground/50">{pct}%</span>
                        <span className="font-semibold text-foreground">{formatCurrency(item.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-1">Spending Quality</h3>
              <p className="text-xs text-muted-foreground/60 mb-4">Are you spending on the right things?</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={necessityData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {necessityData.filter(d => d.value > 0).map((entry) => (
                      <Cell key={entry.key} fill={NECESSITY_COLORS[entry.key] || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-3">
                {necessityData.map((item) => {
                  const total = necessityData.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  const color = NECESSITY_COLORS[item.key];
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/50">{pct}%</span>
                          <span className="font-semibold text-foreground">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
