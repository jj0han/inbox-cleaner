# Requirements: Milestone v1.2 Analytics & User Feedback

## [STATS] Impact & Analytics
- [ ] **STATS-01**: Track total emails archived/deleted across all actions (persisted in DB).
- [ ] **STATS-02**: Calculate "Time Saved" based on a constant multiplier (e.g., 2s per email).
- [ ] **STATS-03**: Display Impact Stats card on the main dashboard hero.
- [ ] **STATS-04**: Generate a "Top Senders" report showing the top 5 most frequent unread senders.

## [HIST] Cleaning History
- [ ] **HIST-01**: Log every cleanup action (Type, Count, Timestamp, Sender context).
- [ ] **HIST-02**: Display a "Recent History" list in the dashboard (last 5-10 actions).
- [ ] **HIST-03**: Support "Undo" directly from the history log for recent actions.

## [FEED] User Feedback Loop
- [ ] **FEED-01**: Implement Thumbs Up/Down feedback for each Smart Suggestion.
- [ ] **FEED-02**: Persist suggestion feedback to influence future engine analysis (ignore disliked senders).
- [ ] **FEED-03**: Add a simple "Send Feedback" button/modal for general app feedback.
- [ ] **FEED-04**: Prompt for a 1-click "How was this?" survey after a large cleanup action (>50 emails).

## Future Requirements
- [ ] Weekly/Monthly cleanup email reports.
- [ ] Custom analytics date ranges.

## Out of Scope
- Integration with external analytics platforms (Segment, Mixpanel) — keep data local to SQLite for now.
- Advanced sender profiling (social media link extraction, etc.).

## Traceability
| REQ-ID | Phase | Status |
|--------|-------|--------|
| STATS-01 | Phase 9 | 🔄 Active |
| STATS-02 | Phase 9 | 🔄 Active |
| STATS-03 | Phase 9 | 🔄 Active |
| STATS-04 | Phase 11 | ⏳ Pending |
| HIST-01 | Phase 10 | ⏳ Pending |
| HIST-02 | Phase 10 | ⏳ Pending |
| HIST-03 | Phase 10 | ⏳ Pending |
| FEED-01 | Phase 11 | ⏳ Pending |
| FEED-02 | Phase 11 | ⏳ Pending |
| FEED-03 | Phase 11 | ⏳ Pending |
| FEED-04 | Phase 11 | ⏳ Pending |
