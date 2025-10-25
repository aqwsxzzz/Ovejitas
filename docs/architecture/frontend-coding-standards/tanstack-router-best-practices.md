# TanStack Router Best Practices

## File-Based Routing
```
src/routes/
├── __root.tsx              # Root layout
├── index.tsx               # Home route
├── animals/
│   ├── index.tsx           # /animals
│   ├── $animalId.tsx       # /animals/:animalId
│   └── new.tsx             # /animals/new
```

## Type-Safe Routes
- **Generate types**: Use `tsr generate` for type generation
- **Route definitions**: Export typed route configs
- **Search params**: Validate with Zod schemas

```typescript
import { z } from 'zod'

const animalSearchSchema = z.object({
  species: z.enum(['bovine', 'ovine', 'porcine']).optional(),
  page: z.number().default(1)
})

export const Route = createFileRoute('/animals/')({
  validateSearch: animalSearchSchema
})
```

## Data Loading
- **Use loaders**: Colocate data requirements with routes
- **Preload on hover**: Enable link preloading for instant navigation
- **Defer non-critical data**: Use `defer()` for below-fold content
