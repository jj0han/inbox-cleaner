# Phase 1: Foundation & Authentication - UI Spec

## Design System: Notion-like Aesthetic
- **Colors:** Predominantly black and white (monochrome), with subtle grays for borders and hover states.
- **Typography:** Sans-serif (Inter or similar), clean, highly legible.
- **Spacing:** Ample whitespace, large padding on cards.
- **Components:** Minimalist buttons, flat borders (or very subtle shadows).

## Screens

### 1. Landing / Login Page
- **Purpose:** Hero section with a clear value proposition and the login action.
- **Elements:**
  - Hero text: "Você pode limpar milhares de e-mails agora"
  - Subtext: "Sem deletar nada importante."
  - Call to Action: Large, prominent "Continuar com Google" button.

### 2. Dashboard (Initial Skeleton)
- **Purpose:** Provide immediate feedback that authentication succeeded and show a high-level summary.
- **Elements:**
  - Header: Welcome message with the user's email or name.
  - Summary Card: "Analisando sua caixa de entrada..." followed by the total number of emails found (fetched via Gmail API profile).

## UI States & Transitions
- **Loading:** Simple spinner or pulse skeleton when redirecting from Google Auth or fetching the email count.
- **Error:** Clear, friendly error message if authentication fails or Gmail API rejects the request.
