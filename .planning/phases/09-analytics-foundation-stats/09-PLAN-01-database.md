---
wave: 1
---
# Phase 9: Analytics Foundation & Stats - Plan 01 (Database & Backend)

Establish the data infrastructure for tracking inbox cleanup impact.

## Wave 1: Schema & Migration

### Task 1.1: Update Prisma Schema
<read_first>
- prisma/schema.prisma
</read_first>
<action>
Add `emailCount Int @default(0)` to the `ActionLog` model in `prisma/schema.prisma`. This will store the aggregate number of emails affected by a cleanup action for fast analytics querying.
</action>
<acceptance_criteria>
- prisma/schema.prisma contains `emailCount Int @default(0)` in `model ActionLog`.
</acceptance_criteria>

### [BLOCKING] Task 1.2: Sync Database
<read_first>
- prisma/schema.prisma
</read_first>
<action>
Run `npx prisma db push` to apply the schema changes to the local SQLite database.
</action>
<acceptance_criteria>
- Command exits with code 0.
- `src/generated/client` is updated.
</acceptance_criteria>

### Task 1.3: Backfill Existing Counts
<read_first>
- prisma/schema.prisma
</read_first>
<action>
Create a temporary script `src/scripts/backfill-counts.ts` that iterates through all `ActionLog` entries and updates `emailCount` by counting their related `ActionItem` records. Run it once and then delete it.
</action>
<acceptance_criteria>
- Existing `ActionLog` entries in the DB have `emailCount` matching their `ActionItem` count.
</acceptance_criteria>

## Wave 2: tRPC Procedures

### Task 2.1: Populate emailCount on Cleanup
<read_first>
- src/server/routers/inbox.ts
</read_first>
<action>
Update the `startCleanupAction` and `applySuggestion` mutations in `src/server/routers/inbox.ts` to include `emailCount: messageIds.length` when creating the `ActionLog` record.
</action>
<acceptance_criteria>
- `startCleanupAction` creates `ActionLog` with `emailCount`.
- `applySuggestion` creates `ActionLog` with `emailCount`.
</acceptance_criteria>

### Task 2.2: Implement getImpactStats
<read_first>
- src/server/routers/inbox.ts
</read_first>
<action>
Add a `getImpactStats` query to `inboxRouter` that:
1. Calculates `totalCleaned` by summing `emailCount` for the current user where `status != "UNDONE"`.
2. Calculates `timeSavedMinutes` by multiplying `totalCleaned` by 2 seconds and converting to minutes.
3. Returns `{ totalCleaned, timeSavedMinutes }`.
</action>
<acceptance_criteria>
- `getImpactStats` returns correct aggregated numbers.
- `UNDONE` actions are excluded.
</acceptance_criteria>

### Task 2.3: Implement getTopSenders
<read_first>
- src/server/routers/inbox.ts
</read_first>
<action>
Add a `getTopSenders` query to `inboxRouter` (Requirement STATS-04) that:
1. Searches the user's inbox for unread emails (`is:unread label:INBOX`) with a `maxResults: 200` limit to ensure performance.
2. Aggregates the top 5 senders by count.
3. Returns an array of `{ sender, count }`.
</action>
<acceptance_criteria>
- `getTopSenders` returns a sorted list of the top 5 senders.
</acceptance_criteria>

## Verification Criteria

### Automated Tests
- Run `npm run build` to verify type safety.
- Verify that `db.actionLog.aggregate` is used for efficient summing.

### Manual Verification
- Perform a cleanup and verify that `emailCount` is recorded in the DB (via Prisma Studio).
- Verify that `getImpactStats` updates immediately after a cleanup (and reverts after an Undo).
