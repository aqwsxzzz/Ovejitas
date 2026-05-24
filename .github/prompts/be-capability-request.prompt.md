# Backend Capability Request Prompt

Use this prompt when frontend is blocked by missing backend behavior and the concern must be solved in backend.

## Prompt Template

Title: Backend capability request for [feature or flow name]

Context:
- Repository: Ovejitas
- Date: [YYYY-MM-DD]
- Requesting side: Frontend
- Why this is backend-owned: [short reason tied to invariants, consistency, security, or performance]

Current behavior:
- What FE needs to do: [user intent]
- What BE currently provides: [current endpoint/action coverage]
- Gap: [exact missing capability]
- Why FE workaround is invalid: [risk: ledger inconsistency, duplicated logic, stale data, broken invariants, etc.]

Requested backend change:
- New or updated endpoint/action: [method + path]
- Ownership model: [action-emitted events / manual event / read model]
- Request payload contract: [fields + validation expectations]
- Response contract: [shape, statuses, error cases]
- Authorization and farm scoping: [rules]

Event-ledger requirements (if applicable):
- Which action emits which events:
  - [action] -> [event types]
- Atomicity requirement: single transaction with rollback on failure
- Edit/delete rules: [reconcile/reverse behavior or create-only]
- Reserved fields behavior: `payload.source` ownership and restrictions

Read/query requirements (if applicable):
- Required filters: [list]
- Search fields: [list]
- Sort options: [list]
- Pagination: page, page_size, total, has_next
- Performance constraints: [indexes or expected scale]

Acceptance criteria:
1. [criterion]
2. [criterion]
3. [criterion]

Test requirements:
- Integration tests covering success, validation failure, and transactional rollback
- Any edge cases: [list]

Definition of done:
- Endpoint/action merged and documented in backend docs
- OpenAPI updated
- FE can remove blocked state and consume the new backend capability without local workaround

## Quick Fill Example

Title: Backend capability request for flock mortality action

Context:
- Repository: Ovejitas
- Date: 2026-05-21
- Requesting side: Frontend
- Why this is backend-owned: stock and mortality must remain ledger-consistent

Current behavior:
- What FE needs to do: register mortality for aggregated animal assets
- What BE currently provides: individual mortality action and generic event creation
- Gap: no flock mortality action that decrements stock and emits mortality together
- Why FE workaround is invalid: FE cannot safely emulate transactional ledger emission

Requested backend change:
- New endpoint/action: POST /api/v1/farms/{farm_id}/assets/{asset_id}/flock/mortalities
- Ownership model: action-emitted events
- Request payload contract: quantity, occurred_at, notes, optional category_id
- Response contract: action summary and emitted event identifiers
- Authorization and farm scoping: farm member only, same-farm validation

Event-ledger requirements:
- flock mortality -> inventory decrement + mortality
- Atomicity requirement: single transaction with rollback
- Edit/delete rules: create-only for this action unless reconcile/reverse is implemented
- Reserved fields behavior: payload.source set by backend action only

Acceptance criteria:
1. Calling endpoint emits both events atomically
2. Negative stock is rejected with domain validation error
3. Event rows contain payload.source = flock_mortality
