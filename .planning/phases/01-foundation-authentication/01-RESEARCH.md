# Phase 1: Foundation & Authentication - Research

## Technical Approach
**Goal:** Initialize the Next.js app, configure NextAuth.js for Google OAuth, and fetch basic metadata from the Gmail API to prove the connection.

### 1. Framework Initialization
- **Next.js (App Router):** Fast setup, native support for API routes, and Server Components.
- **Tailwind CSS + Shadcn UI:** The user explicitly requested `--preset bIm64ck` for Shadcn. This will be the foundation for the "Notion-like" aesthetic. 

### 2. Authentication (NextAuth.js)
- **Library:** `next-auth` (v4 is standard, v5 is in beta but often used. We will stick to v4 for stability or v5 if preferred, but let's assume standard `next-auth` setup).
- **Provider:** `GoogleProvider`.
- **Scopes:** The app is an "Inbox Cleaner" which means it will eventually need to trash, archive, and modify emails. To avoid re-prompting the user with a scary consent screen later, we should request `https://www.googleapis.com/auth/gmail.modify` upfront. 
- **Token Handling:** In the NextAuth `jwt` callback, we must capture `account.access_token` and pass it to the `session` object so that server-side or client-side components can use it to make authorized requests to the Gmail API.

### 3. Gmail API Integration
- **Library:** `googleapis` (official Node.js client).
- **Proof of Concept:** A simple server action or API route that instantiates the `google.gmail({ version: 'v1', headers: { Authorization: \`Bearer \${accessToken}\` } })` and calls `gmail.users.getProfile({ userId: 'me' })` to get the total messages/threads, verifying the integration works.

## Risks & Mitigations
- **Risk:** Google API rate limits.
  **Mitigation:** For Phase 1, we only fetch a profile summary. We will handle pagination/rate limiting in later phases.
- **Risk:** Access Token expiration.
  **Mitigation:** Google tokens expire after 1 hour. For Phase 1, basic login is enough. In Phase 3 (long-running automations), we may need to handle `refresh_token` logic, but we can defer that.

## Validation Architecture
- **Auth Flow:** User can click "Login with Google", complete the OAuth flow, and be redirected to a dashboard.
- **API Connectivity:** The dashboard successfully displays the user's email address and total inbox message count, proving the `accessToken` is valid and the Gmail API is reachable.
