# CuroSCM Development Standards

## Project Overview
CuroSCM is a Supply Chain Management SaaS for project-based procurement in engineering, construction, and energy (EPC) sectors. Built with Next.js 16 (App Router) + Supabase.

## Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js Server Actions + Route Handlers, Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State:** TanStack React Query (server state), Zustand (client state)
- **Tables:** TanStack Table
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## Architecture

### Route Groups
- `src/app/(auth)/` — Login, signup, invite pages (no sidebar)
- `src/app/(app)/` — Main app with sidebar + top nav
- `src/app/api/` — Route handlers for complex operations (PDF generation, imports, exports)

### Data Access Pattern
- Use Supabase client directly from Server Components and Server Actions for CRUD
- Route Handlers for complex multi-table operations
- RLS enforces tenant isolation at the database level
- All tables use `organization_id` for multi-tenancy

### File Organization
- `src/components/ui/` — shadcn/ui primitives (do not modify directly)
- `src/components/layout/` — Sidebar, top nav, breadcrumbs
- `src/components/shared/` — Reusable business components (NotesPanel, FilesPanel, TasksPanel, etc.)
- `src/components/data-table/` — TanStack Table wrappers
- `src/lib/supabase/` — Supabase client configurations
- `src/lib/auth/` — RBAC utilities
- `src/lib/types/` — Generated DB types + domain types
- `src/hooks/` — Custom React hooks
- `src/actions/` — Server Actions by domain

## Coding Standards

### TypeScript
- Strict mode enabled
- Use generated Supabase types from `src/lib/types/database.ts`
- Prefer `interface` for object shapes, `type` for unions/intersections
- No `any` types — use `unknown` and narrow

### Components
- Server Components by default, Client Components only when needed (interactivity, hooks, browser APIs)
- Mark client components with `"use client"` at the top
- Colocate component-specific types in the same file
- Use the `cn()` utility from `src/lib/utils.ts` for conditional classes

### Database
- Migrations in `supabase/migrations/` with numbered prefixes
- Always add RLS policies when creating tables
- Use UUIDs for primary keys
- Add composite indexes on `(organization_id, ...)` for tenant-scoped queries
- Run `npm run db:types` after migration changes

### Forms
- Zod schemas define validation, shared between client and server
- React Hook Form for client-side form state
- Server Actions validate with the same Zod schema

### Testing
- TypeScript strict checks: `npx tsc --noEmit`
- ESLint: `npm run lint`
- Manual testing via dev server: `npm run dev`

## Commands
- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm run db:types` — Generate Supabase types (requires local Supabase running)
- `npx supabase start` — Start local Supabase
- `npx supabase db reset` — Reset local DB and re-run migrations
- `npx supabase migration new <name>` — Create a new migration
