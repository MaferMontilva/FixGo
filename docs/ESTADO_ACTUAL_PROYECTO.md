# Estado actual del proyecto

## Fases cerradas

- Fase 1: cerrada. Commit: `0c09648`.
- Fase 2: cerrada. Commit: `24dbe6f`.
- Fase 3: cerrada en código. Commit: `a8ab256`.
- Fase 4A: cerrada. Commit: `ba38956`.

## Fase próxima

Fase 4B: próxima implementación. No está completada.

## Ramas

- Rama documental actual: `docs/plan-maestro-fixgo-ia`.
- Rama de trabajo funcional anterior: `feature/fase-4b-formulario-solicitud`.

## Base de datos

Archivo:

```text
backend/database/fixgo.db
```

SHA256 de referencia:

```text
CF4B4B9652ED10559B32D6FD3164F6AD8D422152C3AE7FA8CAC130A7BFC71C88
```

Contenido conocido de la base reconstruida de referencia:

- roles: 3.
- categories: 18.
- services: 19.
- users: 0.
- professionals: 0.
- serviceRequests: 0.

## Terminado

- Base visual del frontend.
- Arquitectura modular frontend.
- Backend modular con Prisma y SQLite.
- Endpoints base de categorías, profesionales, servicios y solicitudes.
- Código de autenticación de cliente en backend y frontend.
- Categorías y servicios reales en marketplace.

## Pendiente operativo

1. Crear usuario mediante API.
2. Probar registro.
3. Probar login.
4. Comprobar JWT.
5. Comprobar `GET /api/users/me` o `GET /api/clients/me`.
6. Validar ingreso desde el frontend.
7. Retomar Fase 4B por subpasos.

No se afirma que el login de demostración ya funcione en la base de referencia; debe validarse operativamente cuando se prepare la presentación.

## Próxima implementación

- Fase 4B - formulario modular de solicitud.
- Separar el avance en subpasos pequeños.
- Validar visualmente después de cada subpaso.

## Fuera de alcance actual

- IA real.
- Publicación completa de solicitudes.
- Fotografías.
- Matching profesional.
- Presupuestos.
- Contratación.
- Notificaciones.
- Valoraciones.
- Administración.
- Auditoría completa.

## Nota operativa

Las bases locales pueden cambiar durante pruebas por API real. La documentación registra la referencia de base reconstruida y validada; cualquier cambio operativo posterior debe quedar descrito en informes de fase o tareas de recuperación.
