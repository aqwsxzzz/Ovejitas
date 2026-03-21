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
6. Never force-push during release workflow.
7. Never delete or move existing tags unless explicitly requested.

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
7. Create GitHub Release:
   - default: ready release
   - if `draft` in intent: draft release
   - command: `gh release create vX.Y.Z --generate-notes` (+ `--draft` when requested)
8. Return:
   - Released version
   - Branch used
   - Package version before/after
   - Latest GH version before release
   - Version comparison result (match/mismatch and resolution)
   - Version commit hash (or `none` if `--no-bump`)
   - Tag name and target commit
   - Release URL
   - Push commands and result

## Notes
- Keep release title as `vX.Y.Z` unless user requests a custom title.
- Include generated notes by default and append a short manual summary when appropriate.
- If package version bump is intentionally skipped (`--no-bump`), call this out explicitly in final output.
