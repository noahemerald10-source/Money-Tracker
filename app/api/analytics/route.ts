export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const now = new Date();

    // Last 6 months data
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
        income,
        expenses,
        saved,
        savingsRate,
        need,
        want,
        waste,
        personal,
        business,
      });
    }

    // All-time category breakdown
    const allTransactions = await prisma.transaction.findMany({
      where: { type: "expense" },
    });

    const categoryMap: Record<string, number> = {};
    allTransactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Savings trend
    const savingsTrend = monthlyData.map((d) => ({
      month: d.month,
      saved: d.saved,
      savingsRate: d.savingsRate,
    }));

    // Need/Want/Waste totals
    const needWantWasteData = monthlyData.map((d) => ({
      month: d.month,
      Need: d.need,
      Want: d.want,
      Waste: d.waste,
    }));

    // Personal vs business monthly
    const personalVsBusinessData = monthlyData.map((d) => ({
      month: d.month,
      Personal: d.personal,
      Business: d.business,
    }));

    return NextResponse.json({
      monthlyData,
      categoryData,
      savingsTrend,
      needWantWasteData,
      personalVsBusinessData,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
