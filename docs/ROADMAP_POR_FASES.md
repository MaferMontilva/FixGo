# Roadmap por fases

Cada fase debe diferenciar objetivo, módulos implicados, reglas, entregables, pruebas y criterio de cierre.

## Criterio general de cierre

- `architecture:check`.
- TypeScript.
- Build cuando el entorno lo permita.
- `git diff --check`.
- Pruebas funcionales.
- Pruebas visuales cuando aplique.
- Informe.
- Commit claro.
- Working tree limpio.

## Fase 1 - Frontend base

Estado: cerrada.

Commit: `0c09648`.

- Objetivo: crear la base visual y modular del frontend.
- Módulos implicados: `app`, `home`, `auth`, `budgets`, `professionals`, `service-requests`, `shared`.
- Reglas: respetar identidad visual FixGo y arquitectura modular por funcionalidades.
- Entregables: rutas, navegación, layouts, componentes compartidos y responsive base.
- Pruebas: architecture check, TypeScript, build y revisión visual.
- Criterio de cierre: frontend estable sin reemplazarlo desde cero.

El frontend no queda congelado. Podrá modificarse en fases futuras para completar flujos, mejorar responsive, corregir navegación, mejorar accesibilidad, integrar datos reales, mostrar estados y errores, mostrar acciones según rol, integrar presupuestos, matching, IA, notificaciones y administración. Cada cambio debe conservar la arquitectura modular.

## Fase 2 - Backend y persistencia

Estado: cerrada.

Commit: `24dbe6f`.

- Objetivo: establecer backend NestJS con persistencia real.
- Módulos implicados: módulos backend base, Prisma y SQLite.
- Reglas: React no accede a SQLite; Prisma queda en infraestructura.
- Entregables: API REST, schema Prisma, base SQLite y monolito modular.
- Pruebas: architecture check, build y consultas de lectura.
- Criterio de cierre: backend arranca y conecta con base real.

## Fase 3 - Auth, usuarios y clientes

Estado: cerrada en código.

Commit: `a8ab256`.

- Objetivo: implementar autenticación de cliente.
- Módulos implicados: `auth`, `users`, `clients`.
- Reglas: contraseñas cifradas, JWT, refresh token, roles y guards.
- Entregables: registro, login, logout, refresh, `users/me` y `clients/me`.
- Pruebas: registro, login, JWT y rutas protegidas.
- Criterio de cierre: flujo de cliente funcional en código.

Pendiente operativo: crear cliente demo mediante API cuando la base activa no contenga usuarios, probar registro, login, JWT, `users/me` o `clients/me`, y validar ingreso desde React.

## Fase 4A - Categorías y servicios

Estado: cerrada.

Commit: `ba38956`.

- Objetivo: conectar marketplace con categorías y servicios reales.
- Módulos implicados: `categories`, `services`, `home`, `service-requests`.
- Reglas: no hardcodear catálogos reales en React.
- Entregables: ocho categorías principales, diecinueve servicios, endpoints y búsqueda.
- Pruebas: endpoints, búsqueda, selección y responsive.
- Criterio de cierre: marketplace consume API real y mantiene identidad visual.

## Fase 4B - Formulario modular

Estado: próxima implementación. No está completada.

- Objetivo: construir el formulario de solicitud por pasos.
- Módulos implicados: `service-requests`, `categories`, `services`, `auth`.
- Reglas: no publicar todavía; validar datos progresivamente.
- Entregables: indicador de pasos, categoría, servicio, descripción, datos del trabajo, revisión y borrador local.
- Pruebas: navegación por pasos, query params, validaciones, responsive y ausencia de pantallas rotas.
- Criterio de cierre: formulario modular estable sin persistencia final.

Subpasos:

- 4B.1 preparación estable.
- 4B.2 indicador de pasos.
- 4B.3 categoría.
- 4B.4 servicio.
- 4B.5 descripción.
- 4B.6 datos del trabajo.
- 4B.7 revisión.
- 4B.8 borrador local.
- 4B.9 pruebas y cierre.

## Fase 4C - Persistencia y publicación

- Objetivo: persistir borradores y publicar solicitudes.
- Módulos implicados: `service-requests`, `clients`, `auth`.
- Reglas: publicación completa confirmada por cliente y estados controlados.
- Entregables: crear borrador backend, editar, publicar, cancelar y Mis solicitudes.
- Pruebas: propiedad, estados, validaciones y errores.
- Criterio de cierre: solicitudes reales publicables por cliente autenticado.

## Fase 4D - Fotografías y Mis solicitudes

- Objetivo: completar gestión visual de solicitudes.
- Módulos implicados: `service-requests`, adjuntos y frontend cliente.
- Reglas: límites, formatos y acceso por propietario.
- Entregables: fotografías, listado, detalle y filtros por estado.
- Pruebas: carga, validación, visualización y responsive.
- Criterio de cierre: gestión visual operativa sin romper publicación.

## Fase 5 - FixGo IA

- Objetivo: integrar IA como asistente de estructuración.
- Módulos implicados: `artificial-intelligence`, `service-requests`.
- Reglas: la IA sugiere, el cliente confirma y nunca publica automáticamente.
- Entregables: análisis estructurado, sugerencias, información faltante, urgencia, precio orientativo y resumen editable.
- Pruebas: respuesta válida, fallo de proveedor y continuidad manual.
- Criterio de cierre: IA integrada mediante backend y adaptadores.

## Fase 6 - Profesionales y matching

- Objetivo: crear perfiles profesionales y compatibilidad con solicitudes.
- Módulos implicados: `professionals`, `categories`, `services`, zonas y disponibilidad.
- Reglas: profesional activo, completo, verificado, compatible y dentro de zona.
- Entregables: perfil, categorías, servicios, zonas, disponibilidad, verificación y matching.
- Pruebas: compatibilidad, filtros y permisos.
- Criterio de cierre: profesionales ven solicitudes compatibles.

La cantidad de profesionales de demostración queda pendiente de confirmación.

## Fase 7 - Presupuestos y contratación automática

- Objetivo: permitir presupuestos competitivos y aceptación única.
- Módulos implicados: `budgets`, `service-requests`, `notifications`.
- Reglas: una propuesta activa por profesional y solicitud, cálculo backend, aceptación única y transacción.
- Entregables: crear, modificar, retirar, comparar y aceptar presupuesto; rechazo automático de los demás.
- Pruebas: concurrencia, doble clic, permisos y estados.
- Criterio de cierre: solo puede quedar un presupuesto aceptado por solicitud.

## Fase 8 - Ejecución, calidad y cierre

- Objetivo: completar operación del servicio contratado.
- Módulos implicados: servicio contratado, `notifications`, `reviews`, `administration`, `audit`.
- Reglas: seguimiento del trabajo, valoración solo al completar, administración con auditoría.
- Entregables: ejecución, finalización, notificaciones, valoraciones, administración, auditoría, calidad y documentación final.
- Pruebas: flujos por rol, permisos, auditoría y presentación.
- Criterio de cierre: sistema demostrable de extremo a extremo.
