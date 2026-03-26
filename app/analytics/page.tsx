import { prisma, resetPrismaConnection } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { formatCurrency, calcSavingsRate } from "@/lib/utils";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { AlertCircle } from "lucide-react";

async function getAnalyticsData() {
  const now = new Date();

  // Fetch 12 months of data
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const txns = await prisma.transaction.findMany({
      where: { date: { gte: startOfMonth(date), lte: endOfMonth(date) } },
    });
    const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    monthly.push({
      month: format(date, "MMM yy"),
      income, expenses,
      saved: income - expenses,
      savingsRate: calcSavingsRate(income, expenses),
    });
  }

  // All-time category breakdown
  const allTxns = await prisma.transaction.findMany({ where: { type: "expense" } });
  const byCategory: Record<string, number> = {};
  allTxns.forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Necessity breakdown all-time
  const necessityData = [
    { name: "Essential", key: "need", value: allTxns.filter((t) => t.necessityLabel === "need").reduce((s, t) => s + t.amount, 0) },
    { name: "Nice to Have", key: "want", value: allTxns.filter((t) => t.necessityLabel === "want").reduce((s, t) => s + t.amount, 0) },
    { name: "Wasteful", key: "waste", value: allTxns.filter((t) => t.necessityLabel === "waste").reduce((s, t) => s + t.amount, 0) },
  ];

  // Top spending months
  const allIncome = allTxns.length;
  const totalAllTimeIncome = await prisma.transaction.aggregate({ where: { type: "income" }, _sum: { amount: true } });
  const totalAllTimeExpenses = await prisma.transaction.aggregate({ where: { type: "expense" }, _sum: { amount: true } });
  const totalTransactions = await prisma.transaction.count();

  return {
    monthly,
    categoryData,
    necessityData,
    summary: {
      totalIncome: totalAllTimeIncome._sum.amount ?? 0,
      totalExpenses: totalAllTimeExpenses._sum.amount ?? 0,
      totalTransactions,
    },
  };
}

export default async function AnalyticsPage() {
  let data;
  try {
    data = await getAnalyticsData();
  } catch (err: any) {
    if (err?.message?.includes("closed") || err?.code === "P1017") resetPrismaConnection();
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Couldn't load analytics</h2>
          <p className="text-sm text-muted-foreground mb-4">Try refreshing the page.</p>
          <a href="/analytics" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Refresh</a>
        </div>
      </div>
    );
  }

  return <AnalyticsClient data={data} />;
}
