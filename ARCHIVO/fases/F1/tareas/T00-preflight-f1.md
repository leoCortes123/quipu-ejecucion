# T00 — Preflight F1: baseline del terreno

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Ejecutor (SIN worktree, sobre main) · Nivel: L3 · Presupuesto: ~20 min
Depende de: nada.

## Propósito
Confirmar que el repo está en estado conocido antes de crecerlo, y medir el baseline
de CI que F1 debe preservar.

## Pasos

1. `git -C /mnt/datos/Programacion/QUIPU_ENTERPRISE status --porcelain` → debe estar vacío.
   Si hay algo sin commitear: ESCALAMIENTO C (no commites tú nada por tu cuenta).
2. `docker compose up -d` y espera salud de api/postgres/redis.
3. Corre y CRONOMETRA ambos CI:
   - `time docker compose exec api composer ci`
   - `time docker compose exec web pnpm run ci`
4. Anota en tu checkpoint: tiempos, número de suites pest (`./vendor/bin/pest --list-tests | wc -l`
   o el conteo del resumen), commit HEAD exacto.
5. Sin commit (no modificas nada).

## Criterios de aceptación (GWT)

- DADO `git status --porcelain`, CUANDO se ejecuta al inicio, ENTONCES no devuelve líneas.
- DADO ambos CI, CUANDO terminan, ENTONCES salen 0 (verde) con tiempos registrados.
- DADO HEAD, CUANDO termina la tarea, ENTONCES sigue siendo el mismo commit.

## Evidencia
Checkpoint con tiempos y HEAD. `command_output` de ambos CI.

## Fuera de alcance
Arreglar nada: si un CI está rojo, ESCALAMIENTO C inmediato.
