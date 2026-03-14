# Expenses Feature Handoff

Use this as context in a new chat.

## Project
- Workspace: Ovejitas frontend
- Stack: React 19, TypeScript, TanStack Router, TanStack Query, i18next, Sonner

## What Was Built
- Complete Expenses (Gastos) module with:
  - list page
  - filters (category, status, payment method)
  - create/edit modal form
  - delete confirmation dialog
  - status/category badges
  - loading/empty/error states
  - toast notifications for create/update/delete

## Key Files
- `src/features/expense/types/expense-types.ts`
- `src/features/expense/api/expense-api.ts`
- `src/features/expense/api/expense-queries.ts`
- `src/features/expense/components/expense-form.tsx`
- `src/features/expense/components/expense-form-modal.tsx`
- `src/features/expense/components/delete-expense-dialog.tsx`
- `src/features/expense/components/expense-filter-bar.tsx`
- `src/features/expense/components/expense-list.tsx`
- `src/features/expense/components/expense-badges.tsx`
- `src/features/expense/components/expense-form-main-fields.tsx`
- `src/features/expense/components/expense-form-quantity-fields.tsx`
- `src/features/expense/components/expense-form-entity-fields.tsx`
- `src/features/expense/components/expense-form-schema.ts`
- `src/features/expense/components/expense-labels.ts`
- `src/routes/_private/_privatelayout/farm/$farmId/expenses.tsx`

## Routing + Navigation
- Added expenses route under private farm layout:
  - `/farm/$farmId/expenses`
- Added bottom nav tab label and route for Expenses/Gastos.

## i18n Work Completed
- New translations namespace files:
  - `src/lib/i18n/en/expenses.json`
  - `src/lib/i18n/es/expenses.json`
- Registered in:
  - `src/lib/i18n/config.ts`
  - `src/lib/i18n/resources.ts`
- Replaced hardcoded user-visible strings in expenses UI with i18n keys.

## Important Bug History
- Expenses route file was temporarily overwritten by a TanStack placeholder:
  - `Hello "/_private/_privatelayout/farm/$farmId/expenses"!`
- That was replaced with the full page implementation.

## Import Resolution Issue
- Several files showed module resolution issues importing local helper:
  - `@/features/expense/components/expense-labels`
- Stabilized by switching same-folder imports to relative imports like:
  - `./expense-labels`

## Current State
- Expenses route renders feature UI.
- i18n for expenses is wired (en/es).
- Build passed after fixes.

## Recommended Next Steps
1. Localize date and currency display by active language in expense list.
2. Optional consistency pass:
   - same-folder imports as relative
   - cross-folder imports with `@/` alias
3. UX polish for mobile density and spacing in list/cards.
