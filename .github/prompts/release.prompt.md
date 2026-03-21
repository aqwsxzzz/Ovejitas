---
name: "release"
description: "Run post-merge release workflow from main: sync, choose semver bump, create version commit, tag, push, and publish GitHub Release."
argument-hint: "Optional: bump and options, e.g. 'patch', 'minor', 'major', 'draft patch', or 'v1.8.0 --no-bump'"
agent: "Git Commit Specialist"
---
Start the release workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional release intent — e.g. `patch`, `minor`, `major`, `draft patch`, `vX.Y.Z --no-bump`}

## Goal
Run the post-merge release flow after final changes are already merged to `main`:
1. Sync local `main`
2. Determine release version
3. Bump version (unless explicitly `--no-bump`)
4. Commit version bump (if needed)
5. Create annotated git tag
6. Push commit + tag
7. Publish GitHub Release

## Release Mode Rules
- Always release from `main`.
- If current branch is not `main`, switch to `main` before any release action.
- Always run `git pull --ff-only origin main` before version/tag operations.
- If fast-forward pull fails, stop and ask one concise clarification question.

## Version Resolution Rules
- Accept explicit intent values:
  - `patch`, `minor`, `major`
  - explicit version: `vX.Y.Z` or `X.Y.Z`
  - optional flags: `draft`, `--no-bump`
- Default bump policy (required unless user overrides):
   - apply highest-impact wins across included changes.
   - if any breaking change exists -> `major`.
   - else if any minor-level feature exists -> `minor`.
   - else -> `patch`.
- Preflight comparison is mandatory before deciding version:
   - read package version from `package.json`.
   - read latest GitHub release tag (fallback: latest remote tag if no release exists).
   - normalize both to semver (`X.Y.Z`) and compare.
   - if package version is behind latest GitHub version, stop and ask one concise clarification question.
   - if package version is ahead of latest GitHub version, continue but explicitly note mismatch in output.
- If user gives no bump/version, infer and propose up to 3 options, then ask for one choice.
- If explicit version is provided:
  - normalize to tag format `vX.Y.Z`
  - if `--no-bump` is absent, set package version to `X.Y.Z`.
- If bump type is provided:
  - use `npm version <patch|minor|major>` (without auto-tag).

## Safety Rules
1. Run `git status --short --branch` first.
2. If there are uncommitted changes, ask one concise clarification question before proceeding.
3. Verify `main` exists on remote; if not, ask one concise clarification question.
4. Verify GitHub auth is available (`gh auth status`) before release operations.
5. Verify the final release tag does not already exist locally or remotely.
6. Verify release commit is on `main` before tagging:
   - resolve `main` HEAD and ensure tag target commit equals that SHA.
7. Verify quality gates before publishing release:
   - CI status for `main` must be green (if CI is configured and accessible).
   - run a short smoke checklist (or explicitly record what could not be verified).
8. Never force-push during release workflow.
9. Never delete or move existing tags unless explicitly requested.

## Release Execution Rules
1. Check clean state and current branch.
2. Switch to `main` and sync: `git switch main && git pull --ff-only origin main`.
3. Resolve and compare versions:
   - package version: `node -p "require('./package.json').version"`
   - latest GH release tag: `gh release list --limit 1 --json tagName --jq '.[0].tagName'`
   - if no GH release exists, fallback latest remote tag:
     `git ls-remote --tags --refs origin | sed 's/.*refs\/tags\///' | sort -V | tail -n 1`
   - normalize and compare versions, then propose next target version.
4. If not `--no-bump`:
   - update package version using `npm version <...> --no-git-tag-version`.
   - create commit: `chore(release): vX.Y.Z`.
5. Create annotated tag on HEAD: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
6. Push to origin:
   - if version commit exists: `git push origin main`
   - push tag: `git push origin vX.Y.Z`
7. Build curated release notes (required):
   - do not publish raw commit-list notes as final notes.
   - summarize user-facing value and behavior changes using this structure:
    - `## vX.Y.Z Highlights`
    - `## What's New`
    - `## Improvements`
    - `## Fixes`
    - `## Known Issues` (use `None` if there are no known issues)
    - `## How To Use` (only if there are new flows/features)
    - `## Compatibility Notes` (breaking changes and migration requirements, or `none`)
    - `## Operational Notes` (rollout/rollback notes when relevant)
    - `## Full Changelog` with compare URL
   - group content by feature/domain (e.g. expenses, auth, animal, measurement) instead of by commit.
   - include only sections with meaningful content; omit empty sections.
   - include PR links and commit references only in a short appendix section (optional), not as the main narrative.
8. Create GitHub Release with curated notes:
   - write notes to a temp markdown file and publish with `--notes-file`.
   - default: ready release
   - if `draft` in intent: draft release
   - command pattern:
     - `gh release create vX.Y.Z --notes-file <path-to-notes.md>`
     - add `--draft` when requested.
9. Generate developer changelog artifact (required):
   - create/update `docs/changelog/developer/vX.Y.Z.md`.
   - this is for engineers/PM/TL (not end users).
   - include technical depth and references using this structure:
     - `# vX.Y.Z Developer Changelog`
     - `## Scope`
     - `## Architecture / Design Changes`
     - `## API and Data Contract Changes`
     - `## Implementation Notes`
     - `## Code Examples` (small focused snippets only when useful)
     - `## Migrations / Operational Steps`
     - `## Risks and Mitigations`
     - `## Validation and Test Evidence`
     - `## Follow-ups`
   - reference key PRs and relevant files.
   - keep concise but concrete; avoid raw commit dumps.
10. Post-release verification:
   - verify tag exists remotely and points to intended commit.
   - verify release URL is accessible and published state matches intent (draft/ready).
   - verify local `main` and `origin/main` contain the release commit.
11. Return:
   - Released version
   - Branch used
   - Package version before/after
   - Latest GH version before release
   - Version comparison result (match/mismatch and resolution)
   - Version commit hash (or `none` if `--no-bump`)
   - Tag name and target commit
   - Release URL
   - Release notes summary (1 short paragraph)
   - Developer changelog path and short summary
   - Post-release verification results
   - Push commands and result

## Notes
- Keep release title as `vX.Y.Z` unless user requests a custom title.
- Treat autogenerated notes as optional source material only; final published notes must be curated and human-readable.
- If package version bump is intentionally skipped (`--no-bump`), call this out explicitly in final output.
