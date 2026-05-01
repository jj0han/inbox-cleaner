# Phase 08: Hardening & Documentation Integrity - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning
**Source:** Milestone v1.1 Audit Gaps

<domain>
## Phase Boundary
This phase resolves critical wiring bugs, extends Gmail API resilience (exponential backoff) to all procedures, and backfills missing/incomplete verification documentation for Milestone v1.1.

</domain>

<decisions>
## Implementation Decisions

### Suggestions Error Surfacing (POL-02)
- **Problem**: `getSuggestions` in `inbox.ts` catches all errors and returns `[]`.
- **Decision**: Remove the blanket try/catch or ensure it throws an actual Error when the Gmail API fails, so React Query's `isError` becomes true on the client.

### Gmail API Resilience Expansion (POL-01)
- **Decision**: Apply `withRetry` from `@/lib/gmail-retry` to ALL procedures that call Gmail API:
  - `startCleanupAction`
  - `executeBatch`
  - `unsubscribe`
  - `bulkUnsubscribe`
  - `applySuggestion`
  - `getSummary`
- **Constraint**: Maintain the existing retry logic (3 retries, exponential backoff for 429/503).

### Documentation Integrity
- **Decision**: Create `05-VERIFICATION.md` for Phase 5 (Real Email Preview).
- **Decision**: Complete/Check all boxes in `06-VERIFICATION.md` (Unsubscribe Link Detection) and verify results against live codebase.

</decisions>

<canonical_refs>
## Canonical References
- `src/server/routers/inbox.ts` — Main API router to be hardened.
- `src/lib/gmail-retry.ts` — Resilience utility.
- `.planning/v1.1-MILESTONE-AUDIT.md` — Source of gaps.
</canonical_refs>

---
*Phase: 08-hardening-docs*
