import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from '@/components/analytics/analytics-client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Not signed in.</p>
      </div>
    )
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  const expenses   = transactions.filter((t) => t.type === 'expense')
  const incomeList = transactions.filter((t) => t.type === 'income')

  // ── Monthly data (last 12 months) ───────────────────────────────────────
  const now = new Date()
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month      = subMonths(now, 11 - i)
    const monthStart = startOfMonth(month)
    const monthEnd   = endOfMonth(month)

    const mExp = expenses.filter((t) => {
      const d = new Date(t.date)
      return d >= monthStart && d <= monthEnd
    })
    const mInc = incomeList.filter((t) => {
      const d = new Date(t.date)
      return d >= monthStart && d <= monthEnd
    })

    const totalExp = mExp.reduce((s, t) => s + t.amount, 0)
    const totalInc = mInc.reduce((s, t) => s + t.amount, 0)
    const saved = totalInc - totalExp
    const savingsRate = totalInc > 0 ? Math.round((saved / totalInc) * 100) : 0

    return {
      month: format(month, 'MMM'),
      income: totalInc,
      expenses: totalExp,
      saved,
      savingsRate,
    }
  })

  // ── Category breakdown (expenses only) ──────────────────────────────────
  const catMap = new Map<string, number>()
  expenses.forEach((t) => {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount)
  })
  const categoryData = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // ── Necessity breakdown (expenses only) ──────────────────────────────────
  const nec = { need: 0, want: 0, waste: 0 }
  expenses.forEach((t) => {
    const lbl = t.necessityLabel as keyof typeof nec
    if (lbl in nec) nec[lbl] += t.amount
  })
  const necessityData = [
    { name: 'Need',  key: 'need',  value: nec.need  },
    { name: 'Want',  key: 'want',  value: nec.want  },
    { name: 'Waste', key: 'waste', value: nec.waste },
  ]

  const totalIncome   = incomeList.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)

  return (
    <AnalyticsClient
      data={{
        monthly,
        categoryData,
        necessityData,
        summary: {
          totalIncome,
          totalExpenses,
          totalTransactions: transactions.length,
        },
      }}
    />
  )
}
