# Discussion Log: Phase 7 — Polish & Resilience

**Date:** 2026-04-30
**Mode:** Auto (user skipped interactive discussion — agent made all decisions)

## Gray Areas Identified

| # | Area | Decision Made By |
|---|------|-----------------|
| 1 | Backoff & retry layer (POL-01) | Agent discretion |
| 2 | SuggestionsSection error state (POL-02) | Agent discretion |
| 3 | Card count degradation (POL-03) | Agent discretion |

## Decisions Log

### Area 1 — Backoff & Retry (POL-01)
- **Options considered:** tRPC middleware vs per-procedure try/catch vs shared utility
- **Selected:** Shared `withRetry` utility in `src/lib/gmail-retry.ts` — scoped to Gmail API calls only
- **Rationale:** Keeps retry logic reusable without polluting tRPC middleware layer
- **Delay strategy:** 500ms → 1s → 2s exponential, only on 429/503

### Area 2 — SuggestionsSection Error State (POL-02)
- **Options considered:** Full section replacement vs inline alert vs toast
- **Selected:** Full body replacement with inline error card + "Tentar novamente" button
- **Rationale:** Consistent with existing empty state pattern; gives user clear recovery action

### Area 3 — Card Count Degradation (POL-03)
- **Options considered:** Show `—` silently vs retry icon vs error toast
- **Selected:** Silent `—` em dash, no retry icon
- **Rationale:** Aligns with "zero cognitive load" design principle from PROJECT.md

## Deferred Ideas

None.
