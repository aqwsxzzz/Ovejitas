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
- **useEffect is an escape hatch**: Only use it to synchronize React with external systems
- **Default stance**: If logic can run during render or in an event handler, do not use `useEffect`
- **Data fetching rule**: Never fetch server data with raw `useEffect`; use TanStack Query hooks
- **Cleanup rule**: Subscriptions/listeners/timers must return cleanup

### Never use useEffect for
- **Derived state from props/state**: Compute during render
- **Expensive derived computation**: Use `useMemo`
- **Resetting state on prop change**: Use `key` to remount subtree when appropriate
- **Event-specific behavior**: Keep it in the event handler
- **POST/mutation from user action**: Trigger directly in submit/click handlers
- **Chains of effects**: Avoid cascading state updates across multiple effects
- **Parent notification caused by local state change**: Update local and parent in one event pathway
- **Server data fetching**: Use feature query hooks built on TanStack Query

### Allowed useEffect cases
- **Browser API synchronization**: Event listeners, observers, media queries
- **Third-party imperative APIs**: Non-React widgets, SDK lifecycle sync
- **Connection lifecycle**: WebSocket/session subscribe-unsubscribe
- **Mount/unmount side effects**: Analytics, telemetry, one-time app wiring

### Required patterns
- **Always declare full dependencies**: Do not suppress hook dependency rules without strong justification
- **Always provide cleanup for subscriptions**: Remove listeners, clear timers, unsubscribe
- **Prevent async races**: Guard stale async completion with an `ignore` flag or abort pattern
- **Prefer dedicated hooks**: `useSyncExternalStore` for external stores instead of ad-hoc subscription effects

```typescript
// BAD: redundant state derived via effect
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// GOOD: derive during render
const fullName = `${firstName} ${lastName}`
```

```typescript
// BAD: fetch in useEffect
useEffect(() => {
  fetch(`/api/animals/${animalId}`).then(...)
}, [animalId])

// GOOD: query hook (TanStack Query)
const { data: animal, isLoading } = useGetAnimal(animalId)
```

```typescript
// GOOD: effect for external subscription with cleanup
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])
```

```typescript
// GOOD: async race guard inside effect when external sync is required
useEffect(() => {
  let ignore = false

  const syncExternal = async () => {
    const result = await fetchSomething(id)
    if (!ignore) setData(result)
  }

  syncExternal()
  return () => {
    ignore = true
  }
}, [id])
```

### Pre-useEffect Checklist
Before writing `useEffect`, verify all answers below:
1. Can this be calculated during render?
2. Is this just an expensive calculation that belongs in `useMemo`?
3. Should state reset by changing component `key`?
4. Is this caused by a user interaction and better in an event handler?
5. Is this external store state that should use `useSyncExternalStore`?
6. Is this server data that should use TanStack Query?
7. Is this truly synchronization with an external system?

Use `useEffect` only when item 7 is true.
