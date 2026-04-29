# Requirements

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can securely connect their Gmail account via OAuth
- [ ] **AUTH-02**: System synchronizes inbox metadata without downloading full message bodies

### Dashboard
- [ ] **DASH-01**: User can view a Hero section showing total emails available to clean immediately
- [ ] **DASH-02**: User can view Action Cards summarizing potential cleanups (e.g., newsletters, promos)

### Automations
- [ ] **AUTO-01**: User can execute a "Mass Unsubscribe" action using detected patterns/links
- [ ] **AUTO-02**: User can execute an "Archive Promos" action for emails older than a specified timeframe
- [ ] **AUTO-03**: User can use the "Intelligent 1-Click Cleanup" button to archive old newsletters and promos while keeping personal emails
- [ ] **AUTO-04**: User can set up suggested auto-archive rules based on their reading habits

### Trust & Safety
- [ ] **SAFE-01**: User can view a Smart Preview of 5-10 emails before executing any bulk action
- [ ] **SAFE-02**: User can click "Undo" within 10-30 seconds after any bulk action to revert it

## v2 Requirements (Deferred)
- Outlook integration
- Mobile native application

## Out of Scope
- Direct email reading/replying (not an email client)
- Complex manual rule creation / custom regex filters (violates "zero setup" philosophy)

## Traceability
*(To be populated by ROADMAP.md)*
