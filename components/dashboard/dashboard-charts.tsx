"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];
const NECESSITY_COLORS = { Need: "#6366f1", Want: "#f59e0b", Waste: "#ef4444" };

interface Props {
  monthlyData: Array<{ month: string; income: number; expenses: number; saved: number }>;
  categoryData: Array<{ name: string; value: number }>;
  splitData: { personalExpenses: number; businessExpenses: number };
  necessityData: Array<{ name: string; value: number }>;
}

const tooltipStyle = {
  contentStyle: {
    background: "hsl(222 44% 8%)",
    border: "1px solid hsl(222 35% 16%)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "hsl(210 40% 96%)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  itemStyle: { color: "hsl(210 40% 80%)" },
  labelStyle: { color: "hsl(210 40% 96%)", fontWeight: 600, marginBottom: 4 },
  cursor: { fill: "rgba(99, 102, 241, 0.05)" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold text-foreground/80">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
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
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xl">
      <p className="text-xs font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const axisStyle = { fontSize: 11, fill: "hsl(215 20% 42%)" };
const gridStyle = "hsl(222 35% 12%)";

export function DashboardCharts({ monthlyData, categoryData, splitData, necessityData }: Props) {
  const splitPieData = [
    { name: "Personal", value: Math.round(splitData.personalExpenses) },
    { name: "Business", value: Math.round(splitData.businessExpenses) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Income vs Expenses Bar Chart */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground">Income vs Expenses</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">6-month comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStyle} vertical={false} />
            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="saved" name="Saved" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="mt-4 flex items-center gap-5">
          {[{ label: "Income", color: "#10b981" }, { label: "Expenses", color: "#ef4444" }, { label: "Saved", color: "#6366f1" }].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-muted-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spending by Category */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Spending by Category</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">This month</p>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={categoryData.length ? categoryData : [{ name: "None", value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {(categoryData.length ? categoryData : [{ name: "None", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={categoryData.length ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : "hsl(222 35% 16%)"} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-2">
          {categoryData.slice(0, 4).map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{formatCurrency(item.value)}</span>
            </div>
          ))}
          {categoryData.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-2">No expenses this month</p>
          )}
        </div>
      </div>

      {/* Need / Want / Waste */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Need · Want · Waste</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Spending quality breakdown</p>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={necessityData.some(d => d.value > 0) ? necessityData : [{ name: "None", value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {(necessityData.some(d => d.value > 0) ? necessityData : [{ name: "None", value: 1 }]).map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={necessityData.some(d => d.value > 0)
                    ? NECESSITY_COLORS[entry.name as keyof typeof NECESSITY_COLORS] || CATEGORY_COLORS[i]
                    : "hsl(222 35% 16%)"}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-2">
          {necessityData.map((item) => {
            const color = NECESSITY_COLORS[item.name as keyof typeof NECESSITY_COLORS];
            const total = necessityData.reduce((s, d) => s + d.value, 0);
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{pct}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-secondary">
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal vs Business */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Personal vs Business</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Expense split this month</p>
        </div>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width="40%" height={160}>
            <PieChart>
              <Pie
                data={splitPieData.some(d => d.value > 0) ? splitPieData : [{ name: "None", value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#8b5cf6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-5">
            {splitPieData.map((item, i) => {
              const color = i === 0 ? "#8b5cf6" : "#f59e0b";
              const total = splitPieData[0].value + splitPieData[1].value;
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="font-medium text-foreground/80">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
                      <span className="text-xs text-muted-foreground/60 ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
