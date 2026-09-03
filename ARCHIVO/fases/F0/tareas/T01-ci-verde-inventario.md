# T01 — CI verde e inventario de suites

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor · Nivel: L3 (pre-aprobada) · Presupuesto: ~40 min

## Propósito
Confirmar que el entorno levanta, medir el costo real del CI y producir el inventario de
suites de test que T02 consumirá.

## Contexto
- Repo: `/mnt/datos/Programacion/QUIPU_ENTERPRISE`. Trabaja en rama `master` directamente
  (esta tarea no modifica código).
- Todos los comandos dentro de contenedores. Si `docker compose up -d` no deja los 4
  servicios healthy tras 2 intentos → ESCALAMIENTO C.

## Pasos

1. `docker compose up -d` y espera healthy (`docker compose ps`).
2. Si es primera vez en esta máquina: `docker compose exec api php artisan migrate --seed`
   (verifica antes con `docker compose exec api php artisan migrate:status`; si ya está
   migrado NO ejecutes seed).
3. Cronometra y captura salida completa:
   `docker compose exec api composer ci`
   `docker compose exec web pnpm run ci`
4. Inventario: lista las suites de `code/api/tests/Feature/*.php` y los archivos
   `*.test.ts(x)` de `code/web/src`, con número de líneas de cada uno.
5. Registra en el checkpoint el tiempo de cada comando y el total.

## Criterios de aceptación (GWT)

- DADO el stack levantado, CUANDO corre `composer ci`, ENTONCES exit 0.
- DADO el stack levantado, CUANDO corre `pnpm run ci`, ENTONCES exit 0.
- DADO el inventario producido, CUANDO se buscan pares de nombre similar
  (`Adopcion*`/`Adoption*`, `AuthToken*`/`AgentToken*`), ENTONCES aparecen listados con
  sus líneas para T02.
- DADO un CI fallido por entorno (volúmenes fríos, contenedor muerto), CUANDO se corrige
  sólo con operaciones docker documentadas en CLAUDE.md (`restart api|web`), ENTONCES es
  clase A; cualquier otra cosa es clase C.

## Evidencia
`command_output` de ambos CI (exit codes + resumen final), tabla de tiempos,
inventario completo en el checkpoint.

## Fuera de alcance
Corregir fallos de código; tocar dependencias; "arreglar" warnings preexistentes.
