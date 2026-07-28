# Reglas de negocio

Este documento define las reglas del producto. Salvo que se indique lo contrario, las reglas descritas están **cubiertas por código** en el sistema actual. Las reglas de evolución futura se marcan de forma explícita.

## Regla 1 — Publicación de solicitudes — Implementada

Una solicitud solo puede publicarse cuando:

- El cliente está autenticado (identidad tomada del JWT, nunca del cuerpo).
- Existe un perfil de cliente válido.
- Tiene categoría válida.
- Contiene descripción suficiente.
- Contiene urgencia válida.
- Está en un estado que permite publicación.

La IA puede sugerir datos, pero el cliente confirma. La IA no publica automáticamente.

## Regla 2 — Profesionales compatibles — Implementada

Un profesional solo ve una solicitud como oportunidad cuando:

- Su cuenta está activa.
- Su perfil está verificado.
- Trabaja en la categoría solicitada.
- La solicitud permanece abierta.
- No es propietario de la solicitud.

El emparejamiento actual se realiza por **categoría**. La compatibilidad por zona geográfica y disponibilidad horaria queda como evolución futura.

## Regla 3 — Presupuestos — Implementada

Un profesional:

- No puede presupuestar su propia solicitud.
- No puede tener dos presupuestos activos para la misma solicitud.
- No puede presupuestar solicitudes cerradas.
- Indica importe, condiciones y detalle de la oferta.
- No puede modificarlo después de ser aceptado.

El total definitivo se calcula en backend.

## Regla 4 — Aceptación única — Implementada

El cliente solo puede aceptar un presupuesto. La aceptación se ejecuta en **una sola transacción**:

- Presupuesto elegido → `ACCEPTED`.
- Otros presupuestos → `REJECTED`.
- Solicitud → `PROFESSIONAL_SELECTED`.
- Orden de trabajo → creada.
- Notificaciones → generadas.

`ACCEPTED` y `REJECTED` son estados de presupuesto, no de solicitud. La transacción evita doble clic, peticiones repetidas y que queden dos presupuestos aceptados.

## Regla 5 — Estados controlados — Implementada

Estados de solicitud usados por el sistema:

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

Transiciones permitidas principales:

- `DRAFT` → `AI_PROCESSING` → `READY_TO_PUBLISH` → `PUBLISHED`
- `PUBLISHED` → `RECEIVING_BUDGETS` → `PROFESSIONAL_SELECTED`
- `PROFESSIONAL_SELECTED` → `IN_PROGRESS` → `COMPLETED`
- Estados abiertos → `CANCELLED` cuando las reglas lo permiten.

Transiciones prohibidas: desde `COMPLETED`, `CANCELLED` o `EXPIRED` hacia estados operativos; `DRAFT` → `PROFESSIONAL_SELECTED`; `PUBLISHED` → `COMPLETED`.

La orden de trabajo tiene su propio ciclo: `PENDING_START` → iniciada por el profesional → completada por el profesional → confirmada por el cliente.

## Regla 6 — Valoraciones — Implementada

Solo se puede valorar cuando:

- El servicio está completado.
- El cliente fue participante real.
- El profesional fue el seleccionado.
- No existe una valoración anterior.

El promedio del profesional se recalcula automáticamente y se muestra en su perfil y en el directorio. Al registrarse una valoración, el profesional recibe una notificación en la app.

## Regla 7 — Administración — Implementada

El administrador puede, desde el panel `/admin`:

- Verificar o rechazar profesionales.
- Suspender o activar usuarios.
- Crear usuarios (cliente, profesional o administrador) con clave temporal.
- Otorgar o quitar el rol de administrador a un usuario existente.
- Crear, editar, activar/desactivar y eliminar categorías.
- Revisar, cancelar y eliminar solicitudes.
- Consultar métricas globales, incluido el dinero generado (total y por categoría), y buscar en cada listado.

El registro de auditoría formal de acciones sensibles queda como evolución futura.

## Regla 8 — Autorización — Implementada

`CLIENT`: crea y publica solicitudes, consulta presupuestos, acepta una oferta, sigue el servicio y valora.

`PROFESSIONAL`: gestiona su perfil, consulta oportunidades compatibles, envía presupuestos y ejecuta trabajos asignados.

`ADMIN`: verifica, suspende, administra catálogos, gestiona usuarios y supervisa.

No se permite registro público como `ADMIN`: las cuentas de administrador solo las crea un administrador master (o se cargan por semilla). Un usuario **suspendido no puede iniciar sesión**. Todos los endpoints sensibles están protegidos con `JwtAuthGuard` + `RolesGuard` y la identidad se toma siempre del JWT.

## Regla 9 — Privacidad del contacto — Implementada

El teléfono del profesional no se muestra durante la exploración ni en la comparación de presupuestos. Se libera al cliente únicamente al final del flujo, una vez creada y aceptada la orden de trabajo.

## Regla 10 — Jerarquía de administradores — Implementada

Existen dos niveles de administrador:

- **Administrador master** (`SUPER_ADMIN`): puede crear administradores y otorgar/quitar el rol de administrador a otros usuarios, además de todo lo de un admin normal.
- **Administrador normal** (`ADMIN`): gestiona clientes, profesionales, solicitudes y categorías, pero **no puede gestionar a otros administradores**.

Protecciones: un administrador master está protegido (nadie lo puede suspender desde el panel), nadie puede cambiar el estado de su propia cuenta, y solo un master puede tocar a otros administradores.

## Regla 11 — Visibilidad de profesionales — Implementada

Un profesional aparece en el directorio público y recibe oportunidades solo si su perfil está activo, su verificación es `APPROVED` y su usuario no está suspendido. Al rechazar la verificación o suspender la cuenta, el profesional deja de aparecer y de recibir oportunidades.

## Regla 12 — Clave temporal y cambio forzado — Implementada

Toda cuenta creada por un administrador nace con una **clave temporal** y la marca `must_change_password`. La primera vez que esa persona inicia sesión, el sistema la obliga a definir una contraseña nueva antes de poder navegar a cualquier otra pantalla.

## Regla 13 — Insignias de cliente — Implementada

Según la cantidad de servicios contratados, el cliente obtiene una insignia de clasificación (Cliente nuevo, Junior, Pro o Élite) que se muestra en su pantalla de servicios contratados. Es solo motivacional; no otorga descuentos ni beneficios en esta versión.
