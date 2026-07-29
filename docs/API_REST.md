# API REST — FixGo IA

Inventario real de la API del backend (NestJS). Todas las rutas cuelgan del prefijo global **`/api`**.

- **Autenticación:** JWT (Bearer). El *access token* viaja en la cabecera `Authorization: Bearer <token>`; los roles van dentro del token.
- **Guards:** `JwtAuthGuard` (exige sesión) y `RolesGuard` + `@Roles(...)` (exige rol). Las rutas marcadas como *pública* no requieren token.
- **Validación:** `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`). Las entradas se validan con DTO (`class-validator`).
- **Roles:** `CLIENT`, `PROFESSIONAL`, `ADMIN`, `SUPER_ADMIN` (este último es el administrador *master*).

Todos los endpoints listados están **implementados y conectados** con el frontend, salvo donde se indique.

## Autenticación (`auth`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar cliente (exige nombre, apellido, email, contraseña, **teléfono y dirección**) |
| POST | `/api/auth/register-professional` | Público | Registrar profesional (además, negocio opcional; **teléfono y dirección obligatorios**) |
| POST | `/api/auth/login` | Público | Iniciar sesión; devuelve access + refresh token |
| POST | `/api/auth/refresh` | Público | Renovar el access token con el refresh token |
| POST | `/api/auth/logout` | JWT | Revocar la sesión (refresh) |
| POST | `/api/auth/reset-password` | Público | Restablecer contraseña por verificación de identidad (nombre, apellido, email) |
| POST | `/api/auth/change-password` | JWT | Cambiar la propia contraseña (también cubre la clave temporal forzada) |

## Usuarios y perfiles

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| GET | `/api/users/me` | JWT | Datos del usuario autenticado |
| GET | `/api/clients/me` | JWT + CLIENT | Perfil de cliente |
| PATCH | `/api/clients/me` | JWT + CLIENT | Actualizar perfil de cliente |

## Catálogo (`categories`, `services`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| GET | `/api/categories` | Público | Listar categorías (`?scope=marketplace`) |
| GET | `/api/categories/:slug` | Público | Categoría por slug |
| GET | `/api/services` | Público | Listar servicios (`?category`, `?search`) |
| GET | `/api/services/:slug` | Público | Servicio por slug |

## Profesionales (`professionals`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| GET | `/api/professionals` | Público | Directorio de profesionales |
| GET | `/api/professionals/compatible-count` | Público | Nº de profesionales compatibles (`?categoryId`, `?location`) — usado antes de publicar |
| GET | `/api/professionals/me` | JWT + PROFESSIONAL | Mi perfil profesional |
| PATCH | `/api/professionals/me` | JWT + PROFESSIONAL | Crear/actualizar mi perfil |
| GET | `/api/professionals/me/opportunities` | JWT + PROFESSIONAL | Solicitudes compatibles (por categoría y provincia) |
| GET | `/api/professionals/me/opportunities/:id` | JWT + PROFESSIONAL | Detalle de una oportunidad |
| POST | `/api/professionals/me/opportunities/:id/dismiss` | JWT + PROFESSIONAL | Descartar una oportunidad con un motivo interno (deja de mostrarse; no se avisa al cliente) |

## Solicitudes de servicio (`service-requests`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/service-requests/drafts` | JWT + CLIENT | Crear borrador |
| GET | `/api/service-requests/drafts` | JWT + CLIENT | Mis borradores |
| GET | `/api/service-requests/drafts/:id` | JWT + CLIENT | Detalle de borrador |
| PATCH | `/api/service-requests/drafts/:id` | JWT + CLIENT | Actualizar borrador |
| POST | `/api/service-requests/drafts/:id/publish` | JWT + CLIENT | Publicar la solicitud |
| GET | `/api/service-requests/mine` | JWT + CLIENT | Mis solicitudes publicadas |
| GET | `/api/service-requests/mine/:id` | JWT + CLIENT | Detalle de mi solicitud |
| POST | `/api/service-requests/:id/cancel` | JWT + CLIENT | Cancelar solicitud |
| POST | `/api/service-requests/:id/duplicate-as-draft` | JWT + CLIENT | Reabrir una cancelada como borrador |
| DELETE | `/api/service-requests/:id` | JWT + CLIENT | Ocultar/borrar lógico (soft delete) |

## Presupuestos (`budgets`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/budgets` | JWT + PROFESSIONAL | Enviar presupuesto a una solicitud |
| GET | `/api/budgets/mine` | JWT + PROFESSIONAL | Mis presupuestos enviados |
| GET | `/api/budgets/request/:requestId` | JWT + CLIENT | Presupuestos recibidos en mi solicitud |

## Órdenes de trabajo (`service-orders`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/service-orders/accept-budget` | JWT + CLIENT | Aceptar un presupuesto → crea la orden (rechaza el resto) |
| GET | `/api/service-orders/client` | JWT + CLIENT | Mis servicios contratados (incluye contacto del profesional) |
| GET | `/api/service-orders/professional` | JWT + PROFESSIONAL | Mis trabajos (incluye contacto del cliente: nombre, teléfono, dirección) |
| POST | `/api/service-orders/:id/start` | JWT + PROFESSIONAL | Iniciar el trabajo (notifica al cliente) |
| POST | `/api/service-orders/:id/complete` | JWT + PROFESSIONAL | Marcar como terminado (notifica al cliente para confirmar y valorar) |
| POST | `/api/service-orders/:id/confirm` | JWT + CLIENT | Confirmar el trabajo terminado |

## Valoraciones (`reviews`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/reviews` | JWT + CLIENT | Crear valoración (solo sobre trabajos completados) |
| GET | `/api/reviews/mine` | JWT + PROFESSIONAL | Valoraciones recibidas |
| GET | `/api/reviews/professional/:id` | Público | Valoraciones públicas de un profesional |
| POST | `/api/reviews/:id/reply` | JWT + PROFESSIONAL | Responder una valoración (notifica al cliente) |

## Notificaciones (`notifications`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| GET | `/api/notifications` | JWT | Mis notificaciones |
| GET | `/api/notifications/unread-count` | JWT | Nº de no leídas |
| POST | `/api/notifications/read` | JWT | Marcar todas como leídas |
| POST | `/api/notifications/:id/read` | JWT | Marcar una como leída |

Tipos de notificación generados: `OPPORTUNITY_AVAILABLE`, `BUDGET_RECEIVED`, `BUDGET_ACCEPTED`, `BUDGET_NOT_SELECTED`, `WORK_STARTED`, `WORK_COMPLETED`, `REVIEW_RECEIVED`, `REVIEW_REPLY`. Además, la campana muestra un aviso persistente derivado del estado real ("Trabajo terminado sin cerrar") que no se borra hasta que el cliente confirma y valora.

## Administración (`administration`)

Todas requieren **JWT + ADMIN**. Las acciones sobre otros administradores exigen **SUPER_ADMIN** (master), validado en el servicio.

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/api/admin/stats` | Métricas globales (incluye dinero generado) |
| GET | `/api/admin/users` | Listar usuarios |
| POST | `/api/admin/users` | Crear usuario (crear ADMIN requiere master) |
| PATCH | `/api/admin/users/:id/status` | Cambiar estado (activar/suspender) |
| PATCH | `/api/admin/users/:id/admin-role` | Otorgar/quitar rol de administrador (solo master) |
| GET | `/api/admin/professionals` | Listar profesionales |
| PATCH | `/api/admin/professionals/:id/verification` | Cambiar estado de verificación |
| GET | `/api/admin/service-requests` | Listar solicitudes |
| PATCH | `/api/admin/service-requests/:id/cancel` | Cancelar una solicitud |
| DELETE | `/api/admin/service-requests/:id` | Eliminar una solicitud |
| GET | `/api/admin/categories` | Listar categorías |
| POST | `/api/admin/categories` | Crear categoría |
| PATCH | `/api/admin/categories/:id` | Actualizar categoría |
| PATCH | `/api/admin/categories/:id/active` | Activar/desactivar categoría |
| DELETE | `/api/admin/categories/:id` | Eliminar categoría |

## Inteligencia artificial (`artificial-intelligence`)

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| POST | `/api/ai/service-request-analysis` | JWT + CLIENT | Analizar una solicitud (tipo de trabajo, urgencia, precio orientativo, descripción mejorada) |
| POST | `/api/ai/refine-service-request-description` | JWT + CLIENT | Integrar detalles y pulir la descripción |
| POST | `/api/artificial-intelligence/refine-service-request-description` | JWT + CLIENT | Alias de la ruta anterior (mismo caso de uso) |
| POST | `/api/ai/polish-text` | JWT + CLIENT / PROFESSIONAL | Corregir/redactar texto (reseñas, respuestas, observaciones de presupuesto) |

Todos los endpoints de IA responden `provider` (`groq` \| `local-fallback`) y `model`, de modo que la interfaz sabe si contestó Groq o el respaldo local heurístico.

## Notas

- No hay filtro de excepciones global ni Swagger/OpenAPI; los errores se devuelven con las excepciones HTTP estándar de NestJS (`NotFoundException`, `ForbiddenException`, `ConflictException`, etc.).
- El endpoint de refinado de descripción existe con dos rutas base (`/api/ai/...` y `/api/artificial-intelligence/...`) que resuelven al mismo caso de uso.
