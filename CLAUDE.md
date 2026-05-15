# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint check
npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed database
npx prisma studio        # Open Prisma visual editor
```

No test framework is configured.

## Architecture

**SIAP** (Sistem Informasi Aspirasi Publik) is a Next.js 16 App Router fullstack app for managing public grievance tickets. It has two separate user roles with distinct interfaces: **Admin** and **OPD** (Organisasi Perangkat Daerah).

### Routing

- `app/(auth)/login/` — public auth page
- `app/admin/dashboard/` — admin interface (tickets, users, reports, settings, chat)
- `app/opd/dashboard/` — OPD interface (kanban board, inbox, tasks, reports)
- `app/api/` — API routes (auth, users, profile)
- `middleware.ts` — JWT verification protecting `/dashboard/*`; redirects unauthenticated users to `/login`

Role enforcement happens in two places: middleware (cookie JWT check) and individual API route handlers (`auth.role === 'admin'`).

### Data & State

- **Database**: PostgreSQL via Supabase, accessed through Prisma with `@prisma/adapter-pg`. Singleton in `lib/prisma.ts`.
- **Auth**: JWT (HS256, 7-day expiry) in httpOnly cookies. Helpers in `lib/auth.ts`: `signToken`, `verifyToken`, `getAuthUser`.
- **State**: Zustand stores in `store/` — `useUserStore` (user CRUD + modal state), `useTaskStore` (UI state), `useReturnStore` (ticket return modal). Stores call `fetch()` directly; there is no centralized API client.
- **Some pages use dummy data** (`lib/dummy/`): `ticketsDummy.tsx`, `taskDummy.ts`, `chatData.ts`. These are placeholders not yet wired to real API endpoints.

### UI

- **shadcn/ui** (`components/ui/`) + Radix UI primitives for base components
- **Tailwind CSS 4** for styling; CSS variables for theming; dark/light mode via `next-themes`
- **Recharts** for charts, **Framer Motion** for animations
- Primary brand colors: navy `#041942`, teal accents
- Reusable table components: `TableTemplate` and `TableTemplate2` (search, pagination, custom cell renderers)

### Environment Variables

```
DATABASE_URL          # Supabase PostgreSQL (pooled)
DIRECT_URL            # Supabase PostgreSQL (direct, for migrations)
JWT_SECRET            # JWT signing key
JWT_EXPIRES_IN        # e.g. "7d"
ALLOWED_ORIGIN        # CORS whitelist
```
