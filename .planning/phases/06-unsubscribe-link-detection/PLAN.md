# Plan: Phase 6 — Unsubscribe Link Detection

Implement robust unsubscribe detection and execution using `List-Unsubscribe` headers, integrated into both the `PreviewModal` and the "Newsletters" cleanup flow.

## 1. Backend: tRPC Router Enhancements

### 1.1 Update `getPreview`
- **Goal:** Fetch `List-Unsubscribe` headers for the preview rows.
- **Action:** Update `metadataHeaders` in the `gmail.users.messages.get` call to include `"List-Unsubscribe"`.
- **Response:** Return `unsubscribeUrl` (parsed from the header) in the email object.

### 1.2 Add `unsubscribe` Procedure
- **Goal:** Execute a single unsubscribe action.
- **Input:** `z.object({ messageId: z.string() })`
- **Logic:**
    1. Fetch message metadata to get the `List-Unsubscribe` header.
    2. Parse the header (supports `mailto:` and `https://` formats).
    3. If `mailto:`: Send an email using `gmail.users.messages.send`.
    4. If `https://`: Perform a server-side `fetch` (GET).
    5. Return success/failure.

### 1.3 Add `bulkUnsubscribe` Procedure
- **Goal:** Execute unsubscribes for a list of message IDs.
- **Input:** `z.object({ messageIds: z.array(z.string()) })`
- **Logic:** Process in parallel chunks (e.g., 10 at a time) to avoid Gmail rate limits. Same logic as `unsubscribe` for each ID.

## 2. UI: Dashboard & ActionCard Updates

### 2.1 State Management
- Add `unsubscribeEnabled` state in `dashboard-content.tsx` (default `false`).

### 2.2 ActionCard Toggle
- Modify `ActionCard` to accept an optional `footerExtra` node.
- In `dashboard-content.tsx`, render a `Switch` and label ("Descadastrar e arquivar") for the `NEWSLETTERS` card.
- Update the cleanup button text to "Limpar e Descadastrar" when the toggle is active.

## 3. UI: Preview Modal Enhancements

### 3.1 Unsubscribe Badge
- Display a small "Unsubscribe disponível" badge in the email row if `unsubscribeUrl` is present.
- Use a subtle blue/muted style to maintain premium aesthetics.

### 3.2 Individual Action
- Add an "Unsubscribe" button that appears on row hover (or next to the badge).
- Hook it up to the new `unsubscribe` mutation.
- Show a success toast or update the row state on completion.

## 4. Bulk Execution Integration

### 4.1 Update `handleCleanup` in `dashboard-content.tsx`
- If `unsubscribeEnabled` is true AND type is `NEWSLETTERS`:
    - Call `bulkUnsubscribe` for the chunk of IDs before calling `executeBatch` (archiving).
    - Handle potential failures gracefully (don't stop the whole cleanup if one unsubscribe fails).

## Verification Plan

### Automated Tests (UAT)
- **UNSUB-01:** Verify `getPreview` returns `unsubscribeUrl` for newsletters.
- **UNSUB-02:** Mock a `mailto:` unsubscribe header and verify the backend attempts to send an email.
- **UNSUB-03:** Verify toggle state changes the `startCleanupAction` behavior/params.

### Manual Verification
- Open "Newsletters" preview and check for the blue badge.
- Toggle "Unsubscribe + Archive" on the dashboard and verify the button text changes.
- Trigger a single unsubscribe from the modal and check for console/toast feedback.
