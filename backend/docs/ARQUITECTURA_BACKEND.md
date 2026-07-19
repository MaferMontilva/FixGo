# Arquitectura backend

El backend usa NestJS con una organizacion modular orientada a arquitectura hexagonal.

## Modulos ya reorganizados

- `categories`
- `professionals`
- `service-requests`

Cada modulo funcional debe tender a esta estructura:

```text
module/
  domain/
    *.entity.ts
    *.repository.ts
  application/
    *.service.ts
    *.command.ts
  infrastructure/
    prisma/
      prisma-*.repository.ts
  presentation/
    dto/
      *.dto.ts
    http/
      *.controller.ts
  *.module.ts
```

## Responsabilidad por capa

- `domain`: tipos del negocio y contratos de repositorio.
- `application`: casos de uso, validaciones y coordinacion.
- `infrastructure`: implementacion tecnica, actualmente Prisma y SQLite.
- `presentation`: entrada HTTP, DTOs y controladores REST.

## Modulos pendientes de completar

- `auth`
- `users`
- `clients`
- `budgets`
- `artificial-intelligence`

Estos modulos existen como base, pero todavia deben migrarse a la misma estructura cuando se implemente su logica real.
