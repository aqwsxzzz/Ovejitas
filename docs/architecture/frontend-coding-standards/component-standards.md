# Component Standards

## Single Responsibility Principle
- **One component, one job**: Components should do one thing well
- **Extract complexity**: If component > 200 lines, split it

## Component Structure
```typescript
type Props = {
  animal: Animal
  onUpdate: (id: string) => void
}

export function AnimalCard({ animal, onUpdate }: Props) {
  // Early returns for edge cases
  if (!animal) return null

  // Hooks at top
  const { isOnline } = useOfflineStatus()

  // Event handlers
  const handleUpdate = () => onUpdate(animal.id)

  // Render
  return <div>...</div>
}
```

## Props & Destructuring
- **Always type props**: No inline types, define `type Props = {...}`
- **Destructure props**: `({ animal, onUpdate }: Props)` not `(props: Props)`
- **Default values in destructuring**: `({ showActions = true }: Props)`

## useEffect Rules
- **Avoid useEffect**: Default to TanStack Query for data, declarative patterns for side effects
- **Only for side effects**: Event listeners, DOM manipulation, external system sync
- **Never for data fetching**: Use TanStack Query
- **Clean up**: Always return cleanup function if adding listeners

```typescript
// ❌ BAD: useEffect for data fetching
useEffect(() => {
  fetchAnimals().then(setAnimals)
}, [])

// ✅ GOOD: TanStack Query
const { data: animals } = useQuery({
  queryKey: ['animals', farmId],
  queryFn: () => fetchAnimals(farmId)
})
```
