# Inbox Cleaner

## What This Is

A smart, zero-setup web application that connects to Gmail to help users instantly clean up their chaotic inboxes. It replaces complex email management and manual filters with simple, 1-click automations — bulk archiving of newsletters, promotions, and social notifications, plus an AI-lite suggestion engine that detects repeat-sender patterns and creates persistent Gmail filters.

## Core Value

Provide immediate relief by cleaning thousands of useless emails with a single click, completely removing the cognitive load of inbox management.

## Current Milestone: v1.2 Analytics & User Feedback

**Goal:** Implement a comprehensive analytics dashboard and user feedback loop to visualize impact and refine the suggestion engine.

**Target features:**
- Impact Stats (Total Cleaned, Time Saved)
- Cleaning History Log
- Top Senders Breakdown Chart
- Suggestion Feedback (Thumbs Up/Down)
- Post-Action Success Survey
- Direct Feedback Widget

## Requirements

### Validated

- ✓ Gmail API integration (OAuth) — v1.0
- ✓ Dashboard Hero showing immediate impact ("You can clean X emails now") — v1.0
- ✓ Action Cards for 1-click executions (newsletters, promos, social, smart cleanup) — v1.0
- ✓ Smart Preview (shows 5-10 example emails before executing an action) — v1.0
- ✓ "Undo" functionality (30-second window after taking action) — v1.0
- ✓ Mass Unsubscribe / Archive Promos / Archive Social automations — v1.0
- ✓ "One-click intelligent cleanup" button — v1.0
- ✓ AI-lite suggested rules ("You never open X → auto-archive?") — v1.0
- ✓ Live email count badges on action cards — v1.0
- ✓ Real Gmail data in Preview Modal (sender, subject, snippet) — v1.1
- ✓ Unsubscribe link detection & background execution — v1.1
- ✓ Gmail API resilience (exponential backoff) — v1.1
- ✓ Dashboard error surfacing for failed suggestions — v1.1

### Active (v1.2)

- [ ] Define requirements for v1.2 categories (Stats, History, Feedback)
- [ ] Implement Analytics storage (Prisma)
- [ ] Build Stats Dashboard components
- [ ] Build Feedback/Suggestion tuning UI

### Out of Scope

- Outlook integration — deferred to focus on perfecting the Gmail experience first. Still valid.
- Manual rule/filter creation — goes against the core "zero setup" philosophy. Still valid.
- Native mobile apps — web app works well; PWA could be v2.

## Context

**v1.1 shipped 2026-04-30.** Hardened version with live previews and unsubscribe support. 8.4k LOC total.
**v1.0 shipped 2026-04-30.** Initial MVP with bulk archive and AI suggestions.

Tech stack: Next.js 15, tRPC, Prisma 7 (SQLite), Gmail API v1, NextAuth.js, Shadcn/ui, Tailwind CSS.

The app is now production-ready.

## Constraints

- **Design**: Clean, Notion-like aesthetic with large cards and ample white space.
- **Trust**: Reliable Undo feature and clear previews before data modification.
- **Simplicity**: Zero setup required from the user.
- **API Resilience**: Exponential backoff (withRetry) applied to all Gmail API calls.

## Evolution

This document evolves at phase transitions and milestone boundaries.

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

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with Web App | Easiest to build and access from anywhere | ✓ Good |
| Next.js + tRPC | Type-safe full-stack, zero API boilerplate | ✓ Good — high velocity |
| Prisma 7 + SQLite | Zero-config local DB for undo log | ✓ Good — no infra needed |
| resultSizeEstimate | Avoids expensive full list pagination for counts | ✓ Good — performant |
| 30s undo window | Enough time to reconsider, not annoying | ✓ Good — verified in UAT |
| withRetry utility | Essential for handling Gmail 429 rate limits | ✓ Good — resilience |
| mailto: server-send | Avoids browser "mailto:" popup friction | ✓ Good — seamless UX |
| tRPC Error Surfacing | Allow client to show "Try again" state | ✓ Good — user feedback |

---
*Last updated: 2026-05-01 — v1.2 started*
