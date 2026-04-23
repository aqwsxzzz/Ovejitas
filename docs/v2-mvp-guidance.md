# V2 MVP Guidance (Hardcoded-First)

Date: 2026-04-22
Branch: rewrite/v2-foundation

## Why this guide exists
This is the implementation reminder for V2 while backend contracts are still evolving.
The frontend must ship against stable domain contracts and a mock repository, then swap data sources with minimal UI rewrites.

## Product objective
- Answer fast: "Is everything OK today?"
- Enable fast action: log core events in 1-2 taps.
- Keep decisions visible: production, cost, inventory risk.

## Core domain model (frontend contracts)
- Farm workspace
- Production units
- Optional individuals
- Events as core records
- User-defined categories
- Inventory items

## MVP screen slice
1. Today Dashboard
2. Quick Log chooser
3. Quick Log event form
4. Production Units list
5. Production Unit detail
6. Individual detail (for unit mode individual)
7. Finance overview
8. Feed/inventory overview

## Build order (required)
1. Domain types and mock seed
2. Mock selectors and repository API
3. Dashboard snapshot widgets
4. Quick log creation flow
5. Units list and detail timeline
6. Finance summary
7. Feed summary

## Data-layer rule
- No hardcoded arrays inside page components.
- All fake data comes from the centralized repository in `src/shared/api`.
- Page components consume view-ready selectors.

## Integration rule for backend handoff
- Keep repository function signatures stable.
- Replace repository internals with API queries when BE is ready.
- Avoid changing view contracts unless BE contract changes are unavoidable.

## Current implementation checkpoint
- `src/shared/types/v2-domain-types.ts` defines domain contracts.
- `src/shared/api/v2-mock-seed.ts` stores hardcoded seed data.
- `src/shared/api/v2-mock-selectors.ts` computes dashboard/finance/feed snapshots.
- `src/shared/api/v2-mock-repository.ts` is the sole data entry point for V2 pages.
