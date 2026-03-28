---
name: "PR"
description: "Create a pull request with smart target selection: default current branch -> development, or --main/--master for development -> main."
argument-hint: "Optional: PR intent/title hint. Prefix with 'draft' for draft PR or '--main' (alias '--master') for release PR (development -> main)."
agent: "Git Commit Specialist"
---
Start the pull request workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional PR intent/title hint — prefix with 'draft' and/or '--main' (or '--master')}

## Mode Selection
- If user intent contains `--main` or `--master`, run in release mode:
  - Head branch: `development`
  - Base branch: `main`
   - Remove `--main`/`--master` from the final PR title/body text
- Otherwise run in development mode:
  - Head branch: current checked-out branch
  - Base branch: `development`

## Target Rules
- Development mode: never open a PR from `main`, `master`, `develop`, or `development` to `development`; if currently on one of these, ask for one concise clarification before proceeding.
- Release mode (`--main` or `--master`): always create PR from `development` to `main` unless user explicitly overrides.

## PR Execution Rules
1. Run `git status --short --branch` and confirm there are no merge conflicts.
2. Resolve head/base branches from Mode Selection.
3. If release mode (`--main`/`--master`):
   - Capture current branch name so it can be restored after sync.
   - Run `git switch development && git pull --ff-only origin development`.
   - Run `git switch main && git pull --ff-only origin main`.
   - Return to previous branch unless it is `development` or `main`.
4. Verify head branch is pushed to origin; if not, push with upstream first.
5. Compare head against base and summarize changes (commits/files) for the PR context.
6. If release mode (`--main`/`--master`), generate PR title/body only from the real `main...development` diff after pulls.
7. Propose up to 3 PR titles if intent is ambiguous; otherwise use the best clear title.
8. Build a concise PR body with:
   - Summary
   - What changed
   - Validation performed
   - Validation format rule: list only the validation type and status (Passed/Failed); do not paste command output, logs, stack traces, or code snippets.
   - Risks/notes
   - If there are changes included in the PR that are not reflected in the branch name or main PR intent, briefly explain these out-of-scope changes in the PR body or comments, as appropriate.
9. Create the PR using resolved head/base branches:
   - Default: ready PR
   - If user intent includes `draft`, create as draft
10. Return:
   - Base and head branches
   - Final title
   - PR URL
   - Whether draft or ready
   - Any follow-up actions

## Safety Rules
- If there are uncommitted changes that would affect PR accuracy, ask one concise clarification question before creating the PR.
- In development mode: if `development` does not exist on remote, ask one concise clarification question and suggest `develop` as fallback.
- In release mode (`--main` or `--master`): if `main` or `development` does not exist on remote, ask one concise clarification question before proceeding.
- In release mode (`--main` or `--master`): if `git pull --ff-only` fails on either `main` or `development`, stop and ask one concise clarification question before creating the PR.
