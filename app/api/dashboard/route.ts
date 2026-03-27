export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Current month totals
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    });

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSaved = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((totalSaved / totalIncome) * 100)) : 0;

    // Last 6 months chart data
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

      monthlyData.push({
        month: format(date, "MMM yyyy"),
        income,
        expenses,
        saved: income - expenses,
      });
    }

    // Spending by category (current month)
    const expensesByCategory: Record<string, number> = {};
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const categoryData = Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });

    // Savings goals
    const goals = await prisma.savingsGoal.findMany({
      orderBy: { priority: "desc" },
      take: 4,
    });

    // Personal vs Business split (current month expenses)
    const personalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.financeMode === "personal")
      .reduce((s, t) => s + t.amount, 0);
    const businessExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.financeMode === "business")
      .reduce((s, t) => s + t.amount, 0);

    // Need/Want/Waste breakdown
    const needSpending = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.necessityLabel === "need")
      .reduce((s, t) => s + t.amount, 0);
    const wantSpending = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.necessityLabel === "want")
      .reduce((s, t) => s + t.amount, 0);
    const wasteSpending = currentMonthTransactions
      .filter((t) => t.type === "expense" && t.necessityLabel === "waste")
      .reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      stats: { totalIncome, totalExpenses, totalSaved, savingsRate },
      monthlyData,
      categoryData,
      recentTransactions,
      goals,
      splitData: { personalExpenses, businessExpenses },
      necessityData: [
        { name: "Need", value: needSpending },
        { name: "Want", value: wantSpending },
        { name: "Waste", value: wasteSpending },
      ],
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
