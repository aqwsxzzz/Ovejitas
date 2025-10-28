# TypeScript Standards

## Type Safety
- **Zero `any` types**: Use `unknown` if type is truly unknowable, then narrow with type guards
- **Strict mode enabled**: All TypeScript strict flags must be on
- **Full type coverage**: No implicit `any`, all function signatures typed

## Type Organization
- **Single source of truth**: Types defined in `[feature]-types.ts` files
  ```typescript
  // animal-types.ts - all animal-related types
  export type Animal = { ... }
  export type AnimalEvent = { ... }
  ```
- **No duplicate type definitions**: Import from canonical source
- **Type imports**: Use `import type` for type-only imports
