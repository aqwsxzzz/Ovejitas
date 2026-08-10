Title: Backend capability request — derivable expected due date, and pregnancy as a first-class breeding record (Stage 5 follow-up)

Context:
- Repository: Ovejitas
- Date: 2026-08-07
- Requesting side: Frontend
- Backend revision inspected: `master@1f57c1a`
- Why this is backend-owned: the due date is a projection derived from ledger-backed
  reproductive data and feeds a server-owned read-model (`/reports/upcoming-births`).
  Computing it in the browser would put a second, drifting definition of "due" next to
  the one the report already uses, and would silently disagree with any server-side
  alerting later. Item 2 additionally changes what the `pregnancy` sidecar owns and
  which events it pairs with — squarely ledger-invariant territory.

This is a follow-up to **Stage 5** of `docs/backend-review-2026-06-capability-request.md`
(2026-06-16). That stage was accepted and delivered: you chose Option B (a dedicated
pregnancy resource) and shipped the `pregnancy` table, the `POST /farms/{farm_id}/pregnancies`
action with its paired `reproductive` event, and the `/reports/upcoming-births` read-model.
Thank you — the FE consumes all of it today.

We are back for one unmet criterion from that same stage, plus one design question that
we do **not** want to answer unilaterally.

---

## Item 1 — Expected due date is stored, not derivable (Stage 5, criterion 2)

**Current behavior**
- What FE needs to do: record a pregnancy check and have the expected birth date follow
  from it, so that every positive check reliably produces a due date.
- What BE currently provides: `Pregnancy` carries `occurred_at`, `is_pregnant`,
  `offspring_count`, `expected_due_at`, `notes`. `expected_due_at` is a nullable,
  caller-supplied datetime.
- Gap: there is no gestation parameter anywhere in the schema, so nothing can derive
  `expected_due_at`. The FE has to ask the farmer to type the date by hand on every check
  (`pregnancy-check-form.tsx`).
- Why this matters beyond ergonomics: `/reports/upcoming-births` filters on
  `is_pregnant AND expected_due_at BETWEEN date_from AND date_to`. A check saved without a
  due date is invisible to the report **forever**. Coverage of the entire upcoming-births
  feature is therefore gated on farmer diligence, not on data. This is why we read
  Stage 5 criterion 2 — *"Expected birth date is derivable, and an alert window is
  queryable"* — as half-met: the window is queryable, the date is not derivable. Your
  Option A phrasing at the time listed `gestation_days / expected_due_at` together.
- Why FE workaround is invalid: hardcoding gestation lengths per species in the client
  would (a) put domain knowledge in the browser, (b) require the species taxonomy we have
  deliberately decided not to build, and (c) produce a due date the server's own report
  would not agree was authoritative.

**Requested backend change**
- New or updated field: a farm-scoped, per-asset gestation length — our suggestion is
  `asset.gestation_days` (nullable positive integer), settable via the existing
  `POST /farms/{farm_id}/assets` and `PATCH /farms/{farm_id}/assets/{asset_id}`.
- Ownership model: plain asset attribute; no new events.
- Derivation: on `POST /farms/{farm_id}/pregnancies`, when `is_pregnant` is true and
  `expected_due_at` is omitted, derive it from the individual's asset `gestation_days`.
  An explicitly supplied `expected_due_at` always wins — the farmer overrides the model.
- Important: we need a **base date** to derive from. See Item 2 — with only `occurred_at`
  (the date of the *check*) the derivation is `occurred_at + gestation_days`, which is
  wrong for any check performed after conception. If Item 2 is declined, we would still
  take this, but the honest contract is "due ≈ check date + gestation", and we would label
  it as an estimate in the UI.
- Request payload contract: `gestation_days: int | None`, `> 0`; we would expect a sane
  upper bound (`domain-notes.md` already records a 20–400 day sanity rule for gestation).
- Response contract: `gestation_days` echoed on asset reads; `expected_due_at` populated
  on the pregnancy response whether supplied or derived.
- Authorization and farm scoping: unchanged from existing asset/pregnancy rules.

**Why a per-asset parameter and not a species table:** we have explicitly decided against
introducing a species/breed taxonomy (recorded in `docs/product/vision.md` §3.1). Genericity
wins even where it costs the user some input. A per-asset value is entered once per flock
rather than once per check, keeps all domain knowledge in the farmer's hands, and requires
no taxonomy. If you would rather hang it elsewhere (on `individual`, or on a reproduction
config resource), we have no strong preference — the requirement is only that the FE stops
asking for a hand-typed date.

**Acceptance criteria**
1. A gestation length can be stored per asset (or wherever you land) and read back.
2. A positive pregnancy check with no `expected_due_at` returns a populated, derived
   `expected_due_at`; an explicitly supplied value is preserved unchanged.
3. Such a check appears in `/reports/upcoming-births` for the appropriate window with no
   further client input.
4. An asset with no gestation length configured behaves exactly as today (no derivation,
   no error) — this must be backward compatible with existing rows.

---

## Item 2 — Design discussion: is a pregnancy a record, or a stream of checks?

We are raising this as a **question, not a spec**. Stage 5's design debate worked well last
time and we would rather have your read before we build anything against the current shape.

**The observation**

`pregnancy` is today one row **per check**, not one row per gestation. Current state is
reconstructed by the read-model with latest-record-wins (documented clearly in
`report/upcoming_births.py`). That is philosophically consistent with the event-sourced core
and we are not calling it wrong.

But it means three things a farm cares about have nowhere to live:

1. **The sire.** There is no way to record *who bred her*. `individual.mother_id`/`father_id`
   are set on the offspring at birth; the pregnancy itself has no sire reference. Ram/bull
   performance, inbreeding avoidance, and "which sire throws twins" are all unanswerable.
2. **The service/breeding date.** Only `occurred_at` (the check date) exists. This is the
   direct blocker for Item 1 doing the right thing — without a conception date, a derived
   due date can only count from the check.
3. **The outcome.** `offspring_count` is an *estimate*. The birth action separately emits
   `reproductive` + N×`acquisition`. Nothing links a pregnancy to the birth that resolved
   it, so estimated-vs-actual, and therefore loss rate, are not derivable.

There is also no structured channel for anything else: `PregnancyCreate` is a `StrictModel`,
so unknown fields are rejected, and the paired `reproductive` event's `payload` JSONB is not
exposed through the action. Everything that is not one of the five fields has to be prose in
`notes`.

**The question**

Does a pregnancy become a first-class breeding record — service date → checks → outcome,
owning its paired events the way `material_purchase` and `produce_lot` already do — or does
it stay a stream of checks with everything derived?

Sketch of Option A (entity), for discussion only:
- A breeding/gestation record with `service_date`, optional `sire_individual_id`, and a
  status resolved by its outcome.
- Checks reference the record rather than standing alone.
- The birth action closes the record, making estimated-vs-actual reportable.
- `gestation_days` then derives from `service_date`, which is the correct base date.

Sketch of Option B (stay a stream):
- Add `sire_individual_id` and `service_date` as optional fields on the existing check.
- Accept that grouping checks into one gestation stays a read-model concern.
- Cheaper, no migration of existing rows, but outcome reconciliation stays out of reach.

**What we are asking for**
- Your preference between these (or a third shape we have not seen).
- Whether a check method (`ultrasound` / `palpation` / `observation`) is worth structuring
  or should stay in `notes`.
- Whether the `reproductive` event `payload` should be exposed through the pregnancy action
  for farm-specific detail, or deliberately kept closed.

**We are explicitly not asking for:** reproduction on `aggregated` animal assets. Pregnancy
is inherently a per-animal statement and we accept it as individual-mode only.

**Frontend commitment:** we are **not** building pregnancy UI against the current shape
until you have answered this. We would rather wait than ship something we have to unwind.

---

## Event-ledger requirements

- Item 1 emits no new events. It adds a derived value to an existing action's response.
- Item 2, if it becomes an entity, should follow the established sidecar pattern: the
  record owns FKs to its paired events, written in one transaction with rollback on
  failure, with `payload.source` identifying the emitting action — matching
  `material_purchase` and `produce_lot`.
- Edit/delete rules: unchanged for Item 1. For Item 2, we would expect the existing
  pregnancy PATCH/DELETE reconciliation behavior to extend to the new shape.

## Read/query requirements

- `/reports/upcoming-births` keeps its current contract. We rely on `date_from` being
  unconstrained — passing a past `date_from` returns negative `days_until_due`, which is
  how we intend to surface **overdue** pregnancies. Please confirm this is intended
  behavior we can depend on rather than an accident of the implementation.
- If Item 2 lands, we would want to filter pregnancies by `sire_individual_id` and by
  outcome status.

## Test requirements

- Integration tests covering: derivation when `expected_due_at` is omitted; explicit value
  preserved; asset with no `gestation_days` unchanged; derived rows appearing in
  `/reports/upcoming-births`; validation failure on non-positive or out-of-range gestation.
- Edge cases: non-pregnant check must still reject both `offspring_count` and
  `expected_due_at` (existing `assert_pregnancy_projection` rule must keep holding when the
  value is derived rather than supplied); individual whose asset changed gestation length
  after the check was recorded (we expect the stored due date to be stable, not
  retroactively recomputed — please confirm).

## Definition of done

- Endpoint/action merged and documented in backend docs + OpenAPI.
- `docs/domain-model.md` updated to describe where gestation lives and how the due date is
  derived.
- FE can remove the hand-typed due-date field and consume the derived value with no local
  workaround.
- A written answer on Item 2 — even "stay a stream of checks, here's why" unblocks us.

## Priority

Item 1 is the blocker: it gates coverage of the upcoming-births feature and, downstream,
overdue-birth alerts. Item 2 is a design answer we need before committing FE work, but it
does not need to ship first.

Unrelated and deliberately **not** bundled here: the asset containment gap
(`asset.location` free-text vs `AssetKind.LOCATION`). We will raise that separately so it
does not slow this down.
