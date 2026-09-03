# T03 — Punto cero del flujo OpenSpec

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor (worktree `wt/f0-t03-openspec`) · Nivel: L3 · Presupuesto: ~15 min
Depende de: T01.

## Propósito
Dejar declarado explícitamente que las 4 capabilities existentes constituyen la base
aplanada del proyecto y que el historial de deltas (`openspec/changes/archive/`) arranca
vacío desde este commit. Resuelve la incoherencia detectada en auditoría: regla "ningún
change se archiva sin delta sincronizado" con archivo vacío e historia inexistente.

## Contexto
- `openspec/specs/` contiene: `block-workflow`, `traceability`, `demand-chain`,
  `mcp-interface`. `openspec/changes/archive/` está vacío.
- Decisión ya tomada por el humano (opción A de la auditoría): aceptar base aplanada,
  NO reconstruir deltas retroactivos.

## Pasos

1. Verifica el estado actual:
   `ls openspec/specs/ && ls openspec/changes/archive/` (debe listar las 4 y estar vacío).
2. Edita `CLAUDE.md`: bajo la sección "Desarrollo con OpenSpec", añade esta nota exacta
   después del bloque de reglas duras:

   > **Punto cero (2026-08):** las cuatro capabilities existentes fueron sincronizadas
   > antes de instituir el flujo estricto; su historial de deltas no existe y NO se
   > reconstruye. El historial delta arranca vacío desde ese acuerdo: todo change nuevo
   > sigue el flujo propose→implementar→CI→sync→archive sin excepción.

3. Crea `openspec/changes/archive/BASE-000-punto-cero.md` con:

   ```markdown
   # BASE-000 — Punto cero del historial delta
   Fecha: <fecha real>
   Las capabilities block-workflow, traceability, demand-chain y mcp-interface existían
   ya sincronizadas al heredar la base de Quipu v1. Este archivo marca que su historial
   de deltas se declara inexistente por decisión del propietario; ningún change posterior
   se archiva sin delta sincronizado (regla vigente en CLAUDE.md).
   ```

4. Valida: `docker compose exec api php artisan --version` no es necesario aquí;
   en su lugar corre desde el host `npx openspec validate --all --strict` si el CLI está
   disponible; si NO lo está, es clase A omitir este paso dejándolo anotado.
5. Commit único:
   ```
   OpenSpec: punto cero del historial delta

   F0/T03 · base aplanada declarada · BASE-000 · nota en CLAUDE.md
   ```

## Criterios de aceptación (GWT)

- DADO el repo tras la tarea, CUANDO se lista `openspec/changes/archive/`, ENTONCES
  contiene exactamente `BASE-000-punto-cero.md`.
- DADO `CLAUDE.md`, CUANDO se lee la sección "Desarrollo con OpenSpec", ENTONCES la nota
  de punto cero está presente con fecha real.
- DADO el diff final, CUANDO `git status --porcelain`, ENTONCES sólo aparecen
  `CLAUDE.md` y el archivo nuevo bajo `openspec/changes/archive/`.

## Evidencia
`file_content` de ambos archivos, `diff_review`, commit.

## Fuera de alcance
Retocar el texto de las specs; crear deltas retroactivos; tocar cualquier otra sección
de CLAUDE.md.
