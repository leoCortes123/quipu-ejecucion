# T01 — Propuesta OpenSpec del change `f1-decision-chain`

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Planificador (worktree `wt/f1-t01-propuesta`) · Nivel: L3 · Presupuesto: ~60 min
Depende de: T00.

## Propósito
Dejar el contrato normativo de la capability ANTES de una línea de código: proposal,
design, delta spec y tasks del change `f1-decision-chain`. Será el primer change del
historial delta tras el punto cero.

## Contexto
- El CLI `openspec` no está instalado en el host: crea la estructura a mano con los
  formatos capturados. Referencias obligatorias (léelas primero): `openspec/config.yaml`,
  `.opencode/commands/opsx-propose.md`, `.opencode/commands/opsx-sync.md` (secciones delta),
  `openspec/specs/demand-chain/spec.md` (estilo requirement/scenario).
- Regla dura del repo: cada escenario cita el test que lo verifica. Los tests aún no existen:
  cítalos por su nombre final (`tests/Feature/DecisionChainTest.php`, `ContradiccionGateTest.php`,
  `DecisionMcpTest.php`, `DominioContextoTest.php`) — las tareas T02–T05 los crean así.
- Validación best-effort al final: `npx -y openspec validate --all --strict`; si el CLI no
  existe o falla por ausencia, NO es fallo de la tarea (anótalo en checkpoint).

## Pasos

1. Lee los archivos de formato listados.
2. Crea `openspec/changes/f1-decision-chain/` con cuatro artefactos:

**`proposal.md`**: port de la mitad normativa de Chasqui; capabilities afectadas:
`decision-chain` (nueva) e integración menor en `demand-chain`; reversión: `down()` completos
y columnas nuevas nullable.

**`design.md`**: transcribe las 5 decisiones de diseño del execplan (§ Decisiones de diseño
ya tomadas) y la postura Postgres-vs-PHP: todo gate vive en triggers/CHECK, PHP sólo informa.

**`specs/decision-chain/spec.md`**: delta `## ADDED Requirements` con estos 7 requirements
(formato SHALL + Scenario WHEN/THEN, citando su test):

| # | Requirement | Escenario | Test |
|---|---|---|---|
| 1 | Una decisión superada tiene siempre sucesor y motivo (`fn_decision_superada`) | marcar superada sin arista → Postgres rechaza | DecisionChainTest |
| 2 | Sin ciclos de supersede (`fn_supersede_sin_ciclos`) | arista que cierra A→B→A → rechaza nombrando el ciclo | DecisionChainTest |
| 3 | Sólo humanos promueven decisiones (firma `promuevo` human_admin + ability `decision:aprobar` + sin tool) | agente propone → nace `propuesta` y ningún camino MCP la promueve | DecisionMcpTest |
| 4 | Invariante confirmado lleva evidencia (`ck_inv_confirmado_evidencia`) | confirmado sin evidencia ruta:símbolo → CHECK rechaza | DecisionChainTest |
| 5 | Un criterio cita sólo invariantes vigentes (`fn_invariante_vigente`) | criterio cita invariante de decisión superada → rechaza al COMMIT | ContradiccionGateTest |
| 6 | Un cambio con contradicción pendiente no avanza (`fn_cambio_sin_contradicciones`) | autorizar cambio de dominio congelado → 422 nombrando la contradicción; único escape: rechazado | ContradiccionGateTest |
| 7 | El agente ve el dominio antes de actuar (`dominio_contexto`) | consulta devuelve vigentes, superadas, invariantes con evidencia | DominioContextoTest |

**`tasks.md`**: lista verifiable una a una mapeando T02–T06 de este paquete, con CI completo
como último ítem.

3. Commit en tu worktree:
```
OpenSpec: propuesta f1-decision-chain — dominios, decisiones, invariantes, contradicciones

F1/T01 · primer change del historial delta tras el punto cero
```

## Criterios de aceptación (GWT)

- DADO el delta spec, CUANDO se contrasta contra el formato de demand-chain/spec.md,
  ENTONCES usa idéntica estructura (Requirement SHALL / Scenario WHEN-THEN) y cada
  escenario cita uno de los 4 tests por nombre.
- DADO design.md, CUANDO se lee, ENTONCES contiene las 5 decisiones literales del execplan
  y ninguna regla nueva inventada.
- DADO el CLI openspec, CUANDO corre validate, ENTONCES pasa o su ausencia queda registrada.
- DADO el diff final, CUANDO `git status --porcelain`, ENTONCES sólo aparece
  `openspec/changes/f1-decision-chain/`.

## Evidencia
`file_content` de los 4 artefactos, salida de validate, commit.

## Fuera de alcance
Implementar cualquier código; editar specs existentes; instalar el CLI globalmente.
