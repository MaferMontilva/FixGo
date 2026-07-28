# Estado actual del proyecto

FixGo IA está funcional de extremo a extremo. El recorrido completo —registro, solicitud asistida por IA, publicación, matching, presupuestos, contratación, ejecución, valoración y administración— está implementado y se puede demostrar con datos reales cargados en la base.

Última revisión: julio 2026.

## Resumen ejecutivo

| Área | Estado |
|------|--------|
| Autenticación (cliente, profesional, admin) + JWT + roles | Implementado |
| Recuperación de contraseña por verificación de identidad | Implementado |
| Cambio de contraseña autenticado + clave temporal forzada al primer ingreso | Implementado |
| Jerarquía de administradores (master vs. admin normal) | Implementado |
| Bloqueo de login para usuarios suspendidos | Implementado |
| Catálogo de categorías y servicios reales | Implementado |
| Solicitud de servicio asistida por IA (Groq + fallback) | Implementado |
| Borradores, publicación y gestión de solicitudes | Implementado |
| Perfil profesional y matching por categoría | Implementado |
| Oportunidades compatibles para profesionales (excluye rechazados/suspendidos) | Implementado |
| Presupuestos y aceptación única transaccional | Implementado |
| Órdenes de trabajo (iniciar, completar, confirmar) + liberación del contacto | Implementado |
| Valoraciones con recálculo de media + notificación al profesional | Implementado |
| Insignias de nivel de cliente (nuevo, junior, pro, élite) | Implementado |
| Notificaciones en la app (campana) con clic que lleva a la pantalla | Implementado |
| Panel de administración (CRM) con métricas, dinero generado, buscadores y CRUD | Implementado |
| Crear usuarios (cliente/profesional/admin) desde el panel | Implementado |

## Arquitectura confirmada

- **Backend**: NestJS con arquitectura hexagonal por módulo (dominio, aplicación, infraestructura, presentación). Prisma vive solo en infraestructura. `npm run architecture:check` pasa.
- **Frontend**: React + TypeScript + Vite, modular por funcionalidad. No usa hexagonal. `npm run architecture:check` pasa.
- **Persistencia**: SQLite con Prisma. React nunca accede a la base; todo pasa por la API REST con prefijo `/api`.
- **IA**: integrada por puertos y adaptadores. Proveedor real Groq con fallback local basado en reglas.

## Módulos backend implementados (13)

`auth`, `users`, `clients`, `categories`, `services`, `professionals`, `service-requests`, `artificial-intelligence`, `budgets`, `service-orders`, `reviews`, `notifications`, `administration`.

## Módulos frontend implementados (11)

`auth`, `home`, `categories`, `services`, `service-requests`, `professionals`, `budgets`, `service-orders`, `reviews`, `notifications`, `admin`.

## Base de datos

Archivo activo:

```text
backend/database/fixgo.db
```

Contenido real de demostración (verificado en la base activa):

| Entidad | Cantidad |
|---------|----------|
| Usuarios | 35 |
| — Administradores | 3 (2 master + 1 normal) |
| — Clientes | 7 |
| — Profesionales | 25 |
| Perfiles profesionales (verificados) | 25 |
| Categorías | 18 (8 en uso con profesionales) |
| Servicios | 19 |
| Solicitudes de servicio | 94 |
| Presupuestos | 76 |
| Órdenes de trabajo | 74 |
| Valoraciones | 74 |

Las cifras de solicitudes, presupuestos, órdenes y valoraciones crecen con el uso (son datos reales, no fijos). Las notificaciones tampoco se siembran: se generan en tiempo real cuando ocurren los eventos (nueva oportunidad, presupuesto recibido, presupuesto aceptado, nueva valoración).

## Cómo levantar el proyecto

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173` y la API en `http://localhost:3000/api`.

## Credenciales de demostración

Todas las cuentas de prueba usan la contraseña **`FixGo2026`** (salvo las cuentas personales del autor). El detalle está en:

- [CREDENCIALES_DEMO.md](./CREDENCIALES_DEMO.md) — cuentas por rol para el recorrido.
- [CREDENCIALES_PROFESIONALES.md](./CREDENCIALES_PROFESIONALES.md) — los 24 profesionales de catálogo por categoría.

## Alcance no incluido (roadmap futuro)

El esquema de base contempla tablas para funciones que aún no tienen flujo en código y quedan como evolución futura:

- Mensajería en tiempo real entre cliente y profesional (chat).
- Notificaciones por correo, SMS o push (hoy solo hay notificación dentro de la app).
- Recuperación de contraseña por token/correo (hoy es por verificación de identidad; el cambio autenticado y la clave temporal forzada sí están implementados).
- Carga de fotografías en solicitudes y documentos verificables del profesional.
- Matching por zona geográfica y disponibilidad horaria (hoy el matching es por categoría).
- Permisos granulares por administrador (hoy existe la jerarquía master vs. admin normal).
- Auditoría completa y aceptaciones legales.
- Recompensas asociadas a las insignias de cliente (hoy la insignia es solo de clasificación/motivación).

Estas funciones no deben presentarse como implementadas. El detalle por fase está en [ROADMAP_POR_FASES.md](./ROADMAP_POR_FASES.md).
