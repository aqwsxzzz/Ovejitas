# V2 Cleaning Wave 1 (Controlled)

Date: 2026-04-22
Branch: rewrite/v2-foundation

## Goal
Create a safe first cleanup pass without deleting business-critical auth or breaking CI.

## Decisions Applied
- Keep auth screens and auth API logic operational.
- Move authenticated entry from legacy farm dashboard to v2 shell.
- Keep legacy private routes in codebase temporarily while v2 modules are scaffolded.
- Avoid mass file deletion in wave 1.

## Changes Completed in Wave 1
- Root app entry points to v2 dashboard.
- Auth login success route now points to `/v2/dashboard`.
- Public authenticated guard now redirects to `/v2/dashboard`.
- V2 shell, sections, and route skeleton exist and build successfully.

## Keep List (Wave 1)
- Auth API and session flows.
- Public login/signup pages.
- Build tooling, lint, TS, Vite config, query client wiring.
- Shared axios/i18n infrastructure.

## Rewrite List (Active)
- App shell, navigation system, layout primitives.
- Dashboard and private workflow pages.
- Feature modules tied to v1 information architecture.

## Delete List (Deferred to Wave 2)
- Legacy private route modules under `src/routes/_private/**` once v2 replacements are complete.
- Legacy UI components only referenced by deprecated v1 routes.
- Legacy feature modules with zero references after route cutover.

## Wave 2 Exit Prerequisites
- V2 versions exist for dashboard, production units, inventory, finance, and alerts.
- Legacy route usage is reduced to zero in navigation and redirects.
- Dependency graph confirms target legacy modules are unreferenced.

## Validation Checklist
- [x] Branch safety in place.
- [x] V2 docs and architecture scaffold created.
- [x] Auth continuity preserved.
- [x] Build passes after redirect changes.
- [ ] Route-by-route legacy removal checklist prepared.
- [ ] Wave 2 deletion PR prepared.
