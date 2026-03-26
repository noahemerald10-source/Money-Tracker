import { prisma, resetPrismaConnection } from "@/lib/prisma";
import { formatCurrency, calcSavingsRate } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from "date-fns";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { GoalsMiniPreview } from "@/components/dashboard/goals-mini-preview";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, PiggyBank, Percent,
  ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, RefreshCw,
} from "lucide-react";
import { Transaction, SavingsGoal } from "@/types";

// ─── Demo data shown when the database has no transactions yet ────────────────
const now = new Date();
const DEMO_RECENT: Transaction[] = [
  { id: "d1", type: "expense", category: "Subscriptions", description: "Netflix",             amount: 15.99, date: new Date(now.getTime() - 2 * 86400000).toISOString(), necessityLabel: "want", financeMode: "personal", isRecurring: true,  recurringFrequency: "monthly", createdAt: "", updatedAt: "" },
  { id: "d2", type: "expense", category: "Groceries",     description: "Whole Foods",         amount: 82.50, date: new Date(now.getTime() - 3 * 86400000).toISOString(), necessityLabel: "need", financeMode: "personal", isRecurring: false, recurringFrequency: null,      createdAt: "", updatedAt: "" },
  { id: "d3", type: "income",  category: "Salary",        description: "Monthly salary",      amount: 2125,  date: new Date(now.getTime() - 5 * 86400000).toISOString(), necessityLabel: "need", financeMode: "personal", isRecurring: true,  recurringFrequency: "monthly", createdAt: "", updatedAt: "" },
  { id: "d4", type: "expense", category: "Transport",     description: "Uber",                amount: 24.30, date: new Date(now.getTime() - 6 * 86400000).toISOString(), necessityLabel: "want", financeMode: "personal", isRecurring: false, recurringFrequency: null,      createdAt: "", updatedAt: "" },
  { id: "d5", type: "expense", category: "Dining",        description: "Dinner with friends", amount: 67,    date: new Date(now.getTime() - 7 * 86400000).toISOString(), necessityLabel: "want", financeMode: "personal", isRecurring: false, recurringFrequency: null,      createdAt: "", updatedAt: "" },
];
const DEMO_GOALS: SavingsGoal[] = [
  { id: "g1", title: "Emergency Fund",    currentAmount: 3500, targetAmount: 5000, priority: "high",   deadline: null,                     notes: "3 months of living expenses", createdAt: "", updatedAt: "" },
  { id: "g2", title: "Vacation to Japan", currentAmount: 2800, targetAmount: 4000, priority: "medium", deadline: "2026-09-01T00:00:00.000Z", notes: "",                            createdAt: "", updatedAt: "" },
  { id: "g3", title: "New MacBook Pro",   currentAmount: 1200, targetAmount: 2500, priority: "low",    deadline: null,                     notes: "",                            createdAt: "", updatedAt: "" },
];
const DEMO_DATA = {
  stats:      { totalIncome: 4250, totalExpenses: 2840, totalSaved: 1410, savingsRate: 33, incomeDelta: 5, expensesDelta: -8 },
  comparison: { prevIncome: 4050, prevExpenses: 3090, prevSaved: 960 },
  monthlyData: [
    { month: "Oct", income: 3800, expenses: 2900, saved: 900 },
    { month: "Nov", income: 4100, expenses: 3200, saved: 900 },
    { month: "Dec", income: 4500, expenses: 3800, saved: 700 },
    { month: "Jan", income: 3900, expenses: 2700, saved: 1200 },
    { month: "Feb", income: 4050, expenses: 3090, saved: 960 },
    { month: "Mar", income: 4250, expenses: 2840, saved: 1410 },
  ],
  categoryData: [
    { name: "Housing", value: 1200 }, { name: "Dining", value: 320 },
    { name: "Transport", value: 180 }, { name: "Subscriptions", value: 95 },
    { name: "Entertainment", value: 85 }, { name: "Health", value: 960 },
  ],
  budgetProgress: [
    { category: "Housing",       spent: 1200, limit: 1500, pct: 80 },
    { category: "Dining",        spent: 320,  limit: 300,  pct: 107 },
    { category: "Transport",     spent: 180,  limit: 250,  pct: 72 },
    { category: "Subscriptions", spent: 95,   limit: 100,  pct: 95 },
    { category: "Entertainment", spent: 85,   limit: 150,  pct: 57 },
  ],
  upcomingBills: [
    { id: "b1", description: "Monthly Rent",   category: "Housing",       amount: 1200,  daysUntil: 2,  emoji: "🏠" },
    { id: "b2", description: "Netflix",         category: "Subscriptions", amount: 15.99, daysUntil: 4,  emoji: "📱" },
    { id: "b3", description: "Electric Bill",   category: "Utilities",     amount: 92,    daysUntil: 7,  emoji: "⚡" },
    { id: "b4", description: "Gym Membership",  category: "Health",        amount: 45,    daysUntil: 12, emoji: "🏋️" },
  ],
  netWorth:       9910,
  totalGoalsSaved: 8500,
  recentTransactions: DEMO_RECENT,
  goals:            DEMO_GOALS,
  splitData: { personalExpenses: 2200, businessExpenses: 640 },
  necessityData: [
    { name: "Need", value: 1800 },
    { name: "Want", value: 820 },
    { name: "Waste", value: 220 },
  ],
  recurringExpenses: [
    { id: "r1", description: "Monthly Rent",    category: "Housing",       amount: 1200,  recurringFrequency: "monthly",    weeklyEquivalent: (1200  * 12) / 52 },
    { id: "r2", description: "Netflix",          category: "Subscriptions", amount: 15.99, recurringFrequency: "monthly",    weeklyEquivalent: (15.99 * 12) / 52 },
    { id: "r3", description: "Gym Membership",  category: "Health",        amount: 45,    recurringFrequency: "monthly",    weeklyEquivalent: (45    * 12) / 52 },
    { id: "r4", description: "Internet Bill",   category: "Utilities",     amount: 79,    recurringFrequency: "monthly",    weeklyEquivalent: (79    * 12) / 52 },
    { id: "r5", description: "Spotify",         category: "Subscriptions", amount: 9.99,  recurringFrequency: "monthly",    weeklyEquivalent: (9.99  * 12) / 52 },
  ],
  isDemo: true,
};

// ─── Recurring frequency → weekly cost ────────────────────────────────────────
function toWeekly(amount: number, freq: string): number {
  switch (freq) {
    case "weekly":      return amount;
    case "fortnightly": return amount / 2;
    case "monthly":     return (amount * 12) / 52;
    case "quarterly":   return (amount * 4) / 52;
    case "yearly":      return amount / 52;
    default:            return (amount * 12) / 52;
  }
}

// ─── Per-category soft budget limits ─────────────────────────────────────────
const BUDGET_LIMITS: Record<string, number> = {
  housing: 1500, rent: 1500, mortgage: 1500,
  dining: 300, food: 300, groceries: 400,
  transport: 250, utilities: 150,
  subscriptions: 100, entertainment: 150,
  health: 200, shopping: 300, software: 100,
};

function getCategoryLimit(cat: string, fallback: number): number {
  return BUDGET_LIMITS[cat.toLowerCase()] ?? fallback;
}

function getBillEmoji(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("housing") || c.includes("rent") || c.includes("mortgage")) return "🏠";
  if (c.includes("utilities") || c.includes("electric") || c.includes("water") || c.includes("gas")) return "⚡";
  if (c.includes("subscriptions") || c.includes("streaming")) return "📱";
  if (c.includes("insurance")) return "🛡️";
  if (c.includes("internet") || c.includes("phone")) return "📶";
  if (c.includes("gym") || c.includes("health")) return "🏋️";
  return "📋";
}

// ─── Real DB fetch ─────────────────────────────────────────────────────────────
async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);
  const prevStart  = startOfMonth(subMonths(now, 1));
  const prevEnd    = endOfMonth(subMonths(now, 1));

  const [currentMonthTxns, prevMonthTxns, recentTransactions, goals, allRecurring] = await Promise.all([
    prisma.transaction.findMany({ where: { date: { gte: monthStart, lte: monthEnd } } }),
    prisma.transaction.findMany({ where: { date: { gte: prevStart, lte: prevEnd } } }),
    prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 5 }),
    prisma.savingsGoal.findMany({ orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.transaction.findMany({ where: { isRecurring: true, type: "expense" }, orderBy: { date: "desc" } }),
  ]);

  // Return demo data if the DB is completely empty
  const totalCount = await prisma.transaction.count();
  if (totalCount === 0 && goals.length === 0) return { ...DEMO_DATA };

  const totalIncome   = currentMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = currentMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSaved    = totalIncome - totalExpenses;
  const savingsRate   = calcSavingsRate(totalIncome, totalExpenses);

  const prevIncome   = prevMonthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const prevSaved    = prevIncome - prevExpenses;

  const incomeDelta   = prevIncome   > 0 ? Math.round(((totalIncome   - prevIncome)   / prevIncome)   * 100) : 0;
  const expensesDelta = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  // 6-month chart data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const txns = await prisma.transaction.findMany({ where: { date: { gte: startOfMonth(date), lte: endOfMonth(date) } } });
    const inc = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    monthlyData.push({ month: format(date, "MMM"), income: inc, expenses: exp, saved: inc - exp });
  }

  // Category breakdown
  const expensesByCategory: Record<string, number> = {};
  currentMonthTxns.filter((t) => t.type === "expense").forEach((t) => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  // Budget progress with per-category limits
  const fallbackLimit = totalIncome > 0 ? Math.round(totalIncome * 0.15) : 300;
  const budgetProgress = categoryData.slice(0, 5).map((c) => {
    const limit = getCategoryLimit(c.name, fallbackLimit);
    return { category: c.name, spent: c.value, limit, pct: Math.round((c.value / limit) * 100) };
  });

  // Upcoming bills: recurring expenses from last month, due around same day this month
  const billCategories = ["housing", "utilities", "subscriptions", "insurance", "rent", "mortgage", "internet", "phone", "gym"];
  const upcomingBills = prevMonthTxns
    .filter((t) => t.type === "expense" && billCategories.some((k) => t.category.toLowerCase().includes(k)))
    .map((t) => {
      const dayOfMonth = new Date(t.date).getDate();
      const dueDate    = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
      const daysUntil  = differenceInDays(dueDate, now);
      return { id: t.id, description: t.description || t.category, category: t.category, amount: t.amount, daysUntil, emoji: getBillEmoji(t.category) };
    })
    .filter((b) => b.daysUntil >= -1 && b.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);

  const totalGoalsSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const netWorth        = totalGoalsSaved + Math.max(0, totalSaved);

  const necessityData = [
    { name: "Need",  value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "need" ).reduce((s, t) => s + t.amount, 0) },
    { name: "Want",  value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "want" ).reduce((s, t) => s + t.amount, 0) },
    { name: "Waste", value: currentMonthTxns.filter((t) => t.type === "expense" && t.necessityLabel === "waste").reduce((s, t) => s + t.amount, 0) },
  ];
  const personalExpenses = currentMonthTxns.filter((t) => t.type === "expense" && t.financeMode === "personal").reduce((s, t) => s + t.amount, 0);
  const businessExpenses = currentMonthTxns.filter((t) => t.type === "expense" && t.financeMode === "business").reduce((s, t) => s + t.amount, 0);

  // Deduplicate recurring transactions by description+category (keep most recent)
  const seenRecurring = new Set<string>();
  const recurringExpenses = allRecurring
    .filter((t) => {
      const key = `${t.description ?? t.category}|${t.category}`;
      if (seenRecurring.has(key)) return false;
      seenRecurring.add(key);
      return true;
    })
    .map((t) => ({
      id: t.id,
      description: t.description || t.category,
      category: t.category,
      amount: t.amount,
      recurringFrequency: t.recurringFrequency ?? "monthly",
      weeklyEquivalent: toWeekly(t.amount, t.recurringFrequency ?? "monthly"),
    }));

  return {
    stats: { totalIncome, totalExpenses, totalSaved, savingsRate, incomeDelta, expensesDelta },
    comparison: { prevIncome, prevExpenses, prevSaved },
    monthlyData, categoryData, budgetProgress, upcomingBills, netWorth, totalGoalsSaved,
    recentTransactions: recentTransactions.map((t) => ({ ...t, date: t.date.toISOString(), createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })),
    goals: goals.map((g) => ({ ...g, deadline: g.deadline?.toISOString() ?? null, createdAt: g.createdAt.toISOString(), updatedAt: g.updatedAt.toISOString() })),
    splitData: { personalExpenses, businessExpenses },
    necessityData,
    recurringExpenses,
    isDemo: false,
  };
}

// ─── Snapshot message ──────────────────────────────────────────────────────────
function snapshotMessage(totalIncome: number, totalExpenses: number, totalSaved: number, prevIncome: number, prevExpenses: number, savingsRate: number): string {
  if (totalIncome === 0 && totalExpenses === 0) return "No transactions recorded this month yet. Add your first one to get started!";
  const expDiff = totalExpenses - prevExpenses;
  const parts: string[] = [];
  if (Math.abs(expDiff) > 10 && prevExpenses > 0) {
    parts.push(expDiff > 0
      ? `You spent ${formatCurrency(expDiff)} more than last month.`
      : `You spent ${formatCurrency(Math.abs(expDiff))} less than last month — nice work!`);
  }
  if (savingsRate >= 20) parts.push(`You're saving ${savingsRate}% of your income this month. Keep it up!`);
  else if (totalSaved > 0) parts.push(`You've saved ${formatCurrency(totalSaved)} so far this month.`);
  else if (totalSaved < 0) parts.push(`You're spending more than you earn this month — try to cut back.`);
  return parts.join(" ") || "Here's your financial summary for this month.";
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  let data;
  try {
    data = await getDashboardData();
  } catch (err: any) {
    if (err?.message?.includes("closed") || err?.code === "P1017") resetPrismaConnection();
    return <DashboardError />;
  }

  const { totalIncome, totalExpenses, totalSaved, savingsRate, incomeDelta, expensesDelta } = data.stats;
  const { prevIncome, prevExpenses, prevSaved } = data.comparison;
  const monthDaysLeft = differenceInDays(endOfMonth(new Date()), new Date());
  const msg = snapshotMessage(totalIncome, totalExpenses, totalSaved, prevIncome, prevExpenses, savingsRate);

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8">

      {/* Demo banner */}
      {data.isDemo && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <span className="text-base">✨</span>
          <p className="text-sm" style={{ color: "rgba(245,208,96,0.85)" }}>
            <span className="font-semibold" style={{ color: "#34D399" }}>You're seeing demo data.</span> Add your first transaction to start tracking your real finances.
          </p>
          <Link href="/transactions/new" className="ml-auto flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all btn-gold">
            Add transaction →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 mb-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's how your money is doing in {format(new Date(), "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="h-2 w-2 rounded-full bg-gold-500" />
          <span className="text-xs font-medium" style={{ color: "#10B981" }}>{monthDaysLeft} days left in month</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Money In"      value={formatCurrency(totalIncome)}          subtitle="Total income this month"      icon={TrendingUp}   delta={incomeDelta}   accent="emerald" />
        <StatCard title="Money Out"     value={formatCurrency(totalExpenses)}         subtitle="Total spending this month"    icon={TrendingDown} delta={expensesDelta} accent="red" invertDelta />
        <StatCard title="Saved This Month" value={formatCurrency(Math.max(0, totalSaved))} subtitle={totalSaved < 0 ? "Spending exceeds income" : "Left over after bills"} icon={PiggyBank} accent="blue" />
        <StatCard title="Savings Rate"  value={`${savingsRate}%`}                    subtitle="Of your income kept"          icon={Percent}                            accent="violet" />
      </div>

      {/* Monthly Snapshot + Net Worth */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Snapshot */}
        <div className="lg:col-span-2 rounded-xl p-5 shadow-card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.07), rgba(16,185,129,0.02))", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 text-base" style={{ background: "rgba(16,185,129,0.12)" }}>📊</div>
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Snapshot</h3>
              <p className="text-sm leading-relaxed mt-1" style={{ color: "#9CA3AF" }}>{msg}</p>
            </div>
          </div>
          {(prevIncome > 0 || prevExpenses > 0) && (
            <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}>
              {[
                { label: "Income",   current: totalIncome,   prev: prevIncome,   better: totalIncome >= prevIncome },
                { label: "Spending", current: totalExpenses, prev: prevExpenses, better: totalExpenses <= prevExpenses },
                { label: "Saved",    current: totalSaved,    prev: prevSaved,    better: totalSaved >= prevSaved },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <p className="text-[10px] mb-1" style={{ color: "rgba(156,163,175,0.7)" }}>{row.label}</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(row.current)}</p>
                  <p className={`text-[10px] mt-0.5 ${row.better ? "text-emerald-400" : "text-red-400"}`}>
                    vs {formatCurrency(row.prev)} last month
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Net Worth */}
        <div className="rounded-xl p-5 shadow-card gold-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(16,185,129,0.12)" }}>
              <Wallet className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Net Worth</h3>
              <p className="text-[11px]" style={{ color: "#6B7280" }}>Savings + goals combined</p>
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums mb-4 gold-glow" style={{ color: "#10B981" }}>{formatCurrency(data.netWorth)}</p>
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[10px]" style={{ color: "#6B7280" }}>
              <span>Progress toward $25,000</span>
              <span style={{ color: "#10B981" }}>{Math.min(100, Math.round((data.netWorth / 25000) * 100))}%</span>
            </div>
            <div className="h-[10px] w-full rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.round((data.netWorth / 25000) * 100))}%`, background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#6B7280" }}>In savings goals</span>
              <span className="font-semibold text-white">{formatCurrency(data.totalGoalsSaved)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#6B7280" }}>Saved this month</span>
              <span className={`font-semibold ${totalSaved >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(Math.max(0, totalSaved))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress + Upcoming Bills */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Budget Progress */}
        <div className="rounded-xl p-5 shadow-card gold-card">
          <SectionHeading title="Budget Progress" sub="How close you are to the spending limit per category" />
          {data.budgetProgress.length > 0 ? (
            <div className="space-y-4">
              {data.budgetProgress.map((item) => {
                const isOver    = item.pct > 100;
                const isWarning = item.pct >= 90 && !isOver;
                const barFill   = isOver ? "#EF4444" : "linear-gradient(90deg, #10B981, #34D399)";
                const barWidth  = Math.min(100, item.pct);
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs tabular-nums" style={{ color: "#6B7280" }}>
                          {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                        </span>
                        {isOver    && <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">Over budget</span>}
                        {isWarning && <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Almost there</span>}
                      </div>
                    </div>
                    <div className="h-[10px] w-full rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: barFill }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyCard message="No spending recorded yet this month." hint="Add an expense to see your budget breakdown." />
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="rounded-xl p-5 shadow-card gold-card">
          <SectionHeading title="Upcoming Bills" sub="Recurring expenses due soon this month" />
          {data.upcomingBills.length > 0 ? (
            <div className="space-y-2">
              {data.upcomingBills.map((bill) => {
                const isUrgent = bill.daysUntil <= 2;
                const isSoon   = bill.daysUntil <= 4 && !isUrgent;
                const urgencyText =
                  bill.daysUntil <= 0 ? "Overdue!" :
                  `Due in ${bill.daysUntil}d`;
                const urgencyColor = isUrgent ? "#EF4444" : isSoon ? "#f59e0b" : "#10B981";
                const leftBorderColor = isUrgent ? "#EF4444" : "#10B981";
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all"
                    style={{ borderLeft: `3px solid ${leftBorderColor}`, background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: "rgba(16,185,129,0.08)" }}>{bill.emoji}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{bill.description}</p>
                        <p className="text-[11px]" style={{ color: "#6B7280" }}>{bill.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] font-semibold" style={{ color: urgencyColor }}>{urgencyText}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: "#10B981" }}>{formatCurrency(bill.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyCard message="No recurring bills detected yet." hint="Bills in categories like Housing, Utilities, and Subscriptions will appear here." />
          )}
        </div>
      </div>

      {/* Recurring Expenses */}
      <RecurringExpensesSection items={data.recurringExpenses} />

      {/* Charts */}
      <DashboardCharts
        monthlyData={data.monthlyData}
        categoryData={data.categoryData}
        splitData={data.splitData}
        necessityData={data.necessityData}
      />

      {/* Recent Transactions + Goals */}
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-[11px] mt-0.5 ml-7" style={{ color: "#6B7280" }}>{sub}</p>
    </div>
  );
}

function EmptyCard({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm" style={{ color: "#6B7280" }}>{message}</p>
      <p className="text-xs mt-1" style={{ color: "rgba(107,114,128,0.6)" }}>{hint}</p>
    </div>
  );
}

type RecurringItem = { id: string; description: string; category: string; amount: number; recurringFrequency: string; weeklyEquivalent: number };

function RecurringExpensesSection({ items }: { items: RecurringItem[] }) {
  const totalWeekly      = items.reduce((s, i) => s + i.weeklyEquivalent, 0);
  const totalFortnightly = totalWeekly * 2;
  const totalMonthly     = (totalWeekly * 52) / 12;

  return (
    <div className="rounded-xl p-5 shadow-card gold-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
          <RefreshCw className="h-4 w-4" style={{ color: "#10B981" }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Recurring Expenses</h3>
          </div>
          <p className="text-[11px] ml-7 mt-0.5" style={{ color: "#6B7280" }}>Your committed regular costs</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm" style={{ color: "#6B7280" }}>No recurring expenses tagged yet.</p>
          <p className="text-xs mt-1" style={{ color: "rgba(107,114,128,0.6)" }}>Mark a transaction as "Recurring" when adding it to track your committed costs.</p>
        </div>
      ) : (
        <>
          {/* Summary totals */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Per week",      value: totalWeekly },
              { label: "Per fortnight", value: totalFortnightly },
              { label: "Per month",     value: totalMonthly },
            ].map((s) => (
              <div key={s.label} className="rounded-lg px-3 py-2.5 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                <p className="text-[10px] mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
                <p className="text-base font-bold tabular-nums text-white">{formatCurrency(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Callout */}
          <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="text-sm" style={{ color: "rgba(245,208,96,0.85)" }}>
              You need to set aside{" "}
              <span className="font-bold" style={{ color: "#34D399" }}>{formatCurrency(totalWeekly)}/week</span>
              {" "}·{" "}
              <span className="font-bold" style={{ color: "#34D399" }}>{formatCurrency(totalFortnightly)}/fortnight</span>
              {" "}·{" "}
              <span className="font-bold" style={{ color: "#34D399" }}>{formatCurrency(totalMonthly)}/month</span>
              {" "}to cover all your recurring expenses.
            </p>
          </div>

          {/* Item list */}
          <div style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.06)" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{item.description}</p>
                    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                      🔁 {item.recurringFrequency.charAt(0).toUpperCase() + item.recurringFrequency.slice(1)}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{item.category}</p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0 text-right">
                  <div>
                    <p className="text-[10px]" style={{ color: "#6B7280" }}>per week</p>
                    <p className="text-xs font-semibold tabular-nums" style={{ color: "#9CA3AF" }}>{formatCurrency(item.weeklyEquivalent)}</p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: "#6B7280" }}>amount</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color: "#10B981" }}>{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Couldn't load your dashboard</h2>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>We had trouble connecting to the database. Try refreshing.</p>
        <a href="/dashboard" className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all">
          Refresh page
        </a>
      </div>
    </div>
  );
}

type Accent = "emerald" | "red" | "blue" | "violet";

const accentIconColors: Record<Accent, { bg: string; color: string }> = {
  emerald: { bg: "rgba(16,185,129,0.1)",  color: "#10B981" },
  red:     { bg: "rgba(239,68,68,0.1)",   color: "#EF4444" },
  blue:    { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
  violet:  { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
};

function StatCard({ title, value, subtitle, icon: Icon, delta, accent = "blue", invertDelta = false }: {
  title: string; value: string; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  delta?: number; accent?: Accent; invertDelta?: boolean;
}) {
  const iconCfg   = accentIconColors[accent];
  const isPositive = invertDelta ? (delta !== undefined && delta <= 0) : (delta !== undefined && delta >= 0);
  const DeltaIcon  = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="stat-card relative rounded-xl overflow-hidden">
      {/* Gold top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: iconCfg.bg, color: iconCfg.color }}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          {delta !== undefined && (
            <div
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
              style={{
                background: isPositive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: isPositive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
                color: isPositive ? "#10B981" : "#EF4444",
              }}
            >
              <DeltaIcon className="h-3 w-3" />{Math.abs(delta)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight text-white tabular-nums">{value}</p>
        <p className="text-xs font-semibold mt-2" style={{ color: "#10B981" }}>{title}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{subtitle}</p>
      </div>
    </div>
  );
}
