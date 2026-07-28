# Cuentas de demostración — FixGo IA

Todas las cuentas de prueba usan la contraseña **`FixGo2026`**.

## Administradores

| Correo | Nombre | Nivel | Uso |
|--------|--------|-------|-----|
| `mafer@fixgo.com` | Mafer Admin | **Master** | Puede crear/suspender administradores y todo lo demás. |
| `admin@fixgo.com` | Admin FixGo | **Master** | Cuenta master de respaldo del sistema. |
| `mario@fixgo.com` | Mario Admin | Normal | Gestiona usuarios, profesionales, solicitudes y categorías, pero **no** a otros administradores. |

El panel `/admin` permite CRUD de usuarios, profesionales, solicitudes y categorías, más métricas globales (incluido el dinero generado) y buscadores en cada listado. Solo un **administrador master** puede crear administradores u otorgar/quitar el rol de administrador. Un administrador normal (`mario@fixgo.com`) verá "Master protegido" en las filas de los master.

## Cliente y profesional para el recorrido

| Rol | Correo | Para qué sirve |
|-----|--------|----------------|
| Cliente demo | `demo.cliente@example.com` | Tiene solicitudes publicadas con presupuestos recibidos para probar comparar y aceptar. |
| Profesional demo | `montilvamafer@gmail.com` | Perfil verificado (categoría Manitas). Ve oportunidades, envía presupuestos, gestiona trabajos y ve valoraciones. |

Otros clientes de prueba: `cliente1@fixgo.com` (Laura Gómez) y `cliente2@fixgo.com` (Javier Ruiz), ambos con `FixGo2026`.

Los 24 profesionales de catálogo (3 por cada una de las 8 categorías en uso) están en [CREDENCIALES_PROFESIONALES.md](./CREDENCIALES_PROFESIONALES.md).

> El registro público solo crea CLIENTE o PROFESIONAL. El **administrador no se puede crear desde el registro** (regla de seguridad); se crea por semilla en la base de datos.

## Recorrido sugerido para la demostración

1. Entra como **cliente** → *Solicitar presupuesto* → describe con errores a propósito → la **IA** lo corrige, estructura y recomienda → **Publica**.
2. Entra como **profesional** (`montilvamafer@gmail.com`) → *Oportunidades* → abre la solicitud → **Enviar presupuesto**.
3. Vuelve como **cliente** → *Mis presupuestos* → la solicitud → *Ver presupuestos* → **Aceptar** (se crea la orden y el resto se rechaza).
4. Como **profesional** → *Mis trabajos* → **Iniciar** → **Marcar como completado**.
5. Como **cliente** → *Mis trabajos* → **Confirmar** → **Valorar** (estrellas + comentario).
6. Como **profesional** → *Valoraciones* → aparece la nota. Como **administrador** → revisa todo en `/admin`.

En cada paso, la **campana de notificaciones** avisa al cliente y al profesional de las oportunidades, presupuestos y aceptaciones.
