# FixGo IA

FixGo IA es una plataforma web tipo marketplace que conecta **clientes** que necesitan servicios del hogar (fontanería, electricidad, pintura, limpieza, manitas, etc.) con **profesionales** que los atienden. Incluye una capa de **inteligencia artificial** que ayuda al cliente a redactar su necesidad (autocorrección, mejora del texto y recomendación de servicio, urgencia y precio orientativo) y un **panel de administración** con CRUD de todo el sistema.

## Tecnologías

- **Frontend:** React, TypeScript, Vite, Tailwind CSS y React Router. Arquitectura **modular por funcionalidades** (no hexagonal). React consume el backend solo por **API REST**, nunca accede a la base de datos.
- **Backend:** NestJS, TypeScript, Prisma y SQLite. **Monolito modular con arquitectura hexagonal por módulo** (capas `domain` / `application` / `infrastructure` / `presentation`). El dominio no depende de NestJS ni de Prisma; Prisma vive solo en `infrastructure`.
- **IA:** por puertos/adaptadores. Proveedor activo: **Groq** (`openai/gpt-oss-20b`), con respaldo local basado en reglas si el proveedor falla.
- **Persistencia:** `backend/database/fixgo.db` (SQLite).

## Recorrido funcional completo

1. El cliente se registra e inicia sesión (el registro público nunca crea ADMIN).
2. Elige categoría/servicio y describe su necesidad; la **IA** corrige, mejora el texto y recomienda servicio, urgencia y precio orientativo.
3. Publica la solicitud.
4. El profesional (con perfil activo) ve las **oportunidades** de su categoría y zona.
5. El profesional **envía un presupuesto** (conceptos, precio, duración).
6. El cliente **compara** los presupuestos recibidos y **acepta uno**; los demás se rechazan automáticamente y se crea la **orden de trabajo** (transacción única).
7. Ejecución: el profesional **inicia** y **marca como completado**; el cliente **confirma**.
8. El cliente **valora** al profesional (estrellas + comentario); se recalcula su nota media.
9. **Panel de administrador** con CRUD de usuarios (activar/suspender), profesionales (verificar/rechazar), solicitudes (cancelar/eliminar) y categorías (crear/editar/eliminar/activar), más un resumen de métricas.

## Arranque

> **Guía paso a paso completa (recomendada para evaluar):** [docs/INSTALACION.md](docs/INSTALACION.md). La base de datos SQLite ya viene incluida con datos de demostración (`backend/database/fixgo.db`): no hay que migrar ni sembrar. Antes de arrancar el backend, copia `backend/.env.example` a `backend/.env` y define un `JWT_ACCESS_SECRET` (las claves de IA son opcionales).

Backend:

```bash
cd FixGo/backend
npm install
npm run prisma:generate
npm run start:dev        # http://localhost:3000  (API en /api)
```

Frontend (en otra terminal):

```bash
cd FixGo/frontend
npm install
npm run dev              # http://127.0.0.1:5173
```

Requisitos: `backend/.env` con `DATABASE_URL`, `JWT_ACCESS_SECRET`, `AI_PROVIDER="groq"`, `GROQ_API_KEY` y `GROQ_MODEL`.

## Cuentas de demostración

Ver [docs/CREDENCIALES_DEMO.md](docs/CREDENCIALES_DEMO.md). Resumen:

- **Administrador:** `admin@fixgo.com` / `FixGo2026`
- **Profesional:** `montilvamafer@gmail.com` / `FixGo2026`
- **Cliente demo:** `demo.cliente@example.com` / `FixGo2026`

## Verificación de calidad

- `cd backend && npm run build` y `npm run architecture:check` → sin errores.
- `cd frontend && npm run build` y `npm run architecture:check` → sin errores.
- La trazabilidad requisito ↔ implementación está en [docs/MATRIZ_TRAZABILIDAD.md](docs/MATRIZ_TRAZABILIDAD.md).

## Estructura del repositorio

- `frontend/`: rutas, módulos por funcionalidad (`auth`, `service-requests`, `budgets`, `service-orders`, `reviews`, `professionals`, `admin`, ...), componentes compartidos y consumo de API.
- `backend/`: módulos hexagonales (`auth`, `clients`, `professionals`, `service-requests`, `artificial-intelligence`, `budgets`, `service-orders`, `reviews`, `administration`, ...).
- `docs/`: documentación del proyecto.

## Identidad visual

- Naranja principal: `#F28A2E` · hover `#DC6F19` · profundo `#B95212` · logo `#FD5C03`
- Negro: `#171717` · grises. **No se usa azul.**
