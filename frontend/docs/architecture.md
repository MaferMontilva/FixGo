# FixGo Frontend Architecture

FixGo IA uses React, TypeScript, Vite, Tailwind CSS and React Router. The frontend is organized with a feature-based structure that preserves the current visual identity while leaving room for later functional phases.

## Structure

- `src/app`: app composition, providers, router and layouts.
- `src/modules`: feature modules grouped by domain.
- `src/shared`: reusable components, generic hooks, HTTP client, shared styles and shared types.

## App

`app` owns the router and layout composition. It may import public module APIs from `src/modules/<module>/index.ts`, but should not reach into private module folders.

## Modules

Modules own their pages, services, types and local data. Existing modules are:

- `auth`
- `budgets`
- `categories`
- `home`
- `professionals`
- `service-requests`

Each module exposes only its public surface through `index.ts`. Other areas should use that entry point when they need a page, service or contract from the module.

## Shared

`shared` must stay independent from features and app internals. It must not import from `modules` or `app`.

Current shared resources:

- `components`: `Button`, `Card`, `FooterBar`, `Logo`, `MarketplaceHeader`, `PageContainer`, `PublicHeader`, `SearchBox`.
- `hooks`: `useAsyncData`.
- `http`: `httpClient`.
- `styles`: global CSS and Tailwind theme tokens.
- `types`: shared API error contract.

## Dependencies

Allowed:

- `app` -> `modules` public APIs.
- `app` -> `shared`.
- `modules` -> `shared`.
- `modules` -> another module only through its public `index.ts` when there is a real feature relationship.

Forbidden:

- `shared` -> `modules`.
- `shared` -> `app`.
- Deep imports between modules, such as `modules/categories/services/file`.
- Frontend imports from backend, Prisma, SQLite or server files.

## Routing

React Router is centralized in `src/app/router/AppRouter.tsx`.

Current routes:

- `/`
- `/acceder`
- `/registro`
- `/profesional/inicio`
- `/cliente/inicio`
- `/cliente/solicitar-presupuesto`
- `/cliente/mis-presupuestos`
- `/cliente/profesionales`
- `/legal/terminos`
- `/legal/privacidad`
- `/legal/cookies`
- `*`

## HTTP Client

The shared HTTP client lives in `src/shared/http/httpClient.ts`.

The frontend uses `VITE_API_URL` as the single public environment variable for the API base URL. The client normalizes the value so both `http://host:port` and `http://host:port/api` work.

The client also centralizes JSON headers, optional bearer access tokens and normalized HTTP errors. It does not import React, pages, providers or feature internals, and it does not store tokens by itself.

Category and professional fallbacks are temporary demonstration data. In development, API errors are logged before falling back.

## Authentication Session

The auth feature lives in `src/modules/auth` and is organized with:

- `api`: backend calls for register, login, refresh, logout, current user and client profile.
- `components`: auth form field and protected route components.
- `context`: `AuthProvider`.
- `hooks`: `useAuth`.
- `pages`: login and client registration pages.
- `storage`: centralized refresh-token storage.
- `types`: auth contracts.

During development, the access token is kept only in memory inside `AuthProvider`. The refresh token is stored centrally in `localStorage` as a temporary development solution so the session can be recovered after reload.

This localStorage approach has XSS risk: if malicious JavaScript runs in the browser, it could read the refresh token. A later production hardening phase should move refresh tokens to secure HTTP-only cookies or another hardened session strategy.

On startup, the provider:

1. Reads the stored refresh token.
2. Calls `POST /api/auth/refresh`.
3. Replaces the stored refresh token with the rotated value.
4. Calls `GET /api/users/me`.
5. Stores the authenticated user in memory.

If refresh fails, the stored token and in-memory session are cleared without retry loops.

The public routes remain usable without session:

- `/`
- `/acceder`
- `/registro`
- `/cliente/inicio`
- `/cliente/solicitar-presupuesto`
- `/cliente/profesionales`
- legal pages

Protected client routes redirect unauthenticated users to `/acceder`. Authenticated users with role `CLIENT` can access:

- `/cliente/mis-presupuestos`

Logout calls the backend, clears memory and removes the stored refresh token.

## Visual Identity

The visual identity uses FixGo orange, white, black and neutral grays. The main tokens are centralized in `src/shared/styles/global.css` and `src/shared/styles/tailwind.css`.

The frontend must not introduce blue as an interface color.

## Pending Features

- Phase 4B: modular `service-requests` form.
- Phase 5: `artificial-intelligence`.
- Phase 6: `professionals` and `budgets`.
- Phase 7: `reviews`, `notifications` and `administration`.

Professional login, administrator login, full service-request publication, AI, budgets, reviews and notifications are not implemented yet. Later phases should add their pages, services, types and reusable UI inside the existing structure without reorganizing the whole frontend.
