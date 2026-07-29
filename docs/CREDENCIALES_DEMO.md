# Cuentas de demostración — FixGo IA

Todas las cuentas de prueba usan la contraseña **`FixGo2026`** (salvo las cuentas personales del autor).

> El registro público solo crea **CLIENTE** o **PROFESIONAL** y, desde la última versión, exige **teléfono y dirección** (calle, código postal y ciudad) además de nombre, apellido, correo y contraseña. El **administrador no se puede crear desde el registro** (regla de seguridad): se crea por semilla en la base o desde el panel por un administrador master.

## Administradores

| Correo | Nombre | Nivel | Uso |
|--------|--------|-------|-----|
| `mafer@fixgo.com` | Mafer Admin | **Master (SUPER_ADMIN)** | Puede crear/suspender administradores y todo lo demás. |
| `admin@fixgo.com` | Admin FixGo | **Master (SUPER_ADMIN)** | Cuenta master de respaldo del sistema. |
| `mario@fixgo.com` | Mario Admin | Normal (ADMIN) | Gestiona usuarios, profesionales, solicitudes y categorías, pero **no** a otros administradores. |

El panel `/admin` permite CRUD de usuarios, profesionales, solicitudes y categorías, más métricas globales (incluido el dinero generado) y buscadores en cada listado. Solo un **administrador master** puede crear administradores u otorgar/quitar el rol de administrador. Un administrador normal (`mario@fixgo.com`) verá "Master protegido" en las filas de los master.

## Cliente y profesional para el recorrido

| Rol | Correo | Para qué sirve |
|-----|--------|----------------|
| Cliente demo | `demo.cliente@example.com` | Tiene solicitudes publicadas con presupuestos recibidos para probar comparar y aceptar. |
| Profesional demo | `montilvamafer@gmail.com` | Perfil verificado (categoría Manitas). Ve oportunidades, envía presupuestos, gestiona trabajos y ve valoraciones. |

Otros clientes de prueba: `cliente1@fixgo.com` (Laura Gómez) y `cliente2@fixgo.com` (Javier Ruiz), ambos con `FixGo2026`.

## Profesionales de catálogo (24)

3 profesionales por cada una de las 8 categorías en uso (24 en total), todos con perfil **verificado**. Los profesionales `1` y `2` de cada categoría incluyen foto de perfil (avatar); el `3` no, para mostrar ambos estados. Las valoraciones son reales: cada profesional tiene reseñas y su media se recalcula automáticamente.

| Categoría | Correo | Nombre | Negocio | Valoración | Avatar |
|---|---|---|---|---|---|
| Manitas | `manitas1@fixgo.com` | Carlos Ruiz | Manitas Ruiz | 4.3 | sí |
| Manitas | `manitas2@fixgo.com` | Andres Gomez | Manitas Gomez | 4.0 | sí |
| Manitas | `manitas3@fixgo.com` | Javier Torres | Manitas Torres | 4.7 | — |
| Electricidad | `electricidad1@fixgo.com` | Lucia Fernandez | Electricidad Fernandez | 4.3 | sí |
| Electricidad | `electricidad2@fixgo.com` | Marta Sanchez | Electricidad Sanchez | 4.7 | sí |
| Electricidad | `electricidad3@fixgo.com` | Rosa Diaz | Electricidad Diaz | 4.3 | — |
| Fontanería | `fontaneria1@fixgo.com` | Pedro Navarro | Fontaneria Navarro | 4.7 | sí |
| Fontanería | `fontaneria2@fixgo.com` | Miguel Herrera | Fontaneria Herrera | 4.7 | sí |
| Fontanería | `fontaneria3@fixgo.com` | Elena Vega | Fontaneria Vega | 4.7 | — |
| Pintura | `pintura1@fixgo.com` | Sergio Molina | Pintura Molina | 4.7 | sí |
| Pintura | `pintura2@fixgo.com` | Nuria Castro | Pintura Castro | 4.7 | sí |
| Pintura | `pintura3@fixgo.com` | Diego Reyes | Pintura Reyes | 3.7 | — |
| Cerrajería | `cerrajeria1@fixgo.com` | Ana Ortega | Cerrajeria Ortega | 4.7 | sí |
| Cerrajería | `cerrajeria2@fixgo.com` | Ruben Blanco | Cerrajeria Blanco | 5.0 | sí |
| Cerrajería | `cerrajeria3@fixgo.com` | Sara Ramos | Cerrajeria Ramos | 4.7 | — |
| Limpieza | `limpieza1@fixgo.com` | Ivan Iglesias | Limpieza Iglesias | 4.7 | sí |
| Limpieza | `limpieza2@fixgo.com` | Paula Serrano | Limpieza Serrano | 5.0 | sí |
| Limpieza | `limpieza3@fixgo.com` | Hugo Cabrera | Limpieza Cabrera | 5.0 | — |
| Jardinería | `jardineria1@fixgo.com` | Marina Prieto | Jardineria Prieto | 4.0 | sí |
| Jardinería | `jardineria2@fixgo.com` | Alberto Nunez | Jardineria Nunez | 5.0 | sí |
| Jardinería | `jardineria3@fixgo.com` | Cristina Gil | Jardineria Gil | 4.3 | — |
| Mudanzas | `mudanzas1@fixgo.com` | Raul Pardo | Mudanzas Pardo | 4.0 | sí |
| Mudanzas | `mudanzas2@fixgo.com` | Beatriz Leon | Mudanzas Leon | 4.7 | sí |
| Mudanzas | `mudanzas3@fixgo.com` | Oscar Marin | Mudanzas Marin | 4.7 | — |

Tras iniciar sesión, el profesional entra a su panel (`/profesional/panel`). Con la cuenta guiada `montilvamafer@gmail.com` se cubre el recorrido completo; los 24 de catálogo dan volumen realista al directorio y a las valoraciones.

## Recorrido sugerido para la demostración

1. Entra como **cliente** → *Solicitar presupuesto* → describe con errores a propósito → la **IA** lo corrige, estructura y recomienda → **Publica**.
2. Entra como **profesional** (`montilvamafer@gmail.com`) → *Oportunidades* → abre la solicitud compatible (por categoría y provincia) → **Enviar presupuesto**.
3. Vuelve como **cliente** → *Mis presupuestos* → la solicitud → *Ver presupuestos* → **Aceptar** (se crea la orden y los demás presupuestos quedan como "No seleccionado").
4. Como **profesional** → *Mis trabajos* → **Ver datos de contacto** del cliente → **Iniciar** → **Completar**.
5. Como **cliente** → *Servicios contratados* → **Confirmar** → **Valorar** (estrellas + comentario, con opción de corregir con IA).
6. Como **profesional** → *Valoraciones* → aparece la nota; puede **responder** (con IA). Como **administrador** → revisa todo en `/admin`.

En cada paso, la **campana de notificaciones** avisa al cliente y al profesional (nueva oportunidad, presupuesto recibido, presupuesto aceptado, trabajo iniciado, trabajo terminado, nueva valoración y respuesta a la valoración).
