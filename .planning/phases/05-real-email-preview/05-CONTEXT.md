# Phase 5 Context: Real Email Preview

**Phase:** 5 — Real Email Preview
**Goal:** Replace hardcoded mock data in PreviewModal with live Gmail fetches — real sender, subject, and body snippet, scoped to the selected action type.
**Date:** 2026-04-30

---

## Domain

Replace `getPreview` (currently a parameterless mock) with a live tRPC query that:
1. Accepts the action type as input
2. Runs the same Gmail query as `startCleanupAction` for that type (newsletter/promo/social/smart)
3. Fetches up to 10 messages with metadata + snippet
4. Returns `{ id, sender, subject, snippet }[]` to the PreviewModal

---

## Decisions

### Email data per row (Area B — user-selected)
- **Fields:** `sender` (From header display name/email), `subject` (Subject header), `snippet` (~100 chars of body)
- **UI:** 3-line row — sender bold on line 1, subject on line 2, snippet muted/smaller on line 3
- The `snippet` field is returned directly by the Gmail API on the message object when using `format: "metadata"` — no extra fetch needed for it

### Fetch strategy (Area C — user-selected)
- **Approach:** Single `messages.list(maxResults: 10, q: <action-type-query>)` → then one `Promise.all` of up to 10 `.get({ format: "metadata", metadataHeaders: ["From", "Subject"] })` calls
- **Why:** Keeps it simple and fast. Metadata format is cheap; snippet comes for free on the get response
- **No chunking needed** — 10 messages max, all fetched in parallel in one batch

### Action type routing (Area A — agent discretion)
- `getPreview` must become an **input-bearing query**: `.input(z.object({ type: z.enum(["NEWSLETTERS", "PROMOTIONS", "SOCIAL", "SMART_CLEANUP"]) }))`
- The Gmail `q` string per type is identical to the ones in `startCleanupAction` — reuse the same query map
- `PreviewModal` must accept a `type` prop (the enum value) in addition to `title`
- `dashboard-content.tsx` passes the enum type when calling `setPreviewAction` (currently passes only the title string)
- **State shape change:** `previewAction` state should be `{ type: ActionType; title: string } | null` instead of `string | null`

---

## Code Context

### Reusable assets
- `src/server/routers/inbox.ts` — `getGmailClient()` helper, same query strings as `startCleanupAction`, pattern for `Promise.all` metadata fetch from `getSuggestions`
- `src/components/dashboard/preview-modal.tsx` — existing skeleton, scroll area, and error state; just needs `type` prop + real data
- `src/components/dashboard/dashboard-content.tsx` — `previewAction` state currently `string | null`; needs shape change to `{ type, title } | null`
- `src/components/ui/skeleton.tsx`, `dialog.tsx`, `scroll-area.tsx` — all already imported in PreviewModal

### Gmail query map (same as startCleanupAction — copy this)
```ts
const PREVIEW_QUERIES: Record<string, string> = {
  NEWSLETTERS:   "label:INBOX has:list-unsubscribe",
  PROMOTIONS:    "label:INBOX category:promotions",
  SOCIAL:        "label:INBOX category:social",
  SMART_CLEANUP: "label:INBOX (category:promotions OR category:social OR category:updates) older_than:30d",
};
```

### Pattern to follow for batch get (from getSuggestions)
```ts
const details = await Promise.all(
  messages.map(m =>
    gmail.users.messages.get({
      userId: "me",
      id: m.id!,
      format: "metadata",
      metadataHeaders: ["From", "Subject"],
    })
  )
);
// snippet comes from detail.data.snippet
```

---

## Canonical Refs

- `src/server/routers/inbox.ts` — `getPreview` (lines 41-51, to replace), `getSuggestions` (lines 192-262, fetch pattern to follow), `startCleanupAction` (lines 53-98, query strings to reuse)
- `src/components/dashboard/preview-modal.tsx` — full file, UI to extend with snippet row
- `src/components/dashboard/dashboard-content.tsx` — `previewAction` state and `PreviewModal` props (lines 23, 97-101)
- `.planning/REQUIREMENTS.md` — PREV-01, PREV-02, PREV-03

---

## Out of Scope (this phase)

- Unsubscribe link detection — Phase 6
- Rate-limit backoff — Phase 7
- Pagination / "load more" in preview modal — future
