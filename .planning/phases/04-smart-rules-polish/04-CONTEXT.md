# Phase 4: Smart Rules & Polish — Context

**Gathered:** 2026-04-30
**Status:** Ready for planning
**Source:** /gsd-discuss-phase interactive session

<domain>
## Phase Boundary

Deliver AI-lite pattern-based rule suggestions surfaced from the user's Gmail reading habits, with one-click apply (archive existing + Gmail filter for future) and full undo. Also polish the existing dashboard: real email counts per card, empty states, mobile layout, and inbox-specific email counter.
</domain>

<decisions>
## Implementation Decisions

### Rule Generation Logic
- **Trigger:** Auto-load on dashboard open (alongside `getSummary`) + manual "Analisar" refresh button
- **Eligibility threshold:** Sender has ≥ 3 unread emails older than 14 days in INBOX
- **Max suggestions displayed:** Top 3 only (ranked by email count descending)
- **Data source:** Gmail API — `messages.list` with `q: "is:unread older_than:14d label:INBOX"`, group by `from:` header, filter to senders with count ≥ 3

### Rule Presentation UI
- **Location:** New "Sugestões Inteligentes" section rendered below the existing action cards grid
- **Each suggestion row shows:**
  - Sender email/domain
  - Unread email count (e.g., "47 emails não lidos")
  - Reason/staleness (e.g., "último aberto há 45 dias")
  - "Arquivar" primary button
  - ✕ dismiss button (removes suggestion from UI without taking action, client-side only — does not persist to DB)
- **Refresh:** "Analisar novamente" button in section header triggers re-fetch
- **Loading state:** Section shows skeleton rows while fetching

### Apply Rule Behavior
- **On "Arquivar" click:**
  1. Archive all existing emails from that sender (`batchModify` remove `INBOX` label — same pattern as Phase 3)
  2. Create a Gmail filter (`settings.filters.create`) so future emails from that sender skip inbox (skip inbox = `addLabelIds: ["INBOX"]` removed, or use `skipInbox: true` in filter criteria)
- **Undo:** Full undo using same 30s toast from Phase 3:
  - Restore archived emails to INBOX (`batchModify` add `INBOX` label back)
  - Delete the Gmail filter (`settings.filters.delete` with stored filter ID)
  - Store filter ID in `ActionLog` for undo retrieval

### Polish Scope
- **Real email counts per action card:** Each action card (Newsletters, Notificações) displays a live badge with message count. Fetched as part of the dashboard load — add a new `getCardCounts` tRPC query that runs the same Gmail queries as `startCleanupAction` but only returns counts (no DB writes).
- **Empty states:** If suggestions section has 0 results after analysis, show: "Sua caixa está ótima! Não encontramos padrões suspeitos. 🎉" instead of blank section.
- **Mobile layout:** Ensure action cards grid (`grid-cols-1 md:grid-cols-2`) stacks correctly. Suggestions section renders as a single column on mobile. Undo toast max-width fits small screens.
- **Inbox count metric fix:** Replace `gmail.users.getProfile({ userId: "me" })` (returns total all-mail count) with `gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: 1 })` and use `resultSizeEstimate` for the displayed "E-mails encontrados" count — this reflects actual INBOX size, changes visibly after archiving.

### the agent's Discretion
- Gmail filter API specifics (exact request body shape for `settings.filters.create`)
- Whether to store `filterId` in a new DB column on `ActionLog` or as a JSON metadata field
- Exact staleness text format ("último aberto há X dias" vs "não aberto há X dias")
- Whether `getCardCounts` runs in parallel or sequentially with `getSummary`
- Skeleton/loading state visual details for suggestion rows
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 4 goal and requirements (AUTO-04)
- `.planning/REQUIREMENTS.md` — AUTO-04 user story

### Existing Implementation (Phase 3 patterns to reuse)
- `src/server/routers/inbox.ts` — existing `startCleanupAction`, `executeBatch`, `undoAction` procedures; reuse `batchModify` pattern for apply rule
- `src/lib/db.ts` — Prisma client initialization (driver adapter pattern)
- `src/hooks/use-cleanup.ts` — cleanup mutation flow pattern to replicate for rule apply
- `src/lib/undo-context.tsx` — `startAction`, `updateProgress`, `clearAction` context; extend for rule undo
- `src/components/dashboard/undo-toast.tsx` — existing undo toast (no changes needed)
- `src/components/dashboard/dashboard-content.tsx` — dashboard layout to extend with new suggestions section
- `src/components/dashboard/action-card.tsx` — card pattern to extend with count badge
- `prisma/schema.prisma` — `ActionLog` and `ActionItem` schema; may need `filterId` field on `ActionLog`

### Gmail API
- Gmail Filter create: `gmail.users.settings.filters.create` — stores filter ID returned in response
- Gmail Filter delete: `gmail.users.settings.filters.delete({ id: filterId })`
- Gmail messages list for inbox count: `gmail.users.messages.list({ labelIds: ["INBOX"], maxResults: 1 })` returns `resultSizeEstimate`
</canonical_refs>

<code_context>
## Reusable Assets

- **`batchModify` pattern** — `src/server/routers/inbox.ts:executeBatch` — exact same call for rule archive
- **Undo flow** — `src/hooks/use-cleanup.ts` + `src/lib/undo-context.tsx` — extend `startAction` with `filterId` payload for rule undo
- **Action card component** — `src/components/dashboard/action-card.tsx` — add optional `count?: number` prop for badge
- **tRPC router** — `src/server/routers/inbox.ts` — add `getSuggestions`, `applySuggestion`, `getCardCounts` procedures
- **Prisma schema** — `prisma/schema.prisma` — add `filterId String?` to `ActionLog` if filter undo is required
</code_context>

<deferred>
## Deferred Ideas

- Persist dismissed suggestions to DB (so dismissals survive refresh) — not in scope for Phase 4
- Suggestion based on domain patterns (not just exact sender) — future enhancement
- Outlook integration — out of scope (PROJECT.md)
</deferred>

---

*Phase: 04-smart-rules-polish*
*Context gathered: 2026-04-30 via /gsd-discuss-phase interactive session*
