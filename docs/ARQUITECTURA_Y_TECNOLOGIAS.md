# Arquitectura y tecnologías

FixGo IA se desarrolla como un monolito modular con frontend y backend separados dentro del mismo repositorio. La comunicación entre ambos se realiza mediante API REST.

## Frontend

Tecnologías:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- React Router.

Arquitectura:

- Arquitectura modular por funcionalidades.
- Componentes reutilizables.
- Estructura principal `app`, `modules` y `shared`.
- Diseño responsive.

Aclaración obligatoria: el frontend no utiliza arquitectura hexagonal.

Responsabilidades frontend:

- Presentación.
- Formularios.
- Navegación.
- Estados visuales.
- Consumo de API REST.
- Validaciones de experiencia de usuario.
- Accesibilidad.
- Responsive.

Estructura conceptual:

```text
frontend/src/
  app/
  modules/
  shared/
  main.tsx
```

## Backend

Tecnologías:

- NestJS.
- TypeScript.
- Prisma.
- SQLite.
- API REST.

Arquitectura:

- Monolito modular.
- Arquitectura hexagonal dentro de cada módulo.

Estructura conceptual:

```text
backend/src/modules/<modulo>/
  domain/
  application/
  infrastructure/
  presentation/
  <modulo>.module.ts
```

Responsabilidades:

- `domain`: entidades, objetos de valor, reglas de negocio y contratos de repositorios.
- `application`: casos de uso y coordinación de operaciones.
- `infrastructure`: Prisma, SQLite, repositorios, proveedores externos y adaptadores.
- `presentation`: controllers, DTO, guards y API REST.

## Reglas arquitectónicas

- Prisma solo desde `infrastructure`.
- Los controladores no contienen reglas críticas.
- React no accede directamente a SQLite.
- El dominio no depende de NestJS, Prisma o React.
- Los casos de uso coordinan las acciones.
- La comunicación frontend-backend es mediante API REST.
- Las claves de IA no se colocan en frontend.
- La IA se integra mediante puertos y adaptadores del backend.

## Recorrido completo

```text
Componente React
-> servicio HTTP frontend
-> controller NestJS
-> caso de uso
-> dominio
-> puerto de repositorio
-> repositorio Prisma
-> SQLite
```
