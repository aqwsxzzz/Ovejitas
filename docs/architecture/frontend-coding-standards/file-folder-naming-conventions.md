# File & Folder Naming Conventions

## Files
- **Components**: PascalCase - `AnimalCard.tsx`, `EventTimeline.tsx`
- **Hooks**: camelCase with `use` prefix - `useAnimalSync.ts`, `useOfflineQueue.ts`
- **Utils/lib**: kebab-case - `format-date.ts`, `validate-animal.ts`
- **Types**: `[feature]-types.ts` - `animal-types.ts`, `farm-types.ts`
- **Stores**: `[feature]-store.ts` - `auth-store.ts`, `offline-store.ts`

## Folders
- **Features**: kebab-case - `animal-management/`, `event-tracking/`
- **Organize by feature**, not by type (avoid `components/`, `hooks/` at root)
