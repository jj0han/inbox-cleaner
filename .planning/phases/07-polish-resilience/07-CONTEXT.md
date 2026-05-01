# Phase 7: Polish & Resilience - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the app against Gmail API failures (429 rate limits, network errors, and per-component failures) so the user experience gracefully degrades instead of crashing. No new user-facing features — only resilience and error states for existing functionality.

</domain>

<decisions>
## Implementation Decisions

### Backoff & Retry (POL-01)
- **D-01:** Retry logic lives in a shared `withRetry` server-side utility function (not tRPC middleware) — scoped specifically to Gmail API calls, not all tRPC procedures.
- **D-02:** Strategy: max 3 attempts, exponential delay (500ms → 1s → 2s), only on HTTP 429 and 503 status codes from the Gmail API response.
- **D-03:** If all retries exhausted, throw the original error — let tRPC surface it normally to the client.

### SuggestionsSection Error State (POL-02)
- **D-04:** `SuggestionsSection` receives an optional `error` boolean prop from the parent (`dashboard-content.tsx`), sourced from `trpc.inbox.getSuggestions.useQuery()`.
- **D-05:** On error, replace the entire section body with an inline error card: alert icon + short message ("Não foi possível analisar sua caixa.") + "Tentar novamente" button that calls `refetchSuggestions()`.
- **D-06:** Error card uses the same container/padding as the empty state (no new layout patterns).

### Card Count Degradation (POL-03)
- **D-07:** `getCardCounts` wraps each individual count query in try/catch. On failure, returns `null` for that key (not `undefined` — `undefined` means loading).
- **D-08:** `ActionCard` renders `—` (em dash) when count is `null`. No retry icon — silent, clean degradation consistent with the "zero cognitive load" design principle.
- **D-09:** Auth errors vs network errors are treated the same — any count fetch failure → `null` → `—`.

### Agent Discretion
- Delay implementation (`setTimeout`-based Promise wrapper) is a simple inline helper in the `withRetry` utility — no external dependency needed.
- The `withRetry` utility lives in `src/lib/gmail-retry.ts` (or similar) to keep it reusable across future procedures.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — POL-01, POL-02, POL-03 (the three acceptance criteria for this phase)

### Affected Source Files
- `src/server/routers/inbox.ts` — Where `withRetry` will be applied to Gmail API calls; where `getCardCounts` try/catch needs to be added
- `src/components/dashboard/suggestions-section.tsx` — Receives new `error` prop; replace body with error card on error
- `src/components/dashboard/dashboard-content.tsx` — Passes `error` and `refetchSuggestions` down to `SuggestionsSection`; sources card count `null` from `getCardCounts`
- `src/components/dashboard/action-card.tsx` — Renders `—` when count is `null`

### Design Constraints
- `.planning/PROJECT.md` — "Zero cognitive load" principle: silent degradation over noisy error banners for count failures

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `trpc.inbox.getSuggestions.useQuery()` in `dashboard-content.tsx` — already has `refetch` destructured, just needs `error` destructured too
- `SuggestionsSection` component — already handles `isLoading` and empty state patterns; error state follows the same structure
- `sonner` toast (added Phase 6) — available for transient error notifications if needed, but POL-02 uses inline error card instead

### Established Patterns
- `Skeleton` component used for loading states — error states should use a similar inline card pattern for visual consistency
- Card count: `count={isCountsLoading ? undefined : cardCounts?.NEWSLETTERS}` — changing to `null` for errors requires the type to accept `null | undefined | number`
- `getCardCounts` currently does not exist as a separate procedure — counts may be embedded in another call; verify before implementing

### Integration Points
- `withRetry` wraps Gmail API `googleapisClient` calls inside tRPC procedures
- `SuggestionsSection` error state: `dashboard-content.tsx` → `SuggestionsSection` via props
- Card count null: `inbox.ts` → `getCardCounts` response shape → `ActionCard` render

</code_context>

<specifics>
## Specific Ideas

- User did not specify visual design for the error card — use the established zinc/red-50 palette already present in `dashboard-content.tsx` error handling (line 39: `bg-red-50 text-red-600`)
- No specific wording requested — using existing Portuguese UI language: "Não foi possível analisar sua caixa." / "Tentar novamente"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 7-Polish & Resilience*
*Context gathered: 2026-04-30*
