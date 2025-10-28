# State Management

## TanStack Query (Server State)

### Pessimistic Updates Only
- **Never invalidate queries**: Use pessimistic updates, manual cache updates
- **Update cache directly**: Use `queryClient.setQueryData()`
- **Reflect server response**: UI updates only after successful mutation

```typescript
// ✅ GOOD: Pessimistic update
const mutation = useMutation({
  mutationFn: updateAnimal,
  onSuccess: (updatedAnimal) => {
    queryClient.setQueryData(['animals', farmId], (old) =>
      old?.map(a => a.id === updatedAnimal.id ? updatedAnimal : a)
    )
  }
})

// ❌ BAD: Invalidating queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['animals'] }) // NEVER DO THIS
}
```

### Query Configuration
- **Stale time**: Set appropriate `staleTime` to reduce refetches (default 5 minutes for static data)
- **Retry logic**: Configure retries for offline scenarios
- **Cache time**: `gcTime` (garbage collection) for offline support

## Zustand (Client State)
- **Client state only**: UI state, offline queue, user preferences
- **Not for server data**: Use TanStack Query for all server-derived data
- **Minimal stores**: One store per domain (auth, offline, ui)
