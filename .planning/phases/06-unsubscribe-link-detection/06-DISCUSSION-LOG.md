# Phase 6 Discussion Log: Unsubscribe Link Detection

**Date:** 2026-04-30
**Phase:** 6

---

## Gray Areas Discussed

### 1. Unsubscribe Execution Engine
- **Options presented:** A) Backend-Only (Recommended), B) Hybrid (Client mailto, Backend HTTP).
- **User selection:** **A (Backend-Only)**.
- **Reasoning:** Backend handling both formats avoids CORS issues with HTTP links and allows the app to send "unsubscribe" emails silently via the Gmail API instead of opening the user's local mail client.

### 2. Newsletters Cleanup Flow
- **Options presented:** A) ActionCard Toggle, B) Post-Click Confirmation, C) Preview Modal Focus.
- **User selection:** **A (ActionCard Toggle)**.
- **Reasoning:** Fits the "Zero-Setup" philosophy. The user sees the choice immediately on the dashboard and can decide once before firing the cleanup.

### 3. Preview Modal UI Layout (Badge)
- **Options presented:** Subtle badge in top-right with hover reveal.
- **User selection:** **Yes**.
- **Reasoning:** Keeps the UI clean and premium, only showing the action when the user is focused on a specific row.

---

## Deferred Ideas
- *None in this session.*
