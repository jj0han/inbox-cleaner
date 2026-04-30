# Phase 4: Smart Rules & Polish — Plan

**Phase:** 04-smart-rules-polish
**Status:** Ready to execute
**Requires:** 04-CONTEXT.md, 04-RESEARCH.md

---

## Objective

Deliver AI-lite sender-pattern suggestions with one-click apply (archive existing + Gmail filter) and full undo, plus dashboard polish (real counts, empty states, mobile, inbox counter fix).

---

## Wave 0 — Prerequisites (sequential, blocks everything)

### Plan 0.1 — Add `gmail.settings.basic` OAuth scope
**File:** `src/app/api/auth/[...nextauth]/route.ts`
**Change:** Add `https://www.googleapis.com/auth/gmail.settings.basic` to the `scope` string in the Google provider config. Without this, filter create/delete will 403.
**Verification:** Dev server restarts; on next sign-in the OAuth consent screen shows the new scope.

### Plan 0.2 — Extend Prisma schema with `filterId`
**File:** `prisma/schema.prisma`
**Change:** Add `filterId String?` field to `ActionLog` model to store the Gmail filter ID for undo.
```prisma
model ActionLog {
  ...
  filterId  String?   // Gmail filter ID — set when a rule is applied, used for undo
  ...
}
```
**Run:** `prisma migrate dev --name add_filterId_to_action_log`
**Verification:** Migration runs without error; `filterId` column exists in DB.

---

## Wave 1 — Server-side API (can run in parallel after Wave 0)

### Plan 1.1 — Add `getSummary` inbox count fix
**File:** `src/server/routers/inbox.ts`
**Change:** Replace `gmail.users.getProfile` call with `gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: 1 })`. Use `response.data.resultSizeEstimate` as the count value.
```ts
const response = await gmail.users.messages.list({
  userId: "me",
  labelIds: ["INBOX"],
  maxResults: 1,
});
return { messagesTotal: response.data.resultSizeEstimate || 0, error: null };
```
**Verification:** Dashboard shows a lower count than before (inbox-only vs all-mail). Count decreases after running a cleanup action.

### Plan 1.2 — Add `getCardCounts` tRPC query
**File:** `src/server/routers/inbox.ts`
**New procedure:** `getCardCounts` — runs Gmail queries for each action type and returns message counts per card. Same queries as `startCleanupAction` but **no DB writes**, just count.
```ts
getCardCounts: publicProcedure.query(async () => {
  const gmail = await getGmailClient();
  const queries = {
    NEWSLETTERS: "label:INBOX has:list-unsubscribe",
    PROMOTIONS: "label:INBOX category:promotions",
    SOCIAL: "label:INBOX category:social",
    SMART_CLEANUP: "label:INBOX (category:promotions OR category:social OR category:updates) older_than:30d",
  };
  const counts = await Promise.all(
    Object.entries(queries).map(async ([type, q]) => {
      const res = await gmail.users.messages.list({ userId: "me", q, maxResults: 1 });
      return [type, res.data.resultSizeEstimate || 0];
    })
  );
  return Object.fromEntries(counts) as Record<string, number>;
})
```
Wrap in try/catch with `{ NEWSLETTERS: 0, PROMOTIONS: 0, SOCIAL: 0, SMART_CLEANUP: 0, error: "gmail_auth_error" }` fallback.
**Verification:** tRPC call returns an object with 4 numeric values; each matches approximate email count for that category.

### Plan 1.3 — Add `getSuggestions` tRPC query
**File:** `src/server/routers/inbox.ts`
**New procedure:** `getSuggestions` — fetches unread inbox emails older than 14 days, groups by sender, returns top 3 with ≥ 3 emails.

**Algorithm:**
1. `messages.list({ q: "is:unread older_than:14d label:INBOX", maxResults: 100 })` — get up to 100 message IDs
2. Parallel chunk fetch: `Promise.all` in groups of 10 — each call `messages.get({ id, format: "metadata", metadataHeaders: ["From", "Date"] })`
3. Parse `From` header → extract email address (strip display name)
4. Group by email, count per sender, track oldest date seen
5. Filter: count ≥ 3 senders only
6. Sort: descending by count
7. Return top 3: `{ email: string, count: number, oldestDate: string }[]`

Fallback on Gmail auth error → return `[]`.
**Verification:** Returns array with up to 3 items; each has `email`, `count`, `oldestDate`. With real inbox, senders match known heavy senders.

### Plan 1.4 — Add `applySuggestion` tRPC mutation
**File:** `src/server/routers/inbox.ts`
**New procedure:** `applySuggestion` — input: `{ senderEmail: string }`. Does:
1. `messages.list({ q: "from:${senderEmail} label:INBOX", maxResults: 500 })` — get existing inbox emails
2. If messageIds.length > 0: `messages.batchModify` to remove INBOX label from all
3. `settings.filters.create` with `criteria: { from: senderEmail }, action: { removeLabelIds: ["INBOX"] }` — returns `filterId`
4. `db.actionLog.create` with `actionType: "RULE_APPLY"`, `userId`, `expiresAt: +30s`, `filterId`, and `items` mapping each messageId
5. Return `{ actionId, total: messageIds.length, messageIds, filterId }`

**Verification:** After calling `applySuggestion`, emails from that sender disappear from inbox. Gmail settings → Filters confirms the new filter exists.

### Plan 1.5 — Extend `undoAction` to handle `RULE_APPLY` type
**File:** `src/server/routers/inbox.ts`
**Change:** In `undoAction`, after restoring INBOX labels, check if `action.filterId` is set. If yes, call `gmail.users.settings.filters.delete({ userId: "me", id: action.filterId })`.
```ts
if (action.filterId) {
  await gmail.users.settings.filters.delete({
    userId: "me",
    id: action.filterId,
  });
}
```
**Verification:** After undo on a RULE_APPLY action, emails return to INBOX AND Gmail Filters settings no longer shows the filter.

---

## Wave 2 — Frontend (can run in parallel after Wave 1)

### Plan 2.1 — Add count badge to `ActionCard` component
**File:** `src/components/dashboard/action-card.tsx`
**Change:** Add optional `count?: number` prop. If `count` is defined and > 0, render a small badge in the top-right corner: `"{count} emails"`. While loading (count is undefined), render a skeleton badge.
```tsx
{count !== undefined ? (
  <span className="badge">{count} emails</span>
) : (
  <span className="badge-skeleton" />
)}
```
**Verification:** Each action card shows a count badge. Counts are non-zero when inbox has matching emails.

### Plan 2.2 — Wire `getCardCounts` into `dashboard-content.tsx`
**File:** `src/components/dashboard/dashboard-content.tsx`
**Change:** Add `trpc.inbox.getCardCounts.useQuery()` call. Pass each card's count from `data.NEWSLETTERS`, `data.PROMOTIONS` etc. to the corresponding `ActionCard` as the `count` prop. Handle `isLoading` state (pass `undefined` while loading).
**Verification:** Dashboard loads and action cards show spinner then count badges within a few seconds.

### Plan 2.3 — Build `SuggestionsSection` component
**File:** `src/components/dashboard/suggestions-section.tsx` (new file)

**Props:** `suggestions: Suggestion[]`, `isLoading: boolean`, `onRefresh: () => void`, `onApply: (email: string) => void`, `onDismiss: (email: string) => void`

**Layout:**
```
┌─ Sugestões Inteligentes ────────────────── [↻ Analisar novamente] ┐
│                                                                    │
│  marketing@loja.com · 23 emails não lidos · não abertos há 30d  [Arquivar] [✕] │
│  newsletter@news.com · 15 emails não lidos · não abertos há 45d  [Arquivar] [✕] │
│  updates@app.com    · 8  emails não lidos · não abertos há 22d   [Arquivar] [✕] │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Empty state (no suggestions after load):**
```
Sua caixa está ótima! Não encontramos padrões suspeitos. 🎉
```

**Loading state:** 3 skeleton rows while `isLoading`.

**Dismiss:** Client-side only — maintain `dismissedEmails: Set<string>` in local state; filter suggestions before rendering.

**Verification:** Section renders below action cards. Skeleton shows on load. After load, 0-3 suggestion rows appear. Dismiss removes a row. "Analisar novamente" triggers re-fetch.

### Plan 2.4 — Add `use-suggestion.ts` hook
**File:** `src/hooks/use-suggestion.ts` (new file)
**Pattern:** Mirror `use-cleanup.ts`. Uses `applySuggestion` mutation + `undoAction` mutation. Calls `startAction(actionId, total, "RULE_APPLY")` on the undo context after apply succeeds.
```ts
export function useSuggestion() {
  const { startAction } = useUndo();
  const applyMutation = trpc.inbox.applySuggestion.useMutation();
  const utils = trpc.useUtils();

  const apply = async (senderEmail: string) => {
    const result = await applyMutation.mutateAsync({ senderEmail });
    if (!result.actionId) return;
    startAction(result.actionId, result.total, "RULE_APPLY");
    utils.inbox.getSummary.invalidate();
    utils.inbox.getCardCounts.invalidate();
    utils.inbox.getSuggestions.invalidate();
  };

  return { apply, isPending: applyMutation.isPending };
}
```
**Verification:** Calling `apply()` triggers undo toast. Undo button within 30s reverses everything.

### Plan 2.5 — Wire suggestions into `dashboard-content.tsx`
**File:** `src/components/dashboard/dashboard-content.tsx`
**Changes:**
1. Add `trpc.inbox.getSuggestions.useQuery()` call
2. Import and render `<SuggestionsSection>` below the action card grid
3. Pass `onApply` from `useSuggestion().apply`
4. Pass `onRefresh` → `utils.inbox.getSuggestions.refetch()`
**Verification:** Full flow works end-to-end: suggestions load, apply works, undo toast appears, undo reverses the action.

### Plan 2.6 — Mobile layout audit
**Files:** `src/components/dashboard/dashboard-content.tsx`, `src/components/dashboard/suggestions-section.tsx`, `src/app/dashboard/page.tsx`
**Changes:**
- Confirm action cards grid uses `grid-cols-1 sm:grid-cols-2` (fix if not)
- `SuggestionsSection` renders as a single column list on all screen sizes
- Undo toast: add `max-w-[calc(100vw-2rem)]` to prevent overflow on small screens
- Test at 375px viewport in browser devtools
**Verification:** Dashboard is usable at 375px width. No horizontal scroll. Cards stack correctly.

---

## Wave 3 — Validation

### Plan 3.1 — End-to-end UAT checklist
Manual verification steps:
1. Fresh sign-in → OAuth now requests `gmail.settings.basic` scope (user sees it in consent screen)
2. Dashboard loads → inbox count reflects INBOX size (lower than before)
3. Action cards show count badges
4. Suggestions section shows up to 3 rows with correct sender info
5. Click "Arquivar" on suggestion → toast appears, emails archive, Gmail filter created
6. Click "Desfazer" within 30s → emails back in INBOX, Gmail filter deleted
7. Dismiss suggestion → row disappears without taking action
8. "Analisar novamente" → section re-fetches
9. Empty suggestions → friendly empty state message shown
10. Mobile: test at 375px — no layout breakage

---

## Commit Plan

| Wave | Commit message |
|------|---------------|
| 0.1 | `feat(auth): add gmail.settings.basic OAuth scope for filter management` |
| 0.2 | `feat(db): add filterId field to ActionLog for rule undo` |
| 1.1 | `fix(inbox): use INBOX label list for accurate inbox count` |
| 1.2 | `feat(inbox): add getCardCounts tRPC query for action badge counts` |
| 1.3 | `feat(inbox): add getSuggestions query with sender-pattern analysis` |
| 1.4 | `feat(inbox): add applySuggestion mutation with archive + filter create` |
| 1.5 | `feat(inbox): extend undoAction to delete Gmail filter on RULE_APPLY undo` |
| 2.1 | `feat(ui): add count badge prop to ActionCard` |
| 2.2 | `feat(dashboard): wire getCardCounts to action card badges` |
| 2.3 | `feat(ui): add SuggestionsSection component with loading/empty states` |
| 2.4 | `feat(hooks): add useSuggestion hook for apply flow and undo integration` |
| 2.5 | `feat(dashboard): wire suggestions section into dashboard` |
| 2.6 | `fix(ui): mobile layout audit for dashboard and undo toast` |

---

## Risk Notes

- **OAuth scope change** requires user re-authentication (expected, documented in UAT)
- **`getSuggestions` performance:** 100 messages × metadata fetch = ~10 parallel calls. Acceptable for phase 4, but document as a known bottleneck.
- **Filter 403:** If scope isn't added to OAuth config, filter create will 403. Plan 0.1 must complete before Plan 1.4.
- **Staleness text:** Use `dayjs` or manual date math (`Math.floor((now - oldestDate) / 86400000)` days) — no new dependency needed.
