# V2 Feature Rollout Checklist

Date: 2026-04-22
Branch: rewrite/v2-foundation

## Status Legend
- Not started
- In progress
- Done
- Blocked

## Phase 1: Foundation (Week 1)
- [x] Branch and safety tag
- [x] V2 execution and cleaning docs
- [x] V2 shell route structure
- [x] Design token baseline
- [x] Auth continuity (login/signup retained)
- [x] Root and auth entry redirects to v2

## Phase 2: Dashboard and Quick Actions (Week 2)
- [x] Dashboard placeholder page
- [ ] Dashboard contract-first widgets wired
- [ ] Quick action mutation path 1
- [ ] Quick action mutation path 2

## Phase 3: Production Units (Week 3)
- [x] Production units placeholder route
- [ ] Production unit list API contract implementation
- [ ] Production unit list table/cards and filters
- [ ] Detail entry route and baseline layout

## Phase 4: Inventory and Autonomy (Week 4)
- [x] Inventory placeholder route
- [ ] Autonomy days widget wired to API
- [ ] Stock adjustment flow
- [ ] Consumption registration flow

## Parallel Cleanup Track
- [x] Remove legacy private route: tasks
- [x] Remove legacy private route: expenses
- [x] Remove legacy private route: inventory
- [x] Remove legacy private route: dashboard
- [x] Remove legacy private route: farms
- [x] Remove legacy private route: farm-members
- [x] Remove legacy private route: flocks family
- [x] Remove legacy private route: species and animal profile family

## Validation Gate (Run every cleanup batch)
- [x] Route tree generated (latest batch)
- [x] Build passes (latest batch)
- [ ] Manual smoke: login -> v2 dashboard
- [ ] No broken nav links

## Open Risks
- Legacy component links may still target removed route families.
- Chunk size warning remains in production build.
- V2 placeholders need backend contract alignment before hard cutover.
- Temporary compatibility params route should be removed after v2 component refactor.
