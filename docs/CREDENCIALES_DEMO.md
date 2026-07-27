# Cuentas de demostración — FixGo IA

Todas usan la contraseña **`FixGo2026`**.

| Rol | Correo | Para qué sirve |
|-----|--------|----------------|
| Administrador | `admin@fixgo.com` | Panel `/admin`: CRUD de usuarios, profesionales, solicitudes y categorías + métricas. |
| Profesional | `montilvamafer@gmail.com` | Perfil activo (categoría Manitas, Madrid). Ve oportunidades, envía presupuestos, gestiona trabajos y ve valoraciones. |
| Cliente demo | `demo.cliente@example.com` | Tiene solicitudes publicadas con presupuestos recibidos para probar comparar/aceptar. |

Otros clientes de prueba existentes: `mariomolina@gmail.com`, `carlos@gmail.com`, `montilvamafer88@gmail.com` (contraseña definida por el usuario).

> El registro público solo crea CLIENTE o PROFESIONAL. El **administrador no se puede crear desde el registro** (regla de seguridad); se crea por semilla en la base de datos.

## Recorrido sugerido para la demostración

1. Entra como **cliente** → *Solicitar presupuesto* → describe con errores a propósito → la **IA** lo corrige/mejora y recomienda → **Publica**.
2. Entra como **profesional** (`montilvamafer@gmail.com`) → *Oportunidades* → abre la solicitud → **Enviar presupuesto**.
3. Vuelve como **cliente** → *Mis presupuestos* → la solicitud → *Ver presupuestos* → **Aceptar** (se crea la orden).
4. Como **profesional** → *Mis trabajos* → **Iniciar** → **Marcar como completado**.
5. Como **cliente** → *Mis trabajos* → **Confirmar** → **Valorar** (estrellas + comentario).
6. Como **profesional** → *Valoraciones* → aparece la nota. Como **administrador** → revisa todo en `/admin`.
