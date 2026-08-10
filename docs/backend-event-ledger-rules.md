# Ovejitas BE Event Ledger Rules (FE/BE Working Agreement)

Status: active FE/BE contract baseline.
Date: 2026-07-27.

## Context and source of truth

- This file is aligned with the backend `events-and-actions.md` guidance and the `backend-docs/api/*.yaml` specs shared from the API repository docs (synced 2026-07-27 from backend `develop@96f8256`, "feat(event-category)!: a product owns the produce pool holding its stock (#50)", which follows `b792bb7` "fix!: draw calendar days on the farm timezone, not UTC (#49)").
- Where `backend-docs/events-and-actions.md` and `backend-docs/api/*.yaml` disagree, **the yaml specs win** — the prose doc still says "the 11 actions" and omits the pregnancy-check action defined in `pregnancies.yaml`. It was refreshed for the product-owns-pool change, but not for `produce-outcome`, `profitability-full.allocated_produce_income`, or the farm-calendar rules below.
- Local supporting references:
  - `backend-docs/domain-rebuild-plan.md`
  - `backend-docs/domain-notes.md`
  - `backend-docs/api/production-targets.yaml`, `backend-docs/api/reports.yaml`, `backend-docs/api/assets.yaml`, `backend-docs/api/pregnancies.yaml`, `backend-docs/api/material-consumptions.yaml`, `backend-docs/api/material-purchases.yaml`, `backend-docs/api/material-sales.yaml`

## Core model (what the backend is)

The backend domain is ledger-first and generic:

- `asset`: any trackable thing (animal, crop, equipment, `material`, **`produce`**, location). Carries an optional `gestation_days` (20–400) used to derive pregnancy due dates — **animals only**; sending it for any other `kind` is a `422` ("Only animal assets carry a gestation length"). Present on `AssetCreate`, `AssetUpdate`, and `AssetRead`.
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
| 8 | Harvest | `POST .../assets/{id}/harvests` | `production` + `inventory`+ on produce asset (routed by request `produce_asset_id`; writes a `produce_lot`) |
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
- A check MAY record `service_date` (when she was served) and `sire_individual_id` (who bred her). Both optional; both are mirrored onto the paired `reproductive` event's payload. The sire MUST be a different individual in the same farm.
- The list endpoint filters by `sire_individual_id` (alongside `individual_id` and `is_pregnant`).
- A pregnancy is **one row per check, not one row per gestation**. There is no pregnancy entity, no status, and no link from a check to the birth that resolved it — so estimated-vs-actual offspring is NOT derivable. Current state is reconstructed latest-record-wins by the upcoming-births report.

#### Derived `expected_due_at`

- On **create**, a positive check that omits `expected_due_at` gets one derived as `(service_date or occurred_at) + asset.gestation_days`.
- A value the caller supplies is ALWAYS kept as given — the farmer overrides the model.
- An asset with no `gestation_days` derives nothing rather than erroring. FE MUST treat a null `expected_due_at` on a positive check as a valid state.
- **PATCH never re-derives.** A stored due date does not move when `service_date` is edited, nor when the asset's `gestation_days` changes later.
- FE consequence: `expected_due_at` SHOULD be an optional field, not a required one. Leave it empty to accept the derived value.

### Harvest constraints (action #8)

- Source asset MUST be `kind=animal` or `kind=crop`.
- **`HarvestCreate` names only the PRODUCT: `category_id` (required). `produce_asset_id` is GONE from the body** (sending it is `422` "Extra inputs are not permitted" — the schema base is `extra="forbid"`). The destination pool is resolved from `event_category.produce_asset_id`, so the stock increment and the `production` event can no longer be attributed to different products — the mismatch stopped being *representable* instead of being validated for.
- **FE consequence: the harvest destination picker is a production-category picker.** There is no pool picker and no "create produce asset" flow. See the Product section below.
- A producer still feeds **multiple** products by harvesting under each product's own category; two producers still share a pool by harvesting the same product.
- `asset.produce_asset_id` survives **only as a UI default** ("this producer's usual product") and is never read for routing.
- Resolution order and errors (`resolve_produce_asset` runs **first**, as the farm-scope boundary): a category in another farm → `404` "Category not found in this farm" (never confirmed to exist); a non-production category → `422`; a production category with no pool → `422` "This product has no produce pool to harvest into"; source == pool → `422`.
- `unit` MUST share a **measurement family** with the product category's `unit` (e.g. `unit`/`dozen`), and MUST match the pool's existing stock unit. **A pool is locked to its first harvest's unit** — there is no unit conversion; a mismatch is rejected before emission.
- Each harvest persists a **`produce_lot`** row linking the producer, the destination pool, and the paired `production`/`inventory`+ events. These lots are the FIFO "daily baskets" the produce-attribution reports consume (grouped by the **farm's local calendar day** — see `farm.timezone`), and they carry the per-producer contribution counts. This is the persisted link that makes per-producer attribution possible (harvest events alone are not back-attributable).
- `HarvestRead` returns `{ production_event_id, inventory_event_id, produce_balance }`.

### Material purchase constraints (action #9)

- Atomically emits `inventory`+ **and** an `expense` event for `amount` paid. **This is the only moment feed cost enters the ledger.**
- Purchases establish the material's **average cost basis**, which is what values feed consumption in the `cost-per-unit` report. Stock added by a bare manual `inventory` event has **no cost basis** and will flag `has_unvalued_consumption`.
- `unit` MUST match how the material is already tracked; any unit is allowed for a material with no inventory history.
- Table-backed and editable: `material_asset_id` is immutable. `PATCH` reconciles the inventory event (`quantity`/`unit`/`occurred_at`) and the expense event (`amount`/`occurred_at`). An edit driving stock negative is rejected `409`.
- `DELETE` hard-deletes and reverses **both** the stock increment and the expense; rejected `409` if reversal would drive stock negative.
- Supports `idempotency_key` (replay returns the original record with `200`).

### Material consumption constraints (action #10)

- Emits **`inventory`− only — NO `expense` event.** Consuming feed is money-neutral in the ledger by design: the money was already booked at purchase. FE MUST NOT expect a consumption to move any asset's profitability `net`.
- `reason` is required: `feeding` | `waste` | `spoilage`.
  - `reason=feeding` **requires** `consumer_asset_id` (the asset being fed).
  - `reason=waste` / `spoilage` **MUST omit** `consumer_asset_id` (422 otherwise).
- `unit` MUST match a unit the material already holds stock in.
- Rejected `409 insufficient_stock` if the decrement would drive stock negative. FE MUST surface this as "register a purchase first", never retry or silently clamp.
- Feed cost is attributed to the consumer **only as a derived report figure** (`cost-per-unit.consumed_material_cost`, valued at the material's average purchase cost) — never as a ledger event on the consumer.
- Table-backed and editable: `material_asset_id` is immutable. `PATCH` on `quantity`/`unit`/`occurred_at` reconciles the paired inventory event and re-checks stock. `DELETE` hard-deletes and reverses the stock effect.
- Supports `idempotency_key` (replay returns the original record with `200`).

### Material sale constraints (action #11)

- Decrements the material asset's inventory and books a paired `income` event for `amount` in the farm's default currency. The sale links its `income_event_id` to its inventory decrement so each sale's quantity pairs to its own price (an `income` event alone cannot carry quantity) — this pairing is what the `sales-value` and `produce-outcome` derivations rely on.
- `unit` MUST match a unit the asset already holds stock in; rejected `409` if it would drive stock below zero.
- Create-only (table-less): `MaterialSaleRead` returns `{ inventory_event_id, income_event_id, on_hand }`. No edit/reverse path.
- **Selling a produce pool uses THIS action — there is no dedicated "produce sale" action.** A pooled product (e.g. eggs harvested from several coops) is a `material` asset; the farmer sells it with `material_sale`, which books ONE `income` event on the pool. The split of that income back to the producing animals is **derived at read time** (see the produce-attribution reports), never booked as per-producer `income` events. Consequently **over-selling a pool is rejected** by the same non-negative guard (`409`) — you cannot sell more produce than harvests recorded; FE MUST surface this as "correct your production entry", not retry. Recording produce **loss / self-use** likewise uses the existing `material_consumption` with `reason=waste`/`spoilage` on the pool asset (zero-revenue), which the engine attributes per-producer as `lost`. A dedicated loss/self-use action and a `SELF_USE` reason are **not yet shipped**.

## Asset kind: `produce` (stock-bearing pools, split out of `material`)

`produce` is a first-class asset kind alongside `animal` / `crop` / `equipment` / `material` / `location`, present in `AssetCreate.kind`, `AssetRead.kind`, `AssetUpdate.kind`, and the per-kind `AssetSummary` counts. It gives produce pools (eggs, milk) their own kind instead of overloading `material`.

> Semantics below were **confirmed from backend source at commit `e659525`** ("split produce pools out of the material kind"). `backend-docs/api/*.yaml` is still stale on this — its prose says `material` in several places where the guards now accept both kinds. Trust this section over that prose until the yaml is regenerated.

The load-bearing rule is a backend set: **`INVENTORY_KINDS = {MATERIAL, PRODUCE}`**. Guards meaning *"stock-bearing"* use that set; guards meaning *"a consumable input you buy"* still require `MATERIAL` exactly.

- **Sale — `produce` IS sellable.** `POST .../assets/{id}/sales` accepts both `material` and `produce` (guard checks `kind not in INVENTORY_KINDS`). The pool-sale → derived per-producer allocation path works against `kind=produce`.
- **Inventory — full support.** `inventory` events are allowed for any `INVENTORY_KINDS` asset (plus aggregated animal flocks). `.../events/balance` and `inventory-summary` are pure INVENTORY-event replays with **no kind filter at all** — produce assets appear as soon as they have events. The old "only meaningful for `kind=material`" line was descriptive, never enforced.
- **Harvest target — MUST be `kind=produce`.** A pool that is not `kind=produce` is rejected `422` "This product's produce pool is missing". **This is a hard break:** harvesting into a still-`material` pool now fails. (Since `96f8256` the pool is provisioned by the API as `kind=produce`, so this only bites legacy rows.)
- **Loss / self-use — `material_consumption` REJECTS `produce`** (still `MATERIAL` exactly, deliberately, since consumption is the feed-cost path). **Produce losses are recorded as a plain `inventory` decrement on the pool.** The allocation engine treats every non-`material_sale` decrement/reset as a zero-revenue draw (`is_sale = payload.source == "material_sale"`), so those decrements feed the `lost` column correctly. There is no `reason=waste|spoilage` on produce, and there never was a produce-specific one.
- **Migration — automatic, one bounded gap.** Two migrations: one adds the enum value, one backfills `material → produce` for any asset that has a `produce_lot` row or is pointed at by an `asset.produce_asset_id`. Both reversible. **Gap:** a pool harvested into before `produce_lot` existed (2026-07-22) and never linked from a producer is not caught — and it **cannot be fixed over the API**, because `AssetService.update` freezes `kind` once the asset has any event (a pool by definition has inventory events). Stragglers need a direct SQL `UPDATE`.
- **Pools left as `material` still report correctly.** `produce_lot` rows are keyed by `produce_asset_id` and the pool lookup joins assets with no kind filter, so `produce-outcome` and `allocated_produce_income` keep working, and `profitability-full` excludes both kinds so nothing double-counts. Only **new harvests** into a still-`material` pool are rejected.

### `AssetCreate` forbids `produce_asset_id` — create-then-PATCH

`AssetCreate` genuinely omits `produce_asset_id`, and the schema base is `extra="forbid"`. Sending it on `POST /assets` returns **`422` "Extra inputs are not permitted"** from Pydantic before any service code runs — i.e. the whole asset creation fails, not just the link. FE MUST create the asset first and then set the link with `PATCH .../assets/{id}` (`AssetUpdate` does accept `produce_asset_id`, and validates the target is `kind=produce`).

## A product IS its production category — and it owns its pool

**One farmer-facing thing = one record to create.** A production `event_category` is the product identity (name + unit) **and** owns the `produce` asset holding its stock.

- **`EventCategoryRead.produce_asset_id`** (`integer | null`) — the pool backing this product. Provisioned by the API, never client-supplied; `EventCategoryCreate` does not accept it.
- **Create provisions.** `POST .../event-categories` with `type=production` builds the `kind=produce` pool and links it **in one transaction**. The pool is named after the category at creation time.
- **`POST /assets` and `PATCH .../assets/{id}` REJECT `kind=produce`** — `422` "Produce assets are created by their production category — create the category instead". The hand-authored twin cannot come back. **FE MUST delete any "create produce asset" UI.**
- **Delete retires the pool, or refuses.** `DELETE .../event-categories/{id}` deletes the pool with the category. If the pool already has recorded stock (any event), the delete is **refused** — `422` "Cannot delete a product whose produce pool already has recorded stock" — rather than cascading inventory events away. FE MUST surface this as "this product already has stock/history and can't be deleted", never retry. (Archiving via `archived_at` remains the way to retire a product in use.)
- **Both entities still exist, because they are not the same concept:** the category is the product identity and is still required when there is no stock at all (a `production` event posted straight to `POST /events` with no pool behind it); the pool carries the balance, the FIFO `produce_lot` rows, and the sale path. FE reads `produce_asset_id` off the category whenever it needs the stock side.
- **Migration:** existing categories are paired to pools from strongest evidence down — harvest history (`produce_lot` → production event → category), then an unclaimed same-farm same-name produce asset, then a freshly provisioned pool. It **aborts with a specific message rather than guessing** when a category's lots span two pools or a pool was fed by two categories. The downgrade unpairs but deliberately does not delete provisioned pools.
- **Known gap — renaming a product does NOT rename its pool.** `PATCH .../event-categories/{id}` updates only the category row; the pool keeps its original name, so `produce-outcome.produce_name`, inventory, and sale screens will show the stale name. FE MUST NOT paper over this by displaying the category name where the API returns the pool name — that hides a real divergence. Escalate to BE.

## Linkage model

- Individuals can link lifecycle events through FK fields (`acquisition_event_id`, `mortality_event_id`, `sale_event_id`, `birth_event_id`).
- Table-backed actions (`material_purchase`, `material_consumption`, `pregnancy`) own a row and store FKs to emitted events (e.g. `pregnancy.reproductive_event_id`); they support reconcile-on-edit and reverse-on-delete.
- Table-less actions (`flock/*`, `harvest`, `material_sale`) are create-only and correlate by `payload.source` + `occurred_at` — no edit/reverse. (Harvest additionally persists a `produce_lot` row, but its emitted events remain create-only; a dedicated harvest correction/replay path is **not yet shipped**.)
- Harvest links a producer asset (`kind=animal` or `kind=crop`) to its destination produce pool via the **request-supplied `category_id`** (the product), whose `event_category.produce_asset_id` resolves the pool; the link is recorded on a `produce_lot` row (producer ↔ pool ↔ paired events). `asset.produce_asset_id` is only an optional default suggestion, not the link.
- Because per-producer produce income is **derived, never materialized**, correcting a harvest simply changes the derived reports the next time they are queried — nothing needs re-booking or reversing. (The append-only "void + re-book" engine proposed by FE was intentionally **not** built; the ledger already permits event edit/delete, so derivation is the simpler correct model.)

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
- **Day boundaries are backend-owned too.** FE MUST NOT re-cut, re-bucket, or timezone-shift returned periods client-side; send farm-local naive bounds and render returned dates as given (see Farm calendar and timezone).

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
- `effective_from` / `effective_to` are **bare calendar dates resolved on the farm's calendar** (`effective_from` starts at local midnight of that day). FE MUST send them as `YYYY-MM-DD`, never as a UTC instant derived from a browser `Date` — an off-by-one there silently shifts the expected denominator.
- `PATCH` may only adjust `expected_rate`, close `effective_to`, or set `archived_at`; it MUST NOT re-point the asset/category/basis. `DELETE` removes a target row.
- This generic model supersedes the removed egg-specific `expected_eggs_per_head_per_day` asset field: eggs are now just a target on the "eggs" production category, exactly like milk, wool, etc.
- FE gating: whether an asset shows expected-rate/productivity UI is derived from whether it has applicable production targets (and/or logged production in a category) — never from a per-product boolean or an animal-type guess.

## Reports contract (for FE assumptions)

Reports are always derived from event replay (never cached mutable counters):

- **profitability** (`GET .../reports/profitability`): income − expense per asset per currency. Events with null amount/currency excluded. Different currencies never silently summed. **Scope limit:** `net` counts only `expense`/`income` events booked **on that asset**. Consumed-material (feed) cost is NOT an expense event on the consumer, so it is structurally excluded from `net`. FE MUST NOT present this `net` as an all-in economic result — use `profitability-full` for that. FE MUST NOT synthesize an all-in net by subtracting `cost-per-unit` figures client-side.
- **profitability-full** (`GET .../reports/profitability-full`): the **all-in bottom line** per asset — `net_incl_materials = income − (direct expense + consumed feed)`. Feed is valued on the **same basis as `cost-per-unit` (R3), so the two can never disagree**. This is the report to use for "what did this animal actually earn me".
  - **Row:** `{ asset_id, asset_name, currency, income_total, allocated_produce_income, direct_expense_total, consumed_material_cost, total_cost, net, net_incl_materials, has_unvalued_consumption }`, where `total_cost = direct_expense_total + consumed_material_cost`. Envelope is `{ data, totals }` — note this **does** carry `totals`, unlike `cost-per-unit`, which does not. `totals` rows carry the same `allocated_produce_income` field.
  - **`allocated_produce_income`** is the producer's derived share of income from produce it made that was later **sold** from a pool (see `produce-outcome`). This is how an animal finally reflects the money its products earned. The pool's own `material_sale` income sits on a MATERIAL asset that this report excludes, so surfacing the allocation here does **not** double-count. It is derived at read time (FIFO over `produce_lot` baskets); no per-producer `income` event exists in the ledger. **Net inclusion (confirmed by BE):**
  - `net = income_total − direct_expense_total` — excludes BOTH produce income and feed; unchanged R1 figure kept for backward compatibility.
  - `net_incl_materials = (income_total + allocated_produce_income) − (direct_expense + feed)` — **already includes** `allocated_produce_income`.
  - FE rules: use `net_incl_materials` **as-is** for the all-in bottom line — never add the allocation on top of it. Add `allocated_produce_income` to a headline ONLY if that headline is the bare `net`. Displaying it as its own line is always safe.
  - **Double-count trap:** the produce-sale money is also booked as ordinary `income_total` on the produce (pool) asset's OWN row. `allocated_produce_income` is an attribution *slice* of income that already lives on another row — not new money. NEVER sum `income_total` across rows and also add `allocated_produce_income`.
  - `net` (income − direct expense) is retained unchanged for backward compatibility with R1.
  - **One row per (asset, currency)** — an asset with activity in two currencies gets two rows, and currencies are **never** mixed or converted. There is **NO `has_other_currency`** field on this report (that flag exists only on `produce-outcome`). `currency` is nullable, and null only for an asset whose sole activity is unvalued feed. FE MUST pick a currency and compare within it; summing across rows of different currencies is meaningless.
  - **Excludes `material` and `produce` assets** (`Asset.kind.not_in(INVENTORY_KINDS)`) — deliberately, and this is what makes it the right source for per-asset profitability UI. A material only ever carries cost (its expense is booked at purchase and consumed elsewhere), so it can only look like a permanent loss; a produce pool only ever carries income (the whole sale lands on it), so it outranks the animals that made the produce and double-counts money already reported as their `allocated_produce_income`. R1 `profitability` has **no kind filter**, so FE MUST NOT build "most/least profitable asset" lists from R1.
  - `has_unvalued_consumption: true` means consumed feed had no purchase cost basis, so cost is understated and `net_incl_materials` is **over**stated. FE MUST surface this.
  - `date_from`/`date_to` bound income and direct expense; feed is valued over the **full** purchase history (not bounded), same as R3.
  - PDF export: `GET .../reports/profitability-full/pdf`.
- **aggregate** (`GET .../reports/aggregate`): generic per-type time buckets.
  - `group_by=asset` is ONLY valid for `production`, `mortality`, `acquisition`. Passing it for `observation`, `inventory`, `expense`, `income`, or `reproductive` returns 422.
  - For `inventory` type, pass `adjustment=reset|increment|decrement` to isolate one flow direction; omitting it returns the net flow.
  - `AggregateRow` shape: `{ bucket, group, group_label, measure, value, asset_id, unit }`. `unit` is present for production/observation rows.
  - **`bucket` is a plain calendar date** (`"2026-04-10"`), not a date-time — buckets are cut on the **farm's** calendar (`date_trunc` over `occurred_at AT TIME ZONE farm.timezone`). FE MUST render it as a bare date string and MUST NOT `new Date(bucket)` then format in browser-local time: that parses as UTC midnight and shows the previous day for any viewer west of UTC. A `bucket` round-trips directly as a `date_from` bound (see Farm calendar).
- **material-consumption-aggregate** (`GET .../reports/material-consumption-aggregate`): dedicated endpoint for material consumption totals. Supports `group_by=material|consumer|both`. Do NOT use the generic `aggregate` endpoint for consumption reporting.
- **cost-per-unit** (`GET .../reports/cost-per-unit`): direct expenses + average-cost-valued feed consumption ÷ production quantity, per producer asset. Requires `unit` (what counts as one produced unit) — the report is scoped to **one** production unit per call. Feed is attributed via `material_consumption` with `reason=feeding` and `consumer_asset_id` = the producer. Feed cost is not bounded by `date_from` (full purchase history used for average cost); `date_from`/`date_to` bound production and direct expenses.
  - **Response shape (authoritative):** `CostPerUnitReport = { data, unit }`. There is **NO `totals` array** — FE MUST aggregate per-currency summaries from `data` itself.
  - **Row:** `{ asset_id, asset_name, currency, production_quantity, direct_expense_total, consumed_material_cost, total_cost, cost_per_unit, has_unvalued_consumption }`, where `total_cost = direct_expense_total + consumed_material_cost`.
  - `cost_per_unit` is **nullable**: a producer that made nothing in the window still appears with `cost_per_unit: null`. FE MUST render this as "—", never as 0.
  - `has_unvalued_consumption: true` flags rows whose feed has no purchase history to value it — FE MUST surface this warning, as the row's cost is understated.
- **inventory-summary** (`GET .../reports/inventory-summary`): on-hand balance per (asset, unit) for material assets and aggregated animal flocks. `date_to` gives the balance as of that moment (defaults to now). `date_from` DOES NOT apply to a running balance and is always ignored by the backend.
- **inventory balance** (`GET .../assets/{id}/events/balance`): current on-hand balance per (asset, unit) computed from `inventory` events since the most recent reset. Only meaningful for `kind=material` assets.
- **individual timeline** (`GET .../reports/individuals/{id}/timeline`): paginated `EventRead` list for a single individual. Returns the full event history for that individual in `Page` envelope.
- **sales-value** (`GET .../reports/sales-value`): realized weighted-average sale price per (asset, unit), derived from sale-action events only (manual income excluded). `value_per_unit = sale income ÷ quantity sold`. When an asset was sold in more than one unit in the window, income can't be split → `ambiguous: true` with null `unit`/`quantity_sold`/`value_per_unit`. Assets with no sales in the window do not appear. Pairs with `cost-per-unit` (the cost floor) to derive margin client-side.
- **produce-outcome** (`GET .../reports/produce-outcome`): per (producer asset, produce pool) — what a producer harvested into a pool and what became of its share. Row: `{ producer_asset_id, producer_name, produce_asset_id, produce_name, unit, produced, sold, lost, currency, income_total, has_other_currency }`; envelope `{ data, unattributed_quantity, unattributed_income }`. `produced` = what the producer harvested; `sold`/`lost` = its **derived** share of what later left the pool; `income_total` = the money that share earned. The split is **derived, never stored** (pooled produce is fungible): each outflow consumes the pool's daily `produce_lot` baskets **oldest-first (FIFO)**, split within each basket in proportion to what each producer put in it, priced at that outflow's own unit price, reconciled with **largest-remainder** rounding so per-producer amounts sum exactly to the sale. Keyed per (producer, currency) — currencies are never summed; multi-currency output gives a null `currency` with `has_other_currency: true`. `lost` is stock drawn at zero revenue (`material_consumption` `waste`/`spoilage`). `unattributed_quantity`/`unattributed_income` capture pool outflow with **no lot behind it** (stock that entered by a manual `inventory` increment, or carried across a reset) — this is the only "unassigned" case (over-selling is rejected, not booked here). `produced` is bounded by harvest time, `sold`/`lost`/`income_total` by when stock left, and FIFO crosses window edges — so within a narrow window these are **not** expected to reconcile. This report is the FE's productivity-vs-profitability view (producers can be unprofitable per-pool without blocking either metric).
- **production-productivity** (`GET .../reports/production-productivity`): produced vs expected output per (asset, product), where a product is a production `event_category`. One row per (asset, product) that either produced in the window or has an applicable production target. `produced` is converted into the product's unit; `expected` comes from the asset's applicable production target, scaled by the target's `basis` (`per_head_continuous` uses time-weighted animal-days; `per_event`; `total`). `productivity_pct = produced ÷ expected × 100`. `date_from` and `date_to` are **required**, and **both ends are widened to whole farm-local calendar days** — this report is day-grained, so asking about "today" at 18:45 expects a whole day's target, not the elapsed fraction. The same widened window bounds the `produced` numerator, so numerator and denominator always cover the same days. A pair with no applicable target reports `missing_capacity: true` with null `expected`/`productivity_pct` (mirrors `has_unvalued_consumption`) — never divide-by-zero. Row: `{ asset_id, asset_name, category_id, product_name, unit, produced, expected, productivity_pct, basis, missing_capacity }`. Supersedes the removed egg-only `coop-productivity` report; see the Production targets section. Headcount for `per_head_continuous` remains event-derived, not stored.
- **upcoming-births** (`GET .../reports/upcoming-births`): one row per individual whose *latest* pregnancy check is pregnant with `expected_due_at` inside `[date_from, date_to]`. A later not-pregnant check suppresses the alert. `date_from` and `date_to` are **required**; `days_until_due` counts whole days from `date_from`. Depends on pregnancy checks (action #12) existing.
  - A check with a null `expected_due_at` is **invisible to this report**, permanently. Coverage therefore depends on `asset.gestation_days` being configured (or the date being supplied).
  - **`days_until_due` is NOT a countdown from today.** The report filters `expected_due_at >= date_from`, so the value is always `>= 0` regardless of the window — an overdue animal does not report a negative number. FE MUST NOT use `days_until_due` to detect overdue.
  - **Overdue is an FE-derived read, not a BE capability.** To surface it, request a window whose `date_from` is in the past (otherwise overdue rows are excluded by the filter) and compare each row's `expected_due_at` against today locally. Note that a past `date_from` also inflates `days_until_due` for every row by that offset, so derive all day counts from `expected_due_at` instead.
- **PDF exports**: `GET .../reports/profitability/pdf` and `GET .../reports/cost-per-unit/pdf` return the respective report as a downloadable PDF.

### How `expected` is computed (`per_head_continuous`)

`expected = rate × animal-days`, and **animal-days are counted in whole farm-local days**: an animal present for any part of a day counts for that day. This matches the numerator, which counts a whole day's production. The two headcount sources are mutually exclusive by construction — an asset holds one or the other, never both.

- **Aggregated flock** (`mode=aggregated`, or `mode=null`): derived from `inventory` events with `unit=head`. An **increment opens** its farm-local day; a **decrement closes** its. A flock bought at 09:00 and sold at 15:00 counts that whole day. A `reset` deliberately **keeps its exact instant** — its direction (rise or fall) isn't knowable from the row, so an absolute correction stays where it was recorded. This is the one remaining sub-day case.
- **Individually-tracked herd** (`mode=individual`): derived from `individual` rows, not inventory events. Arrival is the animal's `acquisition` event (any path — purchased, born, other), departure is its `mortality` or `sale` event; an animal with neither is still present. Both ends resolve to whole farm-local days. **Every arrival is floored, not just the first** — onboarding 30 cows this afternoon expects 30 animal-days, not 1.2.
- FE consequence: a `per_head_continuous` target on an **individual-mode** asset now returns a real `expected`. Before, it summed nothing — `expected = 0.00`, `productivity_pct = null` forever, with no `missing_capacity` flag to explain it. Any FE copy implying "individual assets can't have productivity" is now wrong.
- All of this is **report-side and retroactive**: no stored `occurred_at` moves, no migration, no reseed. Existing data recomputes correctly on the next query.

## Farm calendar and timezone (applies to every date window)

**Every calendar day the API draws is the farm's day, not UTC's and not the browser's.** `farm.timezone` is the single anchor.

- **`farm.timezone`** (IANA name, e.g. `America/Montevideo`): `FarmRead` always returns it (default `UTC`); `FarmUpdate` accepts and validates it. `POST .../auth/register` accepts an optional `timezone: string | null` so the farm created at signup starts on the right calendar; it stays changeable later via `PATCH /farms/{id}`.
- FE MUST expose a farm timezone setting, and SHOULD offer the browser's IANA zone as the default at signup. A farm left on the `UTC` default reports a day that ends at 21:00 local at UTC−3 — evening work silently falls into the next day.

### How `date_from` / `date_to` are interpreted (all 25 filtered/query routes)

- A **naive** bound (no `Z`, no offset — e.g. `2026-07-26` or `2026-07-26T00:00:00`) is read as **farm-local wall clock**. This is what FE MUST send.
- A bound carrying an **explicit offset** (`...Z`, `...-03:00`) names an exact instant and is preserved as sent — the farm calendar does NOT re-anchor it.
- **FE rule:** build date-window params from local calendar dates (`YYYY-MM-DD`) and **never** from `Date.prototype.toISOString()`. A browser-derived UTC instant is an aware bound, so the backend honours it literally and the window no longer matches the farm's day — the exact class of off-by-one the BE fix removed.
- A naive `date_to` at midnight is **rolled forward to the next farm-local midnight and compared exclusively**, so the whole day is covered regardless of event time-of-day. A `date_to` with an explicit time keeps its exact inclusive `<=` meaning.
- Report **buckets** are cut with `date_trunc` over `occurred_at AT TIME ZONE farm.timezone`, and a bucket is returned as a bare date (see `aggregate`). A returned bucket can be fed straight back as a `date_from` bound.

### Derived calendar dates

- **`birth_date`** on offspring created by the birth action (#4) defaults to the **farm-local** date of `occurred_at`. A lamb born at 23:30 local is dated today, not tomorrow.
- **Produce FIFO baskets** (`produce_lot`) group by the farm's **local calendar day**, so a harvest at 23:30 local lands in that day's basket. Getting the timezone wrong silently reshuffles which producers contributed to which basket, changing `produce-outcome` and `allocated_produce_income`.
- **PDF export** generated-at stamps render on the farm's calendar.
- **`production_target.effective_from` / `effective_to`** are bare dates resolved at farm-local midnight (see Production targets).

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
- Sending `date_from`/`date_to` as `toISOString()` UTC instants instead of farm-local naive dates.
- Parsing a report `bucket` (a bare date) as a timestamp and formatting it in browser-local time.
- Offering a "create produce asset" flow, or asking the farmer to pick a pool and a category for the same product.

---

## Deliberate design: produce baskets are day-grained, not instant-ordered

**This is intentional. Do not "fix" it, and do not raise it as a defect.** Investigated in depth 2026-07-27 and accepted.

`produce_lot` baskets group by farm-local calendar day, and an outflow is split across everything in its day's basket — **including lots recorded after that outflow**. So a producer can earn from a sale registered before its own harvest was entered, a producer holding unsold stock can show income, and per-producer figures move as the day fills in.

That is the correct trade, because **`occurred_at` records when the farmer entered the fact, not when the hen laid.** A farmer collects from every coop and logs the day's work in bursts. If attribution respected instant-ordering strictly, the order they happened to type things in would become an economic fact — and the animal whose harvest was logged after the sale would be denied income for eggs that were physically in the basket the whole time. Day-granularity is forgiving of data-entry lag; instant-ordering would encode it.

The invariant is enforced where it can be trusted — on **quantity**, not on timestamps. A sale that exceeds recorded stock is rejected `409 insufficient_stock`, so the farmer cannot register a sale without first registering the harvests it consumes.

Consequences FE must present honestly, not paper over:

- Within the current day, per-producer produce income is **provisional** — the day's record isn't complete until the day is.
- A producer's income can change without any event touching that producer.
- Where a pool holds a mix of contributions, the split is a **convention** (proportional to contribution), not a measurement. Pooled produce is fungible; there is no per-unit truth to recover.

## Open backend defects (FE is patched, not fixed)

### `date_to` is not rolled for the produce-allocation half of two reports

**Confirmed against backend `develop@1e19bce` and reproduced on live data.** `profitability_full` bounds its two halves inconsistently:

- direct income/expense → `apply_date_range`, which rolls a midnight `date_to` to the next **farm-local** midnight, so the whole day counts;
- allocated produce income → `income_by_producer_currency` compares `occurred_at > date_to` **raw**, with no roll. `produce_outcome` has the same raw comparison on its `sold` / `income_total` side.

So on a single request an animal's own income covers all of today while the money its products earned is cut off at 00:00 — a same-day sale shows stock leaving the pool and no revenue reaching the producer. Almost certainly `b792bb7` fallout: the whole-day rolling moved into `apply_date_range` and this comparison did not follow.

Reproduction (one harvest of 247, sale of 147 for 2458.00 UYU, both today):

```
date_to = today 00:00 local   → {}
date_to = next local midnight → {(1, 'UYU'): Decimal('2458.00')}
```

**Fix:** apply the same whole-day rolling as `apply_date_range` in `produce_income.py` and `produce_outcome.py`.

**FE status — TEMPORARY PATCH IN PLACE (2026-07-27), remove when BE lands.** `src/features/reports/utils/produce-allocation-window.ts` passes tomorrow as `date_to` for the two affected panels, restoring the missing day for a demo. It is a patch, not a fix: it widens **both** halves of the window by a day, makes "últimos 30 días" 31, would admit future-dated events, and does nothing for a `date_to` the farmer picks by hand. `production-productivity` must NOT use it — it resolves its own whole-day window and is already correct.

## Contract change log

### 2026-08-07

Source: backend `develop@53f46e0` (`d5bd91b`, branch `feat/gestation-derived-due-date`). Answers the Stage 5 follow-up request (`docs/be-request-pregnancy-stage5-followup.md`). `backend-docs/api/assets.yaml`, `backend-docs/api/pregnancies.yaml`, and `backend-docs/domain-model.md` all refreshed.

**Contract changes:**

- **`asset.gestation_days` added** (nullable integer, 20–400, **animals only**). Present on `AssetCreate`, `AssetUpdate`, `AssetRead`. Sending it for a non-animal `kind` is a `422` ("Only animal assets carry a gestation length"). The bounds are sanity limits, not biology — wide enough for any farmed species, narrow enough to catch weeks/months typed into a days field.
- **`expected_due_at` is now derived on create.** A positive check that omits it gets `(service_date or occurred_at) + asset.gestation_days`. A supplied value is always kept as given; an asset with no `gestation_days` derives nothing rather than erroring. **PATCH never re-derives** — a stored due date never moves, not when `service_date` is edited and not when the asset's gestation length changes later. FE can drop the hand-typed due-date requirement and make the field optional.
- **`pregnancy.service_date` and `pregnancy.sire_individual_id` added** (both optional, both editable, both mirrored onto the paired `reproductive` event's payload). The sire MUST be a different individual in the same farm. The list endpoint now filters by `sire_individual_id`.
- **Pregnancy stays a stream of checks — confirmed by design, not an omission.** No pregnancy entity, no status, no link from a check to the birth that resolved it. Consequence: **estimated-vs-actual offspring and loss rate are NOT derivable**, and FE must not synthesize them. BE will revisit if a concrete need appears. Check method and the `reproductive` event `payload` stay closed for the same reason.

**Correction to a previously assumed FE behavior:**

- **`days_until_due` can never be negative.** The report filters `expected_due_at >= date_from`, so the value is always `>= 0` whatever window is passed — it does not count down from today, it counts from `date_from`. An earlier FE reading assumed a past `date_from` would surface overdue animals as negative values; it does not. **Overdue is FE-derived:** request a window starting in the past (or overdue rows are filtered out entirely) and compare `expected_due_at` to today locally. Derive all day counts from `expected_due_at`, never from `days_until_due`, since a past `date_from` inflates it for every row.

### 2026-07-27 (c)

Source: backend `develop@1e19bce`, `a36261b`, `c462ecd` (#51, #52, #53). **Report-side only — retroactive, no migration, no reseed.** No `backend-docs` yaml or prose changed for these; contract confirmed from `report/headcount.py` and `report/productivity_math.py`.

**Contract changes:**

- **`production-productivity` animal-days are now day-grained.** An increment opens its farm-local day, a decrement closes its. Fixes the reported `expected = 109` for a 500-head flock registered at 18:45, and the mirror-image case where a flock sold mid-window contributed only its pre-departure hours while that morning's production counted whole.
- **Individual-mode assets now report headcount at all.** Headcount previously read only `inventory unit=head` events, which only flock actions write — so a `per_head_continuous` target on an `individual`-mode asset returned `expected = 0.00` and `productivity_pct = null` permanently, with nothing flagging it. It now derives from `individual` rows (acquisition → mortality/sale), with both ends on whole farm-local days and **every** arrival floored.
- `reset` inventory rows keep their exact instant (deliberate: direction is unknowable from the row). Documented limitation, not a bug.

### 2026-07-27 (b)

Source: backend `develop@96f8256` — "feat(event-category)!: a product owns the produce pool holding its stock (#50)".

**Contract changes:**

- **BREAKING — `HarvestCreate` no longer accepts `produce_asset_id`.** Pass `category_id` alone; the pool is resolved from `event_category.produce_asset_id`. Sending the old field is `422` (extra input forbidden). A harvest can no longer deposit into one product's pool while attributing the production event to another.
- **BREAKING — `POST /assets` and `PATCH .../assets/{id}` reject `kind=produce`** (`422`). Produce pools are provisioned by their production category. FE must remove the "create produce asset" flow.
- **`EventCategoryRead` gains `produce_asset_id: integer | null`** — the pool backing the product, API-provisioned, unique FK with `ondelete=RESTRICT`. Nullable in the DB because non-production categories have no pool; "required for production" is enforced at the API layer (same as `unit`).
- **Creating a production category provisions and links its pool in one transaction.** Deleting the category retires the pool, and is **refused** once the pool has recorded stock rather than cascading inventory events away.
- Harvest `unit` must share a **measurement family** with the product category's unit, in addition to matching the pool's existing stock unit.
- Harvest error surface changed: cross-farm/unknown `category_id` → `404` "Category not found in this farm"; non-production category, missing pool, or self-harvest → `422`.
- Migration pairs existing categories to pools from harvest history → same-name unclaimed pool → fresh provisioning, and **aborts rather than guessing** on ambiguous data.

**Backend gap (do NOT work around in FE):**

- Renaming a production category does not rename its provisioned pool, so the pool name (surfaced as `produce_outcome.produce_name`, inventory rows, sale screens) silently diverges from the product name.

### 2026-07-27 (a)

Source: backend `develop@b792bb7` — "fix!: draw calendar days on the farm timezone, not UTC (#49)".

**Contract changes:**

- **BREAKING — `AggregateRow.bucket` is now a date (`"2026-04-10"`), not a date-time.** Buckets are cut on the farm's calendar. FE that parses it as a timestamp and formats it in browser-local time will render a day off. Round-trips as a `date_from` bound.
- **`date_from`/`date_to` semantics changed on all 25 filtered/query routes.** A naive bound is now read as **farm-local wall clock** (previously UTC); a bound with an explicit offset keeps the exact instant it names. The whole-day rolling of a midnight `date_to` now lands on a **local** day boundary. FE MUST stop sending `toISOString()` UTC instants for date windows.
- **`production-productivity` widens both window ends to whole farm-local calendar days** (previously only `date_to` rolled). Fixes an in-progress day expecting only the elapsed fraction of the target. The `produced` numerator uses the same widened window.
- **`production_target.effective_from`/`effective_to` resolve at farm-local midnight** (previously UTC midnight), correcting the animal-days denominator.
- **`birth_date`** defaults to the farm-local calendar date of `occurred_at` (previously the UTC date).
- **`POST .../auth/register` accepts optional `timezone: string | null`** (IANA) so a new farm starts on the correct calendar instead of the `UTC` default.
- PDF export generated-at stamps now render on the farm's calendar.

**Clarifications:**

- `farm.timezone` is no longer only a produce-FIFO concern — it is the single anchor for every calendar day the API draws. The former "Farm configuration" section is now "Farm calendar and timezone (applies to every date window)".

### 2026-07-24

**Contract changes:**

- **New `produce` asset kind.** The asset `kind` enum now reads `animal | crop | equipment | material | produce | location` across `AssetCreate`, `AssetRead`, `AssetUpdate`, and `AssetKindCount` (per-kind summary counts). This gives produce pools their own kind rather than overloading `material`.

**Semantics confirmed from backend source at commit `e659525`** (the yaml prose is still stale — see the `produce` asset kind section for the full contract):

- `INVENTORY_KINDS = {MATERIAL, PRODUCE}` is the load-bearing rule. "Stock-bearing" guards use the set; "consumable input you buy" guards still require `MATERIAL` exactly.
- **Sale:** `produce` IS sellable via `POST .../assets/{id}/sales`. The pool-sale → per-producer allocation path works on `kind=produce`.
- **Inventory:** full support; `balance` and `inventory-summary` have no kind filter at all.
- **Harvest target:** MUST be `kind=produce` — a `material` target is `422`. **Hard break** for any pool still typed `material`.
- **Loss/self-use:** `material_consumption` rejects `produce`; produce losses are a plain `inventory` decrement, which the engine counts as a zero-revenue draw into `lost`.
- **Migration:** automatic backfill of `material → produce` for pools with a `produce_lot` or an incoming `produce_asset_id`. Stragglers (harvested before 2026-07-22 and never linked) can't be fixed via API — `kind` freezes once an asset has events — and need direct SQL. Pools left as `material` still report correctly; only new harvests into them fail.
- **`AssetCreate` forbids `produce_asset_id`** (`extra="forbid"`) → `422` "Extra inputs are not permitted", failing the whole create. Must be create-then-`PATCH`.

**FE follow-through applied in this pass:** added `produce` to the asset-kind union/labels; removed `produce_asset_id` from both asset **create** payloads (crop + lot) in favour of create-then-`PATCH`; switched pool pickers to `kind=produce` (harvest, lot, crop) while **leaving feed pickers on `material`**; made produce assets open in the asset detail (so the sale dialog is reachable) and browsable under a "Productos" kind; added produce creation.

**Still stale on the backend side:** `backend-docs/api/*.yaml` descriptions were not regenerated for `produce`. Ask BE to update every affected endpoint description to name each accepted kind, so a future sync doesn't re-derive this from source.

### 2026-07-23

Produce revenue attribution shipped — pooled produce sales now flow back to the producing animals (derived, at read time). This is the backend's response to the FE capability request `docs/be-request-produce-revenue-attribution.md`; the BE **deliberately chose to derive rather than materialize** per-producer income (no void/re-book engine), so most FE-requested write machinery did **not** ship.

**Contract changes:**

- **Harvest routing decoupled (§A).** `HarvestCreate` now **requires `produce_asset_id` in the request body**; the destination pool is client-supplied per harvest, no longer derived from `asset.produce_asset_id` (demoted to an optional UI default). A producer can feed multiple pools; a cross-farm `produce_asset_id` is rejected `404`. Each harvest persists a `produce_lot` (producer ↔ pool ↔ paired events) — the FIFO basket that makes per-producer attribution possible.
- **`profitability-full` gains `allocated_produce_income` (§B)** on both `data` rows and `totals`. It is the producer's derived FIFO share of income from produce later sold from a pool; the pool's own `material_sale` income is excluded from the producer's row (it lives on the pool's own row). **Net inclusion (confirmed):** `net_incl_materials` already includes `allocated_produce_income`; `net` (R1) does not. Use `net_incl_materials` as-is for the all-in figure. Watch the double-count trap: the same money is `income_total` on the pool asset's own row, so never sum `income_total` across rows and also add the allocation.
- **`produce-outcome` report shipped (§E)** (`GET .../reports/produce-outcome`): per (producer, pool) `produced`/`sold`/`lost`/`income_total`, derived FIFO over `produce_lot` baskets with largest-remainder rounding, per (producer, currency); envelope adds `unattributed_quantity`/`unattributed_income` for pool outflow with no lot behind it. FE's productivity-vs-profitability view.
- **`farm.timezone` shipped** (IANA, default `UTC`, validated on write) on `FarmRead`/`FarmUpdate`. Ledger-relevant: FIFO baskets group by the farm's local calendar day.
- **`material_sale` pairs `income_event_id` to its inventory decrement** so each sale's quantity ties to its own price (income events can't carry quantity) — the basis for `sales-value` and `produce-outcome` derivation. `MaterialSaleRead` shape unchanged.
- **Over-draw status code confirmed `409`** (not `422`). Selling/consuming more than a pool holds returns `409` (below-zero / `insufficient_stock`), consistent across `material_sale`, `material_consumption`, and `flock` actions; `422` is generic payload validation only, and the PR summary's "422" for over-draw was loose wording. Note: the yaml `responses` maps omit `409` (a codegen artifact — runtime-raised `HTTPException`s aren't listed), so FE MUST handle `409` for stock guards even though it's undeclared. FE: `409` → "correct your production/registration"; `422` → form validation error.

**Clarifications** (no new behavior; contract detail now recorded):

- **Selling a produce pool uses the existing `material_sale` action — there is no dedicated produce-sale action.** A pooled product is a MATERIAL asset; its sale books ONE `income` event on the pool, and the per-producer split is derived at read time, never booked on the animals. **Over-selling a pool is rejected** by the existing non-negative guard (`409` — confirmed, not `422`), not booked as an "unassigned" remainder — FE must prompt a production correction.
- **Produce loss/self-use uses the existing `material_consumption` `reason=waste`/`spoilage`** on the pool (zero revenue); the engine attributes it per-producer as `lost`.
- **Corrections are free by construction:** because the split is derived, editing a harvest simply recomputes the reports on next query — no re-booking. The append-only void/re-book engine the FE proposed was intentionally **not** built (the ledger already permits event edit/delete).

**Deferred / NOT shipped (FE keep blocked-state or omit):**

- Dedicated loss/self-use action and a `SELF_USE` reason (waste/spoilage already cover zero-revenue draws).
- The correction/replay engine (unnecessary under derivation) — harvest emitted events remain create-only.
- **Unit conversion** — a pool is locked to its first harvest's unit; harvests must match it. Selling/harvesting in a convertible-but-different unit (dozen/tray vs egg) is not supported yet.
- **§D (traceable produce) dropped** — a fully-traceable product is just the allocation with a single-contributor lot; no separate path.

### 2026-07-14

**Contract changes:**

- **`profitability-full` report shipped** (`GET .../reports/profitability-full`, + `/pdf`): the all-in bottom line per asset — `net_incl_materials = income − (direct expense + consumed feed)`. Feed is valued on the **same basis as `cost-per-unit` (R3)**, so the two reports can never disagree, and direct expense is never double-counted. **Closes the gap** logged earlier this day (FE previously had no way to net feed cost against income, and was explicitly forbidden from stitching R1+R3 client-side).
  - Envelope `{ data, totals }` — it **does** carry `totals`, unlike `cost-per-unit`, which does not. Do not confuse the two shapes.
  - ~~**Single-currency by design:** one row per asset in the farm's **default currency**; income/expense in another currency is **excluded** and flagged `has_other_currency`.~~ **This was never true — corrected 2026-07-29 against the schema.** The report is per (asset, currency), currencies are never mixed, and no `has_other_currency` field exists on it. See the Reports contract section.
  - R1 `profitability` is **unchanged**, and `net` (income − direct expense) is retained on the new row for backward compatibility.
- **`production-productivity` daily-goal fix** (behavior only, **contract shape identical**): the current day now counts as a **full** day when scaling a `per_head_continuous` target, instead of accruing hour-by-hour. A target of "1 egg/hen" with 1,000 hens now reads as 1,000 eggs for today, rather than a figure that crept upward through the day. **No FE change required** — `ProductionProductivityRow` is byte-identical; existing consumers simply start receiving correct `expected` values.

**Clarifications** (no backend behavior changed; contract detail that was always true in `backend-docs/api/*.yaml` but missing from this file):

- **`cost-per-unit` response shape pinned down.** `CostPerUnitReport` is `{ data, unit }` — it has **no `totals` array**, and rows carry `production_quantity` / `direct_expense_total` / `consumed_material_cost` / `total_cost` / nullable `cost_per_unit` / `has_unvalued_consumption`. The FE type had drifted to a stale shape (`quantity`, `expense_total`, plus a phantom `totals[]`), which silently hid feed cost from the UI. Recorded here so the drift cannot recur.
- **Material consumption emits `inventory`− ONLY — never an `expense`.** Feeding is money-neutral in the ledger; cost enters at purchase and is attributed to the consumer only as a derived report figure. FE must not expect a feeding to move any asset's profitability `net`. Also documented: `reason` enum, `consumer_asset_id` required for `feeding` / forbidden for `waste`|`spoilage`, `409 insufficient_stock`, unit-match rule, immutable `material_asset_id`, reconcile-on-edit / reverse-on-delete, idempotency.
- **Material purchase is the sole cost-basis entry point.** It emits `inventory`+ **and** `expense`, and establishes the average cost that values feed consumption. Stock added via a bare manual `inventory` event has no cost basis → `has_unvalued_consumption`. Documented reconcile/reverse and `409` guards.
- **Material sale constraints documented**: unit-match, `409` on negative stock, create-only, `MaterialSaleRead = { inventory_event_id, income_event_id, on_hand }`.
- **`profitability.net` scope limit made explicit**: R1's `net` counts only expense/income events on the asset, so consumed feed is structurally excluded. FE must not synthesize an all-in net client-side — use `profitability-full` instead.
- **Source precedence noted**: `backend-docs/events-and-actions.md` lags the yaml specs (still says "the 11 actions", omits the pregnancy-check action). The `api/*.yaml` specs are authoritative.

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
