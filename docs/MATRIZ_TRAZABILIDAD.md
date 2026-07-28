# Matriz de trazabilidad — FixGo IA

Relación entre cada requisito/paso del recorrido, el endpoint del backend que lo implementa y la pantalla del frontend que lo consume. Todo el backend usa prefijo `/api`. La identidad del usuario se obtiene siempre del **JWT** (`@CurrentUser`), nunca del cuerpo de la petición.

| # | Requisito / paso | Endpoint(s) backend | Frontend | Rol | Estado |
|---|------------------|---------------------|----------|-----|--------|
| 1 | Registro de cliente | `POST /auth/register` | `RegisterPage` | público→CLIENT | ✅ |
| 2 | Registro de profesional | `POST /auth/register-professional` | `RegisterPage` | público→PROFESSIONAL | ✅ |
| 3 | Inicio de sesión / refresco / logout | `POST /auth/login` `/refresh` `/logout` | `LoginPage` | todos | ✅ |
| 4 | Redirección por rol | (JWT roles) | `LoginPage` | todos | ✅ |
| 5 | Catálogo de categorías/servicios | `GET /categories` `/services` | flujo de solicitud | público | ✅ |
| 6 | IA: analizar y mejorar la descripción | `POST /ai/service-request-analysis` `/artificial-intelligence/refine-...` | `ServiceRequestPage` (`DescriptionStep`) | CLIENT | ✅ |
| 7 | Crear/editar borrador de solicitud | `POST/PATCH /service-requests/drafts[/:id]` | `ServiceRequestPage` | CLIENT | ✅ |
| 8 | Publicar solicitud (protegida por JWT) | `POST /service-requests/drafts/:id/publish` | `ServiceRequestPage` | CLIENT | ✅ |
| 9 | Listar/gestionar mis solicitudes | `GET /service-requests/mine[/:id]`, cancelar/duplicar/ocultar | `BudgetsPage` (mis solicitudes) | CLIENT | ✅ |
| 10 | Perfil profesional (alta/edición) | `GET/PATCH /professionals/me` | onboarding + `ProfessionalProfilePage` | PROFESSIONAL | ✅ |
| 11 | Oportunidades compatibles (por categoría) | `GET /professionals/me/opportunities[/:id]` | `ProfessionalOpportunitiesPage` | PROFESSIONAL | ✅ |
| 12 | Enviar presupuesto | `POST /budgets` | `SendBudgetForm` (detalle de oportunidad) | PROFESSIONAL | ✅ |
| 13 | Ver mis presupuestos enviados | `GET /budgets/mine` | `ProfessionalBudgetsPage` | PROFESSIONAL | ✅ |
| 14 | Comparar presupuestos de una solicitud | `GET /budgets/request/:id` | `RequestBudgetsPage` | CLIENT | ✅ |
| 15 | Aceptar UNO (los demás se rechazan) + crear orden | `POST /service-orders/accept-budget` (transacción) | `RequestBudgetsPage` | CLIENT | ✅ |
| 16 | Ejecución: iniciar → completar | `POST /service-orders/:id/start` `/complete` | `ProfessionalOrdersPage` | PROFESSIONAL | ✅ |
| 17 | Confirmar trabajo completado | `POST /service-orders/:id/confirm` | `ClientOrdersPage` | CLIENT | ✅ |
| 18 | Valorar al profesional (recalcula media) | `POST /reviews` | `ReviewForm` (en `ClientOrdersPage`) | CLIENT | ✅ |
| 19 | Ver valoraciones recibidas (+ notificación al valorar) | `GET /reviews/mine`, `GET /reviews/professional/:id` | `ProfessionalReviewsPage` | PROFESSIONAL/público | ✅ |
| 20 | Panel ADMIN — CRUD y métricas | `GET /admin/stats` · usuarios `GET`+`PATCH :id/status` · profesionales `GET`+`PATCH :id/verification` · solicitudes `GET`+`PATCH :id/cancel`+`DELETE :id` · categorías `GET`+`POST`+`PATCH`+`DELETE`+`PATCH :id/active` | `AdminDashboardPage` (`/admin`) | ADMIN | ✅ |
| 21 | Crear usuario (cliente/profesional/admin) + dar/quitar rol admin | `POST /admin/users` · `PATCH /admin/users/:id/admin-role` | `AdminDashboardPage` (modal) | ADMIN (crear admin y rol: solo master) | ✅ |
| 22 | Cambio de contraseña autenticado (clave temporal forzada) | `POST /auth/change-password` | `ChangePasswordPage` (`/cambiar-clave`) | autenticado | ✅ |
| 23 | Notificaciones (campana) con navegación al hacer clic | `GET /notifications` · `/unread-count` · `POST /:id/read` · `POST /read` | `NotificationBell` | autenticado | ✅ |
| 24 | Contacto del profesional liberado en la orden aceptada | (incluido en `GET /service-orders/client`) | `ClientOrdersPage` | CLIENT | ✅ |
| 25 | Insignia de nivel de cliente | (derivada de las órdenes del cliente) | `ClientOrdersPage` | CLIENT | ✅ |

## Reglas y garantías verificadas

- **Arquitectura**: backend hexagonal por módulo (dominio sin NestJS/Prisma; Prisma solo en infraestructura); frontend modular por funcionalidad con imports entre módulos solo por índice público. `npm run architecture:check` pasa en ambos.
- **Seguridad**: todos los endpoints sensibles protegidos con `JwtAuthGuard` + `RolesGuard` y `@Roles` correctos; identidad desde el JWT; el registro público no puede crear ADMIN (solo un master); los usuarios suspendidos no pueden iniciar sesión; sin fugas de datos entre usuarios (validación de propiedad en cada flujo).
- **Jerarquía de admins**: master (`SUPER_ADMIN`) vs. admin normal; los master están protegidos y solo ellos gestionan a otros administradores.
- **Clave temporal**: las cuentas creadas por administración obligan a cambiar la contraseña en el primer ingreso (`must_change_password`).
- **Aceptación única**: al aceptar un presupuesto, en una sola transacción se marca ACCEPTED, se rechazan los demás, la solicitud pasa a PROFESSIONAL_SELECTED y se crea la ServiceOrder.
- **Identidad visual**: naranja de marca; sin azul.
