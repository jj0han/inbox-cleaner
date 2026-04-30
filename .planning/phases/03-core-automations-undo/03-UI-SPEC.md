# UI Specification: Core Automations & Undo

## Objective
Provide high-trust, safe interaction patterns for destructive inbox cleaning actions. The user must feel in control through transparent progress feedback and a reliable "safety net" (Undo).

## Design System Additions

### 1. The Undo Safety Net (Toast Notification)
A persistent notification that appears immediately after an action is triggered.

- **Placement:** Fixed at `bottom-center` of the viewport.
- **Visuals:**
  - Background: Sleek dark (e.g., `bg-zinc-900/90`) with backdrop blur (`backdrop-blur-md`).
  - Text: White/High-contrast status message (e.g., "750 emails archived").
  - Action: "Undo" button in a primary brand color (e.g., `text-blue-400`).
  - Progress: A 1px thin primary-colored progress bar at the very bottom edge of the toast.
- **Behavior:**
  - The progress bar shrinks from 100% to 0% over 30 seconds.
  - **Hover:** Pauses the timer.
  - **Click Undo:** Dismisses the toast and triggers the `undoBatch` tRPC mutation.
  - **Auto-dismiss:** When the timer hits zero, the action is considered final (though the data is still in DB, the toast vanishes).

### 2. Action Progress (Inside Cards)
Action cards should transition to a "Processing" state during execution.

- **Trigger:** Clicking "Archive All" or "Unsubscribe" in a card.
- **State Transition:**
  - The card content becomes slightly translucent (`opacity-60`).
  - An overlay appears with a small, high-speed spinner.
  - A **Live Counter** appears below the card title: `Cleaning... {current}/{total}`.
  - Example: `Cleaning... 142/500`.
- **Completion:** The card returns to normal, and the total count in the Hero section is updated via React Query cache invalidation.

### 3. Intelligent Cleanup Button (Hero Section)
A primary action button in the dashboard to trigger the full cleanup logic.

- **Location:** Inside the "Resumo da Caixa de Entrada" Hero section.
- **Style:** Large, primary solid button (e.g., `bg-blue-600 hover:bg-blue-700`).
- **Label:** "Limpeza Inteligente em 1 Clique"
- **Subtext:** "Arquiva promoções e newsletters antigas automaticamente."

## Interaction Flow
1. User clicks "Limpeza Inteligente".
2. Button enters loading state.
3. Live counter starts incrementing on the dashboard.
4. **Undo Toast** appears at the bottom.
5. As batches finish, the counter updates.
6. User can click "Undo" at any point during the 30s window to reverse the **entire** transaction.

## Accessibility
- Toasts must be announced by screen readers (`role="status"` or `aria-live="polite"`).
- The "Undo" button must be focusable via keyboard (`Tab` navigation).
- Use `aria-busy="true"` on cards while processing.
