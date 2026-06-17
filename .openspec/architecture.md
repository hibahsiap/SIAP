# Architecture

## Implemented Architecture
The current implementation is a monolithic **Next.js App Router** application. It employs Server-Side Rendering (SSR) for the frontend and Next.js API Routes (`app/api/*`) for backend logic, interfacing directly with a PostgreSQL database via Prisma ORM.

> [!WARNING]
> **Architectural Discrepancy**: `AGENTS.md` mandates that "Frontend tidak boleh berisi business logic utama. Business logic berada di backend NestJS." Currently, there is no NestJS backend in this repository; the Next.js application houses all routing, classification, and database logic.

## Directory Structure
- `app/`: Contains the Next.js App Router pages and API routes.
  - `(auth)/`: Authentication flows.
  - `admin/`: Admin dashboards.
  - `opd/`: OPD dashboards.
  - `api/`: All implemented backend API routes (e.g., tickets, ai, webhooks).
- `components/`: Reusable React components.
- `lib/`: Utility functions, Prisma configuration, Supabase clients, and Groq SDK initialization.
- `prisma/`: Database schema definitions (`schema.prisma`).

## Authentication & Authorization
- **Implementation**: Uses JWT (via the `jose` library) validated inside Next.js `middleware.ts`.
- **Flow**: Unauthenticated requests to protected routes (`/dashboard/:path*`) are redirected to `/login`. Token verification failures clear the cookie and redirect to login.
- **Roles**: Two roles are defined and utilized: `ADMIN` and `OPD`.
