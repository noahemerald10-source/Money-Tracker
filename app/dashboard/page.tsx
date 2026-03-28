import { prisma } from '@/lib/prisma'
import MonthlyBarChart, { type MonthlyDataPoint } from './MonthlyBarChart'
import CategoryPieChart, { type CategoryDataPoint } from './CategoryPieChart'

export default async function DashboardPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  })

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const net = income - expenses
  const recent = transactions.slice(0, 10)

  // Monthly chart data (last 6 months)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() }
  })

  const monthlyData: MonthlyDataPoint[] = months.map(({ label, year, month }) => {
    const mx = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    return {
      label,
      income: mx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: mx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  // Category breakdown (expenses only, top 8)
  const categoryMap: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount
    })

  const pieData: CategoryDataPoint[] = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
      percentage: expenses > 0 ? Math.round((value / expenses) * 100) : 0,
    }))

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const tagClass: Record<string, string> = {
    need: 'tag-pill tag-need',
    want: 'tag-pill tag-want',
    waste: 'tag-pill tag-waste',
  }

  return (
    <div className="min-h-screen bg-background text-white px-4 py-6 sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.02em] leading-none text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <a
            href="/transactions"
            className="btn-gold rounded-xl px-4 py-2.5 text-sm font-semibold hidden sm:flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Transaction
          </a>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <div className="stat-card rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Income</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M6 10V2M2 6l4-4 4 4" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[1.6rem] font-semibold text-emerald-400 tabular-nums tracking-[-0.02em] leading-none">${fmt(income)}</p>
              <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">All time</p>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Expenses</span>
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6l4 4 4-4" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[1.6rem] font-semibold text-rose-400 tabular-nums tracking-[-0.02em] leading-none">${fmt(expenses)}</p>
              <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">All time</p>
            </div>
          </div>

          <div className={`${net >= 0 ? 'stat-card-positive' : 'stat-card'} rounded-2xl p-5 flex flex-col gap-5`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Net Balance</span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${net >= 0 ? 'bg-emerald-500/[0.12]' : 'bg-rose-500/10'}`}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke={net >= 0 ? '#10B981' : '#f43f5e'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className={`text-[1.6rem] font-semibold tabular-nums tracking-[-0.02em] leading-none ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {net >= 0 ? '+' : '−'}${fmt(Math.abs(net))}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">
                {net >= 0 ? 'Surplus' : 'Deficit'}
                {income > 0 && (
                  <span className="ml-1.5 text-zinc-700">
                    · {Math.round((net / income) * 100)}% rate
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Transactions</span>
              <div className="w-6 h-6 rounded-lg bg-zinc-800/70 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1.5" width="10" height="1.5" rx="0.75" fill="#52525b"/>
                  <rect x="1" y="5"   width="7"  height="1.5" rx="0.75" fill="#52525b"/>
                  <rect x="1" y="8.5" width="9"  height="1.5" rx="0.75" fill="#52525b"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[1.6rem] font-semibold text-white tabular-nums tracking-[-0.02em] leading-none">{transactions.length}</p>
              <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">Recorded</p>
            </div>
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Monthly overview */}
          <div className="card-section rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-[-0.01em]">6-Month Overview</h2>
                <p className="text-xs text-zinc-600 mt-0.5">Income vs Expenses</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/60" />
                  Expenses
                </span>
              </div>
            </div>
            <MonthlyBarChart data={monthlyData} />
          </div>

          {/* Category breakdown */}
          <div className="card-section rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white tracking-[-0.01em]">Spending by Category</h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                {pieData.length > 0
                  ? `${pieData.length} categories · expenses only`
                  : 'Breakdown of expenses'}
              </p>
            </div>
            <CategoryPieChart data={pieData} total={expenses} />
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="card-section rounded-2xl overflow-hidden">

          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/[0.05]">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-[-0.01em]">Recent Transactions</h2>
              {transactions.length > 0 && (
                <p className="text-xs text-zinc-600 mt-0.5">{recent.length} of {transactions.length}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {transactions.length > 10 && (
                <a href="/transactions" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-150">
                  View all →
                </a>
              )}
              <a href="/transactions" className="sm:hidden btn-gold rounded-lg px-3 py-1.5 text-xs">
                + Add
              </a>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#3f3f46" strokeWidth="1.5"/>
                  <path d="M3 9h18" stroke="#3f3f46" strokeWidth="1.5"/>
                  <path d="M8 14h5M8 17h3" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-white font-medium text-sm">No transactions yet</p>
              <p className="text-zinc-600 text-xs mt-1.5 mb-5 max-w-[220px] leading-relaxed">
                Add your first transaction to start tracking your finances.
              </p>
              <a href="/transactions" className="btn-gold rounded-xl px-5 py-2.5 text-sm font-semibold">
                Record a Transaction
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-x-4 px-4 sm:px-6 py-2.5 border-b border-white/[0.04]">
                <span />
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-600">Description</span>
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-600 hidden sm:block">Label</span>
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-600 hidden sm:block">Date</span>
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-600 text-right">Amount</span>
              </div>

              <div>
                {recent.map((t) => {
                  const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const necessity = (t.necessityLabel as string) ?? ''
                  const initial = (t.category || 'T').charAt(0).toUpperCase()
                  return (
                    <div
                      key={t.id}
                      className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-x-4 items-center px-4 sm:px-6 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-100"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold select-none ${
                        t.type === 'income' ? 'bg-emerald-500/[0.12] text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate leading-tight">{t.description || t.category}</p>
                        <p className="text-[11px] text-zinc-600 truncate mt-0.5">{t.category}</p>
                      </div>
                      <div className="hidden sm:block">
                        {necessity
                          ? <span className={tagClass[necessity] ?? 'tag-pill tag-need'}>{necessity}</span>
                          : <span className="text-zinc-700 text-xs">—</span>}
                      </div>
                      <span className="text-xs text-zinc-600 tabular-nums hidden sm:block whitespace-nowrap">{date}</span>
                      <span className={`text-sm font-semibold tabular-nums text-right tracking-[-0.01em] ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {t.type === 'income' ? '+' : '−'}${fmt(t.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
