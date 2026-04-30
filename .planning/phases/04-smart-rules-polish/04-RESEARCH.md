# Phase 4: Smart Rules & Polish — Research

**Date:** 2026-04-30
**Source:** Official Google Gmail API docs

---

## Gmail Filter API

### Create filter
```
POST https://gmail.googleapis.com/gmail/v1/users/{userId}/settings/filters
```

**Request body** (Filter object):
```json
{
  "criteria": {
    "from": "sender@example.com"
  },
  "action": {
    "removeLabelIds": ["INBOX"]
  }
}
```

- `criteria.from` — sender email address to match
- `action.removeLabelIds: ["INBOX"]` — skips inbox for future emails from that sender
- Response returns the created `Filter` object with a server-assigned `id` string — **must store this for undo**

### Delete filter
```
DELETE https://gmail.googleapis.com/gmail/v1/users/{userId}/settings/filters/{id}
```
- `{id}` is the filter ID returned from create
- Empty request body, empty JSON response on success

### Required OAuth scope
`https://www.googleapis.com/auth/gmail.settings.basic`

**⚠️ ACTION REQUIRED:** This scope is NOT in the current OAuth configuration. Must be added to `src/app/api/auth/[...nextauth]/route.ts` `scope` string. Requires user re-authentication after change.

---

## Gmail messages.list for INBOX count
```
GET .../messages?labelIds=INBOX&maxResults=1
```
Returns `resultSizeEstimate` — a reliable estimate of inbox size. This changes visibly after archiving, unlike `getProfile.messagesTotal` which counts all mail.

---

## Suggestion Engine Strategy

### Approach: Fetch-and-group server-side
1. Call `gmail.users.messages.list({ q: "is:unread older_than:14d label:INBOX", maxResults: 500 })`
2. For each message ID, call `gmail.users.messages.get({ id, format: "metadata", metadataHeaders: ["From"] })` to get sender
3. Group by `From` header domain/email, count occurrences
4. Filter: ≥ 3 messages per sender
5. Sort: descending by count, return top 3

### Performance concern
Step 2 requires N individual message.get calls (up to 500). This is expensive. Better approach:
- Use `threads.list` or `messages.list` with `format: "metadata"` in a single batch — but Gmail API v1 doesn't support batch in the googleapis node library the same way.
- **Pragmatic solution:** Limit `maxResults: 100` to keep API calls reasonable. For 100 messages, do 100 individual `messages.get` calls — or use the messages.list `fields` parameter to get headers directly if supported.
- **Actually best approach:** Call `messages.list` then batch-fetch metadata in parallel chunks of 10 using `Promise.all`. 100 messages = 10 parallel calls = ~1-2 seconds max.

### Alternative: Gmail search per sender (simpler but less accurate)
- Can't directly group by sender without fetching individual message headers
- The fetch-and-group approach is necessary

---

## Key Constraints Discovered

1. **New OAuth scope required** — `gmail.settings.basic` must be added before filter create/delete will work
2. **Filter create limit** — max 1000 filters per account (unlikely to hit, but noted)
3. **messages.list format** — `format: "metadata"` with `metadataHeaders: ["From"]` reduces response size for suggestion engine
