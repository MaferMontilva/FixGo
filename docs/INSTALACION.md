# Guía de instalación y ejecución — FixGo IA

Esta guía permite descargar el proyecto desde GitHub y ponerlo en marcha en local. **No requiere Docker, ni servidores externos, ni sembrar datos**: la base de datos SQLite ya viene incluida con datos de demostración.

## 1. Requisitos previos

- **Node.js 18 o superior** (recomendado 20 LTS) y **npm**. Descarga: https://nodejs.org
- **Git** (opcional, solo si clonas en vez de descargar el ZIP).
- Sistema operativo: Windows, macOS o Linux.

Comprobar versiones:

```bash
node -v
npm -v
```

## 2. Obtener el proyecto

Opción A — clonar:

```bash
git clone https://github.com/MaferMontilva/FixGo.git
cd FixGo
```

Opción B — descargar el ZIP desde GitHub (botón **Code → Download ZIP**), descomprimir y entrar a la carpeta `FixGo`.

## 3. Base de datos

La base de datos ya está incluida en `backend/database/fixgo.db` con todos los datos de demostración (usuarios, categorías, servicios, profesionales, solicitudes, presupuestos, órdenes y valoraciones), para que la evaluación se pueda hacer de inmediato y con los mismos datos mostrados. **No hay que ejecutar migraciones ni seed.**

De todos modos, el proyecto también versiona la vía reproducible por si se desea recrear la base desde cero: el esquema Prisma (`backend/prisma/schema.prisma`), las migraciones (`backend/prisma/migrations/`) y los scripts SQL (`backend/database/schema.sql` y `backend/database/seed.sql`).

## 4. Backend (API)

En una terminal:

```bash
cd backend
npm install
```

Crear el archivo de entorno a partir del ejemplo:

- **Windows (PowerShell/CMD):** `copy .env.example .env`
- **macOS / Linux:** `cp .env.example .env`

Abrir `backend/.env` y poner un valor propio en `JWT_ACCESS_SECRET` (cualquier texto largo y aleatorio; es obligatorio). Las claves de IA (`GROQ_API_KEY`, etc.) son **opcionales**: si se dejan vacías, la IA funciona con un respaldo local basado en reglas y el proyecto sigue operando con normalidad.

Generar el cliente de Prisma y arrancar:

```bash
npm run prisma:generate
npm run start:dev
```

La API queda en **http://localhost:3000/api**.

## 5. Frontend (aplicación web)

En **otra** terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en **http://localhost:5173**. Ábrela en el navegador.

## 6. Cuentas de demostración

Todas usan la contraseña **`FixGo2026`**. Detalle completo en [CREDENCIALES_DEMO.md](./CREDENCIALES_DEMO.md).

| Rol | Correo |
|---|---|
| Administrador (master) | `admin@fixgo.com` |
| Administrador (normal) | `mario@fixgo.com` |
| Cliente demo | `demo.cliente@example.com` |
| Profesional (recorrido) | `montilvamafer@gmail.com` |

El registro público crea cuentas de cliente o profesional (pide correo, contraseña, teléfono y dirección). Las cuentas de administrador no se crean desde el registro.

## 7. Comprobaciones opcionales de calidad

```bash
cd backend  && npm run architecture:check   # reglas de arquitectura backend
cd frontend && npm run architecture:check   # reglas de arquitectura frontend
```

## 8. Solución de problemas

- **El backend no arranca y menciona `JWT_ACCESS_SECRET`:** falta crear `backend/.env` o falta ese valor. Revisa el paso 4.
- **Error de Prisma sobre el "Query Engine":** ejecuta `npm run prisma:generate` dentro de `backend` (genera el cliente para tu sistema operativo).
- **El puerto 3000 o 5173 está ocupado:** cierra el proceso que lo usa o cambia `PORT` en `backend/.env`.
- **La IA no responde:** es normal si no configuraste una clave; el sistema usa el respaldo local automáticamente. No afecta al resto del flujo.
- **CORS:** si cambias el puerto del frontend, ajusta `CORS_ORIGIN` en `backend/.env`.

## 9. Documentación del proyecto

En la carpeta [`docs/`](./) están: arquitectura y tecnologías, API REST, reglas de negocio, matriz de trazabilidad, estado actual, plan maestro y credenciales. El diccionario de datos y el modelo entidad-relación están en [`backend/docs/`](../backend/docs/).
