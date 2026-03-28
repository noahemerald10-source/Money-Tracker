'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Transaction = {
  id: string
  type: string
  amount: number
  category: string
  subcategory?: string | null
  description?: string | null
  date: string
  financeMode: string
  necessityLabel: string
  isRecurring?: boolean
  recurringFrequency?: string | null
}

type GroupedTransactions = {
  label: string
  items: Transaction[]
}

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/50 focus:bg-white/[0.05]'

const selectClass =
  'h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.05]'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function groupTransactionsByMonth(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, Transaction[]>()

  for (const tx of transactions) {
    const d = new Date(tx.date)
    const label = d.toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
    })
    const existing = groups.get(label) ?? []
    existing.push(tx)
    groups.set(label, existing)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }))
}

export default function TransactionsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [necessityFilter, setNecessityFilter] = useState('all')

  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    financeMode: 'personal',
    necessityLabel: 'need',
    isRecurring: false,
    recurringFrequency: '',
  })

  const loadTransactions = async () => {
    try {
      setFetching(true)
      const res = await fetch('/api/transactions', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      const items = Array.isArray(data) ? data : data.transactions ?? []
      setTransactions(items)
    } catch (error) {
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      })

      if (!res.ok) throw new Error('Failed to save transaction')

      setForm({
        type: 'expense',
        amount: '',
        category: '',
        subcategory: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        financeMode: 'personal',
        necessityLabel: 'need',
        isRecurring: false,
        recurringFrequency: '',
      })

      await loadTransactions()
    } catch (error) {
      console.error(error)
      alert('Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this transaction?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      await loadTransactions()
    } catch (error) {
      console.error(error)
      alert('Failed to delete transaction')
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesQuery =
        query.trim() === '' ||
        tx.category.toLowerCase().includes(query.toLowerCase()) ||
        (tx.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (tx.subcategory ?? '').toLowerCase().includes(query.toLowerCase())

      const matchesType = typeFilter === 'all' || tx.type === typeFilter
      const matchesNecessity =
        necessityFilter === 'all' || tx.necessityLabel === necessityFilter

      return matchesQuery && matchesType && matchesNecessity
    })
  }, [transactions, query, typeFilter, necessityFilter])

  const grouped = useMemo(
    () => groupTransactionsByMonth(filteredTransactions),
    [filteredTransactions]
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/8 bg-white/[0.02] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-400/70">
                MoneyTrack
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Add Transaction
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Record a new income or expense.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  {['expense', 'income'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('type', type)}
                      className={`h-11 rounded-xl text-sm font-medium transition ${
                        form.type === type
                          ? 'bg-emerald-500 text-black shadow-[0_12px_30px_rgba(16,185,129,0.35)]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Food, Rent, Salary"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Description <span className="normal-case tracking-normal">— optional</span>
                </label>
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Mode
                  </label>
                  <select
                    value={form.financeMode}
                    onChange={(e) => updateField('financeMode', e.target.value)}
                    className={selectClass}
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Necessity
                  </label>
                  <select
                    value={form.necessityLabel}
                    onChange={(e) => updateField('necessityLabel', e.target.value)}
                    className={selectClass}
                  >
                    <option value="need">Need</option>
                    <option value="want">Want</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <label className="flex items-center gap-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={form.isRecurring}
                    onChange={(e) => updateField('isRecurring', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-emerald-500"
                  />
                  This is a recurring transaction
                </label>

                {form.isRecurring && (
                  <div className="mt-4">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      Frequency
                    </label>
                    <select
                      value={form.recurringFrequency}
                      onChange={(e) => updateField('recurringFrequency', e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </aside>

          <section className="rounded-[28px] border border-white/8 bg-white/[0.02] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="border-b border-white/8 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                    Transactions
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Transaction History
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Manage and review your logged transactions.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`${inputClass} min-w-[180px]`}
                  />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All types</option>
                    <option value="expense">Expenses</option>
                    <option value="income">Income</option>
                  </select>
                  <select
                    value={necessityFilter}
                    onChange={(e) => setNecessityFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All labels</option>
                    <option value="need">Need</option>
                    <option value="want">Want</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-6 lg:px-8">
              {fetching ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-12 text-center text-zinc-400">
                  Loading transactions...
                </div>
              ) : grouped.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-14 text-center">
                  <p className="text-lg font-medium text-white">No transactions yet</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Logged transactions will appear here once you save them.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {grouped.map((group) => (
                    <div
                      key={group.label}
                      className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.015]"
                    >
                      <div className="border-b border-white/8 px-5 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            {group.label}
                          </h3>
                          <span className="text-xs text-zinc-500">
                            {group.items.length} item{group.items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.9fr_1fr_0.9fr_0.9fr] border-b border-white/8 px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-zinc-500 lg:grid">
                        <div>Category / Note</div>
                        <div>Date</div>
                        <div>Type</div>
                        <div>Mode</div>
                        <div>Amount</div>
                        <div>Necessity</div>
                        <div className="text-right">Actions</div>
                      </div>

                      <div>
                        {group.items.map((tx) => (
                          <div
                            key={tx.id}
                            className="border-b border-white/6 px-5 py-4 transition last:border-b-0 hover:bg-white/[0.025] sm:px-6"
                          >
                            <div className="lg:hidden">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium text-white">{tx.category}</p>
                                  <p className="mt-1 text-sm text-zinc-400">
                                    {tx.description || 'No description'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">
                                    {formatCurrency(tx.amount)}
                                  </p>
                                  <p className="mt-1 text-xs text-zinc-500">
                                    {formatDateLabel(tx.date)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                                  {tx.type}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                                  {tx.financeMode}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                                  {tx.necessityLabel}
                                </span>
                                {tx.isRecurring && (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                                    {tx.recurringFrequency || 'Recurring'}
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 flex gap-2">
                                <Link
                                  href={`/transactions/${tx.id}/edit`}
                                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(tx.id)}
                                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/15"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.9fr_1fr_0.9fr_0.9fr] items-center gap-4 lg:grid">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-white">
                                  {tx.category}
                                </p>
                                <p className="mt-1 truncate text-sm text-zinc-400">
                                  {tx.description || 'No description'}
                                </p>
                              </div>

                              <div className="text-sm text-zinc-300">
                                {formatDateLabel(tx.date)}
                              </div>

                              <div>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                                  {tx.type}
                                </span>
                              </div>

                              <div className="text-sm text-zinc-300">
                                {tx.financeMode}
                              </div>

                              <div className="font-semibold text-white">
                                {formatCurrency(tx.amount)}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                                  {tx.necessityLabel}
                                </span>
                                {tx.isRecurring && (
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                                    {tx.recurringFrequency || 'Recurring'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/transactions/${tx.id}/edit`}
                                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(tx.id)}
                                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/15"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
