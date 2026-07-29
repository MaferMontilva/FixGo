# Referencia visual de FixGo

Guía del sistema visual e interfaz de FixGo tal como está implementado en el frontend (React + Vite + Tailwind, estilos propios en `src/shared/styles`). Todos los valores están tomados del código real.

## Identidad de color

Definidos como variables CSS en `global.css`:

- **Naranja de marca (primario):** `#F28A2E` (`--fixgo-orange`), con variantes de estado `#DC6F19` (hover) y `#B95212` (profundo) y un fondo suave `#FFF4EA`.
- **Acento cálido:** `#F6AD36` (`--fixgo-yellow-orange`).
- **Tinta / casi negro:** `#171717` (`--fixgo-ink` / `--fixgo-black`) para texto y barras de navegación oscuras; fondo muy oscuro `#080A08`.
- **Neutros de superficie:** blanco `#FFFFFF`, panel claro `#F4F4F4`, gris de texto `#6B7280`, borde `#E0E3E8`.

La marca es **monocroma naranja sobre neutros**; no se usa azul.

## Patrones de composición (pantallas reales)

- **Landing pública** con cabecera flotante y héroe destacado, sobre fondo neutro.
- **Marketplace del cliente** claro, con **navegación superior**, indicador de sección activa y la zona de sesión/acceso a la derecha.
- **Área del profesional** con barra de navegación superior oscura (Panel, Oportunidades, Presupuestos, Mis trabajos, Valoraciones, Perfil) y la campana de notificaciones + salir a la derecha.
- **Buscador amplio** como acción principal en marketplace y directorio.
- **Tarjetas limpias** y consistentes para categorías, profesionales, oportunidades, presupuestos y órdenes de trabajo.
- **Pantallas de autenticación** (iniciar sesión, registro, cambio de clave) con **tarjeta centrada** sobre fondo claro, logo y llamada a la acción visible.

## Autenticación (interfaz)

- **Inicio de sesión por correo electrónico y contraseña** (no por teléfono). El teléfono y la dirección se piden en el **registro**, no en el acceso.
- Redirección por rol tras iniciar sesión; si la cuenta tiene clave temporal, se fuerza el cambio de contraseña antes de continuar (misma tarjeta centrada).

## Tipografía, iconos e idioma

- Iconografía mediante **lucide-react** (trazo, con acento naranja donde corresponde).
- Interfaz íntegramente en **español**.
- Corrector ortográfico del navegador (español) activo en los campos de texto libre.

## Responsividad

Diseño **responsive** de móvil (desde 320px) a escritorio, con componentes reutilizables propios de FixGo. Todos los componentes de interfaz son propios; no se reutiliza código ni recursos de terceros.
