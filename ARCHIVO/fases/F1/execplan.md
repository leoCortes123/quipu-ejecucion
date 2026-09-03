# PLAN/F1 — ExecPlan: Capability `decision-chain` (la mitad normativa de Chasqui)

> **Fase CERRADA** (2026-09-01). Documento histórico: describe el encargo tal como se dio,
> no el estado actual. No se reescribe. La comprobación de que la fase terminó, tarea por
> tarea y contra el árbol real, está en `ESTADO/CIERRE-F1.md`; lo que quedó pendiente, en
> `ESTADO/DEUDA-F2.md`. Mapa del paquete: `INDICE.md`.

> Lector esperado: un agente sin memoria previa. Este documento + tu archivo de tarea +
> los 4 documentos raíz del paquete son TODO tu contexto. Si falta algo: ESCALAMIENTO C.

## Propósito

Portar a QUIPU_ENTERPRISE la capa normativa de `chasqui_n8n`: **decisiones** con grafo
supersede, **invariantes** con evidencia, **dominios** y **contradicciones**, impuestas por
la base de datos (un estado inválido no está desaconsejado: es imposible). Es la capability
que ninguna herramienta del mercado tiene y la que desbloquea F2 (importar Chasqui).

## Contexto mínimo

- Stack: Laravel 12 / PHP 8.4 (`code/api`), React 19 (`code/web`), Postgres 16, Docker.
  Servicios: api :8001, postgres :5436. CI API: `docker compose exec api composer ci`
  (pint + phpstan nivel 8 + pest). CI Web: `docker compose exec web pnpm run ci`.
- Git: rama principal **main** (verificado post-F0; los commits de F0 viven ahí).
- Fuente de verdad del diseño: `openspec/config.yaml` (schema `spec-driven`) +
  `openspec/specs/*/spec.md`. Flujo: propose → implementar → CI verde → sync → archive.
- Convenciones BD verificadas (2026-08): migraciones anónimas con `DB::unprepared(<<<'SQL')`,
  lookups `lookup_<x>` sembrados con INSERT dentro de la propia migración, PK `id SERIAL`,
  constraints `pk_/fk_/uq_/ck_/ix_` + alias corto, estados como VARCHAR+FK a lookup,
  triggers `fn_<regla>` plpgsql con `RAISE EXCEPTION` en español, CONSTRAINT TRIGGER
  DEFERRABLE cuando la regla cruza tablas, huella vía `lookup_artefacto_tipo` +
  `fn_mantener_huella` + `instalar_propagacion`.
- Convenciones MCP verificadas: tools `final class X extends Tool` con `#[Name]`/`#[Description]`,
  registro en `app/Mcp/Servers/QuipuServer.php`, traits `ResolvesMember`/`ResolvesProject`,
  errores `ProtocolViolation` (422) / `PermissionDenied` (403), escritura delegada en servicios
  de `app/Protocol/`, y **ninguna tool de acto de gobierno** (vigilan `McpToolsTest` y `FirmaTest`).
- Formato origen (Chasqui): decisión = `id DOMINIO-NNN`, `dominio`, `estado vigente|superada|descartada`,
  `titulo`, `invariantes[]` (prosa atómica), `supersede[]`, `motivo_reemplazo`, `relacionada_con`,
  `afecta[]` (símbolos). La F2 lo importará; F1 define el destino en BD compatible campo a campo.

## Autorización

F1 pre-aprobada por el humano (plan aprobado). Nivel L3 dentro del alcance textual de cada
tarea. Los commits que cada tarea ordene están autorizados. Fuera de ese texto: `ESCALAMIENTO.md`.
No existe L4 en esta fase.

## Hitos

| Hito | Contenido | Verificación |
|---|---|---|
| M0 | Baseline CI medido + contrato normativo propuesto en OpenSpec | T00, T01 |
| M1 | Esquema normativo en BD: imposible violar supersede/evidencia/ciclos | T02 |
| M2 | Superficie MCP completa: 6 tools, promoción sólo humana | T03, T04 |
| M3 | Demanda conectada a normativa + capability cerrada y archivada | T05, T06 |

## Tabla de tareas

| Tarea | Depende de | Resumen |
|---|---|---|
| T00-preflight-f1 | — | stack arriba, CI verde medido en main, working tree limpio |
| T01-propuesta-openspec | T00 | change `f1-decision-chain`: proposal, design, delta spec, tasks |
| T02-migraciones-normativas | T01 | dominio, decision, decision_supersede, invariante, contradiccion + triggers |
| T03-tools-lectura | T02 | `dominio_contexto`, `decision_leer`, `invariantes_de`, `verificar_contradicciones` |
| T04-tools-gated-promocion | T02 | `decision_proponer`, `registrar_contradiccion`; promoción humana por REST+firma |
| T05-integracion-demanda | T02 | dominio en necesidad/cambio, criterio→invariante, gate de contradicciones |
| T06-cierre-openspec-estado | T03–T05 | sync+archive del change, ESTADO.md, CI final, checkpoint y evidencia |

Orden recomendado: T00 → T01 → T02 → {T03, T04, T05 en worktrees paralelas} → T06 sobre main.
T03/T04/T05 tocan archivos distintos (tools nuevas vs. migraciones de demanda vs. server+REST);
la única colisión posible es `QuipuServer.php` entre T03 y T04: T03 registra sus 4 tools,
T04 añade las 2 restantes — quien llegue segundo hace rebase y resuelve el array a mano.

## Decisiones de diseño ya tomadas (no re-discutir)

1. **Promoción de decisión = acto de gobierno**: `propuesta → vigente` exige firma con
   significado `promuevo` puesta por humano (`human_admin`), patrón `politica_autorizacion`/
   `fn_cambio_autorizado`. Además: endpoint REST con `ability:decision:aprobar` (sólo credencial
   humana) y **ninguna tool MCP de promoción** (patrón barrera-1 de `bloque:aprobar`).
2. **`registrar_contradiccion` SÍ es tool de agente** (desviación deliberada y justificada del
   plan original): abrir una contradicción es conservador — congela, no desbloquea nada.
   Lo human-only es la **resolución** (`aceptada|revocada`), que no tendrá tool ni ruta de agente.
   Si el humano veto esta decisión al revisar el paquete: la tool pasa a ser propuesta-only y se
   registra expediente; nada más del paquete cambia.
3. **Congelación por dominio**: una contradicción `pendiente` congela (a) el cambio que la abrió
   y (b) todo cambio del mismo `dominio_slug`; único escape hacia `rechazado`. Es el port fiel
   de «la decisión se escribe primero» de Chasqui.
4. **`dominio` es tabla global** (vocabulario compartido entre proyectos); `decision`,
   `invariante` y `contradiccion` llevan `project_id`. Columna simple `dominio_slug` en
   necesidad/cambio (nullable); la tabla puente multi-dominio se evalúa en F2 con datos reales.
5. **Estados**: `lookup_decision_estado (propuesta|vigente|superada|descartada)`;
   `lookup_contradiccion_resolucion (pendiente|aceptada|revocada)`;
   `lookup_invariante_etiqueta (confirmado|inferido)`.

## Contexto crítico descubierto en verificación (2026-08)

- El CLI `openspec` NO está instalado en el host: T01 crea el change **manualmente** siguiendo
  los formatos capturados de `.opencode/commands/opsx-*.md` y `changes/archive/BASE-000-punto-cero.md`.
  Si durante la ejecución aparece el CLI, úsalo y valida; si no, validación best-effort con
  `npx -y openspec validate --all --strict` (fallar silencioso del CLI ≠ fallo de la tarea).
- Este sería el **primer change del historial delta** después del punto cero: el rigor del
  formato importa más que nunca.
- `firma` y `lookup_significado_firma` existen (`2026_07_20_110000_create_firma.php`):
  léelas ANTES de T04 y usa sus columnas reales, no supuestos.
- Las suites de demanda existentes insertan cambios SIN dominio: la columna es nullable y el
  gate de contradicciones sólo aplica a cambios con dominio, así que nada previo debe romperse.
  Si algo se rompe, el bug es del gate, no de las suites viejas.

## No-goals (explícito: una IA no infiere límites de lo omitido)

- NO hay UI web para decisiones/invariantes/contradicciones (pantallas: fase de dial F4).
- NO se importa nada de chasqui_n8n ni se le toca (importador: F2). NO se crean skills.
- NO hay export a markdown (`quipu:exportar`: F2). NO hay tabla puente multi-dominio.
- NO se modifican specs/capabilities existentes salvo el delta declarado en T01.
- NO se añaden dependencias composer/npm. NO se refactoriza código ajeno a las 6 tools,
  las 5 tablas y las integraciones listadas.
- NO se toca ningún otro repositorio.

## Riesgos conocidos

- phpstan nivel 8 con clases nuevas: copia los patrones de tools existentes; prohibido bajar
  niveles o añadir ignores.
- El CTE recursivo anti-ciclos: probado con A→B→A y con cadena larga A→B→C→A; ambos rechazan.
- Divergencia entre este plan y archivos reales (nombres de lookup, columnas de firma):
  manda el archivo real; anota la diferencia en tu checkpoint. Si cambia la SEMÁNTICA de una
  regla → ESCALAMIENTO C.
- Congelación demasiado agresiva podría trabajar flujos legítimos: el escape a `rechazado`
  y la resolución humana son parte de la misma migración; nunca quedes atrapado sin salida.

## Verificación final de la fase

Dado F1 ejecutada, cuando el Orquestador re-ejecuta `composer ci` y `pnpm run ci` en main con
las worktrees fusionadas, entonces: ambas verdes; la reflexión sobre `QuipuServer::$tools`
muestra exactamente las 6 tools nuevas y ninguna cuyo nombre contenga verbos de gobierno;
los 7 requirements del delta tienen su escenario citando un test que existe y pasa;
`openspec/specs/decision-chain/spec.md` está sincronizado y el change archivado;
`ESTADO.md` lista decision-chain como completa; y `git log` muestra exactamente los commits
que ordenaron las tareas, nada más.
