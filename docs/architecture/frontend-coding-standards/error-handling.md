# Error Handling

## Error Boundaries
- **Top-level boundary**: Catch all unhandled errors
- **Feature boundaries**: Isolate failures to features
- **Fallback UI**: User-friendly error messages, retry actions

## TanStack Query Errors
- **Handle error states**: Always render `error` state from queries
- **User-friendly messages**: Map error codes to readable messages
- **No stack traces in UI**: Log to console/monitoring, show friendly message

## Offline Handling
- **Detect offline**: Use `navigator.onLine` + actual connectivity checks
- **Queue mutations**: Store failed requests in IndexedDB
- **Retry on reconnect**: Process queue when online
