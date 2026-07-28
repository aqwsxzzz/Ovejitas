# Backend capability request — produce-allocation window and product rename

Context:

- Repository: Ovejitas
- Date: 2026-07-27
- Requesting side: Frontend
- Backend revision inspected: `develop@1e19bce`
- Why this is backend-owned: both concern derivation and persistence of ledger-backed figures.
  Reproducing either in the browser would duplicate backend logic and drift from it.

Two items. Neither blocks the FE outright; item 1 is currently masked by a temporary patch we
want to delete.

---

## Item 1 — `date_to` is not rolled for the produce-allocation half of two reports

### Current behavior

`profitability_full` bounds its two halves inconsistently:

- direct income/expense goes through `apply_date_range`, which rolls a midnight `date_to`
  forward to the next farm-local midnight so the whole day is covered;
- `income_by_producer_currency` compares `occurred_at > date_to` raw, with no roll.
  `produce_outcome` applies the same raw comparison to its `sold` / `income_total` side.

So within a single request, an animal's own income covers all of today while the money its
products earned is cut off at 00:00. A same-day sale shows stock leaving the pool and no revenue
reaching the producer. Very likely `b792bb7` fallout — the whole-day rolling moved into
`apply_date_range` and these comparisons did not follow.

### Reproduction

Same farm, one harvest of 247 and a sale of 147 for 2458.00 UYU, both today:

```
date_to = today 00:00 local    -> {}
date_to = next local midnight  -> {(1, 'UYU'): Decimal('2458.00')}
```

### Requested change

Apply the same whole-day rolling as `apply_date_range` in `produce_income.py` and
`produce_outcome.py`, so every half of a report answers the same window.

### Acceptance criteria

1. With `date_to` set to today (bare date), a sale made today at any hour is included.
2. `profitability_full`'s direct and allocated halves cover an identical window for any bounds.
3. A `date_to` carrying an explicit time keeps its exact inclusive meaning, as elsewhere.

### FE status

**Temporarily patched, and we want to remove it.**
`src/features/reports/utils/produce-allocation-window.ts` passes tomorrow as `date_to` for the
two affected panels so a demo does not under-report money the ledger has already attributed.
It widens both halves of the window by a day and does nothing for a hand-picked `date_to`. It is
documented as temporary and will be deleted when this ships.

---

## Item 2 — Renaming a production category does not rename its produce pool

### Current behavior

`EventCategoryService.create` provisions the pool named after the category.
`EventCategoryService.update` sets attributes on the category row only, so the pool keeps its
original name indefinitely.

Rename the product "Huevos" to "Huevos de gallina" and the meta, the harvest form and the
productivity report say "Huevos de gallina", while `produce_outcome.produce_name`, the inventory
screens and the sale screens still say "Huevos". One real-world product, two names on screen, no
error anywhere.

### Why FE will not paper over this

Substituting the category name wherever the API returns the pool name would hide a genuine
divergence in stored data, and the stale name would resurface in any consumer we do not control —
a PDF export, a future report.

### Requested change

Propagate the rename to the linked produce asset within the same transaction, so a product has
one name everywhere.

### Acceptance criteria

1. `PATCH /event-categories/{id}` with a new `name` updates the linked produce asset's name
   atomically.
2. Categories with no pool (non-production) are unaffected.
3. Rolling back the category update rolls back the pool rename.

---

## Optional cleanup (not blocking)

`asset.produce_asset_id` stores a **pool** id, but since the product-owns-pool change every
picker speaks in **products** (categories). The FE resolves a saved default by walking the
category list to find the one owning that pool. It works and costs no extra request, but the
field now points at the wrong half of the pair; a `default_category_id` would be the honest
shape. Raise only if you are touching that area anyway.

---

## Definition of done

- Both items merged, with integration tests as described.
- Backend docs and OpenAPI updated where contracts change (item 2 has no contract change).
- FE deletes `produce-allocation-window.ts` and its two call sites.
- FE removes the "open backend defects" entry from `docs/backend-event-ledger-rules.md`.
