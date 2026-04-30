# Phase 2: UI Dashboard & Smart Preview — Technical Research

## Standard Stack
- **Component Library:** shadcn/ui (radix)
- **Styling:** Tailwind CSS with `base-nova` preset
- **Data Fetching:** tRPC + React Query (`@trpc/client`, `@trpc/server`, `@trpc/react-query`, `@tanstack/react-query`)
- **Validation:** Zod (for tRPC inputs)

## Architecture Patterns
### tRPC Setup
We need to set up a standard tRPC configuration for Next.js App Router:
1. `src/server/trpc.ts`: Initialize tRPC instance.
2. `src/server/routers/_app.ts`: Define the main app router.
3. `src/server/routers/inbox.ts`: Define the inbox router with `getSummary` and `getPreview` procedures.
4. `src/app/api/trpc/[trpc]/route.ts`: Create the Next.js API route handler.
5. `src/components/providers/trpc-provider.tsx`: Provide the tRPC client and React Query client to the app.

### Dashboard Layout
- Refactor `src/app/dashboard/page.tsx` to include a client component `<DashboardContent />` that uses `trpc.inbox.getSummary.useQuery()`.
- While `isLoading` is true, render `<Skeleton />` for the Hero and Action cards.
- UI will follow `02-UI-SPEC.md`.

## Dependencies to Install
- `@trpc/server` `@trpc/client` `@trpc/react-query` `@tanstack/react-query`
- `zod`
- shadcn UI components: `card`, `dialog`, `skeleton`, `scroll-area`
