# Ovejitas BE Event Ledger Rules (FE/BE Working Agreement)

Status: active FE/BE contract baseline.
Date: 2026-05-21.

## Context and source of truth

- This file is aligned with the backend `events-and-actions.md` guidance shared from the API repository docs.
- Local supporting references:
  - `temp_repo/docs/domain-rebuild-plan.md`
  - `temp_repo/docs/domain-notes.md`

## Core model (what the backend is)

The backend domain is ledger-first and generic:

- `asset`: any trackable thing (animal, crop, equipment, material, location)
- `individual`: identity-level instance under an individual-mode asset
- `event_category`: farm-scoped category taxonomy per event type
- `event`: single ledger table for domain facts, discriminated by `type`

Event types in the ledger:

- `production`
- `expense`
- `income`
- `observation`
- `reproductive`
- `acquisition`
- `mortality`
- `inventory`

## Philosophy 1 (non-negotiable)

One real-world fact must be captured through its governing action. That action emits event rows inside the same transaction.

Implications:

- Users do not manually create action-owned events when an action exists.
- Event rows are a derived, auditable ledger, not a parallel manual input source.
- Action and emitted event(s) must commit/rollback together.

## Actions and emitted events (current contract)

All action emission is atomic and rollback-safe.

1. Individual create -> `acquisition` (+ `expense` if purchased)
2. Individual status -> deceased -> `mortality`
3. Individual status -> sold -> `income`
4. Birth -> `reproductive` + N x `acquisition`
5. Flock acquisition -> `inventory` increment + `acquisition` (+ `expense`)
6. Flock sale -> `inventory` decrement + `income`
7. Flock mortality -> `inventory` decrement + `mortality`
8. Harvest -> `production` + `inventory` increment
9. Material purchase -> `inventory` increment + `expense`
10. Material consumption -> `inventory` decrement
11. Material sale -> `inventory` decrement + `income`

Every action-emitted event must carry `payload.source` (for example: `harvest`, `flock_acquisition`).

## Linkage model

- Individuals can link lifecycle events through FK fields (`acquisition_event_id`, `mortality_event_id`, `sale_event_id`, `birth_event_id`).
- Table-backed actions own their row and store FKs to emitted events.
- Table-less actions are create-only and correlate by `payload.source` + `occurred_at`.
- Harvest links producer asset to produce asset through `asset.produce_asset_id`.

## Event write-path rules

- Action-owned events (`payload.source` set) cannot be edited or deleted via generic `PATCH /events` or `DELETE /events`.
- Manual `POST /events` cannot set `payload.source`.
- `inventory` stays manually writable (for legitimate stock adjustments), but manual decrements must use the same lock and non-negative guard as actions.
- `acquisition` and `mortality` are action-only (not in manual create union).
- `production`, `observation`, standalone `expense`/`income`, and `reproductive` remain manual when no specific action endpoint governs them.
- Inventory mutations must use shared inventory helpers (`emit_increment`, `emit_decrement`, lock, non-negative assertion), never raw event writes.

## Implementation pattern for action services

Each action should implement the same transaction pattern:

- `emit`: create event(s) from action payload
- `reconcile`: edit flow updates event(s) deterministically
- `reverse`: undo/delete flow reverses or compensates event(s)
- full transaction boundary with rollback safety
- service/action layer is the only DB writer

Shared helpers are acceptable; feature-level orchestration is intentional.
Do not force one universal action abstraction if it introduces behavior flags and hides domain intent.

## FE integration rules

### Rule 1: Drive UX by action, not by event type list

- If a domain action exists, FE must call action endpoint, not generic event create.
- Generic event UI should only expose event types that are genuinely manual in current release.

### Rule 2: Hide forbidden manual event types

- FE must not offer manual create forms for `acquisition` and `mortality`.
- FE may offer manual `inventory` adjustment/count flow.
- FE must not expose editable/delete controls for action-owned events (`payload.source` present).

### Rule 3: Prevent double-write paths

- FE must never do action call plus manual event create for the same fact.
- One user intent -> one command endpoint -> backend emits all ledger effects.

### Rule 4: Edit/delete semantics

- FE edits/deletes action records via action endpoints only.
- FE should not patch emitted ledger rows directly when those rows are action-owned.

### Rule 5: Reporting assumptions

- Reports should be treated as ledger projections.
- FE should assume stock/finance/lifecycle consistency is guaranteed by backend action emission, not by FE post-processing.

### Rule 6: Backend-gap escalation (mandatory)

- If a required behavior is backend-owned but missing in current BE build, FE must not implement a workaround that fakes server logic.
- FE must escalate the gap to BE using the request template at `.github/prompts/be-capability-request.prompt.md`.
- Until backend capability is delivered, FE should use explicit blocked/disabled UX rather than hidden fallback behavior.

## BE guardrail rules

- Reject manual create for action-owned event types in generic create endpoint.
- Reserve `payload.source` for action emission only.
- Reject generic event patch/delete when `payload.source` is present.
- Keep same-farm and same-context FK validation in service layer.
- Preserve transactional atomicity for every action that emits events.
- Ensure reconcile/reverse logic exists before shipping an action as editable/deletable.

## Reports contract (for FE assumptions)

Reports are always derived from event replay (never cached mutable counters):

- profitability: income - expense per asset
- aggregate: per-type time buckets
- cost-per-unit: expenses and consumption value against production
- inventory-summary: on-hand by replaying full inventory history (do not truncate replay by date window)

## Priority roadmap (recommended)

1. Aggregated animal lifecycle actions first
- Add flock-level sale and mortality actions (inventory decrement + income/mortality).
- This closes the gap between individual and aggregated assets.

2. Birth action second
- One action should create reproductive event + offspring individuals + offspring acquisition(born) events atomically.
- Must wire parentage (`mother_id`) in the same transaction.

3. Production to inventory third
- Decide domain policy first: whether produced goods must be stock-tracked.
- If yes, production action emits production + inventory increment.

## Definition of done for any new action

- New feature folder and endpoint for business intent.
- Emitted event set is deterministic and documented.
- Events are tagged with unique `payload.source`.
- Generic manual endpoint rejects action-owned manual duplicates.
- If stock mutates, shared inventory helpers and type validation are used.
- Update flow reconciles prior emissions when endpoint is editable.
- Delete/undo flow reverses or compensates prior emissions when supported.
- Integration tests cover transaction behavior with real DB.
- FE removes manual path for action-owned types and uses action flow only.

## Quick anti-pattern checklist

- Manual create of an event type that has a governing action.
- Manual post that sets `payload.source`.
- Generic patch/delete of action-owned event.
- FE creating events directly to "fix" missing backend action wiring.
- Non-transactional action + event writes.
- Event edits that bypass action service.
- A generic abstraction that erases domain intent behind flags.
