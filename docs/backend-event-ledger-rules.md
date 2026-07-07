# Ovejitas BE Event Ledger Rules (FE/BE Working Agreement)

Status: active FE/BE contract baseline.
Date: 2026-07-02.

## Context and source of truth

- This file is aligned with the backend `events-and-actions.md` guidance and the `backend-docs/api/*.yaml` specs shared from the API repository docs (synced 2026-07-02 from `backend-docs/api/*.yaml`; source revision not specified for this sync).
- Local supporting references:
  - `backend-docs/domain-rebuild-plan.md`
  - `backend-docs/domain-notes.md`
  - `backend-docs/api/production-targets.yaml`, `backend-docs/api/reports.yaml`, `backend-docs/api/assets.yaml`, `backend-docs/api/pregnancies.yaml`

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
| 12 | Pregnancy check | `POST .../pregnancies` | `reproductive` |

Every action-emitted event must carry `payload.source` (for example: `harvest`, `flock_acquisition`).

### Pregnancy check constraints (action #12)

- Records a pregnancy / ultrasound check on one `individual` and emits one paired `reproductive` event on that individual's timeline.
- A not-pregnant check MUST omit `offspring_count` and `expected_due_at`.
- Table-backed and editable: `PATCH .../pregnancies/{id}` reconciles the paired reproductive event; `individual_id` is immutable; clearing `is_pregnant` requires also clearing `offspring_count` and `expected_due_at`.
- `DELETE .../pregnancies/{id}` hard-deletes the record and reverses its reproductive event.
- Supports `idempotency_key`: replaying a key returns the original record with `200` (no duplicate event).
- `PregnancyRead` exposes `reproductive_event_id` linking the record to its emitted ledger row.

### Harvest constraints (action #8)

- Source asset MUST be `kind=animal` or `kind=crop`.
- Source asset MUST have `produce_asset_id` set, linking it to a material asset that receives the stock.
- `unit` in the request MUST match the produce asset's existing stock unit.
- `HarvestCreate` requires a production `category_id` (the product category recorded on the emitted `production` event).
- `HarvestRead` returns `{ production_event_id, inventory_event_id, produce_balance }`.

## Linkage model

- Individuals can link lifecycle events through FK fields (`acquisition_event_id`, `mortality_event_id`, `sale_event_id`, `birth_event_id`).
- Table-backed actions (`material_purchase`, `material_consumption`, `pregnancy`) own a row and store FKs to emitted events (e.g. `pregnancy.reproductive_event_id`); they support reconcile-on-edit and reverse-on-delete.
- Table-less actions (`flock/*`, `harvest`, `material_sale`) are create-only and correlate by `payload.source` + `occurred_at` — no edit/reverse.
- Harvest links a producer asset (`kind=animal` or `kind=crop`) to its produce asset via `asset.produce_asset_id`.

## Event write-path rules

- Action-owned events (`payload.source` set) cannot be edited or deleted via generic `PATCH /events` or `DELETE /events`.
- Manual `POST /events` cannot set `payload.source`.
- `inventory` stays manually writable (for legitimate stock adjustments), but manual decrements must use the same lock and non-negative guard as actions.
- `acquisition` and `mortality` are action-only (not in manual create union).
- `production`, `observation`, standalone `expense`/`income`, and `reproductive` remain manual when no specific action endpoint governs them. Pregnancy/ultrasound-check `reproductive` events are now action-owned (action #12) and MUST be created/edited/deleted via `.../pregnancies`, not generic event writes.
- Inventory mutations must use shared inventory helpers (`emit_increment`, `emit_decrement`, lock, non-negative assertion), never raw event writes.
- Generic event create bodies accept an optional `idempotency_key`; `EventRead` exposes it. FE SHOULD send a stable key on manual event creates to make retries safe against duplicates.

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

## Production targets (configuration, not ledger events)

Production targets are a farm-scoped **configuration** resource that declares the expected output of an (asset × product), feeding the `production-productivity` report. They are NOT events and emit NO ledger rows — treat them like `event_category` config, not like actions.

- Endpoints: `GET/POST .../production-targets`, `GET/PATCH/DELETE .../production-targets/{target_id}`.
- A target binds `asset_id` + `category_id` (the product; a production-type category) to an `expected_rate`, with a `basis` (`per_head_continuous` | `per_event` | `total`) and optional `period` (`day` | `year` | null).
- **Effective-dated**: `asset_id`, `category_id`, `basis`, `period`, and `effective_from` are set once at create. A **changed rate is a new effective-dated target, not an edit** — the report replays the target applicable to each moment.
- `PATCH` may only adjust `expected_rate`, close `effective_to`, or set `archived_at`; it MUST NOT re-point the asset/category/basis. `DELETE` removes a target row.
- This generic model supersedes the removed egg-specific `expected_eggs_per_head_per_day` asset field: eggs are now just a target on the "eggs" production category, exactly like milk, wool, etc.
- FE gating: whether an asset shows expected-rate/productivity UI is derived from whether it has applicable production targets (and/or logged production in a category) — never from a per-product boolean or an animal-type guess.

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
- **sales-value** (`GET .../reports/sales-value`): realized weighted-average sale price per (asset, unit), derived from sale-action events only (manual income excluded). `value_per_unit = sale income ÷ quantity sold`. When an asset was sold in more than one unit in the window, income can't be split → `ambiguous: true` with null `unit`/`quantity_sold`/`value_per_unit`. Assets with no sales in the window do not appear. Pairs with `cost-per-unit` (the cost floor) to derive margin client-side.
- **production-productivity** (`GET .../reports/production-productivity`): produced vs expected output per (asset, product), where a product is a production `event_category`. One row per (asset, product) that either produced in the window or has an applicable production target. `produced` is converted into the product's unit; `expected` comes from the asset's applicable production target, scaled by the target's `basis` (`per_head_continuous` uses time-weighted animal-days; `per_event`; `total`). `productivity_pct = produced ÷ expected × 100`. `date_from` and `date_to` are **required**. A pair with no applicable target reports `missing_capacity: true` with null `expected`/`productivity_pct` (mirrors `has_unvalued_consumption`) — never divide-by-zero. Row: `{ asset_id, asset_name, category_id, product_name, unit, produced, expected, productivity_pct, basis, missing_capacity }`. Supersedes the removed egg-only `coop-productivity` report; see the Production targets section. Headcount for `per_head_continuous` remains event-derived, not stored.
- **upcoming-births** (`GET .../reports/upcoming-births`): one row per individual whose *latest* pregnancy check is pregnant with `expected_due_at` inside `[date_from, date_to]`. A later not-pregnant check suppresses the alert. `date_from` and `date_to` are **required**; `days_until_due` counts whole days from `date_from`. Depends on pregnancy checks (action #12) existing.
- **PDF exports**: `GET .../reports/profitability/pdf` and `GET .../reports/cost-per-unit/pdf` return the respective report as a downloadable PDF.

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

### 2026-07-02

- **Production targets resource shipped** (`GET/POST/PATCH/DELETE .../production-targets`): generic per-(asset, product) expected-output configuration with `basis` (`per_head_continuous` | `per_event` | `total`), optional `period` (`day`|`year`), and effective-dating (`effective_from`/`effective_to`, `archived_at`). A rate change is a new effective-dated target, not an edit; `PATCH` only adjusts `expected_rate`/`effective_to`/`archived_at`. Config only — emits no ledger events.
- **`production-productivity` report shipped, replaces `coop-productivity`** (`GET .../reports/production-productivity`): produced vs expected per (asset, product=production category), `expected` from the applicable target scaled by `basis`, `missing_capacity: true` when no applicable target. `date_from`/`date_to` required. Row now carries `category_id`, `product_name`, `basis`. FE must migrate off `coop-productivity` (removed).
- **`expected_eggs_per_head_per_day` removed from the asset** (`AssetCreate`/`AssetUpdate`/`AssetRead`): the egg-specific laying-rate field no longer exists; expected laying rate is now a production target on the eggs category. FE must drop this field and configure rates via `production-targets`.
- **Generic event idempotency**: event create bodies accept optional `idempotency_key` and `EventRead` exposes it (previously called out only for pregnancy checks). FE should send a stable key on manual creates for safe retries.
- **Harvest takes a production `category_id`**: `HarvestCreate` now requires the product category recorded on the emitted `production` event.

### 2026-06-17

- **Pregnancy check action shipped** (`POST/PATCH/DELETE .../pregnancies`): records a pregnancy/ultrasound check on one individual and emits a paired `reproductive` event. Table-backed with reconcile-on-edit and reverse-on-delete; `individual_id` immutable; not-pregnant checks omit `offspring_count`/`expected_due_at`; supports `idempotency_key`. FE must create/edit/delete these `reproductive` events via the pregnancy endpoints, not generic event writes.
- **`sales-value` report shipped** (`GET .../reports/sales-value`): realized weighted-average sale price per (asset, unit) from sale-action events only; `ambiguous: true` when an asset sold across multiple units in the window. FE derives margin by pairing with `cost-per-unit`.
- **`coop-productivity` report shipped** (`GET .../reports/coop-productivity`): eggs laid vs expected per coop. `date_from`/`date_to` required; `missing_capacity: true` when laying rate unset or headcount 0. Headcount is event-derived, not stored.
- **`upcoming-births` report shipped** (`GET .../reports/upcoming-births`): individuals due within `[date_from, date_to]` based on latest pregnancy check; required date window. Depends on pregnancy checks.
- **Asset gains `expected_eggs_per_head_per_day`**: new nullable, editable Decimal field on `AssetCreate`/`AssetUpdate`/`AssetRead` that configures a coop's expected laying rate (feeds `coop-productivity`). Headcount remains event-derived.
- **Report PDF exports added**: `GET .../reports/profitability/pdf` and `GET .../reports/cost-per-unit/pdf` return downloadable PDFs.
- **Not ledger-affecting**: `members` role-management endpoints (`PATCH`/`DELETE .../members/{id}`) changed but emit no events — outside this contract.

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
