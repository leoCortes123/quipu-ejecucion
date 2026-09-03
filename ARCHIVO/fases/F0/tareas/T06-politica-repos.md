# T06 — Política de repos: congelar QUIPU v1

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor · Nivel: L3 (toca OTRO repo: cuidado extra) · Presupuesto: ~20 min
Depende de: T04 (ESTADO.md debe existir para referenciarlo).

## Propósito
Dejar declarado en el README de `/mnt/datos/Programacion/QUIPU` (v1) que el proyecto
queda congelado y su rol activo lo asume QUIPU_ENTERPRISE. Elimina el riesgo de mantener
dos generadores vivos con docs desalineadas.

## Contexto
- Repo objetivo: `/mnt/datos/Programacion/QUIPU` (sólo se toca su README.md y un commit).
- `QUIPU_ENTERPRISE` hereda su base (`Base heredada de Quipu v1`) y ya cubre demanda,
  workflow, trazabilidad y MCP.
- NO se borra ni archiva nada de v1.

## Pasos

1. En `/mnt/datos/Programacion/QUIPU`, crea rama de trabajo `docs/congelamiento`
   (no commitees directo a master en este repo).
2. Añade al INICIO del README.md, justo tras el título:

   ```markdown
   > **CONGELADO (2026-08):** este repositorio no recibe desarrollo nuevo. Su rol activo
   > lo asume `QUIPU_ENTERPRISE` (hereda esta base y la extiende). La documentación bajo
   > `docs/` sigue siendo válida como referencia histórica y de diseño; donde discrepe
   > con Enterprise, manda Enterprise. Ver `ESTADO.md` en ese repo.
   ```

3. Commit:
   ```
   Docs: congelamiento — desarrollo activo continúa en QUIPU_ENTERPRISE
   ```
4. NO hagas push (no hay remoto confirmado); deja la rama local lista para merge.
5. Informa al Orquestador que el merge a master de v1 queda como acción humana
   (clase B: es otro repo; por prudencia no se auto-fusiona).

## Criterios de aceptación (GWT)

- DADO el README de QUIPU v1, CUANDO se lee su inicio, ENTONCES el aviso de congelamiento
  existe con fecha y referencia a ESTADO.md de Enterprise.
- DADO el estado de git en v1, CUANDO `git log --oneline -1`, ENTONCES el commit existe
  en rama `docs/congelamiento` y master quedó intacto.
- DADO cualquier otro archivo de v1, CUANDO `git status --porcelain`, ENTONCES ningún
  otro cambio aparece.

## Evidencia
`diff_review` del README, salida de `git log`/`git status`, commit.

## Fuera de alcance
Borrar/archivar contenido de v1; tocar su código o docs internas; fusionar a master;
tocar CHASQUIxQUIPU (producto sin relación).
