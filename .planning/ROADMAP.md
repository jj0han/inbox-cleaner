# Roadmap

## Phase 1: Foundation & Authentication
**Goal:** Establish secure connection to Gmail API and fetch necessary metadata.
**Requirements:** AUTH-01, AUTH-02
**Success Criteria:**
- User can log in with Google account and grant necessary permissions.
- App can fetch a high-level summary of the inbox (e.g., total message count).
- No message bodies are downloaded or stored.

## Phase 2: UI Dashboard & Smart Preview
**Goal:** Build the core Notion-style interface and preview capability to establish trust.
**Requirements:** DASH-01, DASH-02, SAFE-01
**UI hint:** yes
**Success Criteria:**
- [x] Dashboard displays Hero section with total cleanable emails.
- [x] Action cards render dynamically based on available automations.
- [x] Clicking an action card opens a preview modal with 5-10 example emails.

## Phase 3: Core Automations & Undo
**Goal:** Implement the primary 1-click cleanup actions and the safety undo buffer.
**Requirements:** AUTO-01, AUTO-02, AUTO-03, SAFE-02
**Success Criteria:**
- User can successfully execute "Mass Unsubscribe" or "Archive Promos" via action cards.
- User can execute the "Intelligent 1-Click Cleanup" for comprehensive cleaning.
- Any action triggers a 10-30 second undo toast; clicking it fully reverts the action.

## Phase 4: Smart Rules & Polish
**Goal:** Add AI-lite suggestions and finalize the application experience.
**Requirements:** AUTO-04
**Success Criteria:**
- Application suggests auto-archive rules based on unread patterns.
- User can apply these rules with a single click.
