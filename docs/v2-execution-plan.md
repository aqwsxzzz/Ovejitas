# Ovejitas V2 Execution Plan (Rewrite Branch)

Date: 2026-04-22
Branch: rewrite/v2-foundation
Safety tag: v1-final-2026-04-22

## Conversation Recap
- V2 will be a full UI/UX and feature-direction reset.
- Reusing old feature migration paths is not required.
- Existing auth (login/signup) should be retained initially to reduce risk and speed up rebuild.
- Work begins in a dedicated branch with a rollback-safe tag.

## Product North Star
Build a farm profitability assistant, not only a farm activity tracker.

Primary outcomes:
- Better daily decision support for operators in the field.
- Operational awareness (inventory autonomy, pending actions, risk alerts).
- Clear unit-level profitability visibility with historical comparison.

## Scope: Must-Have vs Later

### Must-Have (V2 Core)
- Authentication continuity (existing login/signup retained initially).
- New app shell (routing, layout system, navigation foundation, design tokens).
- Production Unit model support in frontend contracts.
- Inventory autonomy widget and stock consumption visibility.
- Quick-action workflow from dashboard (record consumption, register event, adjustment).
- Server-driven lists with pagination/filtering for large datasets.
- Alert center MVP for actionable events.

### Later (Post-Core)
- Advanced profitability analytics (deep scenario simulation).
- Full benchmark laboratory (cross-period cohort comparisons).
- Rich offline conflict resolution UX.
- Advanced automation chaining between events and stock actions.
- Extended reporting exports and audit dashboards.

## API Contract Checklist (Contract-First)

Use this checklist before implementing each new screen:
- Endpoint returns only data needed by the current view.
- Server-side pagination exists for list endpoints.
- Server-side search/filter exists when required by UX.
- Request/response schemas are documented in feature API module.
- Loading/error/empty states are represented in response model.
- Domain identifiers are explicit and typed (farmId, productionUnitId, eventId).
- Mutation endpoints return data needed for immediate optimistic reconciliation.
- Date/time semantics are explicit (timezone, calendar boundaries).
- Alert/event endpoints expose immutable event history fields.
- Inventory endpoints include units of measure and conversion assumptions.

## UI Screen Map (V2)

### Public
- /login (retained initially)
- /signup (retained initially)

### Private Foundation
- /app (home redirect)
- /app/dashboard
- /app/production-units
- /app/inventory
- /app/finance
- /app/alerts
- /app/settings

### Key UX intent by screen
- Dashboard: what needs action now, what risks profitability now.
- Production Units: grouped/individual units with operational and financial health summaries.
- Inventory: autonomy days, upcoming depletion risk, adjustment actions.
- Finance: macro cash flow + micro profitability entry points.
- Alerts: actionable event queue tied to business outcomes.

## Target Folder Architecture (V2)

```text
src/
  app/
    providers/
    router/
    layouts/
  design-system/
    tokens/
    primitives/
    patterns/
  domains/
    auth/
    production-unit/
    inventory/
    finance/
    alerts/
  features/
    dashboard/
    quick-actions/
  shared/
    api/
    config/
    hooks/
    types/
    utils/
  routes/
```

Notes:
- domains: business entities and API/query contracts.
- features: task-oriented UI flows that compose domain capabilities.
- design-system: visual language and reusable UI building blocks.

## Keep/Rewrite Matrix (Current to V2)

- Auth API/session logic: Keep (phase 1), then refine when needed.
- Login/signup UI pages: Keep temporarily, restyle later.
- Existing private routes and feature pages: Rewrite.
- Existing layout/navigation shell: Rewrite.
- Existing component library usage: Keep selectively where generic and style-agnostic.
- Feature-specific components tied to old IA: Rewrite.
- API client foundation (axios setup/interceptors): Keep if still valid, otherwise adjust minimally.
- Domain models/types: Re-evaluate per new BE contracts.
- Query hooks tied to old UX data shape: Rewrite.

## Milestones: 6-Week Plan

### Week 1: Foundation and Safety
- Branch/tag completed.
- V2 execution doc finalized.
- New app shell, route foundation, and design tokens baseline.
- Keep auth entry intact.

Exit criteria:
- App runs with v2 shell and at least one private placeholder screen.

### Week 2: Dashboard and Quick Actions MVP
- Implement new dashboard information architecture.
- Add quick-action card patterns.
- Wire first contract-first query flows.

Exit criteria:
- Users can reach dashboard and perform at least 2 key actions.

### Week 3: Production Units
- Build production unit listing and detail entry points.
- Add status and risk indicators.

Exit criteria:
- Production units can be viewed and filtered from server data.

### Week 4: Inventory and Autonomy
- Build inventory overview with autonomy days.
- Add adjustment and consumption entry UX.

Exit criteria:
- Inventory page shows depletion risk and supports core actions.

### Week 5: Finance and Alerts MVP
- Introduce macro cash flow + micro profitability entry points.
- Add actionable alert queue interactions.

Exit criteria:
- User can record key financial events and process alert actions.

### Week 6: Stabilization and Release Readiness
- UX consistency pass, performance pass, bug triage.
- Remove dead v1 references in active routing path.
- Prepare v2 release checklist.

Exit criteria:
- Stable candidate branch ready for review and staged release.

## Parallel 4-Week Rollout Plan (Execution Checkpoints)

### Phase A (Week 1)
- Checkpoint A1: branch safety and docs complete.
- Checkpoint A2: v2 shell/routing/tokens merged.

### Phase B (Week 2)
- Checkpoint B1: dashboard IA validated with placeholders and first real data tiles.
- Checkpoint B2: quick actions integrated with first mutation path.

### Phase C (Week 3)
- Checkpoint C1: production units list + detail entry stable.
- Checkpoint C2: legacy route access reduced to auth-only plus fallback.

### Phase D (Week 4)
- Checkpoint D1: inventory autonomy and adjustments live.
- Checkpoint D2: feature rollout checklist updated with blockers and decisions.

## Initial Milestone Checklist
- [x] Create safety tag and rewrite branch.
- [x] Define v2 execution document.
- [x] Implement new v2 folder architecture skeleton.
- [x] Introduce fresh app shell and route structure.
- [x] Add design tokens baseline and layout primitives.
- [x] Keep login/signup operational during transition.
- [x] Validate build and lint for foundation changes.
- [ ] Publish first internal demo checkpoint.

## Working Rules
- No client-side workaround for server-filterable datasets.
- Prefer enhancement over temporary patches.
- Keep cleanup incremental and auditable in commits.
- Preserve auth continuity until replacement is explicitly planned.
