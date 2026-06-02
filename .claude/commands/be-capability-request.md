Generate a ready-to-send backend capability request prompt.

User intent: $ARGUMENTS
(Describe the missing backend capability and the frontend feature that is blocked.)

## Your Task
Based on the user's intent and the current codebase context, produce a complete BE capability request using the template below. This is used when frontend is blocked by missing backend behavior that cannot and should not be solved in the frontend.

## Rules Before Generating
1. Identify the exact missing backend capability.
2. Confirm why this cannot be owned by the frontend (ledger invariants, data consistency, security, performance, etc.).
3. Do NOT suggest or implement any frontend workaround.
4. Keep frontend in a blocked/disabled state until backend delivers.

## Output Template

```
Title: Backend capability request for [feature or flow name]

Context:
- Repository: Ovejitas
- Date: [today's date]
- Requesting side: Frontend
- Why this is backend-owned: [short reason — invariants, consistency, security, or performance]

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
- Reserved fields behavior: payload.source ownership and restrictions

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
- Edge cases: [list]

Definition of done:
- Endpoint/action merged and documented in backend docs
- OpenAPI updated
- FE can remove blocked state and consume the new backend capability without local workaround
```

## After Generating
- Present the filled template to the user for review.
- Suggest a frontend blocked-state implementation (disabled button, placeholder message) until BE delivers.
- Do not implement any frontend logic that emulates the missing backend behavior.
