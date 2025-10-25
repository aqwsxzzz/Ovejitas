# Code Quality

## Comments
- **Avoid comments**: Code should be self-documenting
- **Only when necessary**: Complex algorithms, non-obvious business logic, workarounds
- **No commented code**: Delete dead code, rely on git history

```typescript
// ❌ BAD: Obvious comment
// Set the name
setName(value)

// ✅ GOOD: Explains non-obvious business rule
// Farm owners can create max 2 farms per regulatory requirement
if (userFarms.length >= 2) throw new Error('Farm limit reached')
```

## Naming
- **Descriptive names**: `handleAnimalUpdate` not `handle` or `onUpdate`
- **Booleans**: Use `is`, `has`, `should` prefix - `isLoading`, `hasEvents`, `shouldSync`
- **Event handlers**: Use `handle` prefix - `handleSubmit`, `handleDelete`

## ESLint & Prettier
- **Follow all rules**: No disabling rules without team discussion
- **Pre-commit hooks**: Lint and format before commit
- **CI enforcement**: Build fails on lint errors

## Conventional Commits
Format: `type(scope): subject`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `docs`: Documentation only
- `chore`: Build, dependencies, tooling

**Examples**:
```
feat(animals): add lineage tree visualization
fix(offline): resolve sync queue processing bug
refactor(auth): simplify token refresh logic
```
