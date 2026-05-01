---
wave: 2
depends_on: ["09-PLAN-01-database.md"]
---
# Phase 9: Analytics Foundation & Stats - Plan 02 (Dashboard UI)

Integrate the impact stats into the Dashboard Hero section.

## Wave 1: Hero Integration

### Task 1.1: Display Impact Stats in Hero
<read_first>
- src/components/dashboard/dashboard-content.tsx
</read_first>
<action>
In `DashboardContent`:
1. Use `trpc.inbox.getImpactStats.useQuery()` to fetch the stats.
2. Under the main email count (where it says "E-mails encontrados"), add a subtle "Impact" line.
3. Text: "Você já poupou **{timeSavedMinutes} minutos** limpando **{totalCleaned} e-mails**."
4. Style: Use `text-zinc-500` with a small icon (e.g., a clock or spark) and consistent spacing.
</action>
<acceptance_criteria>
- Impact line is visible under the main count.
- Numbers are formatted using `Intl.NumberFormat`.
- Skeleton state is handled while loading.
</acceptance_criteria>

## Verification Criteria

### UI/UX Consistency
- Impact stats are only shown if `totalCleaned > 0`.
- The line disappears or fades out when an Undo is active (to avoid showing "stale" stats that are about to revert).

### Manual Verification
- Verify the "Time Saved" calculation matches the expectation (Cleaned * 2s / 60).
- Check responsiveness on mobile view.
