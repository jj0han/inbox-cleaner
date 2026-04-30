# Phase 3 Plan: Core Automations & Undo

## Objective
Implement immediate cleanup actions with a 30-second undo window, progress feedback, and database persistence.

## Wave 1: Database & Schema Infrastructure
- [x] Install Prisma dependencies (`npm install prisma @prisma/client`).
- [x] Initialize Prisma (`npx prisma init --datasource-provider sqlite`).
- [x] Define `ActionLog` model in `prisma/schema.prisma` for undo persistence.
- [x] Run `npx prisma migrate dev --name init_undo_logs`.
- [x] Extend `InboxRouter` in `src/server/routers/inbox.ts` to include `batchModifyLabels` utility.

## Wave 2: Backend Mutations
- [x] Implement `startCleanupAction` tRPC mutation:
  - Creates `ActionLog` entry.
  - Queries Gmail messages based on action type.
  - Returns target IDs and `actionId`.
- [x] Implement `executeBatch` tRPC mutation:
  - Takes `actionId` and a subset of `messageIds`.
  - Performs `batchModify` to archive emails.
  - Updates `ActionLog` with progress.
- [x] Implement `undoAction` tRPC mutation:
  - Reverses label changes for IDs in `ActionLog`.

## Wave 3: UI Components
- [x] Create `UndoToast` component:
  - 30s countdown with shrinking progress bar.
  - "Undo" button linked to `undoAction` mutation.
  - Pause timer on hover.
- [x] Create `ActionProgress` indicator:
  - Live counter overlay for Action Cards.
  - Integration with React Query state to track current/total.

## Wave 4: Integration & Polish
- [x] Connect Action Cards ("Remover Newsletters", "Limpar Notificações") to the new batch mutations.
- [x] Implement "Limpeza Inteligente" in the Hero section.
- [x] Ensure cache invalidation: Total inbox count should refresh after cleanup or undo.

## Verification Plan
- **Automated:** Unit tests for batching logic and undo expiration.
- **Manual UAT:**
  - Trigger "Archive Promos".
  - Verify live counter increments.
  - Verify "Undo" toast appears with 30s timer.
  - Click "Undo" and verify emails are returned to Inbox in Gmail.
  - Wait 30s and verify toast disappears and emails stay archived.
