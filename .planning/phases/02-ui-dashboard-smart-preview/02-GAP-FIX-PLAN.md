# Phase 2 Gap Fix Plan

## Objective
Fix the Gmail API authentication error causing the `getSummary` tRPC query to fail with a 401 Unauthorized error.

## Context
During UAT, it was discovered that `google.gmail()` in `src/server/routers/inbox.ts` is incorrectly configured. Passing `headers: { Authorization: ... }` directly is not supported for full authentication in the `googleapis` library for this endpoint. We must use `google.auth.OAuth2` and `setCredentials`.

## Steps
1. Update `src/server/routers/inbox.ts` to instantiate a new `google.auth.OAuth2` client.
2. Call `setCredentials({ access_token: session.accessToken })` on the OAuth2 client.
3. Pass the `auth` object to `google.gmail({ version: "v1", auth: oauth2Client })`.

## Verification
- Test 2 from UAT should pass. Loading the dashboard should successfully display the hero section with the total count of emails instead of an error message.
