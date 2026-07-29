# Plan maestro y roadmap de FixGo IA

## Nombre

FixGo IA.

## Propósito

FixGo IA es una plataforma web que conecta **clientes** que necesitan servicios para el hogar con **profesionales** que pueden atenderlos. Permite solicitar trabajos de reformas, instalaciones, reparaciones y mantenimiento, recibir presupuestos de profesionales compatibles, contratar una única oferta y cerrar el servicio con seguimiento, confirmación y valoración.

## Alcance

Incluido en esta versión: registro con datos de contacto obligatorios, solicitud de servicio asistida por IA, catálogo de categorías/servicios, matching por categoría y provincia, presupuestos y aceptación única, órdenes de trabajo con liberación de contacto, valoraciones con respuesta, notificaciones dentro de la app, asistente de IA de redacción y panel de administración (CRM) con jerarquía de administradores.

Fuera de alcance (evolución futura): chat en tiempo real, notificaciones externas (correo/SMS/push), recuperación por token/correo, carga de multimedia y documentos verificables, disponibilidad horaria y radio en el matching, auditoría formal y aceptaciones legales, y recompensas por insignias.

## Actores y roles

- **Visitante (público):** navega la landing, el marketplace, el directorio de profesionales y el catálogo sin sesión.
- **Cliente (`CLIENT`):** crea y publica solicitudes, recibe y compara presupuestos, acepta una oferta, sigue el servicio, confirma y valora.
- **Profesional (`PROFESSIONAL`):** gestiona su perfil, ve oportunidades compatibles, envía presupuestos, ejecuta trabajos y responde valoraciones.
- **Administrador (`ADMIN`):** verifica profesionales, gestiona usuarios/solicitudes/categorías y consulta métricas.
- **Administrador master (`SUPER_ADMIN`):** además, crea administradores y otorga/quita el rol de administrador.
- **Sistema externo — Proveedor de IA (Groq):** analiza y redacta texto; con fallback local si no responde.

## Diferenciador

FixGo IA no es solo un CRUD. Su valor es la combinación de: IA para estructurar solicitudes y redactar texto, emparejamiento de profesionales con reglas de compatibilidad, presupuestos competitivos con aceptación automática de una única oferta, estados controlados, notificaciones, valoraciones con respuesta y administración con jerarquía.

## Flujo principal

```text
Cliente crea solicitud
-> IA analiza y estructura
-> cliente confirma y publica
-> sistema identifica profesionales compatibles (categoría + provincia)
-> profesionales envían presupuestos
-> cliente acepta uno -> el sistema marca el resto como "No seleccionado"
-> se crea la orden y se libera el contacto entre ambas partes
-> profesional inicia y completa el servicio
-> cliente confirma y valora -> el profesional puede responder
-> administrador supervisa
```

## Módulos implementados (backend, 13)

`auth`, `users`, `clients`, `categories`, `services`, `professionals`, `service-requests`, `artificial-intelligence`, `budgets`, `service-orders`, `reviews`, `notifications`, `administration`.

## Principios de trabajo

- Avanzar por fases pequeñas y verificables; no rehacer FixGo desde cero.
- No mezclar la arquitectura del frontend con la del backend.
- Colocar las reglas críticas en el backend; no hardcodear datos reales en React.
- Mantener los módulos desacoplados (imports por índice público).
- Proteger la base SQLite; usar ramas y commits controlados.
- Barrera mínima antes de cerrar una fase: `architecture:check` + TypeScript sin errores.

## Desarrollo por fases

Cada fase se cerró comprobando `architecture:check`, compilación de TypeScript, `git diff --check`, pruebas funcionales por endpoint, revisión visual cuando había interfaz y commit limpio.

- **Fase 1 — Frontend base — Cerrada.** Base visual y modular: rutas, navegación, layouts, componentes compartidos y responsive.
- **Fase 2 — Backend y persistencia — Cerrada.** NestJS con API REST, schema Prisma, base SQLite y monolito modular hexagonal (React no accede a SQLite; Prisma en infraestructura).
- **Fase 3 — Auth, usuarios y clientes — Cerrada.** Registro de cliente y profesional, login, logout, refresh, `users/me`, `clients/me` y recuperación por verificación de identidad (bcrypt, JWT, roles y guards).
- **Fase 4 — Catálogo y solicitud de servicio — Cerrada.** 18 categorías (8 en uso) y 19 servicios reales, búsqueda, formulario por pasos, borradores, edición, publicación, cancelación, duplicado y "Mis solicitudes".
- **Fase 5 — FixGo IA — Cerrada.** IA como asistente de estructuración de la solicitud (título, categoría, servicio, urgencia, presupuesto orientativo, información faltante, resumen editable) por puertos y adaptadores. Proveedor Groq real con fallback local y override por palabras clave de riesgo.
- **Fase 6 — Profesionales y matching — Cerrada.** Perfil editable con avatar, verificación por admin, directorio público con búsqueda y valoración, y oportunidades compatibles **por categoría y provincia**, con conteo previo de profesionales compatibles.
- **Fase 7 — Presupuestos y contratación automática — Cerrada.** Enviar presupuesto, ver los propios, comparar los de una solicitud, aceptar uno (el resto queda "No seleccionado") y creación de la orden, todo con el total calculado en backend y aceptación única transaccional.
- **Fase 8 — Ejecución, valoración y administración — Cerrada.** Iniciar/completar (profesional), confirmar (cliente), valorar con recálculo de media, panel de administración (CRM) con métricas y CRUD.
- **Fase 9 — Refuerzos de operación — Cerrada.** Jerarquía de administradores (master vs. normal), clave temporal forzada, notificaciones en la app con aviso persistente, **contacto bidireccional** en la orden, respuesta del profesional a valoraciones, **teléfono y dirección obligatorios** en el registro, y **asistente de IA de redacción** con corrector ortográfico.

## Evolución futura (no implementada)

Planificada y con tablas previstas en el esquema, pero sin flujo en código todavía:

- **Mensajería:** chat en tiempo real entre cliente y profesional.
- **Notificaciones externas:** correo, SMS o push (hoy solo dentro de la app).
- **Recuperación por token/correo:** reemplazaría la verificación de identidad actual.
- **Multimedia y verificación:** fotos en solicitudes y documentos del profesional.
- **Disponibilidad y zonas:** agenda horaria, radio de trabajo y favoritos (hoy el matching es por categoría y provincia).
- **Auditoría y legal:** registro de acciones sensibles y aceptaciones legales.
- **Recompensas:** beneficios asociados a las insignias de cliente (hoy solo motivacionales).

Ninguna función de esta sección debe presentarse como implementada.
