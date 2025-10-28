# Import Organization

Enforce with ESLint `import/order` plugin:

```typescript
// 1. External dependencies
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal modules (lib, hooks, stores)
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/format-date'

// 3. Types
import type { Animal } from '@/features/animals/animal-types'

// 4. Styles/assets
import './AnimalCard.css'
```
