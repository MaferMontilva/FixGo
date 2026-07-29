# Estado actual del proyecto

FixGo IA está funcional de extremo a extremo. El recorrido completo —registro, solicitud asistida por IA, publicación, matching, presupuestos, contratación, ejecución, valoración y administración— está implementado y se puede demostrar con datos reales cargados en la base.

Última revisión: julio 2026.

## Resumen ejecutivo

| Área | Estado |
|------|--------|
| Autenticación (cliente, profesional, admin) + JWT + roles | Implementado |
| Registro con **teléfono y dirección obligatorios** (cliente y profesional) | Implementado |
| Recuperación de contraseña por verificación de identidad | Implementado |
| Cambio de contraseña autenticado + clave temporal forzada al primer ingreso | Implementado |
| Jerarquía de administradores (master vs. admin normal) | Implementado |
| Bloqueo de login para usuarios suspendidos | Implementado |
| Catálogo de categorías y servicios reales | Implementado |
| Solicitud de servicio asistida por IA (Groq + fallback local) | Implementado |
| Borradores, publicación y gestión de solicitudes | Implementado |
| Perfil profesional y **matching por categoría y provincia** | Implementado |
| Conteo previo de profesionales compatibles antes de publicar | Implementado |
| Oportunidades compatibles para profesionales (visibles mientras la solicitud siga abierta; bloqueo si ya fue adjudicada) | Implementado |
| **Descartar oportunidad** con motivo interno (profesional), sin avisar al cliente | Implementado |
| Presupuestos y aceptación única transaccional (resto → "No seleccionado" + notificación a los no elegidos) | Implementado |
| Órdenes de trabajo (iniciar, completar, confirmar) | Implementado |
| **Contacto del cliente** visible para el profesional del trabajo (nombre, teléfono, dirección) | Implementado |
| Valoraciones con recálculo de media + **respuesta del profesional** | Implementado |
| **Asistente de IA para corregir/redactar** texto + corrector ortográfico (es) | Implementado |
| Insignias de nivel de cliente (nuevo, junior, pro, élite) | Implementado |
| **Notificaciones en la app** (campana) con avisos persistentes derivados del estado (trabajo sin cerrar del cliente; oportunidades compatibles del profesional) | Implementado |
| Panel de administración (CRM) con métricas, dinero generado, buscadores y CRUD | Implementado |
| Crear usuarios (cliente/profesional/admin) desde el panel | Implementado |

## Arquitectura confirmada

- **Backend**: NestJS con arquitectura hexagonal por módulo (dominio, aplicación, infraestructura, presentación). Prisma vive solo en infraestructura. `npm run architecture:check` pasa.
- **Frontend**: React + TypeScript + Vite, modular por funcionalidad. No usa hexagonal. `npm run architecture:check` pasa.
- **Persistencia**: SQLite con Prisma. React nunca accede a la base; todo pasa por la API REST con prefijo `/api`.
- **IA**: integrada por puertos y adaptadores. Proveedor real Groq con fallback local basado en reglas.

Detalle en [ARQUITECTURA_Y_TECNOLOGIAS.md](./ARQUITECTURA_Y_TECNOLOGIAS.md) y [API_REST.md](./API_REST.md).

## Módulos backend implementados (13)

`auth`, `users`, `clients`, `categories`, `services`, `professionals`, `service-requests`, `artificial-intelligence`, `budgets`, `service-orders`, `reviews`, `notifications`, `administration`.

## Módulos frontend implementados (12)

`auth`, `home`, `categories`, `services`, `service-requests`, `professionals`, `budgets`, `service-orders`, `reviews`, `notifications`, `admin`, `ai`.

## Base de datos

Archivo activo: `backend/database/fixgo.db` (SQLite, accedido por Prisma).

Contenido de demostración (datos reales; las cifras de solicitudes, presupuestos, órdenes y valoraciones **crecen con el uso**, no son fijas):

| Entidad | Cantidad (indicativa) |
|---------|-----------------------|
| Usuarios | 36 |
| — Administradores | 3 (2 master + 1 normal) |
| — Profesionales | 26 perfiles (24 aprobados + 1 pendiente + 1 rechazado; incluye cuenta guiada) |
| — Clientes | resto |
| Perfiles profesionales aprobados (visibles en el directorio) | 24 |
| Direcciones de usuario | sí (obligatorias desde el registro) |
| Categorías | 18 (8 en uso con profesionales) |
| Servicios | 19 |
| Solicitudes de servicio | ~94 (crece) |
| Presupuestos | ~76 (crece) |
| Órdenes de trabajo | ~76 (crece) |
| Valoraciones | ~74 (crece) |

Las notificaciones no se siembran: se generan en tiempo real cuando ocurren los eventos (nueva oportunidad, presupuesto recibido, presupuesto aceptado, trabajo iniciado/terminado, nueva valoración y respuesta a la valoración).

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

## Pruebas y validación

- **Comprobación de tipos** (sin emitir): `npx tsc --noEmit` en `backend/` y en `frontend/` — pasa sin errores.
- **Verificador de arquitectura**: `npm run architecture:check` en ambos lados — pasa (respeta las reglas de capas/módulos).
- **Validación funcional (E2E manual)**: el recorrido de la demo (ver [CREDENCIALES_DEMO.md](./CREDENCIALES_DEMO.md)) ejercita el ciclo completo cliente ↔ profesional ↔ administrador.
- No hay suite de pruebas automatizadas (unitarias/e2e) configurada; la validación es por comprobación de tipos, verificador de arquitectura y prueba manual guiada.

## Credenciales de demostración

Todas las cuentas de prueba usan la contraseña **`FixGo2026`** (salvo las cuentas personales del autor). El detalle (administradores, cliente/profesional guía y los 24 profesionales de catálogo) está en [CREDENCIALES_DEMO.md](./CREDENCIALES_DEMO.md).

## Alcance no incluido (evolución futura)

El esquema de base contempla tablas para funciones que aún no tienen flujo en código y quedan como evolución futura:

- Mensajería en tiempo real entre cliente y profesional (chat).
- Notificaciones por correo, SMS o push (hoy solo hay notificación dentro de la app).
- Recuperación de contraseña por token/correo (hoy es por verificación de identidad; el cambio autenticado y la clave temporal forzada sí están implementados).
- Carga de fotografías en solicitudes y documentos verificables del profesional.
- Disponibilidad horaria y radio de trabajo en el matching (hoy el matching es por **categoría y provincia**).
- Permisos granulares por administrador (hoy existe la jerarquía master vs. admin normal).
- Auditoría completa y aceptaciones legales.
- Recompensas asociadas a las insignias de cliente (hoy la insignia es solo de clasificación/motivación).

Estas funciones no deben presentarse como implementadas. El detalle por fase está en [PLAN_MAESTRO_FIXGO_IA.md](./PLAN_MAESTRO_FIXGO_IA.md).
