# Project Specification

## SIAP (Sistem Informasi Aduan Publik)
SIAP adalah sistem layanan dan monitoring aduan masyarakat terintegrasi berbasis web.

### Tujuan Sistem
- Sentralisasi aduan masyarakat
- Klasifikasi aduan otomatis menggunakan LLM
- Distribusi aduan ke OPD terkait
- Monitoring progres penyelesaian
- Transparansi status penanganan

## Implemented Technology Stack
Currently, the repository is implemented as a fullstack Next.js application, which differs from the mandated architecture in `AGENTS.md`.

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, Radix UI, Shadcn
- **State Management**: Zustand
- **Database ORM**: Prisma Client v7.8.0
- **Database Engine**: PostgreSQL
- **Authentication**: JWT (jose), bcryptjs
- **External Services**: Supabase (Storage), Groq SDK (AI Classification)
- **Icons**: Boxicons, Lucide React, React Icons

## Local Development
- `npm run dev`: Starts the Next.js development server (runs on port 3000 by default, though AGENTS.md specifies Frontend on 3000 and Backend on 3001).
- `npm run build`: Builds the production bundle.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint.
