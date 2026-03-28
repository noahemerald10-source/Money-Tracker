# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Sync Prisma schema to database (no migration file)
npm run db:seed      # Seed database with sample data
npx prisma migrate dev  # Create and apply a migration
npx prisma studio    # Open database GUI
```

No test suite is configured.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth keys
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, etc.

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Prisma + PostgreSQL (Neon) · Clerk auth · TailwindCSS · Radix UI · Recharts

### Data Model

Three core Prisma models in `prisma/schema.prisma`:
- **Transaction** — income/expense with category, `necessity` (need/want/waste), `financeMode` (personal/business), optional recurrence
- **SavingsGoal** — goal with target amount, deadline, priority
- **WeeklyReview** — weekly financial summary with income, expenses, waste spending, and improvement notes

### Auth

Clerk handles all auth. `middleware.ts` uses `clerkMiddleware()` to protect all routes except `/`, `/sign-in`, and `/sign-up`. After sign-in, users are redirected to `/dashboard`. Server-side auth state is retrieved via `auth()` from `@clerk/nextjs/server`.

### API Routes

All data mutations go through `/app/api/*` route handlers. Input is validated with Zod schemas before hitting Prisma. Key routes: `/api/transactions`, `/api/goals`, `/api/dashboard`, `/api/analytics`, `/api/weekly-review`.

### Component Structure

- `/components/ui/` — Radix UI + Tailwind primitives (Dialog, Select, Toast, etc.)
- `/components/layout/` — Sidebar navigation (client component)
- `/components/{feature}/` — Feature-specific components (dashboard, transactions, goals, analytics, weekly-review)

### Styling

TailwindCSS dark mode with a custom gold/green palette. Primary green: `#10B981` / `#34D399`. A `gold-glow` box-shadow utility is defined in `tailwind.config.ts` for card highlights.

### Prisma Client

Singleton pattern in `lib/prisma.ts` — reuses instance in development (avoids hot-reload connection exhaustion), creates fresh instance in production.
