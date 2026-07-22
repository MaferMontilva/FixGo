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

Category and professional fallbacks are temporary demonstration data. In development, API errors are logged before falling back.

## Visual Identity

The visual identity uses FixGo orange, white, black and neutral grays. The main tokens are centralized in `src/shared/styles/global.css` and `src/shared/styles/tailwind.css`.

The frontend must not introduce blue as an interface color.

## Future Phases

- Phase 3: `auth`, `users` and `clients`.
- Phase 4: `services` and `service-requests`.
- Phase 5: `artificial-intelligence`.
- Phase 6: `professionals` and `budgets`.
- Phase 7: `reviews`, `notifications` and `administration`.

These features are not fully implemented yet. Later phases should add their pages, services, types and reusable UI inside the existing structure without reorganizing the whole frontend.
