# Roadmap por fases

El desarrollo se organizó en fases pequeñas y verificables. Todas las fases del núcleo del producto están cerradas y el sistema es demostrable de extremo a extremo. Este documento describe cada fase, sus módulos y su criterio de cierre, más las fases de evolución futura que aún no se implementan.

## Criterio general de cierre

Cada fase se cerró comprobando: `architecture:check`, compilación de TypeScript, `git diff --check`, pruebas funcionales por endpoint, revisión visual cuando había interfaz y commit claro con árbol de trabajo limpio.

## Fase 1 — Frontend base — Cerrada

- Objetivo: base visual y modular del frontend.
- Módulos: `app`, `home`, `auth`, `budgets`, `professionals`, `service-requests`, `shared`.
- Entregables: rutas, navegación, layouts, componentes compartidos y responsive.

## Fase 2 — Backend y persistencia — Cerrada

- Objetivo: backend NestJS con persistencia real.
- Reglas: React no accede a SQLite; Prisma queda en infraestructura.
- Entregables: API REST, schema Prisma, base SQLite y monolito modular hexagonal.

## Fase 3 — Auth, usuarios y clientes — Cerrada

- Objetivo: autenticación completa.
- Módulos: `auth`, `users`, `clients`.
- Reglas: contraseñas cifradas (bcrypt), JWT de acceso, refresh token con sesión en base, roles y guards.
- Entregables: registro de cliente y de profesional, login, logout, refresh, `users/me`, `clients/me` y recuperación de contraseña por verificación de identidad.

## Fase 4 — Catálogo y solicitud de servicio — Cerrada

- Objetivo: marketplace real y formulario de solicitud por pasos con persistencia.
- Módulos: `categories`, `services`, `home`, `service-requests`.
- Reglas: no hardcodear catálogos en React; la publicación la confirma el cliente; estados controlados.
- Entregables: 18 categorías (8 en uso) y 19 servicios reales, búsqueda, formulario modular por pasos, borradores en backend, edición, publicación, cancelación, duplicado y "Mis solicitudes".

## Fase 5 — FixGo IA — Cerrada

- Objetivo: IA como asistente de estructuración de la solicitud.
- Módulos: `artificial-intelligence`, `service-requests`.
- Reglas: la IA sugiere y el cliente confirma; la IA nunca publica automáticamente; las claves viven solo en backend.
- Entregables: análisis estructurado (título, categoría, servicio, urgencia, presupuesto orientativo, información faltante, resumen editable) integrado por puertos y adaptadores.
- Proveedor: Groq real, con fallback local basado en reglas si el proveedor no responde. Incluye override de emergencia por palabras clave de riesgo.

## Fase 6 — Profesionales y matching — Cerrada

- Objetivo: perfiles profesionales y compatibilidad con solicitudes.
- Módulos: `professionals`, `categories`, `services`.
- Reglas: profesional activo, verificado y compatible por categoría; no puede ver su propia solicitud.
- Entregables: perfil profesional editable con avatar, verificación por admin, directorio público de profesionales con búsqueda y valoración, y oportunidades compatibles por categoría.

## Fase 7 — Presupuestos y contratación automática — Cerrada

- Objetivo: presupuestos competitivos y aceptación única.
- Módulos: `budgets`, `service-requests`, `service-orders`, `notifications`.
- Reglas: cálculo del total en backend; aceptación única en una sola transacción.
- Entregables: enviar presupuesto, ver mis presupuestos, comparar los de una solicitud, aceptar uno (los demás se rechazan automáticamente) y creación de la orden de trabajo.

## Fase 8 — Ejecución, valoración y administración — Cerrada

- Objetivo: operar el servicio contratado y cerrarlo con calidad.
- Módulos: `service-orders`, `reviews`, `notifications`, `administration`.
- Reglas: la valoración solo se permite al completar; el teléfono del profesional se libera al final del flujo.
- Entregables: iniciar y completar trabajo (profesional), confirmar (cliente), valorar con recálculo de media, notificaciones en la app y panel de administración tipo CRM con métricas y CRUD de usuarios, profesionales, solicitudes y categorías.

## Fases de evolución futura (no implementadas)

Quedan planificadas y con tablas previstas en el esquema, pero sin flujo en código todavía:

- **Mensajería**: chat en tiempo real entre cliente y profesional.
- **Notificaciones externas**: correo, SMS o push (hoy solo dentro de la app).
- **Recuperación por token/correo**: reemplazaría la verificación de identidad actual.
- **Multimedia y verificación**: fotos en solicitudes y documentos del profesional.
- **Disponibilidad y zonas**: agenda horaria, áreas de servicio y favoritos.
- **Auditoría y legal**: registro de acciones sensibles y aceptaciones legales.

Ninguna función de esta sección debe presentarse como implementada.
