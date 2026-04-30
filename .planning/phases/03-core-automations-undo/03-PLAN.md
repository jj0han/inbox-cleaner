# Phase 3 Plan: Core Automations & Undo

## Objective
Implement immediate cleanup actions with a 30-second undo window, progress feedback, and database persistence.

## Wave 1: Schema & Infrastructure
- [ ] Update `prisma/schema.prisma` with `ActionLog` model for undo persistence.
- [ ] Run `npx prisma migrate dev --name add_action_log`.
- [ ] Extend `InboxRouter` in `src/server/routers/inbox.ts` to include `batchModifyLabels` utility.

## Wave 2: Backend Mutations
- [ ] Implement `startCleanupAction` tRPC mutation:
  - Creates `ActionLog` entry.
  - Queries Gmail messages based on action type.
  - Returns target IDs and `actionId`.
- [ ] Implement `executeBatch` tRPC mutation:
  - Takes `actionId` and a subset of `messageIds`.
  - Performs `batchModify` to archive emails.
  - Updates `ActionLog` with progress.
- [ ] Implement `undoAction` tRPC mutation:
  - Reverses label changes for IDs in `ActionLog`.

## Wave 3: UI Components
- [ ] Create `UndoToast` component:
  - 30s countdown with shrinking progress bar.
  - "Undo" button linked to `undoAction` mutation.
  - Pause timer on hover.
- [ ] Create `ActionProgress` indicator:
  - Live counter overlay for Action Cards.
  - Integration with React Query state to track current/total.

## Wave 4: Integration & Polish
- [ ] Connect Action Cards ("Remover Newsletters", "Limpar Notificações") to the new batch mutations.
- [ ] Implement "Limpeza Inteligente" in the Hero section.
- [ ] Ensure cache invalidation: Total inbox count should refresh after cleanup or undo.

## Verification Plan
- **Automated:** Unit tests for batching logic and undo expiration.
- **Manual UAT:**
  - Trigger "Archive Promos".
  - Verify live counter increments.
  - Verify "Undo" toast appears with 30s timer.
  - Click "Undo" and verify emails are returned to Inbox in Gmail.
  - Wait 30s and verify toast disappears and emails stay archived.
