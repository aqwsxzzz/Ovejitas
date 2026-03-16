---
name: "commit"
description: "Start a full commit flow: inspect changes, propose Conventional Commit message, apply SemVer rules, validate, commit, and prepare push guidance. Optionally creates and switches to a new branch first."
argument-hint: "Optional: scope/intent or 'new-branch' flag, e.g. \"fix(auth): token refresh\" or \"new-branch fix(auth): token refresh\""
agent: "Git Commit Specialist"
---
Start the commit workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional commit intent — prefix with 'new-branch' to create and switch branch first}

## Branch Step (run first if applicable)
- If user intent starts with `new-branch`, or the current branch is `main`/`master`/`develop`, or the user states they are on the wrong branch:
  1. Infer the correct branch name from the intent and the changed files using the Branch Naming Rules below.
  2. Run `git switch -c "<branch-name>"` before any staging or committing.
  3. Confirm the new branch is active before proceeding.
- If the current branch is already a feature/fix/chore branch that matches the intent, skip branch creation.

## Branch Naming Rules
- Format: `<type>/<short-kebab-description>`
- Allowed types (match the commit type): `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `build`, `ci`, `test`
- Description: lowercase, kebab-case, max 5 words, no special characters
- Examples:
  - `feat/add-expense-filter`
  - `fix/auth-token-refresh`
  - `chore/update-dependencies`
  - `docs/api-integration-notes`
- Never branch directly off an existing feature branch unless explicitly requested.
- Always base new branches off `main` unless the user specifies otherwise.

## Commit Execution Rules
1. Run status and diff review first.
2. Infer the best commit scope and propose up to 3 Conventional Commit messages.
3. Apply semantic versioning policy and report current -> next version impact.
4. If a bump is required, run release gating steps before push guidance.
5. Run repository validation commands relevant to release (`npm run lint`, `npm run build`) unless user explicitly requests skip.
6. If there is exactly one clear commit path, proceed to stage and commit using the best message.
7. If there is ambiguity (multiple unrelated changes), ask one concise clarification question before committing.
8. Return: branch used (new or existing), final message, files committed, SemVer decision, validation results, commit hash, and push command.
