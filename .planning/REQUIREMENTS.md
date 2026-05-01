# Requirements — v1.1 Real Preview, Polish & Unsubscribe

## v1.1 Requirements

### Preview (PREV)
- [x] **PREV-01**: Dashboard preview rows show Sender Name and Subject for real inbox items
- [x] **PREV-02**: Dashboard preview rows show a snippet of the email body
- [x] **PREV-03**: Preview Modal fetches emails specific to the selected action type (newsletters, promos, social)

### Polish & Resilience (POL)
- [x] **POL-01**: App handles Gmail API rate limits (429) gracefully — retries with backoff, no crash or blank screen
- [x] **POL-02**: SuggestionsSection shows an error state with a "Try again" button when analysis fails
- [x] **POL-03**: Individual action card count failures degrade gracefully (show "—" instead of crashing)

### Unsubscribe (UNSUB)
- [x] **UNSUB-01**: User can see which emails in the Preview Modal have a detectable unsubscribe link
- [x] **UNSUB-02**: User can trigger a real unsubscribe (mailto or HTTP one-click) from the Preview Modal
- [x] **UNSUB-03**: User can choose "Archive only" or "Unsubscribe + Archive" when running the Newsletters cleanup

## Future Requirements (Deferred)
- Outlook integration — deferred to v2
- Native mobile apps — deferred to v2
- ML-based inbox scoring — out of scope for pattern-based approach

## Out of Scope
- Reading or replying to emails — not an email client
- Complex manual filter creation — violates zero-setup philosophy
- Batch unsubscribe without user review — trust issue

## Traceability
- **PREV-01, PREV-02, PREV-03** → Phase 5
- **UNSUB-01, UNSUB-02, UNSUB-03** → Phase 6
- **POL-01, POL-02, POL-03** → Phase 7 & 8
