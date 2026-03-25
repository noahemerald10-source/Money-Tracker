import { prisma } from "@/lib/prisma";
import { formatCurrency, calcSavingsRate } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GoalsMiniPreview } from "@/components/dashboard/goals-mini-preview";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthTxns = await prisma.transaction.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  // Previous month for delta
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));
  const prevMonthTxns = await prisma.transaction.findMany({
    where: { date: { gte: prevStart, lte: prevEnd } },
  });

  const totalIncome = currentMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = currentMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSaved = totalIncome - totalExpenses;
  const savingsRate = calcSavingsRate(totalIncome, totalExpenses);

  const prevIncome = prevMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const incomeDelta = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expensesDelta = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const txns = await prisma.transaction.findMany({ where: { date: { gte: start, lte: end } } });
    const inc = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    monthlyData.push({ month: format(date, "MMM"), income: inc, expenses: exp, saved: inc - exp });
  }

  const expensesByCategory: Record<string, number> = {};
  currentMonthTxns
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
  const categoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  const recentTransactions = await prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 8 });
  const goals = await prisma.savingsGoal.findMany({ orderBy: { createdAt: "asc" }, take: 4 });

  const personalExpenses = currentMonthTxns.filter((t) => t.type === "expense" && t.financeMode === "personal").reduce((s, t) => s + t.amount, 0);
  const businessExpenses = currentMonthTxns.filter((t) => t.type === "expense" && t.financeMode === "business").reduce((s, t) => s + t.amount, 0);

  const necessityData = [
    { name: "Need", value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "need").reduce((s, t) => s + t.amount, 0) },
    { name: "Want", value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "want").reduce((s, t) => s + t.amount, 0) },
    { name: "Waste", value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "waste").reduce((s, t) => s + t.amount, 0) },
  ];

  return {
    stats: { totalIncome, totalExpenses, totalSaved, savingsRate, incomeDelta, expensesDelta },
    monthlyData,
    categoryData,
    recentTransactions: recentTransactions.map((t) => ({ ...t, date: t.date.toISOString(), createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })),
    goals: goals.map((g) => ({ ...g, deadline: g.deadline?.toISOString() ?? null, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString() })),
    splitData: { personalExpenses, businessExpenses },
    necessityData,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { totalIncome, totalExpenses, totalSaved, savingsRate, incomeDelta, expensesDelta } = data.stats;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Financial Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "MMMM yyyy")} · Personal Finance Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-xs font-medium text-muted-foreground">Live data</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          subtitle="This month"
          icon={TrendingUp}
          delta={incomeDelta}
          accent="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle="This month"
          icon={TrendingDown}
          delta={expensesDelta}
          accent="red"
          invertDelta
        />
        <StatCard
          title="Net Saved"
          value={formatCurrency(totalSaved)}
          subtitle="Income minus expenses"
          icon={PiggyBank}
          accent="blue"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          subtitle="Of income saved"
          icon={Percent}
          accent="violet"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyData={data.monthlyData}
        categoryData={data.categoryData}
        splitData={data.splitData}
        necessityData={data.necessityData}
      />

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
        <div className="lg:col-span-2">
          <GoalsMiniPreview goals={data.goals} />
        </div>
      </div>
    </div>
  );
}

type Accent = "emerald" | "red" | "blue" | "violet";

const accentConfig: Record<Accent, { icon: string; badge: string; value: string; ring: string }> = {
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    value: "text-emerald-400",
    ring: "shadow-emerald-500/10",
  },
  red: {
    icon: "bg-red-500/10 text-red-400",
    badge: "bg-red-500/10 border-red-500/20",
    value: "text-red-400",
    ring: "shadow-red-500/10",
  },
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    badge: "bg-blue-500/10 border-blue-500/20",
    value: "text-blue-400",
    ring: "shadow-blue-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    badge: "bg-violet-500/10 border-violet-500/20",
    value: "text-violet-400",
    ring: "shadow-violet-500/10",
  },
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delta,
  accent = "blue",
  invertDelta = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  delta?: number;
  accent?: Accent;
  invertDelta?: boolean;
}) {
  const cfg = accentConfig[accent];
  const isPositive = invertDelta ? (delta !== undefined && delta <= 0) : (delta !== undefined && delta >= 0);
  const DeltaIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-border`}>
      {/* Subtle shine */}
      <div className="absolute inset-0 bg-card-shine opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.icon}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-xs font-medium ${cfg.badge} ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            <DeltaIcon className="h-3 w-3" />
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <div>
        <p className={`text-2xl font-bold tracking-tight ${cfg.value}`}>{value}</p>
        <p className="text-xs font-medium text-muted-foreground/70 mt-1">{title}</p>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
