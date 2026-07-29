Title: Backend capability request for produce revenue attribution (per-producer income from pooled products)

## Context
- Repository: Ovejitas
- Date: 2026-07-22
- Requesting side: Frontend
- Why this is backend-owned: This touches ledger invariants (income must be booked once, atomically, only at sale time), inventory FIFO consumption across lots, and multi-event allocation with append-only corrections. Synthesizing per-producer income on the frontend would double-book revenue, produce non-deterministic allocations, and violate the event-ledger source-ownership rules. FE cannot and must not own it.

---

## The problem in one paragraph
We already reflect an animal asset's **costs** (consumed feed valued via cost-per-unit, plus direct expenses) and its **production output** (quantity, via `production`/harvest events + the productivity report). We do **not** reflect the **income earned by selling that animal's product**. Today produce-sale income lands on a separate produce asset and is never attributed back to the producing animal, so an animal's `profitability-full` net shows all its costs and none of its product revenue — it looks perpetually unprofitable. We want to close this loop, honestly, and generically (not egg-specific).

---

## Design rationale & decisions (carried over from the FE design debate — please read before implementing)

We converged on a specific model after working through the real-world constraints. The reasoning matters, so here it is:

1. **Two distinct systems, by traceability.**
   - **System 1 — fully traceable produce** (a tagged individual animal whose product is individually attributable). Income from the sale is booked directly to that individual/asset. Simple, no allocation logic. Still **only at sale time** — never at production.
   - **System 2 — pooled / non-individually-traceable produce** (the common case: eggs from aggregated coops). Requires a **contribution allocation** system, described below.
   Both systems must **only** create income when money is actually received (at sale). We explicitly reject any "expected/likely" revenue at production time — no imputed values anywhere.

2. **Fungibility means per-producer income is an allocation, never a recorded fact.** Once eggs from coop 1/2/3 land in the same basket they are indistinguishable. Any "coop 1 earned X" figure is therefore a *derived allocation*, not an observed event. This rules out asking the farmer which coop's eggs sold.

3. **The basket = a produce asset; the daily lots = harvest events.** We do **not** want a new "basket" table. The existing harvest action already deposits a producer's output (quantity + category) into a produce asset's inventory. So "yesterday's basket with 50/30/20 contributions" is simply *the set of harvest events into that produce asset on that day*. Harvests **are** the FIFO lots. The only genuinely new machinery is the sale-time allocation engine.

4. **Store per-producer quantities, not percentages.** Percentages force double rounding and lose precision when shares don't divide cleanly (e.g. 333/333/334). Store raw contributed counts per lot; derive percentages for display only.

5. **Allocation = proportional within a lot, FIFO across lots. This is the core invariant.** Every draw from a lot is split **proportionally to each producer's share of that lot** — never sequentially (never "fill coop 1's 500 first"), never round-robin. The whole calculation reduces to one line:

   > `unit_price = sale_income / quantity_sold`, then each producer earns `unit_price × (that producer's units consumed by this sale, taken FIFO across lots)`.

   Worked example (validated): Lot = coop1 500 / coop2 300 / coop3 200 (1000 total).
   - Day 1 sells 700 @ 1 UYU (700 UYU): proportional draw 350/210/140 → income 350/210/140. Lot remaining 150/90/60 (still 50/30/20).
   - Day 2 sells 300 @ 2 UYU (600 UYU): proportional draw 150/90/60 → income 300/180/120.
   - Totals: coop1 650, coop2 390, coop3 260. (Identical to a naive percentage split — because proportional-within-lot IS the percentage split, just computed from exact counts.)

6. **FIFO across lots, oldest first.** When a sale spans multiple days' lots, consume the oldest lot fully before drawing from the next. Each lot is priced at the *same* sale unit price; only the per-producer split differs per lot (because each lot has its own contribution mix).

7. **Losses / personal use = the same FIFO draw at zero revenue.** Eggs registered as produced but then lost, wasted, or self-consumed draw down the pool exactly like a sale, but book **no income**. They must still be attributed per-producer (proportionally) so each producer's "produced but never earned" quantity is visible. **Productivity ≠ profitability, and we never block one to serve the other** — the farmer wants both numbers.

8. **Materialize per-producer income at sale time (do NOT leave it as a read-only report).** A sale emits **real** per-producer `income` events wired to each contributing animal asset. This unifies System 1 and System 2 at the ledger level (both book real per-animal income at the moment of sale) and makes the animal's `profitability-full` work with zero new report plumbing. The produce asset's pooled sale is the parent transaction; the per-producer income events are its allocation children — booked once, no double counting.

9. **Rounding = largest-remainder method (not round-half-up).** Independent per-producer rounding creates phantom or missing currency units. Largest-remainder guarantees the per-producer incomes sum **exactly** to the sale total: floor each share, then distribute leftover minor units one at a time to the largest fractional remainders. This must hold per sale, per lot.

10. **Over-draw (sold > registered) is allowed with a warning, not blocked.** It should only happen on a production-registration mistake, and blocking a real sale because our count is stale is bad UX. Book the unmatched quantity to a **"sin asignar" (unassigned)** remainder with no producer attribution, and flag it so the FE can warn the farmer to correct their production entries.

11. **Corrections = recompute-forward, append-only.** Editing a lot, a second same-day registration into the same lot, or a deletion all trigger a deterministic **replay of that product's outflows from the changed point forward**. Because the ledger is append-only, "editing a booked income" means **reverse (void) the affected income events and re-book corrected ones** — never mutate in place. Voided entries must be excluded from reports/UI. Runtime cost is negligible at farm scale (a handful of coops, a few lots/sales per day); the cost is implementation correctness, not performance. A short time window (e.g. edits allowed within a couple of days) is the UX guardrail bounding how far back a correction can cascade; the technically important gate is "free before a lot is consumed, adjustment/replay after." NOTE: there are **no real users yet — only test data** — so a schema/structure reset or migration is acceptable if it yields a cleaner model.

12. **Multi-product routing fix (important, see gap below).** The current single `produce_asset_id` field on a producer only allows one basket per producer. Harvest must instead name its destination **per event** so one producer can feed multiple product baskets (eggs → eggs basket, feathers → feathers basket), and different producers (chicken vs quail) route to different baskets.

---

## Current behavior
- **What FE needs to do:** Let the farmer record produce sales/losses from a pooled produce asset and have the resulting income (or zero-revenue loss) attributed back to the producing animal assets by their contribution, so each animal's `profitability-full` reflects the money its products earned — only at sale time.
- **What BE currently provides:**
  - Harvest action (`POST .../assets/{producer}/harvests`) emits `production` + `inventory+` on a produce asset. Payload: `{ occurred_at?, quantity, unit, category_id?, notes? }`. The destination produce asset is **derived** from the producer's single `asset.produce_asset_id`.
  - Material sale action (`POST .../assets/{id}/sales`) emits `inventory-` + a single `income` event on that asset, in the farm default currency.
  - `profitability-full` report: per-asset `net_incl_materials = income − (direct expense + consumed feed)`, single-currency, `has_other_currency` flag.
  - `sales-value` report: realized weighted-average sale price per (asset, unit) from sale-action events only.
- **Gap:**
  1. No mechanism attributes a produce sale's income back to the **producing** animals; income stays on the produce asset only.
  2. No **FIFO contribution engine** that consumes daily harvest lots oldest-first and splits sale/loss quantities proportionally within each lot across contributing producers.
  3. No **per-producer income materialization** at sale time (System 1 direct + System 2 allocated).
  4. No **loss / self-use** outflow on the produce pool that draws inventory at zero revenue with per-producer attribution.
  5. **Single `produce_asset_id`** prevents one producer from feeding multiple product baskets; harvest can't name its destination per event.
  6. No read model exposing per-producer **produced / sold / lost / self-used** breakdown for the productivity-vs-profitability UI.
- **Why FE workaround is invalid:** Allocating and booking income client-side would double-book revenue (pool sale + synthesized per-producer income), produce non-deterministic/unauditable numbers, and break the append-only ledger and its source-ownership rules. FIFO state, atomic multi-event emission, and reverse/re-book corrections are inherently backend-owned.

---

## Requested backend change

### A. Harvest destination decoupling (multi-product routing)
- **Updated action:** `POST /api/v1/farms/{farmId}/assets/{producerAssetId}/harvests`
- **Payload change:** add `produce_asset_id` (required) alongside the existing `category_id`. The harvest deposits into the **named** produce asset, not the producer's single field.
- `asset.produce_asset_id` is demoted to an optional UI **default** ("this producer usually harvests into X"), no longer the routing source of truth. Keep it nullable; do not rely on it for allocation.
- Validation: `produce_asset_id` must be a produce/material asset in the same farm; `category_id` required (the product recorded on the emitted `production` event); unit convertible to the produce asset's base unit.

### B. Produce-pool sale with per-producer income allocation (System 2 + System 1)
- **New or updated action:** `POST /api/v1/farms/{farmId}/assets/{produceAssetId}/sales` (extend the existing material-sale, or a new produce-sale action — BE's call).
- **Ownership model:** action-emitted events, single transaction.
- **Behavior:**
  1. Convert sale quantity to the produce asset's base unit.
  2. Consume harvest **lots FIFO** (oldest `occurred_at`/lot-day first) up to the sold quantity.
  3. For each consumed lot, split the consumed quantity **proportionally** to each producer's contributed count in that lot.
  4. `unit_price = sale_amount / total_sold_quantity`; each producer's income = `unit_price × their consumed quantity`, reconciled per sale with **largest-remainder** rounding.
  5. Emit one `income` event per contributing producer asset, plus the `inventory-` on the produce asset. If sold > available, book the remainder as an **unassigned** income with a flag.
- **Request payload:** `{ occurred_at, quantity, unit, amount, currency_id?, notes?, idempotency_key }`.
- **Response:** `{ inventory_event_id, allocations: [{ producer_asset_id, quantity, income_event_id, amount }], unassigned: { quantity, amount } | null, produce_balance }` plus a `has_overdraw: boolean` flag. Statuses: 201 success; 422 validation (unit mismatch, non-produce asset); 409 if BE opts to reject specific invalid states.

### C. Produce loss / self-use outflow (zero revenue)
- **New action:** `POST /api/v1/farms/{farmId}/assets/{produceAssetId}/losses` (or a `reason`-typed outflow, mirroring the material-consumption `reason` enum pattern: `waste` / `spoilage` / `self_use`).
- Same FIFO + proportional draw as a sale, but books **no income** — only `inventory-` and a per-producer attributed **loss record** (for the produced-but-unearned stat).
- **Request:** `{ occurred_at, quantity, unit, reason, notes?, idempotency_key }`.
- **Response:** `{ inventory_event_id, allocations: [{ producer_asset_id, quantity }], produce_balance }`.

### D. System 1 (traceable) direct income
- For individually-traceable produce, the sale books income **directly** to the single owning asset/individual (no allocation). Confirm whether this is just System 2 with a single-contributor lot, or a distinct path — BE's modeling call, but the FE contract should be uniform where possible.

### E. Per-producer produce outcome read model
- **New report/query:** per-producer, per-product breakdown of **produced / sold / lost / self-used** quantities and realized income, date-bounded.
- Feeds the productivity-vs-profitability UI (never block one for the other).

### Authorization and farm scoping
- All actions farm-scoped; `produce_asset_id` and `producerAssetId` must belong to `{farmId}`; standard auth.

---

## Event-ledger requirements
- **Which action emits which events:**
  - Harvest → `production` (on producer, carries `category_id`) + `inventory+` (on named produce asset).
  - Produce sale → `inventory-` (produce asset) + N × `income` (one per contributing producer) + optional 1 × unassigned `income`.
  - Produce loss/self-use → `inventory-` (produce asset) + N × per-producer loss attribution (zero-revenue).
- **Atomicity:** each action is a single transaction; all emitted events commit together or roll back entirely. FIFO consumption + allocation + event emission must not partially apply.
- **Edit/delete rules:** **recompute-forward, append-only.** A change to a lot (edit / same-day re-registration / delete) replays that product's outflows from the changed point; affected `income`/loss events are **reversed (voided) and re-booked**, never mutated in place. Voided events excluded from all reports. Free before a lot is consumed; adjustment/replay after; bounded by a configurable recent-window guardrail.
- **Reserved fields:** every emitted event carries `payload.source` (e.g. `produce_sale`, `produce_loss`, `harvest`, `produce_sale_reversal`). Allocation children should correlate to their parent pool transaction (e.g. shared correlation id + `occurred_at`).
- **No imputed value:** income exists only at sale; production/harvest never books revenue.

---

## Read/query requirements
- **Per-producer outcome report:** filters `producer_asset_id`, `produce_asset_id`, `category_id`, `date_from`, `date_to`; measures produced / sold / lost / self-used quantity + realized income; single-currency per row with `has_other_currency` flag (consistent with `profitability-full`).
- **Lot/basket inspection (for UI):** current on-hand per produce asset and its outstanding lots with per-producer remaining counts (so FE can show the accumulating basket and contribution mix).
- Pagination: `page`, `page_size`, `total`, `has_next`.
- Performance: index harvest lots by `(produce_asset_id, occurred_at)` for FIFO; volumes are small (farm scale).

---

## Acceptance criteria
1. A produce sale on a pooled asset emits per-producer `income` events whose amounts sum **exactly** to the sale amount (largest-remainder), split proportionally within each consumed lot, FIFO across lots.
2. The multi-day worked example above reproduces exactly: coop1 650 / coop2 390 / coop3 260 across the two differently-priced sales.
3. Income is created **only** at sale — harvest/production create none.
4. A loss/self-use outflow draws the pool at zero revenue and records per-producer attributed quantities.
5. One producer can harvest into **multiple** produce baskets (eggs, feathers) via per-harvest `produce_asset_id`; chicken vs quail eggs route to distinct baskets.
6. Sold > available books an **unassigned** remainder and returns `has_overdraw: true`; no crash, no negative pool.
7. Editing/deleting a lot (or a second same-day registration) **reverses and re-books** all affected downstream allocations; reversed events are excluded from `profitability-full` and the outcome report.
8. Each contributing animal's `profitability-full` now reflects its allocated produce income alongside its existing feed/direct-expense costs.

---

## Test requirements
- Integration tests: successful multi-lot FIFO sale allocation; single-lot single-contributor (System 1) direct income; loss/self-use zero-revenue draw; over-draw unassigned remainder; largest-remainder reconciliation (indivisible splits, ties); transactional rollback on mid-emission failure.
- Correction tests: edit a not-yet-consumed lot (no ripple); edit a consumed lot (reverse + re-book forward); delete a lot; second same-day registration reworks the lot; verify reports exclude voided events and net totals stay exact.
- Multi-product routing: one producer → two baskets; cross-farm/invalid `produce_asset_id` rejected.
- Unit conversion: gathered in eggs, sold in dozen/tray; quantities reconcile.

---

## Definition of done
- Harvest destination decoupling, produce-sale allocation, produce loss/self-use, and the per-producer outcome read model merged and documented in backend docs + `docs/backend-event-ledger-rules.md`.
- OpenAPI updated (`backend-docs/api/*.yaml`).
- FE can drop the blocked/disabled state and consume the new actions/reports with no client-side allocation, no synthesized income, and no local FIFO logic.

---

## Open question for the BE human
Does the "**harvests are the lots**" simplification (no separate basket table; daily harvest events into a produce asset serve as FIFO lots carrying per-producer counts) hold against anything already sketched on the backend? If a dedicated lot/basket entity is preferred, the FE contract above is unaffected as long as the sale/loss responses still return the per-producer allocations.
