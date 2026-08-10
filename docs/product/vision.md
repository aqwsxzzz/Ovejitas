# Ovejitas — Product Vision & Current Position

**Status:** living document. First written 2026-08-07.
**Purpose:** state what Ovejitas is, record the modelling decisions we have taken (and
deliberately rejected), and track where the product actually stands against that idea.

This is the *product* reference. For the implemented backend model read
`Ovejitas-api/docs/domain-model.md` and `events-and-actions.md` — if they disagree with
this doc about what exists, they win. This doc owns *intent*; those own *mechanics*.

---

## 1. The idea

Ovejitas tracks **assets**. An asset is anything on a farm worth following over time —
an animal, a crop, a material, a piece of equipment, a place, a product.

Three commitments follow from that:

1. **The subject of tracking is generic.** We do not build an animal app with other things
   bolted on. The kernel knows about assets, not about sheep.
2. **The core is the event ledger.** An asset is a thing that accumulates immutable events.
   Everything else — stock levels, headcounts, reports, money — is *derived* by reading
   those events. Nothing is cached or stored as summary state.
3. **Finance is a lens, not the centre.** Profitability is one projection over the ledger,
   alongside production, health, and reproduction. It has had the most attention so far
   because of immediate need, not because it is the foundation.

**What we want to cover eventually:** general info, financial association, stock and
production, reproduction, health, seasonal and scheduled events, measurements, location
and movement — each as generically as the domain honestly allows.

**Design tension we accept:** generic beats convenient. Where genericity pushes work onto
the user (entering parameters we could have hardcoded), we take that trade. See §3.1.

---

## 2. Core model (settled)

The kernel is four tables. This part is built and we are not revisiting it.

| Primitive | What it is |
|---|---|
| `asset` | Any trackable thing. Has a `kind`; animals also have a `mode`. |
| `individual` | One tagged instance of an `individual`-mode animal asset. Optional. |
| `event` | One immutable fact against an asset. Eight system-defined types. |
| `event_category` | Per-farm label for events. For `production`, the category *is* the product. |

**Asset kinds** (closed enum): `animal, crop, equipment, material, produce, location`.

**Event types** (closed, system-defined — users add categories, never types):
`production, expense, income, observation, reproductive, acquisition, mortality, inventory`.

**Actions emit events.** A real-world act that touches money and stock is one server-side
action writing its event pair atomically, with an idempotency key. Clients never assemble
event pairs. Eleven actions exist today.

**Reports are live aggregates.** No summary tables, no materialized views, no rollup cron.
When a farm gets big enough to hurt, we add a materialized view *behind the same endpoint* —
not before.

---

## 3. Decisions taken

Recorded so they are not silently re-litigated. Each can be reopened, but deliberately.

### 3.1 No species table — reproductive parameters are user-supplied
**Decided 2026-08-07.**

We will not introduce a taxonomy (species/breed) to parameterize gestation length, maturity
age, litter size, or breeding seasonality. Those are user-entered values.

*Rationale:* a species table is domain knowledge hardcoded into the kernel, and it only ever
covers the species we thought of. Genericity wins even though it means more user input.

*Consequence, resolved 2026-08-07:* the parameter lives **per asset**. `asset.gestation_days`
(20–400, animals only) is entered once per flock, and a positive pregnancy check that omits
`expected_due_at` gets one derived as `(service_date or occurred_at) + gestation_days`. No
taxonomy, no hardcoded biology, and the farmer can still override any individual due date.
This is the pattern to reuse for future reproductive parameters (maturity age, litter size).

*History:* species existed in v1 and did not survive the rebuild. Only legacy leftovers remain
on the frontend (`livestock-species-page.tsx`, the `compat.$farmId.$speciesId.$animalId` route).

### 3.2 Kind-by-kind behaviour, not a capability system
**Decided 2026-08-07.**

Per-kind rules stay expressed as explicit checks against `kind` (e.g. `reproductive` requires
`kind == 'animal'`; `INVENTORY_KINDS = {material, produce}`). We are not building a capability
registry where asset types declare which subsystems apply to them.

*Rationale:* six kinds, each getting deliberate treatment. The indirection would be ceremony
today.

*Hygiene that keeps the door open, at no cost:* express every per-kind rule as a **named set**
referenced from one place, never as bare literals scattered across guards. `asset/models.py`
already states this rule for `INVENTORY_KINDS` — "reference this set, never the bare values,
so a future stock-bearing kind slots in here exactly once." Apply the same discipline to
reproduction, health, and measurement as they are built. If the enum ever grows past what
hand-written branching can carry, migration is then mechanical.

### 3.3 Cardinality stays animal-scoped for now
**Deferred 2026-08-07.**

`mode` (`aggregated` / `individual`) remains meaningful only for animals. We are not promoting
it to a kernel-level `individual | batch | bulk` property.

*Rationale:* it is a live-schema migration with backfilled data, for benefit that is currently
speculative.

*Recognised but not acted on:* three cardinalities already exist in the codebase under three
names — `mode=individual`, `mode=aggregated` (= bulk), and `produce_lot` (= batch: a quantity
with origin, date, and FIFO ordering). They are simply not unified.

*Reopen when* either trigger fires:
- **Equipment needs individual tracking** — a tractor has a serial number, a maintenance
  history and a resale value; "12 shovels" is a count. Service records cannot attach to a quantity.
- **Perennial crops arrive** — a wheat field is bulk, but olive trees and vines are individuals
  with per-tree yield, disease and replacement.

*Note if reopened:* count-vs-measure (40 head vs 200 kg) is **not** a mode distinction — both are
bulk, and the difference is already carried by the unit's measurement family. Do not spend a mode on it.

---

## 4. Where we stand

Surveyed 2026-08-07 across both repos.

### Strong
- **Event-sourced kernel** — asset/individual/event/event_category, all derived state, no caching.
- **Action layer** — 11 atomic actions with idempotency keys and paired-event ownership.
- **Finance projections** — profitability, profitability-full (incl. average-cost feed),
  cost-per-unit, sales value, produce outcome. Multi-currency, never summed across currencies.
- **Livestock** — the one deeply built vertical (~11,900 lines FE), plus inventory and reports.
- **Produce attribution** — `produce_lot` makes per-producer revenue derivable via FIFO. This is
  the first real instance of a transformation relationship between assets.

### Thin — started, not finished
| Area | State |
|---|---|
| Reproduction / pregnancy | BE settled 2026-08-07: derived due date, `service_date`, `sire_individual_id`, sire filtering. Deliberately stays a **stream of checks**, not a pregnancy entity — so no outcome reconciliation (estimated-vs-actual, loss rate). FE UI is the open work |
| Crops | ~980 lines FE — create, log, timeline, basic snapshots |
| Equipment | ~660 lines FE — create dialog, event form, timeline. Generic shell only |
| Location | ~660 lines FE — same three files. Generic shell only |

These are thin because they are **unstarted, not unwanted**. Livestock is the only vertical
that has had real product attention.

### Absent
| Area | Note |
|---|---|
| Health | No concept. Currently unstructured `observation` payloads |
| Measurements | `observation` carries optional `quantity`/`unit`; no typed, queryable series |
| Scheduling / seasonality | Only `pregnancy.expected_due_at` and effective-dated `asset_production_target`. No general planned-vs-actual layer |
| Alerts | `v2.alerts.tsx` is a literal placeholder ("Fase D") |
| Containment / movement | See §5. Already tracked BE-side as deferred in `domain-notes.md` |
| Lifecycle for non-animals | Status transitions exist only for `individual` |
| Offline capture | No PWA, no service worker |

---

## 5. Open questions

1. ~~**Where do reproductive parameters live?**~~ **Settled 2026-08-07** — per asset, via
   `asset.gestation_days`. See §3.1.
2. **Containment is unmodelled and self-contradictory.** `asset.location` is a free-text
   `String(255)`, while `AssetKind.LOCATION` also exists — nothing connects them. "Animal in
   pen", "crop in field" cannot be expressed. Cheapest to resolve before health and
   measurement start attaching to places.
3. **Batch: asset-level or stock-level?** If §3.3 is ever reopened — is a produce pool an asset
   in batch mode, or a bulk asset whose stock is composed of lots? Either works; pick deliberately.
4. **Lifecycle for non-animal assets.** Every asset ends — sold, harvested, consumed, written
   off, retired. Today only individuals have status transitions.

---

## 6. Working principles

**Logging is a cost the user pays; we owe them a return.** Every data-entry surface should have
a matching payoff — an alert, an answer, or a document. If the ratio tips toward entry, the app
gets abandoned. Worth stating in the spec for each new feature: *what does the user get back?*

**Genericity is internal.** The kernel is generic; the user should never be asked to define an
asset schema. Kinds arrive pre-shaped with the right forms and vocabulary. Users think "my
sheep", not "my asset".

**Escalate, never work around.** Missing backend capability is escalated via
`.github/prompts/be-capability-request.prompt.md`. The frontend shows a blocked state; it does
not synthesize data or fetch oversized lists to compensate.

**Field conditions are a requirement, not polish.** Records get entered standing in a pen with
bad signal and dirty hands.
