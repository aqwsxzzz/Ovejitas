---
name: "commit"
description: "Start a commit and push flow: inspect changes, propose a Conventional Commit message, validate, commit, and perform a simple push. Optionally creates and switches to a new branch first."
argument-hint: "Optional: scope/intent or 'new-branch' flag, e.g. \"fix(auth): token refresh\" or \"new-branch fix(auth): token refresh\""
agent: "Git Commit Specialist"
---
Start the commit workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional commit intent — prefix with 'new-branch' to create and switch branch first}

## Branch Step (run first if applicable)
- If user intent starts with `new-branch`, or the current branch is `main`/`master`/`develop`/`development`, or the user states they are on the wrong branch:
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
- Always base new branches off `development` unless the user specifies otherwise.

## Commit Execution Rules
### Commit Message Length Rule
- The commit head (first line of the commit message) must not exceed 100 characters.
- If the head exceeds 100 characters, the commit will be blocked with an error by husky/commitlint.
1. Run status and diff review first.
2. Infer the best commit scope and propose up to 3 Conventional Commit messages.
3. Apply Conventional Commit semantic rules only for message correctness; do not do version comparison, package version bumps, changelog updates, or tags.
4. Run repository validation commands relevant to the commit (`npm run lint`, `npm run build`) unless user explicitly requests skip.
5. If there is exactly one clear commit path, proceed to stage and commit using the best message.
6. If there is ambiguity (multiple unrelated changes), ask one concise clarification question before committing.
7. After committing, push simply: use `git push -u origin "<branch-name>"` for a new branch or `git push` for an existing branch.
8. Return: branch used (new or existing), final message, files committed, validation results, commit hash, and push command/result.
