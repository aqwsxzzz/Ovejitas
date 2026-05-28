# Ledger Rules Sync Handoff

Use this file as the ready context payload when running the prompt in `.github/prompts/ledger-rules-sync.prompt.md`.

## Context
- Date: 2026-05-22
- Frontend repo: Ovejitas
- Backend source revision: 723337f
- Sync command used: npm run docs:ledger
- Primary source files in `backend-docs/`: `domain-model.md`, `domain-notes.md`, `domain-rebuild-plan.md`, `events-and-actions.md`, `prd_granjas.md`, `production-deployment.md`
- Additional source files in `temp_repo/docs/`: [fill if needed]

## Detected backend-docs changes
No local changes detected in backend-docs after sync.

### Changed files (up to 20)
- none

### Likely ledger-impacting files
- none

## Next action
1. Open `.github/prompts/ledger-rules-sync.prompt.md`.
2. Copy this context block into the prompt placeholders.
3. Run the prompt with Copilot Chat to update `docs/backend-event-ledger-rules.md`.
