# Arquitectura y tecnologías

FixGo IA es un **monolito modular** con frontend y backend separados dentro del mismo repositorio. La comunicación es por **API REST** con prefijo `/api`. Este documento es la **referencia única de arquitectura** (frontend y backend); reemplaza a los documentos de arquitectura anteriores que estaban dispersos y desactualizados.

## Visión general

```text
Usuario (navegador)
  -> Frontend React (SPA, feature-modular)
    -> API REST /api (NestJS)
      -> Módulos con arquitectura hexagonal
        -> Prisma (infraestructura)
          -> SQLite (backend/database/fixgo.db)
      -> Puertos de IA -> Adaptadores (Groq / fallback local)
```

## Frontend

Tecnologías:

- React 18 + TypeScript 5.
- Vite 5 (dev server y build; `tsc -b && vite build`).
- Tailwind CSS 4 (vía plugin oficial de Vite); la mayor parte del estilo son clases CSS propias en `shared/styles`.
- React Router 6.
- Iconos: `lucide-react`.
- HTTP: `fetch` nativo (sin axios ni React Query); sin gestor de estado externo.

Arquitectura: **modular por funcionalidades** (no hexagonal). Los imports entre módulos se hacen solo por el índice público (`index.ts`) de cada módulo.

```text
frontend/src/
  app/         (App, providers, router, layouts: PublicLayout y MarketplaceLayout)
  modules/     (auth, home, categories, services, service-requests,
                professionals, budgets, service-orders, reviews,
                notifications, admin, ai)
  shared/      (components, hooks, http/httpClient, types, styles, assets)
  main.tsx
```

Sesión y roles: el **refresh token** se guarda en `localStorage` (`fixgo.refreshToken`); el **access token vive solo en memoria** y se renueva al cargar la app. Las rutas por rol usan `ProtectedRoute` (exige sesión) y `RoleProtectedRoute` (exige rol). Un guard global obliga a cambiar la clave temporal (`mustChangePassword`) antes de cualquier otra pantalla.

Cliente HTTP: `shared/http/httpClient.ts` centraliza `GET/POST/PATCH/DELETE`, añade `Authorization: Bearer <token>` automáticamente y normaliza los errores en un `ApiError` tipado. La URL base sale de `VITE_API_URL` (por defecto `http://127.0.0.1:3000/api`).

## Backend

Tecnologías:

- NestJS 10 (Express) + TypeScript 5.
- Prisma 5 + SQLite.
- Autenticación: `@nestjs/jwt` + `passport-jwt`; contraseñas con `bcryptjs`.
- Validación: `class-validator` + `class-transformer` con `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).

Arranque (`src/main.ts`): prefijo global `/api`, CORS por `CORS_ORIGIN` (por defecto puertos de Vite 5173/4173), puerto por `PORT` (defecto 3000), carga manual del `.env` local. No hay filtro de excepciones global: se usan las excepciones HTTP estándar de NestJS.

Arquitectura: **monolito modular con arquitectura hexagonal dentro de cada módulo**.

```text
backend/src/modules/<modulo>/
  domain/          (entidades, contratos de repositorio y puertos de IA)
  application/     (casos de uso / servicios de aplicación)
  infrastructure/  (repositorios Prisma, adaptadores de IA y proveedores externos)
  presentation/    (controllers, DTO, guards)
  <modulo>.module.ts
```

Módulos (13): `auth`, `users`, `clients`, `categories`, `services`, `professionals`, `service-requests`, `budgets`, `service-orders`, `reviews`, `notifications`, `artificial-intelligence`, `administration`. La capa compartida se limita a `shared/prisma.service.ts` (+ `prisma.module.ts`).

Autenticación y roles:

- `JwtAuthGuard` valida el Bearer token; `JwtStrategy` extrae `{ id, email, roles }` del token (los roles viajan dentro del JWT, no se reconsultan en cada petición).
- `RolesGuard` + `@Roles(...)` restringen por rol. Roles: `CLIENT`, `PROFESSIONAL`, `ADMIN`, `SUPER_ADMIN` (master). La jerarquía master (crear/promover/degradar admins) se valida en `administration/application/admin.service.ts`.

## Reglas arquitectónicas

- Prisma solo desde `infrastructure`.
- Los controladores no contienen reglas críticas; los casos de uso coordinan.
- El dominio no depende de NestJS, Prisma ni React.
- React nunca accede a SQLite: toda lectura/escritura pasa por la API REST.
- Las claves de IA nunca están en el frontend; la IA se integra por puertos y adaptadores del backend.
- Ambos lados tienen un verificador propio de arquitectura (`npm run architecture:check`).

## Inteligencia artificial

La IA se integra por puertos (dominio) y adaptadores (infraestructura), sin vivir en React ni en los controladores:

```text
Caso de uso -> Puerto de IA (dominio) -> Adaptador del proveedor (infraestructura)
```

Capacidades: análisis de solicitud, refinado de descripción y **corrección/redacción de texto** (`polish-text`, usado en reseñas, respuestas del profesional y observaciones de presupuesto).

Selección de proveedor: por `AI_PROVIDER` o automática según las claves disponibles, en orden **Groq → Gemini → OpenAI → fallback local basado en reglas**. Variables: `GROQ_API_KEY`/`GROQ_MODEL`, `GEMINI_API_KEY`/`GEMINI_MODEL`, `OPENAI_API_KEY`/`OPENAI_MODEL`. El proveedor real de la demo es **Groq**; si no responde, el sistema continúa con el fallback local (heurístico, sin red), de modo que el flujo nunca se rompe. El backend siempre valida y sanea la salida del modelo contra el catálogo real de categorías y servicios.

## Notificaciones

Notificaciones **dentro de la app** (campana), generadas en tiempo real por los eventos del ciclo de vida (oportunidad, presupuesto recibido/aceptado, trabajo iniciado/terminado, valoración recibida y respondida). La campana suma un aviso persistente derivado del estado real ("Trabajo terminado sin cerrar") que no se marca como leído hasta que el cliente confirma y valora. El detalle de endpoints y tipos está en [API_REST.md](./API_REST.md).

## Recorrido completo de una petición

```text
Componente React
-> servicio HTTP del frontend
-> controller NestJS (/api/...)
-> caso de uso -> dominio -> puerto de repositorio o de IA
-> adaptador Prisma / adaptador de IA
-> SQLite / proveedor de IA
```

## Persistencia

- Base oficial: SQLite (`backend/database/fixgo.db`), accedida por Prisma. El esquema Prisma modela claves foráneas como columnas escalares (`*Id`), sin relaciones `@relation`.
- El detalle de tablas está en [Diccionario de datos](../backend/docs/DICCIONARIO_DATOS.md) y [Modelo ER](../backend/docs/MODELO_ER.mmd).
