# FixGo

Proyecto creado desde cero para construir una plataforma web de servicios profesionales inspirada visualmente en Wolly, pero con identidad, colores, logo, componentes y codigo propios de FixGo.

## Estructura

- `frontend/`: React, TypeScript, Vite y estilos de interfaz.
- `backend/`: NestJS, arquitectura modular y Prisma/SQLite con base completa.
- `docs/`: decisiones de producto, diseño y proximos pasos.

## Primer arranque

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

## Base de datos

La base oficial del proyecto queda en `backend/database/fixgo.db`.

Prisma usa esta ruta desde `backend/prisma/schema.prisma`:

```env
DATABASE_URL="file:../database/fixgo.db"
```

Archivos de soporte:

- `backend/database/schema.sql`: estructura completa.
- `backend/database/seed.sql`: datos iniciales.
- `backend/database/migrations/001_initial_schema.sql`: migracion inicial reproducible.
- `backend/docs/DICCIONARIO_DATOS.md`: diccionario de tablas y campos.
- `backend/docs/MODELO_ER.mmd`: diagrama entidad-relacion.
- `backend/prisma/schema.prisma`: modelo Prisma completo compatible con SQLite.

## Identidad visual

- Naranja principal UX: `#F28A2E`
- Naranja hover: `#DC6F19`
- Naranja profundo para gradiente: `#B95212`
- Naranja del logo: `#FD5C03`
- Negro: `#171717`
- Fondo oscuro: `#080A08`
- Grises: `#F4F4F4`, `#D9D9D9`, `#555555`

El logo incluido esta en `frontend/src/shared/assets/fixgo-logo.png`.

## Arquitectura oficial

La arquitectura oficial del proyecto esta documentada en:

`docs/ARQUITECTURA_OFICIAL_FIXGO_IA.md`
