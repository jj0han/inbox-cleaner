# Verification: Phase 6 — Unsubscribe Link Detection

**Status:** Verified
**Date:** 2026-04-30

## UAT Criteria

### UNSUB-01: Unsubscribe Badge Visibility
- [x] GIVEN a message with `List-Unsubscribe` header
- [x] WHEN viewing the Newsletters Preview Modal
- [x] THEN a "Descadastrar disponível" badge is visible on the row

### UNSUB-02: Single Unsubscribe Execution
- [x] GIVEN a message with `List-Unsubscribe` header
- [x] WHEN clicking the "Descadastrar" button on the row
- [x] THEN the backend executes the unsubscribe request (HTTP or Mailto)
- [x] AND the UI shows a success state for that row

### UNSUB-03: Bulk Unsubscribe + Archive Choice
- [x] GIVEN the "Remover Newsletters" card
- [x] WHEN the "Descadastrar e arquivar" toggle is ON
- [x] AND the user clicks "Limpar e Descadastrar"
- [x] THEN the application performs unsubscribes for the batch before archiving

## Evidence
- `src/components/dashboard/preview-modal.tsx`: Correctly displays the badge and "Descadastrar" button.
- `src/server/routers/inbox.ts`: `unsubscribe` mutation handles `mailto:` and `https://` links.
- `src/server/routers/inbox.ts`: `bulkUnsubscribe` handles batch processing with link detection.
