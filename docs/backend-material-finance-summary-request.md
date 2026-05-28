Title: Backend capability request for finance summary read model

Context:
- Repository: Ovejitas
- Date: 2026-05-22
- Requesting side: Frontend
- Why this is backend-owned: finance summaries and recent transactions are ledger-derived projections and should be computed server-side to preserve consistency, avoid FE-side replay drift, and remove N+1 event fetching.

Current behavior:
- What FE needs to do: show a farm finance overview with recent movements, expense breakdowns, and asset-level net values that include material purchases and sales.
- What BE currently provides: profitability report, generic aggregate report, event listing by asset, material action endpoints, and inventory/cost reports.
- Gap: there is no single finance summary read model for recent transactions plus expense breakdowns across all ledger-backed assets.
- Why FE workaround is invalid: FE currently fetches assets, then fetches events per asset, then derives summaries client-side. This is expensive, can become stale, and pushes ledger projection logic into frontend.

Requested backend change:
- New or updated endpoint/action: GET /api/v1/farms/{farm_id}/reports/finance-summary
- Ownership model: read model derived from ledger events
- Request payload contract:
  - date_from?: ISO datetime
  - date_to?: ISO datetime
  - asset_id?: integer
  - asset_kind?: animal | crop | equipment | material | location
  - currency?: string
  - recent_limit?: integer default 10 max 50
- Response contract:
  - summary:
    - income_total: string
    - expense_total: string
    - net: string
    - currency: string
  - expense_breakdown: Array<
    - category_id: integer | null
    - category_name: string | null
    - total: string
    - currency: string
  >
  - recent_transactions: Array<
    - event_id: integer
    - asset_id: integer
    - asset_name: string
    - asset_kind: string
    - type: income | expense
    - occurred_at: string
    - amount: string
    - currency: string
    - category_id: integer | null
    - category_name: string | null
    - notes: string | null
    - payload: object
    - source: string | null
  >
  - asset_ranking: Array<
    - asset_id: integer
    - asset_name: string
    - asset_kind: string
    - income_total: string
    - expense_total: string
    - net: string
    - currency: string
  >
  - statuses:
    - 200 success
    - 422 validation failure
- Authorization and farm scoping: same farm membership rules as existing report endpoints; all rows must belong to the requested farm.

Event-ledger requirements:
- Read model must include action-emitted expense/income events from:
  - material purchase -> expense
  - material sale -> income
  - flock acquisition -> expense when amount exists
  - flock sale -> income
  - individual sold -> income
- Atomicity requirement: report reads from committed ledger state only; no separate mutable counters.
- Edit/delete rules: not applicable to read model endpoint.
- Reserved fields behavior: preserve `payload.source` and expose it as `source` in recent transaction rows for FE display and future action-owned safeguards.

Read/query requirements:
- Required filters: farm_id
- Search fields: none required for MVP
- Sort options:
  - recent transactions sorted by occurred_at desc, event_id desc
  - asset ranking sorted by net desc
  - expense breakdown sorted by total desc
- Pagination: not required for MVP if recent_limit is supported; future pagination can be added if needed.
- Performance constraints:
  - avoid FE-style per-asset event fanout
  - use report-layer aggregation/indexes suitable for farms with large ledgers

Acceptance criteria:
1. Finance summary includes material purchases as expenses and material sales as income without FE-side event replay.
2. Recent transactions return mixed asset kinds, including material assets, in one ordered list.
3. Expense breakdown groups by category and remains consistent with profitability totals for the same filters/currency.
4. Asset ranking includes material assets when they have ledger-backed income/expense activity.
5. Response remains farm-scoped and currency-safe; different currencies are never silently summed.

Test requirements:
- Integration tests covering:
  - material purchase reflected in summary and recent transactions
  - material sale reflected in summary and recent transactions
  - mixed asset kinds in one response
  - category grouping correctness
  - date filter correctness
  - asset_kind filter correctness

Definition of done:
- Endpoint merged and documented in backend docs
- OpenAPI updated
- FE can replace client-side finance replay with this endpoint and remove extra event fanout logic