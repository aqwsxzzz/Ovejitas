# Performance

## Code Splitting
- **Lazy load routes**: Use TanStack Router's built-in lazy loading
- **Heavy components**: Lazy load modals, charts, complex visualizations
- **Third-party libs**: Load large libraries only when needed

## Optimization
- **Measure first**: Use React DevTools Profiler before optimizing
- **Memoization sparingly**: `useMemo`/`useCallback` only for expensive operations or referential equality needs
- **Avoid premature optimization**: Readable code > micro-optimizations

---

**Enforcement**: These standards are enforced via ESLint, TypeScript compiler, and code review. Violations block PR merges.
