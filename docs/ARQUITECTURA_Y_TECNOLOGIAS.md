# Arquitectura y tecnologías

FixGo IA es un monolito modular con frontend y backend separados dentro del mismo repositorio. La comunicación entre ambos es por API REST con prefijo `/api`.

## Frontend

Tecnologías:

- React 18.
- TypeScript 5.
- Vite 5.
- Tailwind CSS 4.
- React Router 6.
- Iconos: lucide-react.
- Tipografías: Inter (texto) y Poppins (títulos), vía Google Fonts.

Arquitectura:

- Modular por funcionalidades (`app`, `modules`, `shared`).
- Componentes reutilizables y diseño responsive.
- **El frontend no utiliza arquitectura hexagonal.**
- Los imports entre módulos se hacen solo por el índice público de cada módulo.

Responsabilidades: presentación, formularios, navegación, estados visuales, validaciones de experiencia de usuario, accesibilidad y consumo de la API REST.

Estructura:

```text
frontend/src/
  app/         (router, providers, layouts)
  modules/     (auth, home, service-requests, professionals, budgets,
                service-orders, reviews, notifications, admin, categories, services)
  shared/      (components, hooks, types, utils, styles)
  main.tsx
```

Estado de sesión: el **refresh token** se guarda en `localStorage`; el **access token vive solo en memoria** y se renueva al cargar la aplicación. Las rutas por rol usan `RoleProtectedRoute`.

## Backend

Tecnologías:

- NestJS 10.
- TypeScript 5.
- Prisma 5.
- SQLite.
- Autenticación con `@nestjs/jwt` y `passport-jwt`; contraseñas con bcryptjs.
- API REST.

Arquitectura:

- Monolito modular.
- **Arquitectura hexagonal dentro de cada módulo.**

Estructura por módulo:

```text
backend/src/modules/<modulo>/
  domain/          (entidades, contratos de repositorio y de IA)
  application/     (casos de uso / servicios de aplicación)
  infrastructure/  (Prisma, adaptadores de IA, proveedores externos)
  presentation/    (controllers, DTO, guards)
  <modulo>.module.ts
```

Módulos (13): `auth`, `users`, `clients`, `categories`, `services`, `professionals`, `service-requests`, `artificial-intelligence`, `budgets`, `service-orders`, `reviews`, `notifications`, `administration`.

## Reglas arquitectónicas

- Prisma solo desde `infrastructure`.
- Los controladores no contienen reglas críticas.
- React no accede directamente a SQLite.
- El dominio no depende de NestJS, Prisma ni React.
- Los casos de uso coordinan las acciones.
- Las claves de IA no se colocan en el frontend.
- La IA se integra mediante puertos y adaptadores del backend.

Ambos lados tienen un verificador propio de arquitectura (`npm run architecture:check`).

## Inteligencia artificial

La IA se integra por puertos y adaptadores, sin vivir en React ni en los controladores:

```text
Caso de uso
  -> Puerto de IA (dominio)
    -> Adaptador del proveedor (infraestructura)
```

El adaptador selecciona proveedor por configuración (`AI_PROVIDER`) o automáticamente según las claves disponibles, en este orden: **Groq → Gemini → OpenAI → fallback local basado en reglas**. El proveedor real usado en la demostración es **Groq**. Si el proveedor no responde, el sistema continúa con el fallback local (heurístico, sin red), de modo que el flujo del cliente nunca se rompe. El backend valida y sanea siempre la salida del modelo contra el catálogo real de categorías y servicios.

## Recorrido completo de una petición

```text
Componente React
-> servicio HTTP del frontend
-> controller NestJS (/api/...)
-> caso de uso
-> dominio
-> puerto de repositorio o de IA
-> adaptador Prisma / adaptador de IA
-> SQLite / proveedor de IA
```

## Persistencia

- La base oficial es SQLite (`backend/database/fixgo.db`), accedida por Prisma.
- React nunca se conecta a la base: toda lectura y escritura pasa por la API REST.
