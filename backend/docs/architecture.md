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
- `auth`: skeleton.
- `users`: skeleton.
- `clients`: skeleton.
- `budgets`: skeleton.
- `artificial-intelligence`: skeleton.
- `services`: skeleton.
- `reviews`: skeleton.
- `notifications`: skeleton.
- `administration`: skeleton.

## Future Phases

- Phase 3: `auth`, `users` and `clients`.
- Phase 4: `services` and `service-requests`.
- Phase 5: `artificial-intelligence`.
- Phase 6: `professionals` and `budgets`.
- Phase 7: `reviews`, `notifications` and `administration`.
