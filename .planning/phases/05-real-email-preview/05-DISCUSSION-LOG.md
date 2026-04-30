# Phase 5 Discussion Log

**Phase:** 5 — Real Email Preview
**Date:** 2026-04-30
**Areas selected:** B (Email data depth), C (Fetch strategy)
**Area A:** Agent discretion (technical prerequisite, not a vision question)

---

## Area A — Action type routing (agent discretion)

**Question:** How should `getPreview` know which card was clicked?
**Decision (agent):** `getPreview` becomes an input-bearing query accepting `type: z.enum([...])`. `PreviewModal` gets a `type` prop. Dashboard `previewAction` state changes shape to `{ type, title } | null`.
**Rationale:** Clear technical prerequisite for scoping the Gmail query. No user vision involved.

---

## Area B — Email data depth

**Question:** What fields should each preview row show?
**Options presented:**
1. Sender + Subject only — keep minimal
2. Sender + Subject + Snippet — add ~100 chars of body *(recommended)*
3. Sender + Subject + Snippet + Date — full context, dense

**User selected:** Sender + Subject + Snippet

---

## Area C — Fetch strategy

**Question:** How many emails to fetch and how fast?
**Options presented:**
1. Single list + batch get — `messages.list(max 10)` → `Promise.all` of 10 `.get(format: "metadata")` *(recommended)*
2. List only with `format: "full"` — 1 round trip but heavier payload
3. You decide — agent picks at planning time

**User selected:** Single list + batch get

---

## Deferred Ideas

None raised during discussion.
