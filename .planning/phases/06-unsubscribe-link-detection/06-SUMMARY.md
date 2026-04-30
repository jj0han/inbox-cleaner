# Phase 6 Summary: Unsubscribe Link Detection

Successfully implemented backend and frontend logic for detecting and executing email unsubscribes via `List-Unsubscribe` headers.

## Key Changes

### Backend (tRPC)
- **Metadata Fetching:** Updated `getPreview` to retrieve the `List-Unsubscribe` header for each email.
- **Header Parsing:** Implemented logic to extract either a one-click HTTP URL or a `mailto:` link from the header.
- **Unsubscribe Execution:**
    - **HTTP:** Server-side `fetch` for one-click URLs.
    - **Mailto:** Automatic email generation and sending via Gmail API (no client-side popups).
- **Bulk Support:** Added a `bulkUnsubscribe` procedure that processes batches serially to remain within API limits.

### Frontend (UI/UX)
- **Dashboard Toggle:** Added a `Switch` on the "Remover Newsletters" card to enable/disable bulk unsubscribe.
- **Dynamic UI:** The cleanup button text now updates to "Limpar e Descadastrar" when the toggle is active.
- **Preview Modal:**
    - **Status Badges:** Subtle blue badges indicate emails where an unsubscribe link was detected.
    - **Individual Actions:** Hovering over a row reveals a "Descadastrar" button for manual execution.
    - **Premium Notifications:** Integrated `sonner` for smooth, non-intrusive feedback on action results.

## Verification Results

### UNSUB-01: Badge Visibility
- [x] Verified: `getPreview` returns `unsubscribeUrl` and the badge renders correctly.

### UNSUB-02: Single Trigger
- [x] Verified: Clicking "Descadastrar" on a row triggers the mutation and shows a success toast.

### UNSUB-03: Bulk Choice
- [x] Verified: Toggle state is correctly passed to `useCleanup` and triggers `bulkUnsubscribe` batches.

## Technical Notes
- **Performance:** Bulk unsubscribe requires a `get` call per message to retrieve the header (since `list` doesn't include headers). We mitigate this by processing batches serially in the backend.
- **Dependencies:** Added `@shadcn/switch`, `@shadcn/label`, and `sonner`.
