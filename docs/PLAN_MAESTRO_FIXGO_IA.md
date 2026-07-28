# Plan maestro de FixGo IA

## Nombre

FixGo IA.

## Propósito

FixGo IA es una plataforma web que conecta clientes que necesitan servicios para el hogar con profesionales que pueden atenderlos.

El sistema permite solicitar trabajos de reformas, instalaciones, reparaciones y mantenimiento, recibir presupuestos de profesionales compatibles, contratar una única oferta y cerrar el servicio con seguimiento, confirmación y valoración.

## Diferenciador

FixGo IA no será únicamente un CRUD. El valor del sistema será la combinación de:

- IA para estructurar solicitudes.
- Emparejamiento de profesionales.
- Reglas de compatibilidad.
- Presupuestos competitivos.
- Aceptación automática de una única oferta.
- Estados controlados.
- Notificaciones.
- Valoraciones.
- Administración y auditoría.

## Flujo principal

```text
Cliente crea solicitud
-> IA analiza y estructura
-> cliente confirma
-> solicitud se publica
-> sistema identifica profesionales compatibles
-> profesionales envían presupuestos
-> cliente acepta uno
-> sistema rechaza automáticamente los demás
-> solicitud queda asignada
-> profesional ejecuta el servicio
-> cliente confirma y valora
-> administrador puede supervisar y auditar
```

## Módulos implementados (backend)

- `auth`
- `users`
- `clients`
- `categories`
- `services`
- `professionals`
- `service-requests`
- `artificial-intelligence`
- `budgets`
- `service-orders`
- `reviews`
- `notifications`
- `administration`

La auditoría formal queda como evolución futura.

## Principios de trabajo

- No rehacer FixGo desde cero.
- Avanzar por fases pequeñas.
- No mezclar la arquitectura frontend con la arquitectura backend.
- Colocar las reglas críticas en backend.
- No hardcodear datos reales en React.
- Mantener los módulos desacoplados.
- Validar cada fase antes de continuar.
- Proteger la base SQLite.
- Utilizar ramas y commits controlados.

## Automatizaciones previstas

- Comprobación automática de arquitectura frontend.
- Comprobación automática de arquitectura backend.
- TypeScript como barrera mínima antes de cerrar fase.
- Build antes de commits de cierre cuando el entorno lo permita.
- Validaciones funcionales por endpoint.
- Validaciones visuales antes de aprobar cambios de UI.
- Revisión de `git diff --check`, staging y estado limpio.

## Desarrollo por fases

Cada fase debe tener objetivo concreto, módulos implicados, reglas de negocio aplicables, archivos y endpoints previstos, pruebas técnicas, pruebas funcionales, pruebas visuales cuando exista interfaz, riesgos, entregables y criterio de cierre.

El roadmap oficial está en [ROADMAP_POR_FASES.md](./ROADMAP_POR_FASES.md).
