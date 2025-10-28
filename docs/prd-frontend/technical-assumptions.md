# Technical Assumptions

## Tech Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router (type-safe, file-based routing)
- **State Management**:
  - TanStack Query (server state, caching, sync)
  - Zustand (client state, offline queue)
- **Forms**: React Hook Form + Zod validation
- **UI Library**: shadcn/ui (Tailwind CSS + Radix UI primitives)
- **Offline Storage**: IndexedDB via Dexie.js
- **PWA**: Vite PWA plugin with Workbox

## Repository Structure
```
src/
├── components/     # Reusable UI components
├── features/       # Feature-based modules (animals, farms, events)
├── lib/            # Utilities, API client, offline sync
├── hooks/          # Custom React hooks
├── stores/         # Zustand stores
└── routes/         # TanStack Router file-based routes
    ├── __root.tsx
    ├── index.tsx
    └── animals/
        ├── index.tsx
        ├── $animalId.tsx
        └── new.tsx
```

## Offline & Sync Strategy
- **Cache-First**: API responses cached in IndexedDB
- **Optimistic Updates**: UI updates immediately, queue sync for later
- **Background Sync**: Use Workbox background sync for failed requests
- **Conflict Resolution**: Last-write-wins (server timestamp authoritative)

## Data Validation
- **Client-side**: Zod schemas mirror backend JSON schemas
- **Server-side**: Always validate server responses
- **User Feedback**: Inline field validation, clear error messages

## Testing Requirements
- **Unit**: Vitest for hooks, utilities, stores
- **Component**: Vitest + React Testing Library
- **E2E**: Playwright for critical user flows
- **Visual**: Manual testing (chromatic later if needed)

## Deployment
- **Platform**: Vercel (or Netlify/Cloudflare Pages)
- **CI/CD**: GitHub Actions (lint, test, build, deploy)
- **Environments**: dev, staging, production
