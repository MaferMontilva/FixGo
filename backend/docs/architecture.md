# FixGo Backend Architecture

FixGo IA uses a modular monolith with NestJS, TypeScript, Prisma and SQLite. The backend is organized by business modules, and each functional module follows a hexagonal architecture so later phases can add use cases without reorganizing the project.

## Layers

Each functional module is organized with these layers:

- `domain`: entities, business rules, value objects and repository ports.
- `application`: application services, commands, queries and use cases.
- `infrastructure`: Prisma repositories, SQLite access and external adapters.
- `presentation`: HTTP controllers, DTOs and request/response adaptation.

Skeleton modules may contain only their NestJS `module.ts` until their functional phase starts.

## Allowed Dependencies

- `presentation` may depend on `application`.
- `application` may depend on `domain`.
- `infrastructure` may depend on `domain` and shared infrastructure such as `PrismaService`.
- NestJS modules wire ports to implementations through providers.

## Forbidden Dependencies

- `domain` must not import NestJS, Prisma, infrastructure, presentation or application.
- `application` must not import Prisma repositories, controllers, DTOs from presentation, `PrismaService` or `@prisma/client`.
- `presentation` must not import `PrismaService`, `@prisma/client`, SQLite files or concrete Prisma repositories.
- `AppModule` must not register concrete repositories directly.

## Flow

```text
Controller
-> application service or use case
-> domain port
-> Prisma repository
-> PrismaService
-> SQLite
```

## Shared Prisma Infrastructure

`PrismaService` remains in `backend/src/shared/prisma.service.ts`.

`PrismaModule` is defined in `backend/src/shared/prisma.module.ts`, provides `PrismaService`, exports it and is imported by `AppModule`. This prevents repeated manual registration of `PrismaService` in feature modules.

## Modules

- `auth`
- `users`
- `clients`
- `professionals`
- `categories`
- `services`
- `service-requests`
- `artificial-intelligence`
- `budgets`
- `reviews`
- `notifications`
- `administration`

## Current Status

- `categories`: functional. Exposes `GET /api/categories`, uses a domain repository port and Prisma implementation.
- `professionals`: functional. Exposes `GET /api/professionals`, uses a domain repository port and Prisma implementation.
- `service-requests`: partial. Exposes current `GET /api/service-requests` and `POST /api/service-requests`, keeps existing validation rules and uses a domain repository port with Prisma implementation.
- `auth`: functional for client registration and session management. Exposes `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh` and `POST /api/auth/logout`.
- `users`: functional for authenticated self-service. Exposes `GET /api/users/me`.
- `clients`: functional for the authenticated client profile. Exposes `GET /api/clients/me` and `PATCH /api/clients/me`.
- `budgets`: skeleton.
- `artificial-intelligence`: skeleton.
- `services`: skeleton.
- `reviews`: skeleton.
- `notifications`: skeleton.
- `administration`: skeleton.

## Authentication And Roles

Passwords are hashed with `bcryptjs` using cost factor `12`. Passwords and password hashes are never returned by HTTP responses.

Access tokens are JWTs signed with `JWT_ACCESS_SECRET`. The token payload is minimal: user id in `sub`, `email` and `roles`. `JWT_ACCESS_TTL_SECONDS` controls the lifetime and defaults to `900` seconds when the variable is not provided. The backend fails at startup with a clear error if `JWT_ACCESS_SECRET` is missing.

Refresh tokens are opaque random values generated with Node `crypto.randomBytes`. Only a SHA-256 hash is stored in `auth_sessions`; the raw refresh token is returned once to the client and is never persisted by the backend. `REFRESH_TOKEN_TTL_DAYS` controls the lifetime and defaults to `7` days. Refresh rotates the token and revokes the used session.

The reusable HTTP guards and decorators live in `auth/presentation`:

- `JwtAuthGuard`
- `RolesGuard`
- `@Roles(...)`
- `@CurrentUser()`

Protected controllers read identity from the access token and never trust user ids or roles sent by the frontend.

## Environment Variables

- `DATABASE_URL`: SQLite database URL consumed by Prisma.
- `JWT_ACCESS_SECRET`: required secret for access tokens.
- `JWT_ACCESS_TTL_SECONDS`: optional access token lifetime in seconds; recommended value `900`.
- `REFRESH_TOKEN_TTL_DAYS`: optional refresh token lifetime in days; recommended value `7`.
- `CORS_ORIGIN`: optional comma-separated list of frontend origins.

## Pending Features

Authentication currently covers client registration, login, refresh, logout, current user and client profile. The following remain for later phases:

- Professional authentication flow.
- Administrator authentication flow and administration panel.
- Real service-request creation connected to authenticated clients.
- AI-assisted request intake.
- Budgets, contracting, reviews and notifications.

## Future Phases

- Phase 4: `services` and `service-requests`.
- Phase 5: `artificial-intelligence`.
- Phase 6: `professionals` and `budgets`.
- Phase 7: `reviews`, `notifications` and `administration`.
