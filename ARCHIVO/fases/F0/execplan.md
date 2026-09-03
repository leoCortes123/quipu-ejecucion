# PLAN/F0 — ExecPlan: Estabilización e inventario de QUIPU_ENTERPRISE

> **Fase CERRADA** (2026-08). Documento histórico: describe el encargo tal como se dio, no
> el estado actual. No se reescribe — reescribirlo falsificaría contra qué se verificó el
> trabajo. Dos cosas que ya no son ciertas: la rama por defecto es `main` (no `master`) y
> la evidencia vive en `evidencia/` (no en `code/web/evidencia/`).
> Estado vigente: `ESTADO/ESTADO.md`. Mapa del paquete: `INDICE.md`.

> Lector esperado: un agente sin memoria previa. Este documento + tu archivo de tarea +
> los 4 documentos raíz del paquete son TODO tu contexto. Si falta algo: ESCALAMIENTO C.

## Propósito

Dejar el repositorio `/mnt/datos/Programacion/QUIPU_ENTERPRISE` sin ambigüedades antes
de crecerlo: CI verde medido, tests deduplicados, punto cero del flujo OpenSpec declarado,
inventario de estado escrito, convención de evidencia formalizada y la política entre
repos documentada. Es la fase que desbloquea F1 (capability `decision-chain`).

## Contexto mínimo

- Stack: Laravel 12 / PHP 8.4 (`code/api`), React 19 + Vite (`code/web`), Postgres 16,
  Redis. Todo en Docker.
- Servicios: `api` :8001, `web` :5174, `postgres` :5436, `redis` :6382.
- CI: `docker compose exec api composer ci` (pint+phpstan nivel 8+pest) y
  `docker compose exec web pnpm run ci` (eslint+prettier+tsc+vitest).
- Tests API: `code/api/tests/Feature/` (~48 suites). Web: tests vitest junto a pantallas.
- Flujo propio del repo: OpenSpec (`openspec/specs/` = fuente de verdad;
  `openspec/changes/` con delta→sync→archive).
- Git: rama por defecto `master`. Estado inicial verificado: 7 commits, CI presumiblemente
  verde (T01 lo confirma), sin TODO/FIXME.

## Autorización

F0 completa pre-aprobada por el humano (plan aprobado). Nivel L3 dentro del alcance
textual de cada tarea. Los commits que cada tarea ordene están autorizados.

## Hitos

| Hito | Contenido | Verificación |
|---|---|---|
| M0 | Working tree resuelto: reestructuración pendiente commiteada, master limpio | T00 |
| M1 | CI verde medido + suites deduplicadas | T01, T02 |
| M2 | Punto cero OpenSpec + inventario ESTADO.md | T03, T04 |
| M3 | Convención evidencia + política de repos | T05, T06 |

## Tabla de tareas

| Tarea | Depende de | Resumen |
|---|---|---|
| T00-resolucion-working-tree | — | commitear la reestructuración OpenSpec pendiente (31 archivos); master limpio |
| T01-ci-verde-inventario | T00 | levantar stack, CI verde, medir tiempos, inventario de suites |
| T02-dedup-tests | T01 | resolver AdopcionTest/AdoptionTest y AuthTokenTest/AgentTokenTest |
| T03-punto-cero-openspec | T01 | commit que declara base aplanada; nota en CLAUDE.md |
| T04-estado-md | T01, T02 | escribir ESTADO.md completo |
| T05-evidencia-convencion | — | formalizar `code/web/evidencia/` en CLAUDE.md |
| T06-politica-repos | T04 | marcar congelamiento de QUIPU v1 en su README |

Orden recomendado: **T00 obligatorio primero, sobre master y sin worktree** (resuelve el
working tree pendiente; los worktrees nacen de HEAD). Después T01 → {T02, T03, T05} →
T04 → T06. T02/T03/T05 paralelizables en worktrees distintas (no tocan los mismos archivos).

## Contexto crítico descubierto en verificación (2026-08)

El repo NO estaba limpio al auditarlo: existe una reestructuración completa sin commitear
(toda `docs/` heredada borrada, `openspec/` entero no rastreado, CLAUDE/README/docker
modificados — 31 archivos). Es trabajo intencional de una sesión anterior que murió antes
del commit. **T00 lo preserva en commits revisables antes de que cualquier agente toque
nada.** La nota de "punto cero" de T03 sigue siendo necesaria: el archivo delta seguirá
vacío incluso tras commitear la base.

## No-goals (explícito: una IA no infiere límites de lo omitido)

- NO se refactoriza nada más allá de la deduplicación literal de T02.
- NO se actualizan dependencias (composer/package intocables).
- NO se corrigen bugs ni deuda descubierta de paso: se registra en checkpoint
  (`hallazgos_no_aplicados`) y ahí queda.
- NO se modifica contenido normativo de specs existentes (sí se permite el commit
  declarativo de T03 sobre CLAUDE.md, texto exacto dado en la tarea).
- NO se crea ninguna capability nueva; F1 es otra fase.
- NO se toca ningún otro repositorio salvo el README de QUIPU v1 en T06.

## Riesgos conocidos

- El stack puede no estar levantado o volúmenes fríos tras reinicio: T01 lo resuelve;
  si un servicio no arranca tras dos intentos → ESCALAMIENTO C.
- Las suites duplicadas pueden tener tests únicos cada una: la regla de decisión está
  escrita en T02; lo que exceda esa regla → ESCALAMIENTO C.

## Verificación final de la fase

Dado F0 ejecutada, cuando el Orquestador re-ejecuta ambos comandos de CI en `master`
con las worktrees fusionadas, entonces: verde, sin suites duplicadas (grep de nombres),
`ESTADO.md` existe y cita las 4 capabilities, CLAUDE.md contiene las notas de T03 y T05,
README de QUIPU v1 declara el congelamiento, y `git log` muestra exactamente los commits
especificados por las tareas, nada más.
