# Copilot Global Instructions

These instructions apply to all Copilot chats and agents in this workspace.

## 1. useEffect Rule (Highest Priority)
- Treat `useEffect` as an escape hatch only for synchronizing with external systems.
- Do not use `useEffect` when logic can run during render, inside event handlers, or through dedicated React hooks.
- Never use raw `useEffect` for server data fetching; use TanStack Query feature hooks.
- Do not use `useEffect` for derived state, prop-sync state resets, event-specific logic, parent notifications, or chained state transitions.
- Always include complete dependencies and cleanup for subscriptions/listeners/timers.
- For async effect synchronization, prevent stale updates with an ignore/abort pattern.
- Prefer `useSyncExternalStore` for external store subscriptions.

Decision gate before writing `useEffect`:
1. Can this be calculated during render?
2. Is this an expensive derivation that belongs in `useMemo`?
3. Should state reset by changing component `key`?
4. Is this user interaction logic that belongs in an event handler?
5. Is this external store subscription logic better handled by `useSyncExternalStore`?
6. Is this server data and therefore a TanStack Query concern?
7. Is this truly synchronization with an external system?

Only use `useEffect` when item 7 is true.

## 2. Follow Repository Standards
- Follow the architecture and coding standards under `docs/architecture/frontend-coding-standards/`.
- Prefer existing feature patterns and abstractions over introducing new patterns.
- Do not add dependencies unless explicitly requested and justified.

## 3. Preserve Boundaries
- Keep separation between UI components, state management, and API/data layers.
- Avoid breaking route/API behavior unless explicitly requested.
- Make minimal, focused changes tied to the request.

## 4. Validation
- Validate meaningful code changes with project checks when possible.
- Report assumptions, risks, and follow-up recommendations when relevant.

## 5. Frontend Testing Policy
- Do not create, modify, or propose frontend unit/integration/e2e tests unless the user explicitly requests tests.
- Do not add testing frameworks, test dependencies, or test-related scripts by default.
- Prefer lightweight validation via typecheck/build/lint and manual verification notes when needed.
