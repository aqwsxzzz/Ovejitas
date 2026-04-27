# Real DB Implementation Plan (No Mock)

Date: 2026-04-24
Source of truth: C:/projects/Ovejitas/Ovejitas-api/openapi.json

## Goal

Migrate V2 frontend flows to backend-backed data only, using live endpoints and server-side filters/pagination.

## Backend Endpoint Inventory (Live)

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- GET /api/v1/auth/me

### Assets
- GET /api/v1/farms/{farm_id}/assets
- POST /api/v1/farms/{farm_id}/assets
- GET /api/v1/farms/{farm_id}/assets/{asset_id}
- PATCH /api/v1/farms/{farm_id}/assets/{asset_id}
- DELETE /api/v1/farms/{farm_id}/assets/{asset_id}

### Individuals
- GET /api/v1/farms/{farm_id}/assets/{asset_id}/individuals
- POST /api/v1/farms/{farm_id}/assets/{asset_id}/individuals
- GET /api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}
- PATCH /api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}
- DELETE /api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}

### Events
- GET /api/v1/farms/{farm_id}/assets/{asset_id}/events
- POST /api/v1/farms/{farm_id}/assets/{asset_id}/events
- GET /api/v1/farms/{farm_id}/assets/{asset_id}/events/{event_id}
- PATCH /api/v1/farms/{farm_id}/assets/{asset_id}/events/{event_id}
- DELETE /api/v1/farms/{farm_id}/assets/{asset_id}/events/{event_id}

### Event Categories
- GET /api/v1/farms/{farm_id}/event-categories
- POST /api/v1/farms/{farm_id}/event-categories
- GET /api/v1/farms/{farm_id}/event-categories/{category_id}
- PATCH /api/v1/farms/{farm_id}/event-categories/{category_id}
- DELETE /api/v1/farms/{farm_id}/event-categories/{category_id}

### Reports
- GET /api/v1/farms/{farm_id}/reports/cost-per-unit
- GET /api/v1/farms/{farm_id}/reports/individuals/{individual_id}/timeline
- GET /api/v1/farms/{farm_id}/reports/production
- GET /api/v1/farms/{farm_id}/reports/profitability

## Current FE State (Delta)

### Already Live
- Auth API calls are on /api/v1/auth/*.
- Livestock assets and individuals are wired to /api/v1/farms/{farm_id}/assets*.
- Flock event categories and event list/create are already wired to live BE.

### Still Mock-Backed
- Dashboard page uses v2 mock repository snapshots.
- Finance page uses v2 mock summary + mock events.
- Livestock list/species pages still use listLivestockGroups from mock repository.
- Flock detail KPIs (egg/finance cards) still rely on fallback/mock snapshot structure.

## Implementation Plan

## Phase A: Stabilize Real Event Flow (Immediate)

Scope:
- complete events CRUD on current flock detail/event flows

Tasks:
1. Add event GET by id, PATCH, DELETE API functions in livestock API.
2. Add event mutation hooks (update/delete) in livestock queries.
3. Add edit/delete UI actions in unit event timeline.
4. Replace temporary payload status workaround with explicit FE mapping helper.

Acceptance:
- user can create, edit, delete events against BE
- event list refetch/invalidation is consistent and typed

## Phase B: Replace Dashboard Mocks with Reports

Endpoints:
- GET /reports/production
- GET /reports/profitability

Tasks:
1. Add dashboard-report API module under src/features/dashboard/api.
2. Add query hooks with server-side params (date range, bucket, asset filter).
3. Map report response into UnitKpiSlider input model.
4. Remove dependency on getDashboardSnapshot/getUnitDashboardSlices in dashboard page.

Acceptance:
- dashboard cards and unit slider render from live report endpoints only

## Phase C: Replace Finance Mocks with Reports + Events

Endpoints:
- GET /reports/profitability
- GET /reports/cost-per-unit
- GET /assets/{asset_id}/events (type=income|expense)

Tasks:
1. Add finance-report API/query module.
2. Rebuild summary cards from profitability response.
3. Rebuild category bars from cost-per-unit response.
4. Rebuild transaction feed from live events filtered by type.
5. Remove getFinanceSummary/listEvents mock usage from finance page.

Acceptance:
- finance page fully backed by BE responses and query params

## Phase D: Replace Livestock Grouping Mocks

Endpoints:
- GET /assets (kind=animal)
- GET /assets/{asset_id}/individuals
- GET /assets/{asset_id}/events (for attention heuristics)

Tasks:
1. Introduce server-backed livestock aggregation selector in FE (derived from live assets+individuals+events).
2. Replace listLivestockGroups mock usage in livestock page and species page.
3. Preserve existing UX semantics (attention, healthy groups) with deterministic mapping rules.

Acceptance:
- livestock index/species views are built from live assets/individuals/events

## Phase E: Individual Timeline Integration

Endpoint:
- GET /reports/individuals/{individual_id}/timeline

Tasks:
1. Add timeline API/query to individual detail feature.
2. Render timeline section in individual detail page.
3. Use report filters (date range, type, page, page_size) from UI controls.

Acceptance:
- individual detail includes paged live event timeline

## Cross-Cutting Rules

1. No fallback to v2 mock repository for routes migrated in each phase.
2. Use BE pagination/filtering/sorting in query params, never local list slicing as substitute.
3. Keep farmId as explicit required parameter for all farm-scoped calls.
4. Add adapters where needed to keep UI model stable.

## Execution Order Recommendation

1. Phase A
2. Phase B
3. Phase C
4. Phase E
5. Phase D

Reason:
- A/B/C unlock highest-user-value screens first with endpoints already stable.
- E is straightforward once reports infrastructure is in place.
- D has the most UI/domain mapping work and should come after core contracts are proven.
