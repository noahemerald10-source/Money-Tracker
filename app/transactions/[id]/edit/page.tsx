'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function EditTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [fetching, setFetching]               = useState(true)
  const [type, setType]                       = useState<'expense' | 'income'>('expense')
  const [amount, setAmount]                   = useState('')
  const [date, setDate]                       = useState('')
  const [category, setCategory]               = useState('')
  const [description, setDescription]         = useState('')
  const [financeMode, setFinanceMode]         = useState<'personal' | 'business'>('personal')
  const [necessityLabel, setNecessityLabel]   = useState<'need' | 'want' | 'waste'>('need')
  const [isRecurring, setIsRecurring]         = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('monthly')
  const [status, setStatus]                   = useState<Status>('idle')

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then((r) => r.json())
      .then((t) => {
        setType(t.type)
        setAmount(String(t.amount))
        setDate(new Date(t.date).toISOString().split('T')[0])
        setCategory(t.category ?? '')
        setDescription(t.description ?? '')
        setFinanceMode(t.financeMode ?? 'personal')
        setNecessityLabel(t.necessityLabel ?? 'need')
        setIsRecurring(t.isRecurring ?? false)
        setRecurringFrequency(t.recurringFrequency ?? 'monthly')
      })
      .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          date: new Date(date).toISOString(),
          category,
          description,
          financeMode,
          necessityLabel,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setTimeout(() => router.push('/transactions'), 1200)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3500)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-700 focus:border-emerald-500/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-150'

  const selectClass =
    'w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-10 text-sm text-white focus:border-emerald-500/40 focus:outline-none focus:bg-white/[0.04] transition-all duration-150'

  return (
    <div className="min-h-screen bg-background text-white px-8 py-10 md:px-10">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <a
            href="/transactions"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-150 mb-5"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Transactions
          </a>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-white leading-none">
            Edit Transaction
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Update the details below and save.</p>
        </div>

        {fetching ? (
          <div className="card-section rounded-2xl px-6 py-16 flex items-center justify-center">
            <div className="flex items-center gap-2.5 text-zinc-600 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-emerald-500 animate-spin" />
              Loading…
            </div>
          </div>
        ) : (
          <div className="card-section rounded-2xl overflow-hidden">

            {/* Type toggle */}
            <div className="px-6 pt-5 pb-5 border-b border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-3">
                Transaction Type
              </p>
              <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 gap-1">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${
                      type === t
                        ? t === 'income'
                          ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/20'
                          : 'bg-rose-500/90 text-white shadow-sm shadow-rose-500/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-zinc-600 text-sm border-r border-white/[0.06] pointer-events-none select-none">
                      $
                    </span>
                    <input
                      type="number" step="0.01" min="0" placeholder="0.00"
                      value={amount} onChange={(e) => setAmount(e.target.value)} required
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                    Date
                  </label>
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                  Category
                </label>
                <input
                  type="text" placeholder="e.g. Food, Rent, Salary"
                  value={category} onChange={(e) => setCategory(e.target.value)} required
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                  Description{' '}
                  <span className="normal-case font-normal tracking-normal text-zinc-700">— optional</span>
                </label>
                <input
                  type="text" placeholder="Add a note..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.05] -mx-6" />

              {/* Mode + Necessity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                    Mode
                  </label>
                  <div className="relative">
                    <select
                      value={financeMode}
                      onChange={(e) => setFinanceMode(e.target.value as 'personal' | 'business')}
                      className={selectClass}
                    >
                      <option value="personal">Personal</option>
                      <option value="business">Business</option>
                    </select>
                    <Chevron />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                    Necessity
                  </label>
                  <div className="relative">
                    <select
                      value={necessityLabel}
                      onChange={(e) => setNecessityLabel(e.target.value as 'need' | 'want' | 'waste')}
                      className={selectClass}
                    >
                      <option value="need">Need</option>
                      <option value="want">Want</option>
                      <option value="waste">Waste</option>
                    </select>
                    <Chevron />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.05] -mx-6" />

              {/* Recurring */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                  Schedule
                </p>

                <button
                  type="button"
                  onClick={() => setIsRecurring((v) => !v)}
                  className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                    isRecurring
                      ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`relative w-8 h-[18px] rounded-full flex-shrink-0 transition-colors duration-200 ${isRecurring ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all duration-200 ${isRecurring ? 'left-[18px]' : 'left-[2px]'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">Recurring transaction</span>
                  {isRecurring && (
                    <span className="ml-auto text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">On</span>
                  )}
                </button>

                {isRecurring && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                      Frequency
                    </label>
                    <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 gap-1">
                      {(['weekly', 'fortnightly', 'monthly'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setRecurringFrequency(f)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${
                            recurringFrequency === f
                              ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/20'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-1 space-y-3">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="btn-gold w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide"
                >
                  {status === 'loading' ? 'Saving…' : status === 'success' ? 'Saved!' : 'Save Changes'}
                </button>

                <a
                  href="/transactions"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3.5 text-sm text-zinc-500 hover:border-white/10 hover:text-zinc-300 transition-all duration-150"
                >
                  Cancel
                </a>

                {status === 'success' && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] px-4 py-3">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="#10B981" strokeWidth="1.5"/>
                      <path d="M4.5 7l2 2 3-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-sm text-emerald-400 font-medium">Changes saved. Redirecting…</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.07] px-4 py-3">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="#f43f5e" strokeWidth="1.5"/>
                      <path d="M7 4.5v3M7 9.5v.5" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p className="text-sm text-rose-400 font-medium">Something went wrong. Please try again.</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

function Chevron() {
  return (
    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
