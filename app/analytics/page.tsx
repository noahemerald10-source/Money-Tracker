import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

async function getAnalyticsData() {
  const now = new Date();

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const txns = await prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
    });

    const income = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const saved = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, Math.round((saved / income) * 100)) : 0;
    const need = txns.filter((t) => t.type === "expense" && t.necessityLabel === "need").reduce((s, t) => s + t.amount, 0);
    const want = txns.filter((t) => t.type === "expense" && t.necessityLabel === "want").reduce((s, t) => s + t.amount, 0);
    const waste = txns.filter((t) => t.type === "expense" && t.necessityLabel === "waste").reduce((s, t) => s + t.amount, 0);
    const personal = txns.filter((t) => t.type === "expense" && t.financeMode === "personal").reduce((s, t) => s + t.amount, 0);
    const business = txns.filter((t) => t.type === "expense" && t.financeMode === "business").reduce((s, t) => s + t.amount, 0);

    monthlyData.push({
      month: format(date, "MMM yy"),
      income: Math.round(income),
      expenses: Math.round(expenses),
      saved: Math.round(saved),
      savingsRate,
      need: Math.round(need),
      want: Math.round(want),
      waste: Math.round(waste),
      personal: Math.round(personal),
      business: Math.round(business),
    });
  }

  // Category breakdown (all time)
  const allExpenses = await prisma.transaction.findMany({
    where: { type: "expense" },
  });
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return { monthlyData, categoryData };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsClient data={data} />;
}
