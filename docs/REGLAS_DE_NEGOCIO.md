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

El emparejamiento se realiza por **categoría y provincia** (zona del profesional frente a la ubicación de la solicitud). La disponibilidad horaria y el radio de trabajo en el matching quedan como evolución futura. Antes de publicar, el cliente ve un **conteo de profesionales compatibles** para saber si su solicitud tendrá alcance.

La oportunidad permanece visible para todos los profesionales compatibles mientras la solicitud siga **abierta** (estados `PUBLISHED` o `RECEIVING_BUDGETS`); no desaparece del resto solo porque ya haya recibido un presupuesto. Si el profesional abre una solicitud ya adjudicada o cerrada, el sistema le indica que **ya no está disponible** y no permite presupuestarla. Además, el profesional puede **descartar** una oportunidad que no le interese (ver Regla 17).

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
- Otros presupuestos → `REJECTED` ("No seleccionado").
- Solicitud → `PROFESSIONAL_SELECTED`.
- Orden de trabajo → creada.
- Notificaciones → generadas: al profesional elegido ("Te seleccionaron") y a cada profesional no elegido ("Presupuesto no seleccionado").

`ACCEPTED` y `REJECTED` son estados de presupuesto, no de solicitud. En la interfaz del profesional, un presupuesto `REJECTED` se muestra como **"No seleccionado"** (el cliente no lo cancela: simplemente no lo eligió). La transacción evita doble clic, peticiones repetidas y que queden dos presupuestos aceptados.

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

El promedio del profesional se recalcula automáticamente y se muestra en su perfil y en el directorio. Al registrarse una valoración, el profesional recibe una notificación en la app. El profesional puede **responder** a la valoración desde "Mis valoraciones"; al hacerlo, el cliente recibe una notificación con la respuesta.

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

## Regla 9 — Privacidad y liberación del contacto — Implementada

El contacto se libera solo cuando existe una relación de trabajo real (orden creada al aceptar un presupuesto), nunca durante la exploración ni la comparación de presupuestos:

- **Hacia el cliente:** el teléfono del profesional se muestra en "Servicios contratados" una vez aceptada la orden.
- **Hacia el profesional:** en "Mis trabajos", mediante el botón *Ver datos de contacto*, se muestran **nombre, teléfono y dirección** del cliente del trabajo. Estos datos dejan de mostrarse cuando el trabajo pasa a **completado** o cancelado.

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

## Regla 14 — Datos de contacto obligatorios en el registro — Implementada

El registro (cliente y profesional) exige **teléfono y dirección** (calle, código postal y ciudad), además de nombre, apellido, correo y contraseña. El teléfono se guarda en el usuario y la dirección como dirección por defecto. Con esto se garantiza que, al contratarse un trabajo, el profesional siempre disponga de datos de contacto reales del cliente (ver Regla 9).

## Regla 15 — Asistente de IA para redacción — Implementada

Además de la IA que analiza y mejora la descripción de la solicitud, el sistema ofrece un asistente opcional de **corrección/redacción de texto** (botón "Corregir/Redactar con IA") en la reseña del cliente, en la respuesta del profesional a una valoración y en las observaciones del presupuesto. Corrige ortografía, gramática y puntuación manteniendo el significado, sin inventar datos; el usuario decide si aplica el resultado. Todos los campos de texto libre llevan además el corrector ortográfico del navegador en español. Si el proveedor de IA no está disponible, se aplica una limpieza local básica.

## Regla 16 — Notificaciones en la app — Implementada

El sistema genera notificaciones internas (campana) en los eventos del ciclo de vida: nueva oportunidad para el profesional, presupuesto recibido para el cliente, presupuesto aceptado para el profesional, **presupuesto no seleccionado** para los profesionales no elegidos, trabajo iniciado y trabajo terminado para el cliente, nueva valoración para el profesional y respuesta a la valoración para el cliente.

Además, la campana muestra **avisos persistentes derivados del estado real** (no dependen del momento del evento): al **cliente**, "Trabajo terminado sin cerrar" hasta que confirma y valora; al **profesional**, un aviso por cada **oportunidad compatible abierta que aún no ha presupuestado** (para que la vea aunque se registrara o activara después de publicarse). Estos avisos desaparecen solos cuando la acción se resuelve. No hay notificaciones por correo, SMS ni push: quedan como evolución futura.

## Regla 17 — Descartar oportunidad — Implementada

Un profesional puede **descartar** una oportunidad que no le interese eligiendo un motivo interno (precio no compensa, muy lejos, fuera de servicio, agenda llena u otro). Al descartarla, la solicitud deja de mostrarse en sus oportunidades y en su campana de forma **permanente** (se guarda en el backend; no reaparece al recargar ni en otro dispositivo). El **cliente no recibe ninguna notificación** por cada descarte, para evitar ruido y desánimo. El motivo se conserva como **dato interno** (base para futuras estadísticas). Descartar no impide que otros profesionales compatibles vean y presupuesten la solicitud.
