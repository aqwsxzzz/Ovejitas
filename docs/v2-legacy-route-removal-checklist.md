# V2 Legacy Route Removal Checklist

Date: 2026-04-22
Branch: rewrite/v2-foundation

Purpose: Track route-level decommissioning from v1 private flow to v2 modules.

## Cutover Map

- [x] `/_private/_privatelayout/farm/$farmId/dashboard` -> `/v2/dashboard` (legacy route removed)
- [x] `/_private/_privatelayout/farm/$farmId/farms` -> `/v2/production-units` (legacy route removed)
- [x] `/_private/_privatelayout/farm/$farmId/inventory` -> `/v2/inventory` (legacy route removed)
- [x] `/_private/_privatelayout/farm/$farmId/expenses` -> `/v2/finance` (legacy route removed)
- [x] `/_private/_privatelayout/farm/$farmId/tasks` -> `/v2/alerts` (legacy route removed)
- [x] `/_private/_privatelayout/farm/$farmId/farm-members` -> `/v2/settings` (legacy route removed)
- [ ] `/_private/_privatelayout/farm/$farmId/flocks` -> (defer, define v2 module)
- [ ] `/_private/_privatelayout/farm/$farmId/species` -> (defer, define v2 module)
- [x] `/_private/_privatelayout/farm/$farmId/flocks` -> `/v2/production-units` (legacy route family removed)
- [x] `/_private/_privatelayout/farm/$farmId/species` -> `/v2/production-units` (legacy route family removed)

## Preconditions Before Deleting Legacy Route Files

- [ ] No navigation links point to legacy routes.
- [x] Root/index redirects no longer point to legacy routes.
- [x] Auth success path points to v2 routes.
- [ ] Legacy route components have zero inbound imports from active routes.
- [ ] Equivalent v2 screens have baseline UX approved.
- [x] Build passes after each removal batch.

## Suggested Removal Batches

### Batch 1 (Low risk)
- Remove `tasks`, `expenses`, `inventory` legacy route files after v2 placeholders are accepted.

Status:
- [x] tasks removed
- [x] expenses removed
- [x] inventory removed (legacy link updated to v2 path)

### Batch 2 (Medium risk)
- Remove `dashboard`, `farms`, `farm-members` legacy route files after v2 modules are wired.

Status:
- [x] dashboard removed
- [x] farms removed
- [x] farm-members removed

### Batch 3 (High risk)
- Remove `flocks`, `species`, animal profile legacy route files once corresponding v2 domain routes exist.

Status:
- [x] flocks route family removed
- [x] species route family removed
- [x] animal profile route removed
- [x] link references remapped to v2 placeholders

Note:
- Added temporary compatibility route `src/routes/compat.$farmId.$speciesId.$animalId.tsx` to preserve param typings in shared components while those components are refactored for v2-first data flow.

## Validation Script

Run on each batch:

- `npx -y @tanstack/router-cli generate`
- `npm run build`

If both pass and no route-level regressions are found, proceed to next batch.
