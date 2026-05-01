# Verification: Phase 7 — Polish & Resilience

## UAT Criteria

### POL-01: Gmail API Rate Limit Backoff
- [x] GIVEN a Gmail API call that returns a 429 or 503 error
- [x] WHEN the error occurs inside `withRetry`
- [x] THEN the system retries up to 3 times with 500ms → 1s → 2s delays
- [x] AND a warning is logged to console on each retry
- [x] AND non-retryable errors (e.g., auth 401) are thrown immediately

### POL-02: SuggestionsSection Error State
- [x] GIVEN the `getSuggestions` query fails (isError = true)
- [x] WHEN the `SuggestionsSection` renders
- [x] THEN the section body is replaced with an error card
- [x] AND the error card shows "Não foi possível analisar sua caixa."
- [x] AND a "Tentar novamente" button is present that calls `refetchSuggestions()`

### POL-03: Card Count Graceful Degradation
- [x] GIVEN an individual count query fails (e.g., NEWSLETTERS count throws)
- [x] WHEN `getCardCounts` runs
- [x] THEN only the failed key returns `null` (other keys unaffected)
- [x] AND `ActionCard` renders "— emails" for the null count
- [x] AND no unhandled promise rejection occurs

## Static Verification

- [x] `npx tsc --noEmit` exits 0 (no TypeScript errors)
- [x] `src/lib/gmail-retry.ts` exists with `withRetry` export
- [x] `withRetry` applied to all Gmail API calls in `getPreview`, `getSuggestions`, `getCardCounts`
- [x] `getCardCounts` returns `Record<string, number | null>` (per-key fault isolation)
- [x] `ActionCard` accepts `count?: number | null` and renders `—` for null
- [x] `SuggestionsSection` accepts `error?: boolean` and renders error card

## Manual Test Script

1. **Backoff behavior (POL-01):**
   - Temporarily throttle network or mock a 429 response in `inbox.ts`
   - Verify console shows "Gmail API retryable error (attempt 1/4). Retrying in 500ms..."
   - Verify the request eventually succeeds or fails after 4 total attempts

2. **SuggestionsSection error state (POL-02):**
   - Set `isSuggestionsError = true` in dev (or disable the API route)
   - Reload dashboard — verify the Suggestions section shows ⚠️ icon + error message + "Tentar novamente" button
   - Click "Tentar novamente" — verify it triggers a refetch

3. **Card count degradation (POL-03):**
   - In `getCardCounts`, throw inside the NEWSLETTERS try/catch
   - Reload dashboard — NEWSLETTERS card shows "— emails", other cards show real counts
   - No error overlay or crash on the full dashboard
