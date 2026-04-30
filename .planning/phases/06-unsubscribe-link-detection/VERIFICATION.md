# Verification: Phase 6 — Unsubscribe Link Detection

## UAT Criteria

### UNSUB-01: Unsubscribe Badge Visibility
- [ ] GIVEN a message with `List-Unsubscribe` header
- [ ] WHEN viewing the Newsletters Preview Modal
- [ ] THEN a "Descadastramento disponível" badge is visible on the row

### UNSUB-02: Single Unsubscribe Execution
- [ ] GIVEN a message with `List-Unsubscribe` header
- [ ] WHEN clicking the "Descadastrar" button on the row
- [ ] THEN the backend executes the unsubscribe request (HTTP or Mailto)
- [ ] AND the UI shows a success state for that row

### UNSUB-03: Bulk Unsubscribe + Archive Choice
- [ ] GIVEN the "Remover Newsletters" card
- [ ] WHEN the "Descadastrar e arquivar" toggle is ON
- [ ] AND the user clicks "Limpar e Descadastrar"
- [ ] THEN the application performs unsubscribes for the batch before archiving

## Manual Test Script

1. **Dashboard Toggle:**
   - Locate "Remover Newsletters" card.
   - Verify the Switch is present.
   - Toggle it ON and verify the button text changes from "Limpar Agora" to "Limpar e Descadastrar".

2. **Preview Modal Badge:**
   - Click "Ver E-mails" on the Newsletters card.
   - Verify rows have a subtle blue badge if eligible.
   - Hover over a row and verify the "Descadastrar" button appears.

3. **Backend Execution (Logs):**
   - Trigger a single unsubscribe.
   - Check server logs (stdout) for "Executing unsubscribe for message ID..." and the detected link type.
