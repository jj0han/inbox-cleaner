# Phase 05: Real Email Preview - Verification

**Status:** Verified
**Date:** 2026-04-30

## UAT Criteria

### PREV-01: Metadata Extraction
- [x] Dashboard preview rows show Sender Name/Email correctly.
- [x] Dashboard preview rows show Subject line.
- [x] Modal shows full metadata.

### PREV-02: Snippet Visibility
- [x] Dashboard preview rows show a snippet of the email body.
- [x] Modal shows snippet/body content.

### PREV-03: Unsubscribe Link Detection
- [x] Router correctly extracts `List-Unsubscribe` headers.
- [x] Detection logic handles both `mailto:` and `https://` links.
- [x] Unsubscribe links are passed to the frontend for action.

## Evidence
- `src/server/routers/inbox.ts`: `getPreview` procedure uses `format: "metadata"` and extracts headers.
- `src/components/dashboard/email-preview-modal.tsx`: Displays sender, subject, and snippet.
- Manual test: Newsletter emails show "Unsubscribe" action in modal.
