---
name: "PR"
description: "Create a pull request with smart target selection: default current branch -> development, or --master for development -> main."
argument-hint: "Optional: PR intent/title hint. Prefix with 'draft' for draft PR or '--master' for release PR (development -> main)."
agent: "Git Commit Specialist"
---
Start the pull request workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional PR intent/title hint — prefix with 'draft' and/or '--master'}

## Mode Selection
- If user intent contains `--master`, run in release mode:
  - Head branch: `development`
  - Base branch: `main`
  - Remove `--master` from the final PR title/body text
- Otherwise run in development mode:
  - Head branch: current checked-out branch
  - Base branch: `development`

## Target Rules
- Development mode: never open a PR from `main`, `master`, `develop`, or `development` to `development`; if currently on one of these, ask for one concise clarification before proceeding.
- Release mode (`--master`): always create PR from `development` to `main` unless user explicitly overrides.

## PR Execution Rules
1. Run `git status --short --branch` and confirm there are no merge conflicts.
2. Resolve head/base branches from Mode Selection.
3. Verify head branch is pushed to origin; if not, push with upstream first.
4. Compare head against base and summarize changes (commits/files) for the PR context.
5. Propose up to 3 PR titles if intent is ambiguous; otherwise use the best clear title.
6. Build a concise PR body with:
   - Summary
   - What changed
   - Validation performed
   - Risks/notes
7. Create the PR using resolved head/base branches:
   - Default: ready PR
   - If user intent includes `draft`, create as draft
8. Return:
   - Base and head branches
   - Final title
   - PR URL
   - Whether draft or ready
   - Any follow-up actions

## Safety Rules
- If there are uncommitted changes that would affect PR accuracy, ask one concise clarification question before creating the PR.
- In development mode: if `development` does not exist on remote, ask one concise clarification question and suggest `develop` as fallback.
- In release mode (`--master`): if `main` or `development` does not exist on remote, ask one concise clarification question before proceeding.
