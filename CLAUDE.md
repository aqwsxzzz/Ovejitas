# CLAUDE.md — Ovejitas Frontend

## Project Overview

- **Type:** React frontend (livestock / farm management)
- **Stack:** React 19, TypeScript 5.x strict, TanStack Query, TanStack Router, Zustand, shadcn/ui, Tailwind CSS
- **Package manager:** npm
- **Architecture docs:** `docs/architecture/frontend-coding-standards/`
- **Backend docs:** `docs/backend-event-ledger-rules.md`, `backend-docs/`

## Development Commands

```bash
npm run lint       # ESLint
npm run build      # TypeScript + Vite build
npm run typecheck  # Type check only (if available)
```

Always run `npm run lint && npm run build` before committing or creating a PR.

---

## Rule Priority Order

1. useEffect Rule (section below) — **highest priority**
2. UI Consistency & Reuse Gate
3. Single Responsibility hard limits
4. Data Fetching / BE Escalation rules
5. React & TypeScript best practices
6. General architecture standards

---

## 1. useEffect — Escape Hatch Only (Highest Priority)

`useEffect` is only for synchronizing with **external systems**. Never use it for:
- Derived state
- Prop-sync or state resets (use component `key` instead)
- Event-specific logic (use event handlers)
- Parent notifications
- Chained state transitions
- Server data fetching (use TanStack Query)

Decision gate before writing `useEffect`:
1. Can this be calculated during render?
2. Is this an expensive derivation → `useMemo`?
3. Should state reset by changing component `key`?
4. Is this user interaction logic → event handler?
5. Is this external store subscription → `useSyncExternalStore`?
6. Is this server data → TanStack Query?
7. Is this truly synchronization with an external system?

Only write `useEffect` when **item 7 is true**.

Always include complete dependencies and cleanup for subscriptions/listeners/timers. For async effects, use an ignore/abort pattern to prevent stale updates.

---

## 2. Shadcn-First UI Rule

Always use existing shadcn/ui components from `src/components/ui/` when an equivalent exists.

- Never introduce raw HTML controls (`input`, `select`, `textarea`, `button`, form wrappers, modal primitives, cards, labels, separators) when shadcn components cover the case.
- Compose shadcn primitives: `Form`, `FormField`, `Input`, `Button`, `Card`, `Dialog`, `Select`, `Label`, `Separator`.
- Only fall back to native HTML/CSS when no shadcn path exists — document the reason.

---

## 3. UI Consistency & Reuse Gate (Mandatory)

Before creating or editing any UI element (buttons, badges/pills, cards, chips, action links, toggles):

1. Is there an existing shared component for this element type?
2. Is there an existing semantic variant that matches this intent?
3. Can I achieve this by reusing `src/components/ui/*` without local color overrides?
4. If no, should I add a new semantic variant in the shared component instead of local styles?
5. If still no, is this a real product requirement for a unique design?

Only add local custom styling when **step 5 is true**.

- Do not use `className` color overrides (`bg-*`, `text-*`, `border-*`) on reusable primitives for core intent states.
- Extend shared variant definitions in `src/components/ui/button.tsx`, `badge.tsx`, etc. instead of styling one-off instances.
- One intent = one visual language app-wide.

---

## 4. Single Responsibility — Hard Limits

Every file, function, component, and hook must do **one thing**.

| Metric | Max | Action |
|--------|-----|--------|
| File length | 200 lines | Split into smaller modules |
| Function / hook body | 30 lines | Extract helpers or sub-hooks |
| Component JSX return | 50 lines | Extract child components |
| Function parameters | 3 | Use an options object |
| Component props | 5–6 | Compose or use `children` |
| Nesting depth | 3 levels | Early returns or extracted helpers |
| Cyclomatic complexity | 5 branches | Simplify or split |

**Component rules:** One component = one job. Extract when a JSX section has its own state, effects, repeated UI, or standalone conditional logic.

**Hook rules:** One hook = one concern. Separate server data, mutations, and local UI state. If the hook name needs "And", split it.

**Signals to refactor:**
- More than 3 `useState` calls in one component → extract a custom hook
- Imports from more than 5 feature directories → the file knows too much

Pre-flight checklist:
1. Can this file/function be described in one sentence without "and"?
2. File under 200 lines?
3. Every function under 30 lines?
4. 3 or fewer levels of nesting?
5. Each hook handles exactly one concern?
6. State minimal, derived values computed not stored?

If any answer is no — split, extract, or simplify first.

---

## 5. React Best Practices

- **Function components only.**
- Prefer composition through `children`, slots, or focused subcomponents over prop drilling.
- State: `useState` for simple local values, `useReducer` for complex multi-value transitions, context for low-change globals (auth, theme, locale).
- **No manual memoization by default** — React 19 compiler handles it. Only memoize when there is a demonstrated need.
- Never use array indexes as keys for dynamic lists; use stable identifiers.
- Prefer `startTransition` for non-urgent updates.
- Use component `key` intentionally when state should reset for a changed identity.
- Prefer granular error boundaries around independently failing UI sections.
- Prefer `use()` for context/async resources in React 19.
- Prefer `useActionState` for form submission flows.
- Prefer `useOptimistic` for optimistic UI when it avoids duplicating state.
- Pass `ref` as prop in React 19-compatible components; avoid `forwardRef` by default.

Split a component when it grows beyond ~100–150 lines, manages unrelated state, or contains sections with their own logical identity. 200 lines is the hard maximum.

---

## 6. TypeScript Best Practices

- `strict: true` always enabled.
- Prefer `interface` for extendable object shapes; `type` for unions, intersections, mapped types.
- Prefer discriminated unions over optional-property state bags for multi-shape domain models.
- Avoid `any`; use `unknown` at unsafe boundaries and narrow with type guards.
- Use exhaustive `never` checks in `switch` for discriminated unions.
- Prefer `satisfies` for structural validation while preserving literal inference.
- Prefer `as const` for literal tuples and config objects.
- Prefer utility types (`Pick`, `Omit`, `Partial`, `Record`) over repeating structural definitions.
- Annotate return types on all exported functions.
- Never use numeric enums in new code.
- Validate external data at API/storage boundaries with the repo's established schema-validation approach.

---

## 7. Data Fetching — Server-First, Just-in-Time

**Never load more data than the current view requires.**

- Always prefer dedicated BE endpoints that filter, search, and paginate server-side over fetching full lists and slicing client-side.
- Use `useInfiniteQuery` or paged `useQuery` for any list that can grow.
- Do not build client-side search/filter logic over in-memory lists.
- Never expand `limit` values to work around missing BE filtering — that is a red flag, not a solution.
- Scope query params tightly: only send `include`, `language`, `sex`, `speciesId`, and other filters when actually needed.

Decision gate before writing any data-fetching code:
1. Does a BE endpoint exist that returns exactly this data filtered/searched/paginated server-side?
2. If yes → wire it up in `*-api.ts` and `*-queries.ts`.
3. If no → **stop**. Tell the user: "This needs a new BE endpoint. Do not implement client-side filtering as a workaround."

---

## 8. Backend Capability Escalation (No FE Workarounds)

If required behavior is backend-owned and missing: **do not fix it in frontend.**

- No local hacks, derived fake logic, oversized fetches, manual event synthesis, or hidden fallback rules.
- Frontend must escalate to backend via `.github/prompts/be-capability-request.prompt.md`.

Until backend support exists, frontend may only:
- Show a clear blocked-state UX
- Hide/disable unsupported UI actions
- Document the dependency in the implementation summary

Mandatory escalation workflow:
1. Identify the exact missing backend capability and why FE cannot own it safely.
2. Do not implement a frontend workaround.
3. Create a BE AI request prompt using `.github/prompts/be-capability-request.prompt.md`.
4. Share the prompt with the user.
5. Proceed in FE only with non-deceptive blocked-state handling.

---

## 9. Architecture & Boundaries

- Keep separation between UI components, state management, and API/data layers.
- Do not break route/API behavior unless explicitly requested.
- Make minimal, focused changes tied to the request.
- Follow existing patterns in the feature before introducing new ones.
- Do not add dependencies unless explicitly requested and justified.
- Reference `docs/architecture/frontend-coding-standards/` for detailed standards.

### Feature File Naming (Required)

Match established naming in each feature folder. Update existing files before creating new ones.

```
src/features/{name}/api/{name}-api.ts       ← API calls
src/features/{name}/api/{name}-queries.ts   ← TanStack Query hooks
src/features/{name}/types/{name}-types.ts   ← interfaces/types
```

Do not create parallel duplicates (e.g., `breed-api.ts` and `breed.api.ts` for the same concern). Keep naming aligned with nearby files in the same folder.

---

## 10. Enhance Over Patch

When facing a bug or limitation, prefer enhancing the system over implementing a workaround.

- Workarounds leave technical debt; enhancements solve the root cause.
- Example: debounce + local state patches focus-loss on search, but URL search params enhance the system (adds bookmarkability, back/forward, persistence).
- When a short-term patch is the only option: mark it explicitly as temporary and document the ideal enhancement path.

---

## 11. Frontend Tests

**Do not create, modify, or propose frontend tests** (unit, integration, e2e) unless the user explicitly requests them. Do not add testing frameworks, test dependencies, or test-related scripts by default.

Prefer lightweight validation via typecheck/build/lint plus manual verification notes.

---

## 12. Git Workflow

### Branch Naming

Format: `<type>/<short-kebab-description>`

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `build`, `ci`, `test`

Rules:
- Description: lowercase, kebab-case, max 5 words, no special characters
- Always base new branches off `development` unless specified otherwise
- Never branch directly off an existing feature branch unless explicitly requested
- Branch type must match the commit type

Examples: `feat/add-expense-filter`, `fix/auth-token-refresh`, `chore/update-dependencies`

### Commit Messages (Conventional Commits)

Format: `<type>(<scope>): <subject>`

- Subject: imperative, concise, specific
- Head line must not exceed 100 characters (enforced by commitlint)
- Add body when context is important (why, impact, migration notes)
- Only use `!` or `BREAKING CHANGE:` footer for truly breaking changes

Commit workflow:
1. `git status --short --branch`
2. Review diffs (`git diff`, `git diff --staged`)
3. Group related changes; avoid mixing unrelated concerns
4. Run `npm run lint && npm run build` before committing
5. Stage only intended files
6. Commit with conventional message
7. Push: `git push -u origin <branch>` for new branches, `git push` otherwise

### PR Workflow

- **Development mode** (default): current branch → `development`
- **Release mode** (`--main`): `development` → `main`

PR body structure:
- Summary
- What changed
- Validation performed (type + status only — no logs or stack traces)
- Risks/notes
- Out-of-scope changes explained if any

---

## 13. BE Request Template

When escalating a missing backend capability, use `.github/prompts/be-capability-request.prompt.md`. Key fields:
- Why this is backend-owned
- Current gap
- Requested endpoint/action with request + response contract
- Event-ledger requirements (atomicity, source ownership)
- Acceptance criteria

---

## 14. Ledger Rules Sync

To sync `docs/backend-event-ledger-rules.md` after updating backend docs, use `.github/prompts/ledger-rules-sync.prompt.md`. This is a controlled sync — not a blind copy.
