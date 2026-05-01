# Milestones

## v1.1 Real Preview, Polish & Unsubscribe (Shipped: 2026-04-30)

**Delivered:** Production-ready Gmail dashboard with live email previews, automated unsubscribe execution, and hardened API resilience.

**Phases completed:** 5-8 (7 plans total)

**Key accomplishments:**
- **Live Email Previews** — Replaced mock data with real sender/subject/snippet fetches from Gmail API.
- **Automated Unsubscribe** — Implemented header detection and background execution for mailto: and HTTP links.
- **Gmail API Resilience** — Implemented `withRetry` with exponential backoff for all Gmail API call sites.
- **Error Surfacing** — Added proper tRPC error handling to show retry states in the Suggestions section.
- **Hardened Cleanup** — Applied retry protection to bulk archive and filter creation actions.

**Stats:**
- 41 files modified
- 2,549 lines of code added/changed
- 4 phases, 7 plans, 20+ tasks
- 9 hours from v1.0 to v1.1

**Git range:** `75e25bc` → `edecdd6`

**What's next:** v1.2 Analytics & User Feedback

---

*Archive: `.planning/milestones/v1.1-ROADMAP.md`*


## v1.0 MVP — Inbox Cleaner

**Shipped:** 2026-04-30  
**Phases:** 4 | **Plans:** 13 | **Commits:** 45  
**Timeline:** 2 days (2026-04-29 → 2026-04-30)  
**Tech:** Next.js 15, tRPC, Prisma 7 (SQLite), Gmail API v1, NextAuth.js

### Delivered

A complete Gmail inbox cleaning app: OAuth login, inbox analysis, 4 one-click cleanup actions (newsletters, promotions, social, smart), 30-second undo, AI-lite sender pattern suggestions with auto-archive rules, live email count badges on action cards, and accurate inbox counting.

### Key Accomplishments
1. **Google OAuth + Gmail API** — NextAuth integration with access token forwarding; metadata-only reads (no bodies stored)
2. **Dashboard + Action Cards** — Notion-style UI with preview modal, count badges, and progress overlay
3. **4 Cleanup Actions + Undo** — batchModify archiving, Prisma undo log, 30s countdown toast with full revert
4. **Smart Suggestions Engine** — pattern analysis across 100 unread emails, top 3 repeat senders surfaced
5. **Gmail Filter Creation** — `applySuggestion` creates real Gmail filters; undo deletes them too
6. **Bug fixes** — accurate INBOX count (not account total), duplicate filter handling, Prisma client regeneration

### Known Deferred Items
- `getPreview` uses hardcoded mock data (not live Gmail preview)
- `getCardCounts` makes 4 parallel API calls — no rate-limit backoff
- No error boundary for `SuggestionsSection` failures

---
*Archive: `.planning/milestones/v1.0-ROADMAP.md`*
