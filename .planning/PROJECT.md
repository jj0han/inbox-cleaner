# Inbox Cleaner

## What This Is

A smart, zero-setup web application that connects to Gmail to help users instantly clean up their chaotic inboxes. It replaces complex email management and manual filters with simple, 1-click automations like bulk unsubscribing, archiving old newsletters, and auto-categorizing emails.

## Core Value

Provide immediate relief by cleaning thousands of useless emails with a single click, completely removing the cognitive load of inbox management.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Gmail API integration (OAuth)
- [ ] Dashboard Hero showing immediate impact ("You can clean X emails now")
- [ ] Action Cards for 1-click executions (e.g., "Remove old newsletters", "Archive promos", "Cancel subscriptions")
- [ ] Smart Preview (shows 5-10 examples and main senders before executing an action)
- [ ] "Undo" functionality (10-30 seconds window after taking action)
- [ ] Mass Unsubscribe logic (detecting patterns, headers, links)
- [ ] Intelligent auto-categorization (Promotions, Social, Updates, Work)
- [ ] "One-click cleanup inteligente" button (archives old newsletters, removes promos, keeps personal)
- [ ] AI-lite suggested rules ("You never open X -> auto-archive?")

### Out of Scope

- Outlook integration — deferred to focus on perfecting the Gmail experience first.
- Manual rule/filter creation — goes against the core "zero setup" philosophy.
- Native mobile apps — starting with a web app accessible from anywhere.

## Context

Users are overwhelmed by inbox zero strategies that require manual folder organization and complex rules. They don't want to "manage" emails; they want to push a button and make the clutter disappear. The UI must reflect this simplicity with a clean, Notion-style aesthetic, large action cards, plenty of white space, and clear copy that builds trust ("We never delete without confirmation").

## Constraints

- **Design**: Clean, Notion-like aesthetic with large cards and ample white space — reduces decision fatigue.
- **Trust**: Must provide clear previews and a reliable Undo feature — essential for actions that affect user data.
- **Simplicity**: Zero setup required from the user — the app must do the heavy lifting.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with Web App | Easiest to build and access from anywhere. | — Pending |
| Focus only on Gmail first | Validating the concept and getting it perfect before handling multiple APIs. | — Pending |

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

---
*Last updated: 2026-04-29 after initialization*
