---
phase: 2
slug: ui-dashboard-smart-preview
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (Using visual manual tests for now) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint` or check browser.
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Build must pass.
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | DASH-01 | - | - | build | `npm run build` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | DASH-01 | - | - | build | `npm run build` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 2 | DASH-02 | - | - | build | `npm run build` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 2 | SAFE-01 | - | - | build | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- None — Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual Dashboard | DASH-01 | UI components | Open browser, login, check dashboard layout |
| Action Cards Render | DASH-02 | UI components | Verify cards appear correctly |
| Preview Modal | SAFE-01 | Interactive UI | Click card, verify modal opens with 5 emails |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-30
