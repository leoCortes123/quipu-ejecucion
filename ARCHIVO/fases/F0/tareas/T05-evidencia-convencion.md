# T05 — Formalizar convención de evidencia en repo

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor (worktree `wt/f0-t05-evidencia`) · Nivel: L3 · Presupuesto: ~15 min
Depende de: ninguna (paralelizable con T02–T04).

## Propósito
Convertir el hábito informal de guardar evidencias reales en el repo
(`code/web/evidencia/f1-b12/traza-CHG-0003.json`) en convención escrita, hasta que la
evidencia migre a BD (F3 del plan).

## Contexto
Existe exactamente una evidencia actual: `code/web/evidencia/f1-b12/traza-CHG-0003.json`.
El patrón observado: `evidencia/<bloque>/<descripción>.<ext>`.

## Pasos

1. Crea `code/web/evidencia/README.md` con:

   ```markdown
   # evidencia/ — artefactos de verificación commiteados

   Convención: evidencia/<bloque-o-change>/<qué-prueba>.<ext>
   Reglas:
   - Cada archivo prueba UN criterio citado por un test o un scenario OpenSpec.
   - Es artefacto DERIVADO: se regenera ejecutando lo que lo produce; nunca se edita
     a mano para "arreglar" un resultado.
   - Cuando la evidencia viva en la BD de Quipu (capability planificada), este
     directorio queda deprecado y se elimina en bloque.
   ```

2. Edita `CLAUDE.md`: en la sección de reglas duras del flujo OpenSpec, añade:

   > - **La evidencia que cita un escenario vive en `code/web/evidencia/`** siguiendo su
   >   README: derivada, reproducible, nunca editada a mano.

3. Commit único:
   ```
   Docs: convención de evidencia en repo

   F0/T05 · README de evidencia + nota en CLAUDE.md
   ```

## Criterios de aceptación (GWT)

- DADO el repo tras la tarea, CUANDO se abre `code/web/evidencia/`, ENTONCES existe
  README.md con las tres reglas.
- DADO `CLAUDE.md`, CUANDO se leen las reglas duras del flujo, ENTONCES la nueva regla
  está presente.
- DADO la evidencia existente (`f1-b12/traza-CHG-0003.json`), CUANDO se contrasta con la
  convención escrita, ENTONCES ya cumple el patrón de ruta (no se mueve ni renombra).

## Evidencia
`file_content` de ambos archivos, `diff_review`, commit.

## Fuera de alcance
Mover/renombrar evidencias existentes; crear evidencias nuevas; tocar tests.
