# Phase 6 Context: Unsubscribe Link Detection

**Phase:** 6 — Unsubscribe Link Detection
**Goal:** Detect and execute real unsubscribes from List-Unsubscribe headers. Add a toggle to the Newsletters cleanup flow for "Unsubscribe + Archive".
**Date:** 2026-04-30

---

## Domain

Enhance the "Newsletters" cleanup and `PreviewModal` with real unsubscribe capabilities by:
1. Fetching `List-Unsubscribe` headers for emails in the preview.
2. Displaying an "Unsubscribe available" badge in the UI.
3. Providing a backend-driven mechanism to execute these unsubscribes (HTTP or Mailto).
4. Adding an "Unsubscribe" toggle to the Newsletter action card.

---

## Decisions

### Unsubscribe Execution (Area 1 — user-selected)
- **Backend-Only:** The tRPC backend will handle the parsing and execution of unsubscribe links.
- **HTTP:** Backend will perform a `fetch` (GET/POST) to the unsubscribe URL.
- **Mailto:** Backend will send a "Unsubscribe" email on behalf of the user via the Gmail API.
- **Why:** Avoids CORS issues, ensures consistency, and allows for reliable success/fail logging.

### Newsletters Flow (Area 3 — user-selected)
- **ActionCard Toggle:** Add a Shadcn `Switch` to the "Remover Newsletters" card.
- **State:** `[ ] Descadastrar e arquivar`.
- **Behavior:** If toggled ON, the bulk cleanup action will attempt to unsubscribe from each message before archiving it. The button text should update (e.g., "Limpar e Descadastrar").

### UI Layout (Area 2 — agent discretion)
- **Preview Modal Badge:** A small, subtle badge (e.g., `text-[10px] bg-blue-50 text-blue-600`) in the top-right of the email row.
- **Hover Action:** On hover of the email row, reveal an "Unsubscribe Now" button/link that triggers a single-email unsubscribe.

---

## Code Context

### Reusable assets
- `src/server/routers/inbox.ts` — Add `List-Unsubscribe` to `metadataHeaders` in `getPreview`. Add a new `unsubscribe` procedure.
- `src/components/dashboard/action-card.tsx` — Add support for an optional `footer` or toggle section.
- `src/components/dashboard/dashboard-content.tsx` — Add state for the `unsubscribeEnabled` toggle.
- `src/components/ui/switch.tsx` — Use for the toggle.

### Patterns to follow
- **Header Parsing:** `headers.find(h => h.name === 'List-Unsubscribe')?.value`
- **Mailto Sending:** Use `gmail.users.messages.send` with a basic RFC822 message if the header contains `mailto:`.

---

## Canonical Refs

- `src/server/routers/inbox.ts` — `getPreview` (to fetch headers), new `unsubscribe` and `bulkUnsubscribe` logic.
- `src/components/dashboard/preview-modal.tsx` — UI for the eligibility badge and per-email action.
- `src/components/dashboard/action-card.tsx` — UI for the "Unsubscribe" toggle.
- `.planning/REQUIREMENTS.md` — UNSUB-01, UNSUB-02, UNSUB-03

---

## Out of Scope (this phase)

- Auto-detecting unsubscribe links *inside* the email body (only headers for now).
- Automatic bulk unsubscribe without user opting in via the toggle.
- Phase 7 polish (rate limits, retries).
