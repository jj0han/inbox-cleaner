# Phase 5 Summary: Real Email Preview

**Completed:** 2026-04-30
**Plans executed:** 05-01, 05-02, 05-03
**Commit:** feat(05): replace mock getPreview with live Gmail fetch + snippet UI

---

## What Was Built

Replaced the hardcoded 5-email mock in `getPreview` with a live Gmail-backed tRPC query. The PreviewModal now shows real emails from the user's inbox, scoped to the selected action type (newsletters, social, etc.), with sender name, subject, and a 120-char body snippet per row.

---

## Changes Made

### `src/server/routers/inbox.ts`
- `getPreview` converted from parameterless mock to input-bearing query accepting `type: z.enum([...]))`
- Runs the same Gmail query map as `startCleanupAction` scoped by action type
- Fetches top 10 messages via `messages.list` + `Promise.all` of 10 `.get(format: "metadata")` calls
- Extracts `sender` (display name preferred), `subject`, and `snippet` (sliced to 120 chars) per message
- Returns `{ emails: [], error: "gmail_auth_error" }` gracefully on auth failures

### `src/components/dashboard/dashboard-content.tsx`
- `previewAction` state changed from `string | null` to `{ type: ActionType; title: string } | null`
- Both ActionCard `onPreviewClick` handlers updated to pass typed objects
- `PreviewModal` now receives `type` and `title` props separately

### `src/components/dashboard/preview-modal.tsx`
- Added `type: ActionType` prop to interface
- `getPreview.useQuery(undefined, ...)` replaced with `getPreview.useQuery({ type }, { enabled: isOpen })`
- Each email row now renders 3 lines: sender (bold), subject, snippet (muted xs)
- Skeleton loading updated to 3 lines per row (matching real layout)
- Added dedicated amber warning state for `gmail_auth_error`

---

## Verification

- `pnpm tsc --noEmit` → exits 0 (clean)
- No hardcoded mock emails remain (`marketing@loja.com` gone)
- `getPreview` input schema uses `z.enum(["NEWSLETTERS", "PROMOTIONS", "SOCIAL", "SMART_CLEANUP"])`
- Snippet rendered with `text-xs text-zinc-400 mt-0.5 truncate`

---

## Requirements Addressed

- PREV-01: Preview shows real emails from the user's Gmail inbox ✅
- PREV-02: Preview is scoped to the selected action type ✅
- PREV-03: Preview rows show sender, subject, and snippet ✅
