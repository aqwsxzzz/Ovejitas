# Backend Ledger Rules Sync Prompt

Use this prompt after updating `backend-docs/` from the backend repository (for example after `npm run docs`).

## Purpose

Keep `docs/backend-event-ledger-rules.md` aligned with backend behavior changes while preserving the FE/BE contract quality.

This is a **controlled sync** process, not blind copying.

## How to use

1. Refresh backend docs in this repo.
2. Open this prompt and replace bracket placeholders.
3. Run the prompt with your coding agent.
4. Review the generated diff and contract-change summary before commit.

## Prompt Template

Title: Sync backend event ledger rules from latest backend docs

Context:
- Date: [YYYY-MM-DD]
- Frontend repo: Ovejitas
- Backend source revision: [commit/tag/branch]
- Sync command used: [example: npm run docs]
- Primary source files in `backend-docs/`: [list exact files]
- Additional source files in `temp_repo/docs/`: [list exact files or "none"]

Task:
Update `docs/backend-event-ledger-rules.md` so it matches current backend behavior and invariants.

Hard constraints:
1. Keep this file as a FE/BE contract document, not implementation notes.
2. Preserve existing section structure where possible.
3. Do not invent backend capabilities not present in source docs.
4. Do not add frontend workaround guidance for backend-owned behavior.
5. If capability is missing in backend, keep blocked-state guidance and produce a BE request using `.github/prompts/be-capability-request.prompt.md`.
6. Keep language precise and auditable (MUST/SHOULD style where useful).

Required workflow:
1. Read current `docs/backend-event-ledger-rules.md`.
2. Read latest backend source docs listed above.
3. Build a change map with three buckets:
   - `No Change`: rule still valid
   - `Clarify`: wording/detail update only, same behavior
   - `Contract Change`: behavior/invariant changed
4. Update `docs/backend-event-ledger-rules.md` with minimal targeted edits.
5. Add or update a short `Contract change log` section at the end with date and bullet entries for each Contract Change.
6. If a backend gap is detected, generate a ready-to-send BE capability request block using `.github/prompts/be-capability-request.prompt.md` and include it in the final report (not inside the rules file unless requested).

Output format:
1. `Updated file`: list modified files.
2. `Contract changes`: bullet list (empty if none).
3. `Clarifications`: bullet list.
4. `Backend gaps`: bullet list (or `none`).
5. `Validation`: explain why updated rules match source docs.
6. `Suggested commit message`: conventional commit style.

Quality gate checklist (must pass):
- One user intent -> one governing action endpoint when action exists.
- No manual create for action-owned event types.
- `payload.source` reserved for backend action emission.
- No generic patch/delete for action-owned events.
- Inventory decrement protections stay explicit.
- FE avoids action+manual double-write path.
- Reports assumptions remain ledger-replay based.

## Quick Fill Example

Title: Sync backend event ledger rules from latest backend docs

Context:
- Date: 2026-05-22
- Frontend repo: Ovejitas
- Backend source revision: feat/domain-rebuild@abc1234
- Sync command used: npm run docs
- Primary source files in `backend-docs/`: `events-and-actions.md`, `domain-notes.md`
- Additional source files in `temp_repo/docs/`: `domain-rebuild-plan.md`

Task:
Update `docs/backend-event-ledger-rules.md` so it matches current backend behavior and invariants.

[Apply hard constraints, required workflow, output format, and quality gate checklist exactly as specified above.]
