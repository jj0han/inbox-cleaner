# Phase 4: Smart Rules & Polish — Discussion Log

**Date:** 2026-04-30
**Phase:** 04-smart-rules-polish
**Participants:** User + AI (discuss-phase)

---

## Area 1: Rule Generation Logic

**Question 1:** How should rules be triggered?
**Options:** On dashboard load / On demand (button) / Once per session
**User:** Mix of 1 and 2 — auto-load on dashboard open, plus a manual refresh button
**Notes:** tRPC query fires on mount + refetch on button click

**Question 2:** What makes a sender eligible?
**Options:** ≥5 unread / ≥3 unread older than 14d / ≥10 total emails
**User:** Option 2 — ≥3 unread emails older than 14 days
**Notes:** Combines count + staleness = stronger "you're ignoring these" signal

**Question 3:** How many suggestions max?
**Options:** Top 3 / Top 5 / Top 10
**User:** Top 3

---

## Area 2: Rule Presentation UI

**Question 1:** Where should suggestions appear?
**Options:** New section below action cards / Inline in hero / Collapsible section
**User:** Option 1 — new "Sugestões Inteligentes" section below action cards

**Question 2:** What info per suggestion row?
**Options:** Sender + count / + reason / + reason + dismiss
**User:** Option 3 — sender, count, reason (staleness), dismiss (✕), Arquivar button

---

## Area 3: Apply Rule Behavior

**Question 1:** What happens on "Arquivar"?
**Options:** Archive existing only / Future filter only / Both
**User:** Option 3 — archive existing emails AND create Gmail filter for future

**Question 2:** Should it be undoable?
**Options:** Full undo (archive + filter) / No undo / Partial undo (archive only)
**User:** Option 1 — full undo: reverse archive AND delete the Gmail filter

---

## Area 4: Polish Scope

**Question:** Which polish items to include?
**Options:** Real counts per card / Empty states / Mobile layout / Inbox count fix
**User:** All 4

---

## Deferred Ideas

- Persist dismissed suggestions to DB (survive refresh)
- Domain-level suggestions (not just exact sender match)
