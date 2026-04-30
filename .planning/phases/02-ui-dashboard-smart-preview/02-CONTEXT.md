# Phase 2: UI Dashboard & Smart Preview — Context

## Domain
Building the core dashboard interface, action cards for automations, and the smart preview modal to establish user trust before actions are taken.

## Canonical Refs
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`

## Decisions
- **Preview Modal Scope:** Headers only (Faster/Lighter) — show only Sender and Subject line to optimize speed and API quota.
- **Action Cards Layout:** Grid of Bold "Recipe" Cards — large, clickable cards with title, description, and icon to emphasize 1-click simplicity and a Notion-like gallery feel.
- **Data Fetching Strategy:** Client-side Fetch using **tRPC and React Query** — load the dashboard UI immediately, show a progress indicator, and use tRPC/React Query to fetch emails via an API route for better perceived performance and end-to-end type safety.

## Code Context
- Reusable components from Shadcn/ui.
- NextAuth session setup from Phase 1 (`src/app/api/auth/[...nextauth]/route.ts`).
