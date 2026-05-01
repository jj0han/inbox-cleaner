# Phase 7 Summary: Polish & Resilience

Successfully hardened the app against Gmail API failures with zero new user-facing features — pure resilience improvements.

## Key Changes

### Backend
- **`src/lib/gmail-retry.ts` (new):** `withRetry<T>` utility — wraps any async Gmail API call with exponential backoff: max 3 retries, delays 500ms → 1s → 2s, triggers only on 429/503 status codes. Non-retryable errors (auth, network) throw immediately.
- **`src/server/routers/inbox.ts`:** Applied `withRetry` to all Gmail API calls in `getPreview` (list + per-message get), `getSuggestions` (list + per-chunk get), and `getCardCounts` (per-type list).
- **`getCardCounts` refactored:** Changed from a single outer try/catch (all-or-nothing) to per-key try/catch inside `Promise.all`. Each failed count returns `null` independently — other counts continue unaffected. Return type is now `Record<string, number | null>`.

### Frontend
- **`src/components/dashboard/action-card.tsx`:** `count` prop type extended to `number | null | undefined`. Added null branch rendering `— emails` badge (silent em dash, no retry icon — consistent with zero-cognitive-load design).
- **`src/components/dashboard/dashboard-content.tsx`:** Destructures `isError: isSuggestionsError` from `getSuggestions` query; passes `error={isSuggestionsError}` to `SuggestionsSection`; updated `cardCounts` cast to `Record<string, number | null>`.
- **`src/components/dashboard/suggestions-section.tsx`:** Added `error?: boolean` prop. When `error` is true, replaces the section body with an inline error card: ⚠️ icon + "Não foi possível analisar sua caixa." + "Tentar novamente" button (`onClick={onRefresh}`).

## Verification Results

### POL-01: Rate Limit Backoff
- [x] `withRetry` retries on 429/503, throws immediately on other errors
- [x] Console warning logged per retry attempt

### POL-02: SuggestionsSection Error State
- [x] Error card renders when `isSuggestionsError` is true
- [x] "Tentar novamente" button triggers refetch

### POL-03: Card Count Degradation
- [x] Individual count failures return `null` — other cards unaffected
- [x] `ActionCard` renders `—` for null count
- [x] `npx tsc --noEmit` passes clean

## Technical Notes

- `withRetry` is generic — can be reused for any future Gmail API procedures (bulkUnsubscribe, applySuggestion, etc.)
- `getSuggestions` server-side already had a try/catch returning `[]` on failure; `isSuggestionsError` on the client now surfaces the actual error state (previously the server was swallowing it and React Query never saw an error)
