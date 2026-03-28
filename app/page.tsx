export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">

      {/* Single ambient glow — top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-64 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 text-center max-w-xl px-6 fade-up">

        {/* Logo mark */}
        <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <polyline points="3 17 8 10 13 13 18 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20.5" cy="5" r="1.5" fill="#34D399"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1 mb-7">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[11px] font-medium text-zinc-400 tracking-wide uppercase">
            Personal Finance
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[3.5rem] md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.06] mb-5">
          Financial clarity,
          <br />
          <span className="gold-text">redesigned.</span>
        </h1>

        <p className="text-zinc-500 text-[1.05rem] leading-[1.7] mb-9 max-w-sm mx-auto">
          Track income, expenses, and net balance.
          Built for people who take their finances seriously.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-stretch sm:items-center">
          <a
            href="/dashboard"
            className="btn-gold rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide"
          >
            Open Dashboard →
          </a>
          <a
            href="/transactions"
            className="rounded-xl border border-white/8 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-zinc-400 hover:border-white/12 hover:bg-white/[0.05] hover:text-zinc-200 transition-all duration-150"
          >
            Add Transaction
          </a>
        </div>

        {/* Feature list */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            'Income & Expenses',
            'Net Balance',
            'Need / Want / Waste',
            'Business Mode',
            'Savings Goals',
          ].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {f}
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-700">
          No account required — open and use instantly.
        </p>
      </div>
    </main>
  )
}
