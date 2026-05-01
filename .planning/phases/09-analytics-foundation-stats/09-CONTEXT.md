# Phase 9: Analytics Foundation & Stats - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the database infrastructure for tracking cleanup impact and recent history. This includes the Prisma schema updates and the initial implementation of the impact stats card in the Dashboard Hero.

</domain>

<decisions>
## Implementation Decisions

### Data Granularity (Storage Strategy)
- **D-01:** Store an aggregate `CleanupAction` record per bulk action (e.g., id, userId, type, count, timestamp).
- **D-02:** Do NOT store individual message IDs for past cleanups. The "Action Log" is sufficient for history.

### "Time Saved" Logic
- **D-03:** Use a hardcoded constant for the "Time Saved" multiplier (e.g., 2 seconds per email).
- **D-04:** This value is not currently configurable by the user.

### UI Integration (Dashboard Hero)
- **D-05:** Integrate impact stats directly into the existing Hero card (badge or small text line).
- **D-06:** Maintain the Notion-like aesthetic by avoiding a separate card for stats.

### the agent's Discretion
- Database schema field names (e.g., `actionType`, `emailCount`).
- Precise visual styling of the "Impact" line in the Hero.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements
- `.planning/REQUIREMENTS.md` — [Defines STATS-01, STATS-02, STATS-03]
- `.planning/ROADMAP.md` — [Defines Phase 9 scope]

### Code References
- `prisma/schema.prisma` — [Existing data model]
- `src/components/dashboard/dashboard-content.tsx` — [Dashboard UI implementation]
- `src/server/routers/inbox.ts` — [Existing inbox analysis logic]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/gmail-retry.ts`: Use `withRetry` for any Gmail API calls during stats generation.
- `src/components/dashboard/dashboard-content.tsx`: The Hero section to be modified.

### Established Patterns
- tRPC + Prisma: For data fetching and persistence.
- Shadcn/ui: For consistent component styling.

### Integration Points
- `trpc.inbox.getCardCounts`: The impact stats can be fetched alongside or via a new tRPC procedure.
- `Cleanup` mutation: Needs to be updated to record an entry in `CleanupAction`.

</code_context>

<specifics>
## Specific Ideas
- "Total Emails Cleaned" and "Estimated Time Saved" should be the primary metrics displayed.

</specifics>

<deferred>
## Deferred Ideas
- Individual email history log (belong in Phase 10 if needed, but currently out of scope).
- User-configurable time constant (Settings phase).

</deferred>

---

*Phase: 09-Analytics Foundation & Stats*
*Context gathered: 2026-05-01*
