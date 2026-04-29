---
wave: 1
depends_on: []
files_modified:
  - "package.json"
  - "tsconfig.json"
  - "tailwind.config.ts"
  - "components.json"
  - "src/app/layout.tsx"
  - "src/app/page.tsx"
  - "src/app/api/auth/[...nextauth]/route.ts"
  - "src/app/dashboard/page.tsx"
  - "src/components/Providers.tsx"
  - "src/components/ui/button.tsx"
  - ".env.example"
autonomous: true
---

# Phase 1: Foundation & Authentication Plan

## Goal
Establish secure connection to Gmail API, define frontend architecture, and fetch necessary metadata.

<threat_model>
- **Threat:** Exposure of Google OAuth credentials or access tokens.
- **Mitigation:** Credentials stored only in `.env.local` (excluded from git). Access tokens passed securely via encrypted HTTP-only session cookies handled by NextAuth.js. NextAuth inherently protects against CSRF.
</threat_model>

## Tasks

### 1. Initialize Next.js & Shadcn UI
<read_first>
- `package.json` (if it exists)
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md`
</read_first>
<action>
1. Generate the Next.js application. Since the directory is not empty (contains `.planning`), initialize in a temporary directory and move files:
   `npx create-next-app@latest app-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
   `mv app-tmp/* app-tmp/.* . 2>/dev/null || true`
   `rm -rf app-tmp`
2. Initialize Shadcn UI with default styling (Slate):
   `npx shadcn@latest init -d`
3. Add the Shadcn Button component:
   `npx shadcn@latest add button`
</action>
<acceptance_criteria>
- `package.json` contains `next`, `react`, `react-dom`, and `tailwindcss`
- `components.json` exists in the root
- `src/components/ui/button.tsx` exists
</acceptance_criteria>

### 2. Install Auth & API Dependencies
<read_first>
- `package.json`
</read_first>
<action>
Install NextAuth.js and Google APIs client:
`npm install next-auth googleapis`
</action>
<acceptance_criteria>
- `package.json` contains `next-auth` and `googleapis` in dependencies
</acceptance_criteria>

### 3. Configure NextAuth & Environment Variables
<read_first>
- `src/app/api/auth/[...nextauth]/route.ts` (create new)
- `.env.example` (create new)
</read_first>
<action>
1. Create `.env.example` with:
   `GOOGLE_CLIENT_ID=`
   `GOOGLE_CLIENT_SECRET=`
   `NEXTAUTH_SECRET=`
   `NEXTAUTH_URL=http://localhost:3000`
2. Create `src/app/api/auth/[...nextauth]/route.ts` with NextAuth configuration:
   - Use `GoogleProvider` with `clientId` and `clientSecret`.
   - Configure authorization parameters to request `https://www.googleapis.com/auth/gmail.modify` scope and `access_type: "offline"`.
   - Implement the `jwt` callback to store `account.access_token` into the token.
   - Implement the `session` callback to expose `token.accessToken` on the session object.
3. Export `GET` and `POST` handlers from `NextAuth`.
</action>
<acceptance_criteria>
- `.env.example` contains `GOOGLE_CLIENT_ID=`
- `src/app/api/auth/[...nextauth]/route.ts` exports `GET` and `POST`
- `route.ts` contains `https://www.googleapis.com/auth/gmail.modify`
</acceptance_criteria>

### 4. Create Session Provider
<read_first>
- `src/components/Providers.tsx` (create new)
- `src/app/layout.tsx`
</read_first>
<action>
1. Create a client component `src/components/Providers.tsx` that wraps children in `<SessionProvider>`.
2. Update `src/app/layout.tsx` to import `Providers` and wrap the `{children}` inside the `<body>`.
</action>
<acceptance_criteria>
- `src/components/Providers.tsx` contains `"use client"` and `<SessionProvider>`
- `src/app/layout.tsx` imports and uses `<Providers>`
</acceptance_criteria>

### 5. Build Landing Page & Dashboard UI
<read_first>
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx` (create new)
- `.planning/phases/01-foundation-authentication/01-UI-SPEC.md`
</read_first>
<action>
1. Overwrite `src/app/page.tsx` to be the landing page:
   - Must use a clean, minimal "Notion-like" aesthetic (lots of whitespace, minimal borders).
   - Hero text: "Você pode limpar milhares de e-mails agora"
   - Subtext: "Sem deletar nada importante."
   - Action: A "Continuar com Google" button (from Shadcn) that triggers NextAuth `signIn('google', { callbackUrl: '/dashboard' })`.
2. Create `src/app/dashboard/page.tsx` (Server Component):
   - Import `getServerSession` to protect the route. If no session, redirect to `/`.
   - Instantiate `google.gmail({ version: 'v1', headers: { Authorization: \`Bearer \${session.accessToken}\` } })`.
   - Fetch the user's profile: `gmail.users.getProfile({ userId: 'me' })`.
   - Render a minimal dashboard displaying the user's email and `messagesTotal`.
   - If the API call fails, catch the error and show a clean error message.
</action>
<acceptance_criteria>
- `src/app/page.tsx` contains "Você pode limpar milhares de e-mails agora"
- `src/app/page.tsx` uses `signIn` from `next-auth/react`
- `src/app/dashboard/page.tsx` contains `getServerSession`
- `src/app/dashboard/page.tsx` calls `gmail.users.getProfile`
</acceptance_criteria>

## Verification
- `npm run build` must complete successfully without TypeScript or Lint errors.
- Verification script could check that `.env.example` exists and NextAuth route handlers are properly exported.
