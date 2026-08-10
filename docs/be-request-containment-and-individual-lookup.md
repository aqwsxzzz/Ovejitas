Title: Backend capability request — asset containment, and a farm-wide individual lookup

Context:
- Repository: Ovejitas
- Date: 2026-08-07
- Requesting side: Frontend
- Backend revision inspected: `develop@53f46e0`
- Why this is backend-owned: item 1 is a schema/relationship question — where an asset *is*
  cannot be a client-side convention without every consumer inventing its own. Item 2 is a
  query the backend does not expose; the only FE alternative is fanning out one request per
  animal asset and merging in the browser, which is exactly the over-fetching our own rules
  forbid.

Two unrelated items, bundled only because both are small. Neither is urgent — item 2 has a
working (if limited) FE fallback in place, and item 1 blocks nothing today. Please treat
this as lower priority than anything already in flight.

---

## Item 1 — Containment: `asset.location` is free text, and `AssetKind.LOCATION` also exists

**Current behavior**
- `asset.location` is a `String(255)` free-text field.
- `AssetKind.LOCATION` is a full asset kind, and the FE has a location detail page that
  creates location assets and logs events against them.
- Nothing connects the two. A location asset's name and an asset's `location` string are
  unrelated values that happen to be spelled similarly, or not.

**Gap**
There is no way to express *"this flock is in that paddock"* as a relationship. Concretely,
none of these are answerable today:
- Which animals are in a given paddock right now?
- What has happened at this location (across everything that has been in it)?
- Move a flock from one paddock to another, as a recorded fact rather than an edited string.

`backend-docs/domain-notes.md` already lists **"Location history & movement tracking — still
deferred"** under Phase 2, so we take it this is known and intended eventually. This request
is mostly asking whether the shape is settled, because the free-text field and the location
kind currently pull in opposite directions.

**Why FE workaround is invalid**
We could match `asset.location` against location-asset names by string. That would be a
silent, lossy join — it breaks on renames, on typos, on two locations with the same name in
different areas — and it would put a fake relationship in front of the farmer that the
backend does not consider true.

**Requested backend change (design question, not a spec)**
- Our expectation is a nullable `asset.location_asset_id` FK pointing at a `kind=location`
  asset, with the existing free-text `location` either kept as an informal label or
  migrated and dropped. But this is your call.
- The larger question: is containment **current state** (a column on the asset) or
  **history** (a movement event, with current location derived by replay)? The latter fits
  the ledger philosophy and answers "what was in this paddock in March", but it is
  materially more work. We do not need history for anything we are building right now.
- Should containment be recursive (farm → paddock → pen), or one level?

**Acceptance criteria**
1. An asset can be related to a location asset such that the link survives a rename.
2. Assets can be listed/filtered by their location.
3. If history is in scope: the location of an asset at a past date is derivable.

---

## Item 2 — No farm-wide individual lookup (blocks sire selection across lots)

**Current behavior**
- What FE needs: when recording a pregnancy check, let the farmer pick the sire from the
  animals on the farm.
- What BE provides: `GET /farms/{farm_id}/assets/{asset_id}/individuals` — individuals are
  listable only under one asset. There is no farm-scoped individual list.
- Gap: rams and bulls are commonly kept in their own lot, separate from the females. Those
  are exactly the individuals a farmer needs to select as sire, and they are the ones we
  cannot offer.

**What we shipped meanwhile (not a workaround, a reduced scope)**
`sire_individual_id` is wired and working, but the picker only offers individuals from the
**same asset** as the female — it reuses the list already loaded for the genealogy picker,
so it costs no extra request. Where the sire shares the lot this is correct and complete;
where he does not, the field simply cannot be filled. The field is optional, so nothing is
blocked, and we have not invented a fallback.

**Why FE workaround is invalid**
The obvious client-side fix is to fetch every animal asset, then fetch individuals for each,
then merge. That is N+1 requests to populate one dropdown, it grows with the farm, and it
duplicates a filter the database should be doing. Our own data-fetching rule forbids it, and
we would rather ask than special-case it.

**Requested backend change**
- New endpoint: `GET /farms/{farm_id}/individuals`, farm-scoped, paginated.
- Ownership model: read model. No events, no writes.
- Filters we would use: `status` (to offer only `active` animals), `asset_id` (optional, so
  it can also replace the per-asset list), and ideally something to narrow to plausible
  sires. On that last point — sex currently lives in the untyped `individual.extra` payload,
  so we cannot filter on it reliably. If you would rather promote `sex` to a real column,
  that would solve it properly; if not, we will list all active individuals and let the
  farmer choose.
- Search: by `tag` and `name`, so a farm with hundreds of animals can find one.
- Pagination: standard `page`, `page_size`, `total`, `has_next`.
- Response contract: same `IndividualRead` shape already returned by the per-asset list, so
  the FE types are unchanged.
- Authorization and farm scoping: identical to the existing individuals routes.

**Acceptance criteria**
1. All individuals in a farm are listable in one paginated request, regardless of asset.
2. Filterable by `status`, searchable by `tag`/`name`.
3. The existing per-asset endpoint keeps working unchanged.

---

## Test requirements

- Item 1: an asset linked to a location survives renaming that location; deleting a location
  behaves predictably (we would expect `SET NULL` rather than cascade, matching
  `produce_asset_id`); cross-farm links rejected.
- Item 2: farm scoping enforced (no individuals from another farm, ever); pagination stable;
  `status` filter correct; search matches tag and name.

## Definition of done

- Endpoint/action merged and documented in backend docs + OpenAPI.
- `docs/domain-model.md` updated if containment lands, since it changes the asset model.
- FE can offer sires from any lot and remove the asset-scoped limitation note in
  `pregnancy-check-form.tsx`.

## Priority

Low. Item 2 has a reduced-scope implementation already shipped and is only a limitation, not
a block. Item 1 is a design question we would like settled before health and measurement
features start attaching to places — but nothing is waiting on it this week.
