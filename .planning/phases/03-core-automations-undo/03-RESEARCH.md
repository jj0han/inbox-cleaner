# Phase 3 Research: Core Automations & Undo

## Gmail API: Batch Processing
- **Method:** `users.messages.batchModify`
- **Quota:** 100 messages per request.
- **Limits:** Max 50 requests per second.
- **Latency:** High for large batches; requires sequential processing with progress updates.
- **Reference:** https://developers.google.com/gmail/api/reference/rest/v1/users.messages/batchModify

## Database Persistence (Prisma)
- **Current State:** The project currently lacks a database (no Prisma in `package.json`).
- **Action:** Must initialize Prisma with SQLite for simplicity (as it's a local tool) and add `ActionLog` model.
- **Schema Design:** `ActionLog` needs to store `messageIds` (list of strings) and `originalLabels` (to restore if needed).

## Undo UX Patterns
- **Best Practice:** Show a toast with a 30s countdown.
- **Interruption:** Clicking Undo must immediately cancel any pending batches and reverse completed batches for that specific action.
- **Refreshes:** By persisting `ActionLog` in DB, we can recover the undo state after a page refresh.

## Technical Blockers
- **Authentication:** Gmail API requires `https://www.googleapis.com/auth/gmail.modify` or `https://www.googleapis.com/auth/gmail.metadata` + `https://www.googleapis.com/auth/gmail.labels` to archive. We currently have `google.gmail`.
- **Labels:** To archive, we remove the `INBOX` label. To undo, we add it back.
