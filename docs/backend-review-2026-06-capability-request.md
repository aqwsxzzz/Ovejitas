# Backend capability request — June 2026 product review

- **Repository:** Ovejitas
- **Date:** 2026-06-16
- **Requesting side:** Frontend
- **Why this is backend-owned:** every item below touches the event ledger,
  asset schema, or cross-asset aggregates. FE cannot synthesize these without
  breaking ledger invariants, duplicating server logic, or showing data that
  disagrees with the backend's source of truth.

This bundles all backend-blocked items from the review into one request,
separated by stage/section. Stages 1–5 are concrete asks; the Discussion
section lists items that need a design decision before any endpoint work.

---

## Stage 1 — Allow material assets to have no tracking mode

**Current behavior**
- FE needs: create `material` assets without an aggregated/individual
  distinction (materials are not counted head-by-head).
- BE currently provides: `AssetCreate` requires `mode` and only accepts
  `aggregated | individual` (`assets.yaml`). `AssetUpdate` already allows
  `mode: null`.
- Gap: create cannot express "no mode" for materials.
- Why FE workaround is invalid: FE currently hardcodes `mode: "aggregated"` on
  material creation, producing a misleading "Agrupado" semantic and polluting
  mode-based reporting. Faking it client-side keeps the asset record wrong.

**Requested backend change**
- Updated endpoint: `POST /api/v1/farms/{farm_id}/assets`
- Make `mode` optional/nullable (or accept a `none` value) when
  `kind = material` (and likely `equipment`/`location`). Reject `mode = null`
  for `kind = animal`.
- Response: `AssetRead` with `mode: null` for materials.

**Acceptance criteria**
1. Creating a material with no mode succeeds and persists `mode = null`.
2. Creating an animal with no mode is rejected (422).
3. Existing aggregated materials remain readable (migration/back-compat note).

---

## Stage 2 — Include inventory events in the default event listing

**Current behavior**
- FE needs: the material timeline "Todos" (no type filter) to show inventory
  movements (stock increment/decrement) alongside expense/income.
- BE currently provides: `GET .../assets/{asset_id}/events`. With a `type`
  filter, inventory events return; with no `type` (the "Todos" case), the FE
  observes inventory events missing while the expense event from the same
  purchase shows.
- Gap: unfiltered listing appears to exclude `type = inventory`.
- Why FE workaround is invalid: FE already sends no `type` param for "all";
  there is nothing correct to change client-side. Re-fetching per-type and
  merging would duplicate server pagination/ordering logic.

**Requested backend change**
- Confirm/fix: `GET .../events` with no `type` returns ALL event types,
  including `inventory`. If exclusion is intentional, document it and add an
  explicit opt-in (e.g. `include=inventory`).

**Acceptance criteria**
1. A material with a purchase (expense) + stock increment (inventory) returns
   both rows when listed with no type filter.
2. Pagination / `total` / `has_next` account for inventory events.

---

## Stage 3 — Asset counts per kind (Activos overview)

**Current behavior**
- FE needs: show how many assets exist per kind in the "Activos" view
  (e.g. Animales: 4, Materiales: 7, Equipos: 2).
- BE currently provides: paginated asset list per kind; no count summary.
- Gap: no endpoint returns counts grouped by kind.
- Why FE workaround is invalid: FE would have to fetch full lists per kind just
  to count them — disallowed (oversized fetch / client-side aggregation).

**Requested backend change**
- New endpoint: `GET /api/v1/farms/{farm_id}/assets/summary`
  (or add counts to an existing summary/report).
- Response: array of `{ kind, count }` scoped to the farm.

**Acceptance criteria**
1. Returns one entry per kind present in the farm with an accurate count.
2. Respects farm scoping/authorization.

---

## Stage 4 — Farm/user default currency preference

**Current behavior**
- FE needs: let the user choose a currency that is stored and applied to new
  monetary events and displayed consistently. Today everything is USD.
- BE currently provides: events carry a `currency` field; profitability is per
  (asset, currency). There is no farm/user-level default currency.
- Gap: no persisted "preferred currency" setting; no defaulting rule.
- Why FE workaround is invalid: a FE-only display toggle would misrepresent
  stored USD amounts as another currency without real conversion, and would not
  persist across devices/users.

**Requested backend change**
- New/updated: farm (or user) setting `default_currency`.
- New monetary events default to it when currency is omitted.
- Decision needed: single currency per farm, or multi-currency with explicit
  per-event currency + optional conversion?

**Acceptance criteria**
1. A farm currency can be set and read.
2. New income/expense events without explicit currency adopt the default.
3. Reports continue to never silently sum across currencies.

---

## Stage 5 — Structured pregnancy / ultrasound records + lambing alerts

**Current behavior**
- FE needs: record ultrasound results per individual animal — pregnant?, number
  of offspring, estimated gestation/time — and surface alerts for the estimated
  lambing/birth date (e.g. ±1 week) on the dashboard.
- BE currently provides: `EventReproductiveCreate` (type=reproductive, bound to
  `individual_id`) with a freeform `payload` object. No structured fields, no
  validation, no derived due-date alerts.
- Gap: no structured schema for pregnancy data and no alerting mechanism.
- Why FE workaround is invalid: stuffing unvalidated data into `payload` and
  computing/storing alerts client-side fragments the domain model and cannot
  drive server-side notifications.

**Requested backend change (design debate)**
- Option A: structured fields on reproductive events (`is_pregnant`,
  `offspring_count`, `gestation_days` / `expected_due_at`).
- Option B: a dedicated pregnancy/breeding record resource.
- Plus: a derived "upcoming births" alert/read-model (configurable window)
  consumable by the dashboard.
- Question: generic reproductive-event extension vs. a specific pregnancy
  feature? Should alerts live on the same resource or a separate
  notifications/alerts endpoint?

**Acceptance criteria**
1. Pregnancy data can be stored per individual with validation.
2. Expected birth date is derivable, and an alert window is queryable.
3. Editing/deleting follows existing action/event reconciliation rules.

---

## Discussion items (confirm before any endpoint work — likely FE-side)

- **Demand-based feeding** (feeders filled on demand, e.g. hens): we believe
  `material-consumption` with `reason=feeding` already lets the farmer record
  the actual quantity removed at refill time, which models this better than a
  fixed daily estimate. Confirm there is no need for a dedicated "feeder refill"
  concept, or tell us what a feeder entity would add.
- **Production per lot:** appears available via `reports/aggregate`
  (`type=production`, `group_by=asset`). Confirm this is the intended source so
  FE can surface it without a new endpoint.
- **Productivity per lot:** please define the metric. Is it production quantity
  per head over time (composable FE-side from production aggregate + headcount),
  or a server-owned ratio you'd rather expose directly?

---

## Definition of done (per stage)

- Endpoint/action merged and documented in backend docs + OpenAPI.
- FE can remove its blocked/placeholder state and consume the capability with no
  local workaround.
