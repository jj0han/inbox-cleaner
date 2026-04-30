# Inbox Cleaner

## What This Is

A smart, zero-setup web application that connects to Gmail to help users instantly clean up their chaotic inboxes. It replaces complex email management and manual filters with simple, 1-click automations — bulk archiving of newsletters, promotions, and social notifications, plus an AI-lite suggestion engine that detects repeat-sender patterns and creates persistent Gmail filters.

## Core Value

Provide immediate relief by cleaning thousands of useless emails with a single click, completely removing the cognitive load of inbox management.

## Requirements

### Validated (v1.0)

- ✓ Gmail API integration (OAuth) — v1.0
- ✓ Dashboard Hero showing immediate impact ("You can clean X emails now") — v1.0
- ✓ Action Cards for 1-click executions (newsletters, promos, social, smart cleanup) — v1.0
- ✓ Smart Preview (shows 5-10 example emails before executing an action) — v1.0
- ✓ "Undo" functionality (30-second window after taking action) — v1.0
- ✓ Mass Unsubscribe / Archive Promos / Archive Social automations — v1.0
- ✓ "One-click intelligent cleanup" button — v1.0
- ✓ AI-lite suggested rules ("You never open X → auto-archive?") — v1.0
- ✓ Live email count badges on action cards — v1.0

### Active (v1.1 candidates)

- [ ] Real Gmail preview in PreviewModal (currently hardcoded mocks)
- [ ] Rate-limit backoff for `getCardCounts` parallel calls
- [ ] Error boundary for `SuggestionsSection`
- [ ] Unsubscribe link detection (actual unsubscribe, not just archive)
- [ ] Mobile-optimized layout (current: responsive web; future: PWA)

### Out of Scope

- Outlook integration — deferred to focus on perfecting the Gmail experience first. Still valid.
- Manual rule/filter creation — goes against the core "zero setup" philosophy. Still valid.
- Native mobile apps — web app works well; PWA could be v2.

## Context

**v1.0 shipped 2026-04-30.** Built in 2 days, 45 commits, 4 phases.

Tech stack: Next.js 15, tRPC, Prisma 7 (SQLite), Gmail API v1, NextAuth.js, Shadcn/ui, Tailwind CSS.

The app works end-to-end: Google login → inbox analysis → 4 bulk cleanup actions → undo → AI suggestions → Gmail filter creation. Core user flow is complete and verified.

Known limitations: preview modal uses mock data; suggestion engine is pattern-based (frequency), not ML. Both are intentional for v1 speed.

## Constraints

- **Design**: Clean, Notion-like aesthetic with large cards and ample white space — reduces decision fatigue.
- **Trust**: Must provide clear previews and a reliable Undo feature — essential for actions that affect user data.
- **Simplicity**: Zero setup required from the user — the app must do the heavy lifting.
- **API**: Gmail API rate limits apply; batch calls used where possible to stay within quota.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with Web App | Easiest to build and access from anywhere | ✓ Good |
| Focus only on Gmail first | Validate concept before handling multiple APIs | ✓ Good |
| Next.js + tRPC | Type-safe full-stack, zero API boilerplate | ✓ Good — high velocity |
| Prisma 7 + SQLite | Zero-config local DB for undo log | ✓ Good — no infra needed |
| Gmail batchModify | Single API call for bulk archive/restore | ✓ Good — fast and reliable |
| gmail.settings.basic scope | Required for Gmail filter CRUD | ✓ Good — users need re-auth |
| resultSizeEstimate for counts | Avoids expensive full list pagination | ✓ Good — performant approximation |
| 30s undo window | Enough time to reconsider, not annoying | ✓ Good — verified in UAT |
| Inline suggestion engine | Pattern analysis without ML dependency | ✓ Good for v1 speed |

## Evolution

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-30 after v1.0 milestone*
