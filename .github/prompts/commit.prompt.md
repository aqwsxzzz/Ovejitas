---
name: "commit"
description: "Start a full commit flow: inspect changes, propose Conventional Commit message, apply SemVer rules, validate, commit, and prepare push guidance."
argument-hint: "Optional: scope/intent, e.g. \"fix(auth): token refresh\""
agent: "Git Commit Specialist"
---
Start the commit workflow immediately using the Git Commit Specialist agent.

User intent: ${input:Optional commit intent}

Execution rules:
1. Run status and diff review first.
2. Infer the best commit scope and propose up to 3 Conventional Commit messages.
3. Apply semantic versioning policy and report current -> next version impact.
4. If a bump is required, run release gating steps before push guidance.
5. Run repository validation commands relevant to release (`npm run lint`, `npm run build`) unless user explicitly requests skip.
6. If there is exactly one clear commit path, proceed to stage and commit using the best message.
7. If there is ambiguity (multiple unrelated changes), ask one concise clarification question before committing.
8. Return: final message, files committed, SemVer decision, validation results, commit hash, and push command.
