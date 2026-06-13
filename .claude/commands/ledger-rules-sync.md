Sync docs/backend-event-ledger-rules.md with the latest backend docs.

User intent: $ARGUMENTS
(Provide: backend source revision, sync command used, and primary source files in backend-docs/. Example: "feat/domain-rebuild@abc1234, npm run docs, events-and-actions.md domain-notes.md")

## Purpose
Keep `docs/backend-event-ledger-rules.md` aligned with backend behavior changes while preserving the FE/BE contract quality. This is a **controlled sync** — not a blind copy.

## Required Workflow
1. Read current `docs/backend-event-ledger-rules.md`.
2. Read the latest backend source docs listed in the user intent (from `backend-docs/` and/or `temp_repo/docs/`).
3. Build a change map with three buckets:
   - `No Change` — rule still valid
   - `Clarify` — wording/detail update only, same behavior
   - `Contract Change` — behavior/invariant actually changed
4. Update `docs/backend-event-ledger-rules.md` with minimal targeted edits.
5. Add or update a short `Contract change log` section at the end with today's date and bullet entries for each Contract Change.
6. If a backend gap is detected, generate a ready-to-send BE capability request block (use the `/be-capability-request` format) and include it in the final report — not inside the rules file unless requested.

## Hard Constraints
1. Keep this file as a FE/BE contract document, not implementation notes.
2. Preserve existing section structure where possible.
3. Do not invent backend capabilities not present in source docs.
4. Do not add frontend workaround guidance for backend-owned behavior.
5. If a capability is missing in backend, keep blocked-state guidance and produce a BE request.
6. Keep language precise and auditable (MUST/SHOULD style where useful).

## Quality Gate (must pass before finishing)
- One user intent → one governing action endpoint when an action exists.
- No manual create for action-owned event types.
- `payload.source` reserved for backend action emission.
- No generic patch/delete for action-owned events.
- Inventory decrement protections stay explicit.
- FE avoids action + manual double-write path.
- Reports assumptions remain ledger-replay based.

## Output Format
1. `Updated file` — list modified files
2. `Contract changes` — bullet list (empty if none)
3. `Clarifications` — bullet list
4. `Backend gaps` — bullet list (or `none`)
5. `Validation` — explain why updated rules match source docs
6. `Suggested commit message` — conventional commit style
