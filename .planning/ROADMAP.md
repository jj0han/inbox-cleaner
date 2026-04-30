# Roadmap: Inbox Cleaner

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-04-30)
- 🚧 **v1.1 Real Preview, Polish & Unsubscribe** — Phases 5-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-04-30</summary>

- [x] Phase 1: Foundation & Authentication — completed 2026-04-29
- [x] Phase 2: UI Dashboard & Smart Preview — completed 2026-04-29
- [x] Phase 3: Core Automations & Undo — completed 2026-04-30
- [x] Phase 4: Smart Rules & Polish — completed 2026-04-30

</details>

### 🚧 v1.1 Real Preview, Polish & Unsubscribe

## Phase 5: Real Email Preview
**Goal:** Replace hardcoded mock data in PreviewModal with live Gmail fetches.
**Requirements:** PREV-01, PREV-02, PREV-03
**Success Criteria:**
- [ ] Preview Modal shows real sender name and subject for each cleanup type
- [ ] Each email row includes a short snippet (first 120 chars of body)
- [ ] Emails shown are specific to the action type (newsletters query, promos query, etc.)
- [ ] Loading skeleton shown while fetching; empty state when no emails found

## Phase 6: Unsubscribe Link Detection
**Goal:** Detect and execute real unsubscribes from List-Unsubscribe headers.
**Requirements:** UNSUB-01, UNSUB-02, UNSUB-03
**Success Criteria:**
- [ ] Preview Modal badges show "Unsubscribe available" for emails with List-Unsubscribe header
- [ ] Clicking "Unsubscribe" fires the appropriate mailto: or HTTP GET request
- [ ] Newsletters cleanup action offers "Archive only" vs "Unsubscribe + Archive" choice
- [ ] Unsubscribe attempts are logged (success/fail) and shown to user

## Phase 7: Polish & Resilience
**Goal:** Harden the app against API failures and rate limits.
**Requirements:** POL-01, POL-02, POL-03
**Success Criteria:**
- [ ] 429 errors from Gmail API trigger exponential backoff and retry (max 3 attempts)
- [ ] SuggestionsSection shows error card with "Try again" button on analysis failure
- [ ] Individual card count failures show "—" badge instead of crashing the dashboard
- [ ] No unhandled promise rejections visible in browser console during normal usage

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1. Foundation & Authentication | v1.0 | ✅ Complete | 2026-04-29 |
| 2. UI Dashboard & Smart Preview | v1.0 | ✅ Complete | 2026-04-29 |
| 3. Core Automations & Undo | v1.0 | ✅ Complete | 2026-04-30 |
| 4. Smart Rules & Polish | v1.0 | ✅ Complete | 2026-04-30 |
| 5. Real Email Preview | v1.1 | 🔲 Not started | — |
| 6. Unsubscribe Link Detection | v1.1 | 🔲 Not started | — |
| 7. Polish & Resilience | v1.1 | 🔲 Not started | — |
