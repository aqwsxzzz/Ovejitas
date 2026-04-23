# Backend Domain Rebuild API Mapping Guide

This guide maps the backend branch `feat/domain-rebuild` to the current frontend structure in this repo so implementation can start without re-discovering contracts.

Primary backend sources reviewed:

- `temp_repo/openapi.json`
- `temp_repo/docs/api/INDEX.md`
- `temp_repo/docs/api/auth.md`
- `temp_repo/docs/api/assets.md`
- `temp_repo/docs/api/individuals.md`
- `temp_repo/docs/domain-rebuild-plan.md`
- `temp_repo/docs/domain-notes.md`

## 1. Current Backend Scope

The rebuild branch is not a drop-in replacement for the current frontend API yet. Right now the mounted backend resources are:

- `auth`
- `assets`
- `individuals`
- `health`

Confirmed mounted routers in backend `main.py`:

- `auth`
- `asset`
- `individual`

Planned but not exposed yet in the rebuild branch docs/plan:

- `event_category`
- `event`
- `report`
- farm and membership management beyond what `auth/me` already returns

That means we can start real-data integration for authentication and core livestock structure, but not yet for dashboards, reporting, feed, finance, egg collection, or historical event flows unless the backend adds those endpoints next.

## 2. New Domain Model

The new backend replaces many domain-specific resources with three primitives:

- `asset`: any trackable farm thing
- `individual`: optional tagged instance under an asset
- `event`: planned generic activity/measurement/finance record, not exposed yet in the current branch

Important semantics from backend docs:

- `kind` answers what the asset is: `animal | crop | equipment | material | location`
- `mode` answers how it is tracked: `aggregated | individual`
- `aggregated` is for group-counted units like a flock of chickens
- `individual` is for tagged instances like cows or individually tracked animals

## 3. Exact API Surface Available Today

Base prefix:

- `/api/v1`

### Auth

| frontend concern | method | endpoint | response |
|---|---|---|---|
| register | `POST` | `/api/v1/auth/register` | `TokenPair` |
| login | `POST` | `/api/v1/auth/login` | `TokenPair` |
| refresh token | `POST` | `/api/v1/auth/refresh` | `TokenPair` |
| current user | `GET` | `/api/v1/auth/me` | `MeResponse` |

Auth response types:

- `TokenPair`: `access_token`, `refresh_token`, `token_type?`
- `MeResponse`: `{ user, memberships }`
- registration also creates a default farm and owner membership

### Assets

| frontend concern | method | endpoint | response |
|---|---|---|---|
| list farm assets | `GET` | `/api/v1/farms/{farm_id}/assets` | `Page<AssetRead>` |
| create asset | `POST` | `/api/v1/farms/{farm_id}/assets` | `AssetRead` |
| get asset | `GET` | `/api/v1/farms/{farm_id}/assets/{asset_id}` | `AssetRead` |
| update asset | `PATCH` | `/api/v1/farms/{farm_id}/assets/{asset_id}` | `AssetRead` |
| delete asset | `DELETE` | `/api/v1/farms/{farm_id}/assets/{asset_id}` | `204 No Content` |

Supported list query params from router/schema:

- `page`
- `page_size`
- `q`
- `sort`
- `kind`
- `mode`
- `date_from`
- `date_to`

### Individuals

| frontend concern | method | endpoint | response |
|---|---|---|---|
| list asset individuals | `GET` | `/api/v1/farms/{farm_id}/assets/{asset_id}/individuals` | `Page<IndividualRead>` |
| create individual | `POST` | `/api/v1/farms/{farm_id}/assets/{asset_id}/individuals` | `IndividualRead` |
| get individual | `GET` | `/api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}` | `IndividualRead` |
| update individual | `PATCH` | `/api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}` | `IndividualRead` |
| delete individual | `DELETE` | `/api/v1/farms/{farm_id}/assets/{asset_id}/individuals/{individual_id}` | `204 No Content` |

Supported list query params from router/schema:

- `page`
- `page_size`
- `q`
- `sort`
- `status`
- `date_from`
- `date_to`

## 4. Contract Differences Vs Current Frontend

This is the main migration risk area.

### 4.1 Response envelope changed

Current frontend API helpers assume legacy responses like:

```ts
{
  status: "success" | "fail" | "error",
  data: ...,
  message: string,
  meta?: ...
}
```

The rebuild backend returns plain FastAPI models instead:

- auth returns raw typed objects like `TokenPair`
- list endpoints return `{ data, meta }`
- single-resource reads return the resource object directly
- delete endpoints return `204` with no body
- validation errors use FastAPI `422` shape

Frontend implication:

- do not reuse current `IResponse<T>` assumptions for rebuild endpoints
- either add a second response contract for rebuild APIs or adapt `axiosHelper` to support both legacy and rebuild styles

### 4.2 Auth flow changed

Current frontend auth assumptions:

- signup endpoint: `/auth/signup`
- login expects wrapped `IUser`
- logout endpoint exists
- profile query selects `data.data`

Rebuild backend reality:

- register endpoint is `/auth/register`
- login returns `TokenPair`, not a wrapped user object
- there is no logout endpoint in current rebuild branch
- current user comes from `GET /auth/me`
- refresh endpoint now exists and should become part of token lifecycle

Frontend implication:

- sign-in must persist token pair and set bearer auth header
- profile must be loaded after login using `/auth/me`
- logout becomes a frontend state clear unless backend adds revocation later

### 4.3 Update methods changed

Legacy frontend code often uses `PUT` for full updates. Rebuild uses:

- `PATCH` for asset update
- `PATCH` for individual update

### 4.4 Pagination shape changed

Legacy frontend pagination often expects:

- `meta.pagination.page`
- `meta.pagination.limit`
- `meta.pagination.totalPages`

Rebuild pagination is:

```ts
{
  data: T[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
  };
}
```

Frontend implication:

- query hooks must derive `hasNextPage` from `meta.has_next`
- use `page_size`, not `limit`
- total pages are no longer returned directly

## 5. Frontend Mapping By Existing Feature Folder

This repo should integrate in place where possible, not build a parallel frontend.

### `src/features/auth`

Status:

- good first migration target

Required mapping:

- `signup` -> replace with `register`
- `login` -> expect `TokenPair`
- add `refresh`
- `getUserProfile` -> expect `MeResponse`
- `logout` -> local-only until backend exposes revocation/logout

Files likely involved first:

- `src/features/auth/api/auth-api.ts`
- `src/features/auth/api/auth-queries.ts`
- `src/features/auth/types/auth-types.ts`
- `src/lib/axios/index.ts`

### `src/features/flock`

Status:

- current flock API does not match the rebuild backend

Suggested rebuild mapping:

- flock-like production units -> `asset` with `kind="animal"` and `mode="aggregated"`

Important limitation:

- current backend branch has no event or egg-collection endpoints yet, so only basic asset CRUD/listing can move now
- flock events, egg collections, profitability, feeding logs, and similar flock-specific actions cannot be migrated yet

Files to revisit later:

- `src/features/flock/api/flock-api.ts`
- `src/features/flock/api/flock-queries.ts`

### `src/features/animal`

Status:

- current `/animals` surface does not exist in the rebuild backend

Suggested rebuild mapping:

- individually tracked animals -> `individual` records nested under an `asset` where `kind="animal"` and `mode="individual"`

Important limitation:

- the list endpoint is scoped by both `farm_id` and `asset_id`
- current frontend animal flows that assume farm-wide `/animals` access need a parent asset selection or asset context first

Files likely involved when migration starts:

- `src/features/animal/api/animal-api.ts`
- `src/features/animal/api/animal-queries.ts`
- `src/features/animal/types/animal-types.ts`

### `src/features/livestock` and `src/routes/v2.production-units.flock.$unitId.tsx`

Status:

- currently backed by `v2-mock-repository`

Suggested rebuild mapping:

- v2 production unit list/detail pages should be the first UI slice connected to real rebuild data
- initial real-data version can show asset details only
- event timelines, production charts, finance cards, and egg metrics should remain mocked or hidden until `event`/`report` endpoints land in the backend

Files directly affected in a first real-data pass:

- `src/features/livestock/pages/flock-detail-page.tsx`
- `src/shared/api/v2-mock-repository.ts`
- `src/routes/v2.production-units.flock.$unitId.tsx`

## 6. Recommended Implementation Order

This is the lowest-risk sequence given what the backend exposes today.

### Phase 1. API client foundation

1. Add rebuild-aware response typing in the frontend API layer.
2. Support bearer-token auth cleanly for `TokenPair` login/refresh.
3. Add pagination helpers for `{ data, meta: { page, page_size, total, has_next } }`.

Deliverable:

- frontend can call rebuild endpoints without pretending they use legacy envelopes

### Phase 2. Auth migration

1. Update auth API calls to `/api/v1/auth/*`.
2. Persist `access_token` and `refresh_token`.
3. Load `/auth/me` after login to get user and memberships.
4. Decide active farm from memberships in frontend state.

Deliverable:

- working login/register/me on real rebuild backend

### Phase 3. Asset integration for production units

1. Add asset types and queries.
2. Fetch `kind="animal"` assets for current farm.
3. Use `mode` to split grouped units vs individually tracked units in UI.
4. Replace livestock production-unit mock listing with asset list data.

Deliverable:

- v2 production-unit list can come from real backend assets

### Phase 4. Individual integration

1. Introduce individual API/query helpers.
2. Load individuals under a selected asset.
3. Map current animal detail/list screens to asset-scoped individual data.

Deliverable:

- individually tracked animal views can run on real backend data

### Phase 5. Event/report migration

Blocked until backend exposes:

- `event`
- `event_category`
- `report`

This phase is required before migrating:

- measurements
- finance
- flock events
- egg collection
- feed consumption derived from events
- production charts
- profitability

## 7. Suggested Type Contracts For Frontend

These shapes match the rebuild backend as documented.

```ts
export interface ApiPageMeta {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface ApiPage<T> {
  data: T[];
  meta: ApiPageMeta;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface FarmMembershipRead {
  farm_id: number;
  role: string;
}

export interface MeResponse {
  user: {
    id: number;
    email: string;
    name: string;
    created_at: string;
  };
  memberships: FarmMembershipRead[];
}

export type AssetKind =
  | "animal"
  | "crop"
  | "equipment"
  | "material"
  | "location";

export type AssetMode = "aggregated" | "individual";

export type IndividualStatus =
  | "active"
  | "sold"
  | "deceased"
  | "archived";
```

## 8. Decisions The Frontend Needs Early

These should be settled before broad migration work.

### Decision A. Keep legacy feature names or introduce rebuild-named modules?

Recommendation:

- keep UI feature folders where they already own the screen
- add new backend-facing modules where semantics actually changed
- avoid pretending `/animals` and `/flocks` still exist if they do not

Practical example:

- keep livestock pages in place
- add `asset` and `individual` API/query types for the rebuild contracts
- only keep `animal` or `flock` modules if they become thin UI adapters over the new primitives

### Decision B. What is the active farm source of truth?

Backend `GET /auth/me` returns memberships, not a single active farm.

Frontend needs one rule for:

- choosing the default active farm after login
- persisting active farm selection
- passing `farm_id` into every farm-scoped request

### Decision C. How should logout behave until backend adds revocation?

Recommendation:

- clear stored tokens
- clear auth/user/farm query cache
- redirect to login

## 9. Known Gaps Blocking Full Replacement

These frontend areas cannot move to real rebuild backend data yet because the endpoints are not exposed in the reviewed branch.

- flock detail metrics derived from production events
- egg collections
- feeding logs
- finance summaries
- measurements
- dashboards and reports
- category-driven event workflows

If the next backend step is being planned, the highest-value additions for the current frontend are:

1. `event_category`
2. `event`
3. report endpoints for dashboard and profitability summaries

## 10. Recommended First Frontend Ticket Slice

The best first implementation slice is:

1. migrate auth to rebuild endpoints
2. add rebuild-compatible API typing and pagination support
3. add asset list query for `kind=animal`
4. replace the v2 production-unit list screen mock with real asset data

That sequence uses only currently available backend resources and creates the foundation needed for every later domain.

## 11. Supporting Files In This Repo

Generated endpoint matrix:

- `docs/backend-rebuild-openapi-matrix.txt`

Backend docs inspected from the cloned branch:

- `temp_repo/docs/api/INDEX.md`
- `temp_repo/docs/api/auth.md`
- `temp_repo/docs/api/assets.md`
- `temp_repo/docs/api/individuals.md`
