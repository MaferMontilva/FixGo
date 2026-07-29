# Flujo Git/GitHub

## Ramas

- `main`: versión estable.
- `develop`: rama de integración cuando sea incorporada formalmente al repositorio.
- `feature/...`: funcionalidades.
- `docs/...`: documentación.
- `backup/...`: recuperaciones excepcionales.

## Flujo recomendado

```text
Issue
-> rama
-> auditoría
-> implementación
-> pruebas
-> commit
-> pull request
-> revisión
-> integración
```

## Flujo actualmente aplicado

Hasta esta fase se ha trabajado con ramas locales por fase, auditorías previas, commits controlados y verificaciones antes de cierre. No se afirma que ya existan issues, pull requests o `develop` en remoto.

## Tareas futuras de GitHub

- Crear issues por fase o subfase.
- Publicar ramas autorizadas.
- Abrir pull requests para revisión.
- Incorporar `develop` formalmente si se decide usarlo como rama de integración.
- Proteger `main`.

## Reglas

- No trabajar directamente en `main`.
- Una funcionalidad por rama.
- Commits descriptivos.
- No mezclar fases.
- Revisar `git diff`.
- Revisar staging antes de commitear.
- Cerrar con working tree limpio.
- Proteger secretos.
- No versionar bases locales.
- No hacer push o merge sin autorización.
- No usar `push --force` sin autorización explícita.

## Archivos prohibidos

- `.env`
- `node_modules`
- `dist`
- logs
- cachés
- bases temporales
- respaldos
- tokens
- secretos

## Criterios de cierre

- `architecture:check`.
- TypeScript.
- Build.
- `git diff --check`.
- Pruebas funcionales.
- Pruebas visuales.
- Informe.
- Commit claro.
- Working tree limpio.

## Commits controlados

Antes de crear un commit:

1. Verificar rama.
2. Verificar `git status --short`.
3. Verificar `git diff --name-only`.
4. Ejecutar pruebas acordadas.
5. Agregar solo archivos autorizados.
6. Revisar `git diff --cached --name-only`.
7. Revisar `git diff --cached --check`.
8. Crear commit con mensaje claro.

No se debe hacer merge ni push sin instrucción expresa.
