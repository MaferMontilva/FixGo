# FixGo IA

FixGo IA es una plataforma web para conectar clientes que necesitan servicios del hogar con profesionales que pueden atenderlos. El proyecto combina solicitudes guiadas, datos reales, reglas de negocio, presupuestos competitivos y una futura capa de inteligencia artificial para estructurar necesidades antes de publicarlas.

La documentación oficial está en [docs/README.md](docs/README.md), y el plan maestro está en [docs/PLAN_MAESTRO_FIXGO_IA.md](docs/PLAN_MAESTRO_FIXGO_IA.md).

## Tecnologías

- Frontend: React, TypeScript, Vite, Tailwind CSS y React Router.
- Backend: NestJS, TypeScript, Prisma, SQLite y API REST.
- Persistencia: `backend/database/fixgo.db`.

## Arquitectura

- El frontend utiliza arquitectura modular por funcionalidades en `app`, `modules` y `shared`.
- El frontend no utiliza arquitectura hexagonal.
- El backend utiliza un monolito modular con arquitectura hexagonal por módulo.
- React consume el backend mediante API REST y nunca accede directamente a SQLite.

## Estructura del repositorio

- `frontend/`: experiencia de usuario, rutas, módulos frontend, componentes y consumo de API.
- `backend/`: API REST, reglas de aplicación, casos de uso, puertos, adaptadores Prisma y SQLite.
- `docs/`: plan maestro, arquitectura, reglas de negocio, roadmap, estado actual y flujo Git/GitHub.

## Primer arranque

Frontend:

```bash
cd FixGo/frontend
npm install
npm run dev
```

Backend:

```bash
cd FixGo/backend
npm install
npm run prisma:generate
npm run start:dev
```

## Estado general

Fases cerradas:

- Fase 1 - frontend base: `0c09648`.
- Fase 2 - backend y persistencia: `24dbe6f`.
- Fase 3 - auth, usuarios y clientes: `a8ab256`.
- Fase 4A - categorías y servicios: `ba38956`.

La siguiente implementación funcional es la Fase 4B: formulario modular de solicitud por subpasos.

## Base de datos

La base oficial del proyecto queda en `backend/database/fixgo.db`.

Prisma usa esta ruta desde `backend/prisma/schema.prisma`:

```env
DATABASE_URL="file:../database/fixgo.db"
```

Archivos de soporte:

- `backend/database/schema.sql`: estructura completa.
- `backend/database/seed.sql`: datos iniciales.
- `backend/database/migrations/001_initial_schema.sql`: migración inicial reproducible.
- `backend/docs/DICCIONARIO_DATOS.md`: diccionario de tablas y campos.
- `backend/docs/MODELO_ER.mmd`: diagrama entidad-relación.
- `backend/prisma/schema.prisma`: modelo Prisma completo compatible con SQLite.

## Identidad visual

- Naranja principal UX: `#F28A2E`
- Naranja hover: `#DC6F19`
- Naranja profundo para gradiente: `#B95212`
- Naranja del logo: `#FD5C03`
- Negro: `#171717`
- Fondo oscuro: `#080A08`
- Grises: `#F4F4F4`, `#D9D9D9`, `#555555`

El logo incluido está en `frontend/src/shared/assets/fixgo-logo.png`.

## Documentación oficial

- [Índice documental](docs/README.md)
- [Plan maestro](docs/PLAN_MAESTRO_FIXGO_IA.md)
- [Arquitectura y tecnologías](docs/ARQUITECTURA_Y_TECNOLOGIAS.md)
- [Reglas de negocio](docs/REGLAS_DE_NEGOCIO.md)
- [Roadmap por fases](docs/ROADMAP_POR_FASES.md)
- [Estado actual](docs/ESTADO_ACTUAL_PROYECTO.md)
- [Flujo Git/GitHub](docs/FLUJO_GIT_GITHUB.md)
