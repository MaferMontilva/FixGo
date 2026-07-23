# Arquitectura backend

El backend usa NestJS con una organizacion modular orientada a arquitectura hexagonal.

## Modulos ya reorganizados

- `categories`
- `professionals`
- `service-requests`
- `services`
- `auth`
- `users`
- `clients`

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

- `budgets`
- `artificial-intelligence`
- `reviews`
- `notifications`
- `administration`

Estos modulos existen como base o esqueleto, pero todavia deben completarse cuando se implemente su logica real.
