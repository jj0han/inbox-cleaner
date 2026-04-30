# Phase 2: UI Dashboard & Smart Preview — Discussion Log

**Date:** 2026-04-30

## Area: Preview Modal Scope
**Options:**
- Headers only (Faster/Lighter)
- Include Snippets
- Full Content on Click

**Selection:** 1 (Headers only)
**Notes:** User chose 1. Faster and saves API quota.

## Area: Action Cards Layout
**Options:**
- Grid of Bold "Recipe" Cards
- Dense List View
- One Primary "Magic" Button

**Selection:** 1 (Grid of Bold "Recipe" Cards)
**Notes:** User chose 1. Emphasizes 1-click simplicity and fits the Notion-like aesthetic well.

## Area: Data Fetching Strategy
**Options:**
- Server Component (Blocking with Skeleton)
- Client-side Fetch
- Hybrid (Lazy Load Previews)

**Selection:** 2 (Client-side Fetch) + tRPC and React Query
**Notes:** User chose 2 and specifically requested adding tRPC with React Query to the stack to handle client-side data fetching.
