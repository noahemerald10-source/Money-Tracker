"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// Gold-first palette for charts
const CATEGORY_COLORS = [
  "#10B981", "#34D399", "#059669",
  "#10b981", "#ef4444", "#a78bfa", "#f97316", "#14b8a6",
];
const NECESSITY_COLORS = { Need: "#10B981", Want: "#9CA3AF", Waste: "#EF4444" };

interface Props {
  monthlyData: Array<{ month: string; income: number; expenses: number; saved: number }>;
  categoryData: Array<{ name: string; value: number }>;
  splitData: { personalExpenses: number; businessExpenses: number };
  necessityData: Array<{ name: string; value: number }>;
}

const tooltipStyle = {
  contentStyle: {
    background: "#0f0f0f",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.2)" }}>
      <p className="mb-2 text-xs font-semibold text-white">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: "#9CA3AF" }}>{p.name}</span>
          </div>
          <span className="font-semibold text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.2)" }}>
      <p className="text-xs font-semibold text-white">{payload[0].name}</p>
      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const axisStyle  = { fontSize: 11, fill: "#4B5563" };
const gridColor  = "rgba(16,185,129,0.06)";
const emptyFill  = "rgba(16,185,129,0.08)";

export function DashboardCharts({ monthlyData, categoryData, splitData, necessityData }: Props) {
  const splitPieData = [
    { name: "Personal", value: Math.round(splitData.personalExpenses) },
    { name: "Business", value: Math.round(splitData.businessExpenses) },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Income vs Expenses */}
      <div className="rounded-xl p-5 shadow-card lg:col-span-2" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Income vs Expenses</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>6-month comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.04)" }} />
            <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="saved"    name="Saved"    fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center gap-5">
          {[{ label: "Income", color: "#10b981" }, { label: "Expenses", color: "#ef4444" }, { label: "Saved", color: "#10B981" }].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs" style={{ color: "#6B7280" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spending by Category */}
      <div className="rounded-xl p-5 shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Spending by Category</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>This month</p>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={categoryData.length ? categoryData : [{ name: "None", value: 1 }]}
              cx="50%" cy="50%" innerRadius={50} outerRadius={78}
              paddingAngle={3} dataKey="value" strokeWidth={0}
            >
              {(categoryData.length ? categoryData : [{ name: "None", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={categoryData.length ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : emptyFill} />
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
                <span className="text-xs truncate max-w-[100px]" style={{ color: "#9CA3AF" }}>{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{formatCurrency(item.value)}</span>
            </div>
          ))}
          {categoryData.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: "#6B7280" }}>No expenses this month</p>
          )}
        </div>
      </div>

      {/* Need / Want / Waste */}
      <div className="rounded-xl p-5 shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Need · Want · Waste</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>Spending quality breakdown</p>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={necessityData.some(d => d.value > 0) ? necessityData : [{ name: "None", value: 1 }]}
              cx="50%" cy="50%" innerRadius={45} outerRadius={68}
              paddingAngle={3} dataKey="value" strokeWidth={0}
            >
              {(necessityData.some(d => d.value > 0) ? necessityData : [{ name: "None", value: 1 }]).map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={necessityData.some(d => d.value > 0)
                    ? NECESSITY_COLORS[entry.name as keyof typeof NECESSITY_COLORS] || CATEGORY_COLORS[i]
                    : emptyFill}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-2.5">
          {necessityData.map((item) => {
            const color = NECESSITY_COLORS[item.name as keyof typeof NECESSITY_COLORS];
            const total = necessityData.reduce((s, d) => s + d.value, 0);
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span style={{ color: "#9CA3AF" }}>{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{pct}%</span>
                </div>
                <div className="h-[6px] w-full rounded-full" style={{ background: "#1a1a1a" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal vs Business */}
      <div className="rounded-xl p-5 shadow-card lg:col-span-2" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Personal vs Business</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>Expense split this month</p>
        </div>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width="40%" height={160}>
            <PieChart>
              <Pie
                data={splitPieData.some(d => d.value > 0) ? splitPieData : [{ name: "None", value: 1 }]}
                cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                paddingAngle={3} dataKey="value" strokeWidth={0}
              >
                <Cell fill="#10B981" />
                <Cell fill="#34D399" />
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-5">
            {splitPieData.map((item, i) => {
              const color = i === 0 ? "#10B981" : "#34D399";
              const total = splitPieData[0].value + splitPieData[1].value;
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">{formatCurrency(item.value)}</span>
                      <span className="text-xs ml-2" style={{ color: "#6B7280" }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-[8px] w-full rounded-full" style={{ background: "#1a1a1a" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
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
