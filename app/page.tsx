export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-sm px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 mx-auto mb-6 shadow-lg shadow-blue-500/25">
          <span className="text-white text-xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">MoneyTrack</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your personal finance dashboard. Track income, expenses, and savings goals in one place.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/dashboard"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get started for free
          </a>
          <a
            href="/dashboard"
            className="rounded-xl border border-border/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
