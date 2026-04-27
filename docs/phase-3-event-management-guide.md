# Phase 3 Guide: Livestock Event Management

Date: 2026-04-24
Scope: Production unit (flock) detail in V2

## Backend Source of Truth

Use the live backend repository first:

- `C:/projects/Ovejitas/Ovejitas-api/openapi.json`

Fallback only when needed:

- `temp_repo/openapi.json`

Recommended workflow before any FE API wiring:

1. Read endpoint paths from `C:/projects/Ovejitas/Ovejitas-api/openapi.json`.
2. Cross-check request and response schemas there.
3. Only use `temp_repo/openapi.json` if the live file is unavailable.
4. If both exist, treat the live backend file as canonical.

## What Was Implemented

Phase 3 was implemented in the flock detail flow as an event management slice with two core capabilities:

1. Event timeline per production unit (lote)
2. Quick event creation form directly inside flock detail

The UI now supports creating and reviewing events without leaving the flock detail page.

## Files Added

- `src/features/livestock/components/unit-event-form.tsx`
- `src/features/livestock/components/unit-event-timeline.tsx`

## Files Updated

- `src/features/livestock/pages/flock-detail-page.tsx`

## Implementation Details

### 1) Event Timeline

The timeline renders unit-scoped events sorted by latest first.

Behavior:
- Reads events with `listEvents({ unitId })`
- Sorts by `occurredAt` descending
- Displays latest 8 events
- Renders category, type, status, date/time, quantity, amount, and notes

Component:
- `UnitEventTimeline`

### 2) Event Creation

A quick event form is now available in flock detail.

Behavior:
- Toggle via `Nuevo evento` button
- Supports:
  - `type`
  - `categoryId` (filtered by selected type)
  - `status` (`logged` or `planned`)
  - `occurredAt`
  - optional `quantity`
  - optional `amount`
  - optional `notes`
- Creates event via `createEvent(...)`
- Refreshes timeline immediately after save

Component:
- `UnitEventForm`

## Current Data Source

Phase 3 now uses live backend endpoints through livestock API/query modules:

- `src/features/livestock/api/livestock-api.ts`
- `src/features/livestock/api/livestock-queries.ts`

Used endpoints:
- `GET /api/v1/farms/{farm_id}/event-categories`
- `GET /api/v1/farms/{farm_id}/assets/{asset_id}/events`
- `POST /api/v1/farms/{farm_id}/assets/{asset_id}/events`

This means event categories and event timeline data are now real-time from BE for flock detail.

## User Flow

1. Open a flock detail page: `/v2/production-units/flock/:unitId`
2. Go to `Eventos del lote`
3. Click `Nuevo evento`
4. Fill event form and save
5. Confirm event appears at top of timeline

## Validation Performed

Command:

```bash
npm run build
```

Result:
- TypeScript build passed
- Vite build passed

## Known Limits (Current Phase 3 State)

- Event create/list are live against BE. Event edit/delete are not added yet in the UI.
- Event status badge (`logged`/`planned`) is currently stored in `payload.status` because BE event status is not a first-class field.
- Timeline pagination is not needed yet because this slice intentionally shows latest 8 events only.

## Backend Migration Plan (Remaining)

### Step 1: Event mutations completion

Add remaining event endpoints in `src/features/livestock/api/livestock-api.ts` for:
- update event
- delete event

### Step 2: Query/mutation hooks completion

Keep existing list hooks and add mutation hooks for update/delete.

### Step 3: Reports wiring

Use report endpoints to replace remaining fallback metrics:
- `GET /api/v1/farms/{farm_id}/reports/production`
- `GET /api/v1/farms/{farm_id}/reports/profitability`

### Step 4: Keep UI stable

No UI contract changes required for:
- `UnitEventForm`
- `UnitEventTimeline`

Only the data source should change.

## Suggested Next Iteration

1. Add event edit/delete actions in timeline.
2. Add event filtering (type/status/date) server-side once API supports query params.
3. Connect `/v2/log` quick action route to this same event creation path with prefilled context.
