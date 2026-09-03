# ESTADO — Quipu Enterprise

> Vigente al **2026-09-01**, con F0 y F1 cerradas y ninguna fase abierta.
> La comprobación de cierre de F1 está en `CIERRE-F1.md`; **la deuda completa y
> clasificada, en `DEUDA-F2.md`** — la sección «Deuda declarada» de abajo se conserva
> como se escribió en F1, pero `DEUDA-F2.md` es la que manda para planificar.

## Capabilities OpenSpec (normativas)
| Capability | Estado | Notas |
|---|---|---|
| block-workflow   | completa | Ciclo de vida del bloque: grafo cerrado de transiciones (`backlog→ready→in_progress→verifying→done`, con `blocked`), gates evaluados en Postgres (dependencias `done`, contract locks activos) y cierre sólo humano (`block.approve`, `human_admin`). |
| traceability     | completa | Microtarea por entregable, ningún criterio `met` sin evidencia enlazada (`trg_bac_before_met`), evidencia con contenido real, enlaces M:N dentro del mismo bloque y gate que reporta por cuánto falla más los tipos de evidencia exigidos. |
| demand-chain     | completa | Cadena necesidad→cambio→requisito→enlace impuesta por triggers/CHECKs (anclaje, grafo de estados del cambio como dato, sellado de enlaces, firmas humanas); incluye vía rápida con deuda controlada y retrofit con cobertura (`fn_retrofit_exige_requisito`). Desde F1/T05, el grafo de estados del cambio también responde a `fn_cambio_sin_contradicciones` (ver `decision-chain`): `MODIFIED Requirements` sincronizado. |
| decision-chain   | completa | La mitad normativa del método (F1, port de Chasqui): `dominio` (vocabulario global), `decision` con grafo `decision_supersede` sin ciclos, `invariante` con evidencia `ruta:símbolo`, `contradiccion` que congela por dominio. Promoción de decisión y resolución de contradicción son actos humanos (firma `promuevo`/`human_admin` y ability `contradiccion:resolver`, ambos gates en Postgres); un agente sólo propone y abre. Límites declarados del modelo (TRUNCATE, no-deferrable de `trg_supersede_no_huerfana`, RESTRICT de `fk_ds_sucesora`, orden de triggers en `cambio`) en `openspec/changes/archive/f1-decision-chain/proposal.md`. |
| mcp-interface    | completa | 2 transportes (HTTP `POST /mcp` con `auth:sanctum` y STDIO `mcp:start quipu` con `QUIPU_AGENT_TOKEN`) sobre un solo motor; errores 422/403 nunca 500; sin tool de aprobación. 46 tools en `code/api/app/Mcp/Tools/` (conteo real de archivos: 40 en F0/T04 + 6 de `decision-chain` en F1/T03-T04). |

## En diseño / siguiente

- **F2 — importar Chasqui**: desbloqueada por `decision-chain`, sin ExecPlan ni tareas
  todavía. Sus bloqueantes están en `DEUDA-F2.md` § A.
- Pantallas web de `decision-chain` (dial F4): decisiones, invariantes y contradicciones no
  tienen UI todavía, sólo MCP+REST.
- `CONTEXTO-PROYECTO.md` no menciona `decision-chain` pese a que la capability cerró; se
  carga en todos los turnos, así que su desactualización se paga en cada sesión.

## Heredado de Quipu v1 sin spec (congelado)
| Feature | Tablas principales | Estado |
|---|---|---|
| Templates bootstrap | project_template (mig. `2026_07_12_100300`), template_applies_when (mig. `2026_07_16_100000`) | congelado: se revisa en F4 |
| Conocimiento | knowledge_entry (mig. `2026_07_12_140000`, junto a `code_module/class/method/route/component/hook`) | congelado: se revisa en F4 |
| Changelog | sin migración en este repo: `changelog_entry`/`changelog_block` no existen en `database/migrations/`; única referencia es un comentario en `code/web/src/pages/BlockHub.tsx` | congelado: se revisa en F4 |
| Catálogo UI | screen_component + component_state, component_interaction, component_data_source (mig. `2026_07_12_120100`), lookups `lookup_interaction_*` (mig. `2026_07_12_120000`) | congelado: se revisa en F4 |
| Assets | sin migración ni referencia en este repo: `entity_asset` no existe en `database/migrations/` | congelado: se revisa en F4 |

## Tests
- Suites API: 50. Baseline de 46 tras F0/T02 (dedup de suites, línea de abajo); F1 sumó 4:
  `DecisionChainTest.php` (F1/T02), `DominioContextoTest.php` (F1/T03), `DecisionMcpTest.php`
  (F1/T04) y `ContradiccionGateTest.php` (F1/T05). Suites web: 20 (sin cambio en F1: la
  capability no tiene UI). Duplicaciones resueltas en F0/T02:
  `AdopcionTest.php` absorbió los 15 tests de `AdoptionTest.php` (31 en total) y
  `AgentTokenTest.php` absorbió los 12 de `AuthTokenTest.php` (26 en total); ambos
  pares fusionados por regla literal de la tarea — la hipótesis de duplicados-exactos
  quedó refutada (0 duplicados exactos).
- CI medido en T01: api ≈ 67 s tiempo real (`composer ci`: pest 502 passed /
  2583 aserciones, 49 s de pest), web ≈ 9–26 s según corrida (`pnpm run ci`:
  vitest 20 archivos / 73 tests).
- CI final F1 medido en T06 sobre `main` fusionado (T02–T05): api `composer ci` exit 0 — pint
  PASS 342 files, phpstan nivel 8 `[OK] No errors`, pest **562 passed (3408 assertions)**,
  210.20 s; web `pnpm run ci` exit 0 — eslint+prettier PASS, `tsc -b` PASS, vitest **20 archivos
  / 73 tests**, 11.53 s (un primer intento cayó por timeout de workers vitest del entorno, sin
  relación con el código; el reintento inmediato, sin nada más corriendo en la pila, salió verde).

## Deuda declarada
- Servicio `web` sin healthcheck definido en compose (T01).
- `docker-compose.yml` cambiado a `restart: "no"` — pendiente confirmación del propietario (T01).
- Las worktrees necesitan replicar `.env`, `bootstrap/cache` y `storage/framework` locales (T02).
- Evidencia huérfana anterior al punto cero (`f1-b11/`, `f1-b12/`): ningún escenario la
  cita. Archivada el 2026-09-01 en `ARCHIVO/evidencia-pre-punto-cero/`; se resuelve en F4.
- Hipótesis de duplicación de suites refutada: 0 duplicados-exactos entre los pares
  Adopcion/Adoption y AuthToken/AgentToken (T02).
- Límites declarados del modelo `decision-chain` (F1, no corregidos a propósito):
  `TRUNCATE decision_supersede` sortea `trg_supersede_no_huerfana` (fallo sistémico, ninguna
  regla del motor se defiende de `TRUNCATE`); `trg_supersede_no_huerfana` no es `CONSTRAINT
  TRIGGER DEFERRABLE`; `fk_ds_sucesora` en `RESTRICT` impide borrar un proyecto con decisiones
  superadas; `trg_cambio_autorizado` se dispara antes que `trg_cambio_sin_contradicciones`
  (orden alfabético de Postgres) y por eso un cambio sin firma y congelado muestra primero el
  error de firma. Detalle y comandos de reproducción en
  `openspec/changes/archive/f1-decision-chain/proposal.md`.
- Grafo de transiciones de `decision` (hallazgo S4, resurrección `superada → vigente`) diferido
  a F2 por decisión humana (T06).

## Deuda del propio Sistema A (antes invisible)

El proyecto de optimización de contexto de la flota (`PLAN/FLOTA/PLAN_IMPLEMENTACION.md`)
entregó todo `bin/`, el modo sombra y el contrato mecánico de checkpoint, pero nunca entró
en este inventario. Sus cinco pendientes —incluido que `bin/metricas.sh` quedó ciego tras
el port a Claude Code— están en `DEUDA-F2.md` § D, y el trabajo que los produjo, sin tarea
que lo encargara, en `ARCHIVO/TRABAJO-SIN-TAREA.md`.
