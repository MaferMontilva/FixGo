# Reglas de negocio

Este documento define reglas aprobadas para el producto. Algunas ya están cubiertas por código y otras pertenecen a fases futuras del roadmap. Ninguna regla futura debe presentarse como implementada hasta cerrar su fase correspondiente.

## Estado actual frente a implementación futura

- Actual: autenticación de cliente, perfil cliente, categorías y servicios reales.
- Futuro: publicación completa de solicitudes, IA, matching, presupuestos, contratación, valoraciones, notificaciones, administración y auditoría completa.

## Regla 1 - Publicación

Una solicitud solo puede publicarse cuando:

- El cliente está autenticado.
- Existe un perfil de cliente válido.
- Tiene categoría válida.
- Contiene descripción suficiente.
- Contiene ubicación general.
- Contiene urgencia válida.
- Está en un estado que permite publicación.

La IA puede sugerir datos, pero el cliente confirma. La IA no publica automáticamente.

Estado: regla aprobada para implementación futura en Fase 4C y Fase 5.

## Regla 2 - Profesionales compatibles

Un profesional solamente puede ver o presupuestar una solicitud cuando:

- Su cuenta está activa.
- Su perfil está completo.
- Está verificado.
- Trabaja en la categoría solicitada.
- Ofrece un servicio compatible cuando corresponda.
- Atiende la ciudad o zona.
- La solicitud permanece abierta.
- No es propietario de la solicitud.

Estado: regla aprobada para implementación futura en Fase 6.

## Regla 3 - Presupuestos

Un profesional:

- No puede presupuestar su propia solicitud.
- No puede tener dos presupuestos activos para la misma solicitud.
- No puede presupuestar solicitudes cerradas.
- Debe indicar importe, duración, disponibilidad y condiciones.
- Puede modificar o retirar el presupuesto mientras esté pendiente.
- No puede modificarlo después de ser aceptado.

El total definitivo se calcula en backend.

Estado: regla aprobada para implementación futura en Fase 7.

## Regla 4 - Aceptación única

El cliente solo puede aceptar un presupuesto.

La aceptación debe ejecutarse en una transacción:

- Presupuesto elegido -> `ACCEPTED`.
- Otros presupuestos -> `REJECTED`.
- Solicitud -> `PROFESSIONAL_SELECTED`.
- Servicio contratado -> creado.
- Notificaciones -> generadas.

`ACCEPTED` y `REJECTED` son estados de presupuesto, no estados de solicitud.

Debe evitar:

- Doble clic.
- Peticiones repetidas.
- Aceptación simultánea.
- Dos presupuestos aceptados.

Estado: regla aprobada para implementación futura en Fase 7.

## Regla 5 - Estados controlados

Estados actuales conocidos de solicitudes:

- `DRAFT`
- `AI_PROCESSING`
- `READY_TO_PUBLISH`
- `PUBLISHED`
- `RECEIVING_BUDGETS`
- `PROFESSIONAL_SELECTED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `EXPIRED`

No se deben inventar estados adicionales sin auditar primero el esquema.

Transiciones permitidas:

- `DRAFT` -> `AI_PROCESSING`
- `DRAFT` -> `READY_TO_PUBLISH`
- `AI_PROCESSING` -> `READY_TO_PUBLISH`
- `READY_TO_PUBLISH` -> `PUBLISHED`
- `PUBLISHED` -> `RECEIVING_BUDGETS`
- `RECEIVING_BUDGETS` -> `PROFESSIONAL_SELECTED`
- `PROFESSIONAL_SELECTED` -> `IN_PROGRESS`
- `IN_PROGRESS` -> `COMPLETED`
- Estados abiertos -> `CANCELLED`, cuando las reglas lo permitan.
- Estados publicados sin actividad -> `EXPIRED`, mediante proceso controlado.

Transiciones prohibidas:

- `COMPLETED` -> cualquier estado operativo.
- `CANCELLED` -> cualquier estado operativo.
- `EXPIRED` -> cualquier estado operativo sin reactivación explícita.
- `DRAFT` -> `PROFESSIONAL_SELECTED`.
- `PUBLISHED` -> `COMPLETED`.

Estado: regla aprobada para implementación gradual desde Fase 4C.

## Regla 6 - Valoraciones

Solo se puede valorar cuando:

- El servicio está completado.
- El cliente fue participante real.
- El profesional fue el seleccionado.
- No existe una valoración anterior.

El promedio del profesional se recalcula automáticamente.

Estado: regla aprobada para implementación futura en Fase 8.

## Regla 7 - Administración y auditoría

El administrador puede:

- Verificar profesionales.
- Suspender usuarios.
- Gestionar categorías.
- Revisar solicitudes.
- Revisar incidencias.
- Supervisar actividad.

Las acciones sensibles deben dejar registro de auditoría.

Estado: regla aprobada para implementación futura en Fase 8.

## Regla 8 - Autorización

`CLIENT`:

- Crea solicitudes.
- Publica.
- Consulta presupuestos.
- Acepta una oferta.
- Sigue el trabajo.
- Valora.

`PROFESSIONAL`:

- Gestiona perfil.
- Configura categorías y zonas.
- Consulta solicitudes compatibles.
- Envía presupuestos.
- Ejecuta trabajos asignados.

`ADMIN`:

- Verifica.
- Suspende.
- Administra catálogos.
- Supervisa.
- Audita.

No se permite registro público como `ADMIN`.

Estado: roles base existentes; permisos completos se implementarán por fase.
