# System Logic Specification: Core Automations & Undo

## Objective
Implement reliable, batch-processed cleanup logic with a durable undo mechanism using the Gmail API and Prisma.

## Cleanup Heuristics

### 1. "Remover Newsletters"
- **Query:** `label:INBOX category:updates OR category:promotions`
- **Logic:** Filter for messages containing the `List-Unsubscribe` header.
- **Action:** Archive (remove `INBOX` label).

### 2. "Limpar Notificações"
- **Query:** `label:INBOX category:social OR category:forums`
- **Logic:** Target emails older than 7 days.
- **Action:** Archive.

### 3. "Limpeza Inteligente em 1 Clique"
- **Query:** `label:INBOX (category:promotions OR category:updates OR category:social) older_than:30d`
- **Action:** Mass archive.

## Data Schema & Persistence

### Prisma Schema Updates
```prisma
model ActionLog {
  id           String   @id @default(cuid())
  userId       String
  type         String   // e.g., "ARCHIVE", "TRASH"
  status       String   @default("PENDING") // PENDING, COMPLETED, UNDONE
  targetCount  Int
  messageIds   String[] // Store IDs affected for reversal
  createdAt    DateTime @default(now())
  expiresAt    DateTime // createdAt + 30 seconds
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Batch Processing Strategy
- Use `p-limit` or a custom concurrency throttler to process batches of 50 messages.
- Use Gmail API `users.messages.batchModify` for efficient bulk label changes.
- **Rate Limiting:** Implement a 200ms delay between batch calls if needed to stay within Gmail API quotas.

## Undo Implementation
- **Storage:** When an action starts, create an `ActionLog` record.
- **Execution:** Perform the Gmail API calls and update `ActionLog.status = "COMPLETED"`.
- **Reversal:** 
  - tRPC mutation `undoAction(actionId: string)`.
  - Verify `expiresAt > now()`.
  - Fetch `messageIds` from the log.
  - Call Gmail API `batchModify` to add the `INBOX` label back to those IDs.
  - Update `ActionLog.status = "UNDONE"`.

## Performance Targets
- **UI Latency:** Action feedback (counter) should update at least every 2 seconds.
- **Max Batch Size:** 100 messages per Gmail API call (API limit).
- **Undo Window:** Exactly 30 seconds from `createdAt`.
