# Phase 3 Discussion Log: Core Automations & Undo

## Date: 2026-04-30

## Participants
- AI Developer
- User

## Discussion Points

### 1. Undo Mechanism
- **Question:** Should actions be immediate with reversal commands or delayed?
- **Decision:** Actions will be performed **immediately**. A reversal command (e.g., a list of Message IDs and their original labels/state) will be stored to allow for a full undo if the user clicks the toast.

### 2. Batching & Performance
- **Question:** How to handle thousands of emails?
- **Decision:** Processing will be done in **batches** to respect Gmail API rate limits and provide incremental feedback.

### 3. Action Feedback
- **Question:** What kind of progress feedback should the user see?
- **Decision:** A **live counter** showing "Items cleaned" (e.g., "450 of 1200 items cleaned") will be displayed in the UI during the process.

### 4. Persistence
- **Question:** Should the Undo state be persisted in the DB?
- **Decision:** **Yes**, the Undo state will be persisted in the database. This ensures that if the user refreshes or closes the tab, the undo option (within the 30s window) remains available or can be reconciled.

## Next Steps
- Generate UI design contract (UI-SPEC.md) for the progress feedback and undo toast.
- Update database schema to support action logging and undo reversal.
- Implement batch processing logic for Gmail API actions.
