# Ovejitas BE Event Ledger Rules (FE/BE Working Agreement)

Status: active FE/BE contract baseline.
Date: 2026-06-03.

## Context and source of truth

- This file is aligned with the backend `events-and-actions.md` guidance shared from the API repository docs.
- Local supporting references:
  - `backend-docs/domain-rebuild-plan.md`
  - `backend-docs/domain-notes.md`

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

| # | Action | Endpoint | Emits |
|---|--------|----------|-------|
| 1 | Individual create | `POST .../individuals` | `acquisition` (+ `expense` if purchased) |
| 2 | Individual → deceased | `PATCH .../individuals/{id}` | `mortality` |
| 3 | Individual → sold | `PATCH .../individuals/{id}` | `income` |
| 4 | Birth | `POST .../individuals/{id}/births` | `reproductive` + N × `acquisition` |
| 5 | Flock acquisition | `POST .../assets/{id}/flock/acquisitions` | `inventory`+ + `acquisition` (+ `expense`) |
| 6 | Flock sale | `POST .../assets/{id}/flock/sales` | `inventory`− + `income` |
| 7 | Flock mortality | `POST .../assets/{id}/flock/mortalities` | `inventory`− + `mortality` |
| 8 | Harvest | `POST .../assets/{id}/harvests` | `production` + `inventory`+ on produce asset |
| 9 | Material purchase | `POST .../material-purchases` | `inventory`+ + `expense` |
| 10 | Material consumption | `POST .../material-consumptions` | `inventory`− |
| 11 | Material sale | `POST .../assets/{id}/sales` | `inventory`− + `income` |

Every action-emitted event must carry `payload.source` (for example: `harvest`, `flock_acquisition`).

### Harvest constraints (action #8)

- Source asset MUST be `kind=animal` or `kind=crop`.
- Source asset MUST have `produce_asset_id` set, linking it to a material asset that receives the stock.
- `unit` in the request MUST match the produce asset's existing stock unit.
- `HarvestRead` returns `{ production_event_id, inventory_event_id, produce_balance }`.

## Linkage model

- Individuals can link lifecycle events through FK fields (`acquisition_event_id`, `mortality_event_id`, `sale_event_id`, `birth_event_id`).
- Table-backed actions (`material_purchase`, `material_consumption`) own a row and store FKs to emitted events.
- Table-less actions (`flock/*`, `harvest`, `material_sale`) are create-only and correlate by `payload.source` + `occurred_at` — no edit/reverse.
- Harvest links a producer asset (`kind=animal` or `kind=crop`) to its produce asset via `asset.produce_asset_id`.

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

- **profitability** (`GET .../reports/profitability`): income − expense per asset per currency. Events with null amount/currency excluded. Different currencies never silently summed.
- **aggregate** (`GET .../reports/aggregate`): generic per-type time buckets.
  - `group_by=asset` is ONLY valid for `production`, `mortality`, `acquisition`. Passing it for `observation`, `inventory`, `expense`, `income`, or `reproductive` returns 422.
  - For `inventory` type, pass `adjustment=reset|increment|decrement` to isolate one flow direction; omitting it returns the net flow.
  - `AggregateRow` shape: `{ bucket, group, group_label, measure, value, asset_id, unit }`. `unit` is present for production/observation rows.
- **material-consumption-aggregate** (`GET .../reports/material-consumption-aggregate`): dedicated endpoint for material consumption totals. Supports `group_by=material|consumer|both`. Do NOT use the generic `aggregate` endpoint for consumption reporting.
- **cost-per-unit** (`GET .../reports/cost-per-unit`): direct expenses + average-cost-valued feed consumption ÷ production quantity, per producer asset. Feed cost is not bounded by `date_from` (full purchase history used for average cost). `has_unvalued_consumption: true` flags rows where feed has no purchase history to value it — FE should surface this warning.
- **inventory-summary** (`GET .../reports/inventory-summary`): on-hand balance per (asset, unit) for material assets and aggregated animal flocks. `date_to` gives the balance as of that moment (defaults to now). `date_from` DOES NOT apply to a running balance and is always ignored by the backend.
- **inventory balance** (`GET .../assets/{id}/events/balance`): current on-hand balance per (asset, unit) computed from `inventory` events since the most recent reset. Only meaningful for `kind=material` assets.
- **individual timeline** (`GET .../reports/individuals/{id}/timeline`): paginated `EventRead` list for a single individual. Returns the full event history for that individual in `Page` envelope.

## Priority roadmap (recommended)

~~1. Aggregated animal lifecycle actions~~ — **DONE**: `flock/sales`, `flock/mortalities` shipped.

~~3. Production to inventory~~ — **DONE**: Harvest action ships `production` + `inventory`+ on produce asset.

1. Birth action (next priority)
- One action should create reproductive event + offspring individuals + offspring acquisition(born) events atomically.
- Must wire parentage (`mother_id`) in the same transaction.

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

---

## Contract change log

### 2026-06-03

- **Clarification only — no contract changes** in this sync.

### 2026-06-02

- **Harvest source expanded**: Harvest action (`POST .../assets/{id}/harvests`) now supports `kind=crop` assets as producers, not only `kind=animal`. FE must allow crop assets to trigger harvest.
- **Harvest unit constraint**: `unit` in the harvest request MUST match the produce asset's existing stock unit. A mismatch is rejected 422 before emission.
- **Aggregate `group_by=asset` restricted**: `group_by=asset` on the aggregate report is valid ONLY for `production`, `mortality`, `acquisition`. All other types return 422. FE must not pass `group_by=asset` for expense, income, observation, inventory, or reproductive aggregates.
- **`AggregateRow.unit` field added**: Aggregate report rows now carry a `unit` field (present for production/observation rows, null otherwise). FE type updated accordingly.
- **`material-consumption-aggregate` report endpoint shipped**: Dedicated report for material consumption totals at `GET .../reports/material-consumption-aggregate`. Supports `group_by=material|consumer|both`. Use this endpoint instead of the generic aggregate for consumption reporting.
- **Inventory balance endpoint available**: `GET .../assets/{id}/events/balance` returns current on-hand balances per unit for a material asset. FE can use this in place of replaying events client-side.
- **Flock sale and mortality actions shipped**: `POST .../assets/{id}/flock/sales` and `POST .../assets/{id}/flock/mortalities` are now live, closing the gap noted in the previous roadmap.
