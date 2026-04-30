---
phase: 2
depends_on: []
files_modified:
  - package.json
  - src/server/trpc.ts
  - src/server/routers/_app.ts
  - src/server/routers/inbox.ts
  - src/app/api/trpc/[trpc]/route.ts
  - src/components/providers/trpc-provider.tsx
  - src/app/layout.tsx
  - src/app/dashboard/page.tsx
  - src/components/dashboard/dashboard-content.tsx
  - src/components/dashboard/action-card.tsx
  - src/components/dashboard/preview-modal.tsx
autonomous: true
---

# Phase 2: UI Dashboard & Smart Preview - Execution Plan

<task>
<id>2-01-01</id>
<title>Install tRPC and React Query Dependencies</title>
<type>execute</type>
<requirements>DASH-01, DASH-02</requirements>
<read_first>
- package.json
</read_first>
<action>
Run the following command to install tRPC, React Query, and Zod dependencies:
`npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod`
</action>
<acceptance_criteria>
- package.json contains `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, `zod` in dependencies
</acceptance_criteria>
</task>

<task>
<id>2-01-02</id>
<title>Configure tRPC Server and Next.js Route Handler</title>
<type>execute</type>
<requirements>DASH-01, DASH-02, SAFE-01</requirements>
<read_first>
- src/app/dashboard/page.tsx
- src/app/api/auth/[...nextauth]/route.ts
</read_first>
<action>
1. Create `src/server/trpc.ts`: Initialize tRPC with `initTRPC.create()`.
2. Create `src/server/routers/inbox.ts`: Define a `getSummary` public procedure that takes the NextAuth session, authenticates via Google API, and returns `messagesTotal`. Migrate the Gmail API fetching logic from `src/app/dashboard/page.tsx` into this procedure. Also add a `getPreview` procedure that returns a mock array of 5 emails (with id, sender, and subject).
3. Create `src/server/routers/_app.ts`: Merge routers to create `appRouter` exporting its type.
4. Create `src/app/api/trpc/[trpc]/route.ts`: Use `fetchRequestHandler` from `@trpc/server/adapters/fetch` to export GET and POST handlers for the App Router.
</action>
<acceptance_criteria>
- `src/server/routers/inbox.ts` contains `getSummary` procedure that calls `google.gmail`
- `src/server/routers/inbox.ts` contains `getPreview` returning mocked objects
- `src/app/api/trpc/[trpc]/route.ts` exports GET and POST
</acceptance_criteria>
</task>

<task>
<id>2-01-03</id>
<title>Setup TRPC Provider</title>
<type>execute</type>
<requirements>DASH-01, DASH-02</requirements>
<read_first>
- src/app/layout.tsx
- src/server/routers/_app.ts
</read_first>
<action>
1. Create `src/components/providers/trpc-provider.tsx`: A `"use client"` component that initializes `QueryClient` and `trpc.createClient` (with `httpBatchLink` pointing to `/api/trpc`), and wraps children with `trpc.Provider` and `QueryClientProvider`. Provide the `trpc` hook instance exported from `src/lib/trpc.ts` (create this file: `export const trpc = createTRPCReact<AppRouter>();`).
2. Update `src/app/layout.tsx` to wrap `{children}` inside the `<TRPCProvider>`.
</action>
<acceptance_criteria>
- `src/components/providers/trpc-provider.tsx` exports TRPCProvider
- `src/app/layout.tsx` contains `<TRPCProvider>` wrapping children
</acceptance_criteria>
</task>

<task>
<id>2-02-01</id>
<title>Add Shadcn UI Components</title>
<type>execute</type>
<requirements>DASH-01, DASH-02, SAFE-01</requirements>
<read_first>
- components.json
</read_first>
<action>
Run the command:
`npx shadcn@latest add card dialog skeleton scroll-area --yes`
</action>
<acceptance_criteria>
- `src/components/ui/card.tsx` exists
- `src/components/ui/dialog.tsx` exists
- `src/components/ui/skeleton.tsx` exists
- `src/components/ui/scroll-area.tsx` exists
</acceptance_criteria>
</task>

<task>
<id>2-02-02</id>
<title>Implement Dashboard Client Component</title>
<type>execute</type>
<requirements>DASH-01, DASH-02</requirements>
<read_first>
- src/app/dashboard/page.tsx
- .planning/phases/02-ui-dashboard-smart-preview/02-UI-SPEC.md
</read_first>
<action>
1. Create `src/components/dashboard/dashboard-content.tsx` (`"use client"`). Use `trpc.inbox.getSummary.useQuery()` to fetch data. Render a loading `<Skeleton>` if `isLoading`. When loaded, display the hero section showing the `messagesTotal`.
2. Add a grid of action cards below the hero section. Create `src/components/dashboard/action-card.tsx` to display an automation "recipe" (e.g., "Remover Newsletters", "Limpar Promocionais") using the `Card` component with a bold Notion-like layout and a "Ver E-mails" CTA button (accent reserved for CTA).
3. Refactor `src/app/dashboard/page.tsx` to be a server component that verifies the NextAuth session, and then renders `<DashboardContent session={session} />`. It no longer fetches data from Gmail directly.
</action>
<acceptance_criteria>
- `src/app/dashboard/page.tsx` does NOT import `google.gmail`
- `src/components/dashboard/dashboard-content.tsx` contains `trpc.inbox.getSummary.useQuery`
- `src/components/dashboard/action-card.tsx` exists and uses `Card` component
</acceptance_criteria>
</task>

<task>
<id>2-02-03</id>
<title>Implement Smart Preview Modal</title>
<type>execute</type>
<requirements>SAFE-01</requirements>
<read_first>
- src/components/dashboard/dashboard-content.tsx
- .planning/phases/02-ui-dashboard-smart-preview/02-UI-SPEC.md
</read_first>
<action>
1. Create `src/components/dashboard/preview-modal.tsx` using the `Dialog` and `ScrollArea` components.
2. When opened, it fetches mock emails using `trpc.inbox.getPreview.useQuery()`.
3. Render the headers (sender and subject) of the returned emails in a clean list format.
4. Update `DashboardContent` to track state for which card is clicked, and pass the state to `<PreviewModal>` so it opens when "Ver E-mails" is clicked.
</action>
<acceptance_criteria>
- `src/components/dashboard/preview-modal.tsx` uses `Dialog`
- `src/components/dashboard/preview-modal.tsx` uses `trpc.inbox.getPreview.useQuery`
- `src/components/dashboard/dashboard-content.tsx` contains `<PreviewModal>`
</acceptance_criteria>
</task>
