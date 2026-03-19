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

## 6. React Single Responsibility Rule
- Apply this rule whenever creating or editing any React component, hook, service, or utility file.
- Every file, function, component, and hook must do one thing. If it can only be described with "and", split it.

Hard limits:

| Metric | Max | Required action |
|--------|-----|-----------------|
| File length | 200 lines | Split into smaller modules |
| Function or hook body | 30 lines | Extract helpers or sub-hooks |
| Component JSX return | 50 lines | Extract child components |
| Function parameters | 3 | Use an options object |
| Component props | 5-6 | Compose smaller components or use `children` |
| Nesting depth | 3 levels | Use early returns or extracted helpers |
| Cyclomatic complexity | 5 branches | Simplify or split logic |

Component rules:
- One component should own one job.
- Extract a component when a JSX section has its own state, its own effects, repeated UI, or standalone conditional logic.
- Do not over-split natural units such as a compact form with its fields or a table with its columns when the markup is tightly coupled and small.

Hook rules:
- One hook should own one concern.
- Separate server data, mutations, and local UI state when they represent different responsibilities.
- Hook names must describe a single purpose. If the name needs "And", split the hook.

Function rules:
- Keep functions pure, small, and focused.
- Prefer single-purpose pipelines over multi-step orchestration inside one function.
- Prefer early returns over nested conditionals.

File organization rules:
- Keep one export focus per file.
- Colocate related code, but separate concerns by responsibility.
- Types shared across a feature belong in that feature's shared type module.
- A utility used once should stay inline; promote it only when reuse justifies it.

Service and state rules:
- One service should own one resource or domain.
- Do not mix unrelated resources in the same service module.
- Keep state minimal and derive values instead of storing redundant state.
- Use focused stores by domain instead of a single god store.

Complexity smell test:
- Refactor when a function requires scrolling to understand, when control flow needs explanatory comments, when a change breaks unrelated behavior, or when a file clearly mixes responsibilities.
- Treat more than 3 `useState` calls in one component as a signal to consider extracting a custom hook.
- Treat imports from more than 5 feature directories as a signal that the file knows too much.

Refactoring checklist:
1. Can this file or function be described in one short sentence without "and"?
2. Is the file under 200 lines?
3. Is every function under 30 lines?
4. Are there 3 or fewer levels of nesting?
5. Does each hook handle exactly one concern?
6. Is state minimal, with derived values computed instead of stored?
7. Could someone understand this file without scrolling?

If any answer is no, split, extract, or simplify before proceeding.

## 7. React Best Practices
- Apply this rule whenever writing or editing React components, hooks, local state, or component architecture.
- Follow React 19 best practices for composition, state modeling, performance, and TypeScript usage.
- Treat `useEffect` and TanStack Query rules in this file as higher priority than generalized React advice.
- Treat section 6 as the structural baseline. In this section, the 100-150 line component range is a refactor signal, while 200 lines remains the hard maximum.

Component design rules:
- Use function components only.
- Prefer composition through `children`, slots, or focused subcomponents over prop drilling through intermediaries.
- Split a component when it grows beyond roughly 100-150 lines, manages unrelated state, or contains sections with their own logical identity.

State management rules:
- Use `useState` for simple local values such as booleans, toggles, and individual form inputs.
- Use `useReducer` when multiple related values transition together or when state transitions are complex.
- Use context for global-ish values that change relatively infrequently, such as auth, theme, or locale.

Performance rules:
- Do not add manual memoization by default. In React 19, prefer letting the compiler optimize ordinary component work.
- Only use manual memoization when there is a demonstrated need, such as expensive computation or third-party interop that depends on referential equality.
- Never use array indexes as keys for dynamic lists; use stable identifiers.
- Prefer `startTransition` for non-urgent updates that would otherwise block more important UI interactions.
- Use component `key` intentionally when state should reset for a changed identity.

Error handling and React 19 feature rules:
- Prefer granular error boundaries around independently failing UI sections instead of relying only on a top-level boundary.
- Prefer `use()` for supported context or async resource consumption patterns in React 19 where the codebase and runtime support it.
- Prefer `useActionState` for form submission flows when it fits the app architecture and platform constraints.
- Prefer `useOptimistic` for optimistic UI flows when it simplifies user feedback without duplicating state unnecessarily.
- Prefer passing `ref` as a prop in React 19-compatible components instead of introducing `forwardRef` by default.

TypeScript and project structure rules:
- Type component props explicitly and prefer extending intrinsic element props when building wrapper components.
- Use `React.ReactNode` for children typing.
- Type DOM events explicitly.
- Prefer generic component APIs when building reusable abstractions.
- Use barrel exports at feature boundaries only.

Default rules:
1. Always use function components.
2. Always prefer composition over prop drilling.
3. Never add manual memoization without a concrete reason.
4. Never use array indexes as keys for dynamic collections.
5. Always prefer granular error isolation for independently failing sections.
6. Prefer `use()` over legacy context access patterns when supported by the codebase.
7. Prefer `useActionState` for form actions when appropriate.
8. Prefer `startTransition` for non-urgent state updates.

## 9. Data Fetching Philosophy (Server-first, Just-in-time)

This project follows a **"ask the BE for exactly what you need"** principle. All agents must respect this.

Core rule: **Never load more data than the current view requires.**

- Always prefer dedicated BE endpoints that filter, search, and paginate server-side over fetching full lists and slicing them client-side.
- Use `useInfiniteQuery` or paged `useQuery` for any list that can grow. Avoid one-shot queries that fetch all records.
- Do not build client-side search/filter logic over an in-memory list. If a BE search or filter endpoint exists, use it. If it doesn't exist yet, flag it to the user and ask for it before implementing a client-side workaround.
- Never expand `limit` values to work around missing BE filtering. That is a red flag, not a solution.
- Scope query params tightly: only send `include`, `language`, `sex`, `speciesId`, and other filters when they are actually needed by the view.

Decision gate before writing any data-fetching code:
1. Does a BE endpoint exist that returns exactly this data filtered/searched/paginated at the server level?
2. If yes, use it. Wire it up in `*-api.ts` and `*-queries.ts`.
3. If no, stop. Tell the user: "This needs a new BE endpoint. Do not implement client-side filtering as a workaround."

## 8. TypeScript Best Practices
- Apply this rule whenever writing or editing TypeScript types, interfaces, generics, type guards, error handling patterns, or tsconfig configuration.
- Follow TypeScript 5.x strict-mode best practices and favor patterns that improve type safety at compile-time.

Type design rules:
- Prefer `interface` for extendable object shapes and `type` for unions, intersections, mapped types, and utility compositions.
- Prefer discriminated unions over optional-property state bags for multi-shape domain models.
- Prefer branded types for identifiers when mixing domains could cause accidental assignment.
- Prefer `as const` for literal tuples and config objects used to derive union types.
- Prefer utility types (`Pick`, `Omit`, `Partial`, `Record`, etc.) over repeating equivalent structural type definitions.

Type safety rules:
- Avoid `any`; use `unknown` at unsafe boundaries and narrow with type guards.
- Prefer type predicates and assertion functions over unsafe type assertions when runtime checks are possible.
- Use exhaustive `never` checks in `switch` statements for discriminated unions.
- Prefer `satisfies` when you need structural validation while preserving literal inference.
- Validate external data at API and storage boundaries using the repository's established schema-validation approach.

Function and API typing rules:
- Use overloads only when the return type truly depends on input shape.
- Use constrained generics (`extends`, `keyof`) to preserve key and value relationships.
- Prefer parameter objects for functions that would otherwise exceed 3 parameters.
- Annotate return types on exported functions and public APIs.

Common pitfalls and preferred patterns:
- Use typed helpers when iterating object keys because `Object.keys` returns `string[]`.
- Use type-predicate filter helpers for nullable arrays to preserve narrowing.
- Prefer union literals or `as const` objects over numeric enums.

Error handling rules:
- Prefer explicit typed error models (for example discriminated union errors) over implicit stringly-typed failures.
- Prefer a `Result` pattern for expected recoverable failures at service boundaries where exceptions would obscure control flow.

tsconfig guidance:
- Keep `strict: true` enabled.
- Prefer enabling `noUncheckedIndexedAccess` in strict codepaths.
- Prefer `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` unless repository constraints require exceptions.

Default rules:
1. Always keep strict type-safety enabled for application code.
2. Always use `unknown` instead of `any` at unknown boundaries, then narrow.
3. Always use discriminated unions for multi-shape domain types.
4. Always use exhaustive `never` checks when switching on discriminants.
5. Always validate external data at system boundaries with established validators.
6. Always annotate return types on exported functions.
7. Never use numeric enums in new code.
8. Never use type assertions when a type guard can be used.
9. Prefer `satisfies` for validation plus inference.
10. Prefer `as const` for literal config and union sources.
