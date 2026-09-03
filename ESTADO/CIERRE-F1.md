# CIERRE-F1 — comprobación de finalización de la fase 1

Fecha de la comprobación: **2026-09-01**. Reconstruido desde `.session/progress.json`,
`git log` de `/mnt/datos/Programacion/QUIPU_ENTERPRISE` y el árbol real, nunca desde
narrativa (`NORMATIVA/HANDOFF.md` § Reglas).

## Veredicto

**F1 está terminada en lo sustantivo y cerrada en el ledger.** La capability
`decision-chain` existe, está impuesta en Postgres, tiene superficie MCP+REST, spec
sincronizada, change archivado, CI verde medido y evidencia derivada commiteada.

Quedaban **tres actos de cierre** que no son de código. Dos se aplican en este mismo
documento; uno sigue abierto y no lo puede cerrar un agente.

## Tarea por tarea

| Tarea | Ejecutor | Verificador | Orquestador | Commits en `main` |
|---|---|---|---|---|
| T00 preflight | hecha (2 vueltas) | hecha | cerrada | — (medición) |
| T01 propuesta OpenSpec | hecha | hecha | cerrada | `4721de7` |
| T02 migraciones normativas | hecha (4 vueltas) | hecha | cerrada | `9f5e383` |
| T03 tools de lectura | hecha | hecha | cerrada | `8f1f0d0` |
| T04 tools gated + promoción | hecha (2 vueltas) | hecha | cerrada | `da49e11`, `e0e0b4f`, `21b7a0a` |
| T05 integración demanda | hecha (2 vueltas) | hecha | cerrada | `718406e`, `af3c23e`, `5468f2f` |
| T06 cierre OpenSpec + ESTADO | hecha | hecha | cerrada | `b97b410`, `9693378`, `f6ded75` |

Ningún Verificador coincide con su Ejecutor (`NORMATIVA/CONSTITUCION.md` regla 14).
En T06 el archivo de tarea asignaba el rol al Orquestador; se ejecutó con Ejecutor y
Verificador distintos precisamente para no violar la regla 14, y la desviación está
registrada en el checkpoint del Orquestador con su justificación.

## Puerta general de `NORMATIVA/VALIDACION.md`

| Criterio | Resultado | Evidencia |
|---|---|---|
| CI API verde | **PASA** | `composer ci` exit 0 — pint PASS 342 archivos, phpstan nivel 8 `[OK] No errors`, pest **562 passed / 3408 aserciones**, 210,20 s. `evidencia/f1-decision-chain/composer_ci_final.txt` |
| CI web verde | **PASA** | `pnpm run ci` exit 0 — eslint+prettier PASS, `tsc -b` PASS, vitest 20 archivos / 73 tests, 11,53 s |
| Regla suite-diff (ninguna suite que pasaba deja de pasar) | **PASA** | baseline 46 suites tras F0/T02 → 50 hoy; las 4 nuevas son de F1 |
| Specs sincronizadas antes de archivar | **PASA** | `openspec/specs/decision-chain/spec.md` existe; `demand-chain` refleja su sección `MODIFIED` |
| Cada escenario cita su test | **PASA** | convención `- **Verificado por**: <ruta>` estrenada por `decision-chain` |
| Evidencia derivada, no escrita a mano | **PASA** | 5 archivos en `evidencia/f1-decision-chain/`, salidas redirigidas de pest y del CI |

### Contrastes hechos contra el árbol real, no contra el ledger

| Afirmación de `ESTADO/ESTADO.md` | Conteo real | Coincide |
|---|---|---|
| 46 tools MCP | `ls code/api/app/Mcp/Tools/*.php` → **46** | sí |
| 50 suites API | `ls code/api/tests/Feature/*.php` → **50** | sí |
| 20 suites web | 20 ficheros `*.test.*` en `code/web/src` | sí |

## Actos de cierre pendientes al 2026-09-01

| # | Acto | Estado |
|--:|---|---|
| 1 | Aplicar la regla 7 de oro a `AGENTS.md` con el texto propuesto por el Ejecutor de T06 | **APLICADO** el 2026-09-01 en esta reorganización. El texto es el que dejó en `extra.texto_propuesto_AGENTS_regla_7` de su checkpoint, literal salvo puntuación |
| 2 | Borrar las worktrees `wt/f1-*` (`ESTADO/DESPLIEGUE.md` §5) | **APLICADO** el 2026-09-01, tras comprobar rama por rama que su contenido está en `main` |
| 3 | Correr `openspec validate --all --strict` | **ABIERTO.** Nunca se ha ejecutado: `npx` y `node` están en el `deny` de `.claude/settings.json` y de `opencode.json`. Toda la validación estructural del flujo OpenSpec ha sido manual hasta hoy |

El acto 3 es una decisión humana: abrir el permiso de `npx` antes de F2 —donde habrá más
changes que validar— o asumir de forma explícita que la validación seguirá siendo manual.
Está registrado en `abierto[]` del checkpoint de `F1/orquestacion`.

## Lo que F1 dejó deliberadamente sin corregir

No son defectos pendientes de arreglar: son límites **declarados y verificados**, con
comandos de reproducción en `openspec/changes/archive/f1-decision-chain/proposal.md`.
Se listan aquí para que la comprobación de fase no los confunda con trabajo olvidado.
Su tratamiento futuro está en `ESTADO/DEUDA-F2.md`.

1. `TRUNCATE decision_supersede` sortea `trg_supersede_no_huerfana`. Es **sistémico**:
   ninguna regla del motor se defiende hoy de `TRUNCATE`.
2. `trg_supersede_no_huerfana` no es `CONSTRAINT TRIGGER DEFERRABLE`: sustituir la
   sucesora con DELETE-luego-INSERT se rechaza aunque la transacción acabe consistente.
3. `fk_ds_sucesora` en `RESTRICT` impide borrar un proyecto con decisiones superadas.
4. `trg_cambio_autorizado` se dispara antes que `trg_cambio_sin_contradicciones` (orden
   alfabético de Postgres): un cambio sin firma y además congelado muestra primero el
   error de firma. Ninguna regla se viola; engaña el orden de los mensajes.

## Cómo re-verificar esto sin creerme

```bash
cd /mnt/datos/Programacion/QUIPU_ENTERPRISE
docker compose up -d
docker compose exec -T -e COMPOSER_PROCESS_TIMEOUT=1800 api composer ci   # espera exit 0
docker compose exec -T web pnpm run ci                                    # espera exit 0
ls code/api/app/Mcp/Tools/*.php | wc -l                                   # espera 46
ls code/api/tests/Feature/*.php | wc -l                                   # espera 50
sistema-a/bin/estado.sh                                                   # proyección del ledger
```

El CI no cabe en una invocación de shell (techo de 10 min; pest tarda ~210 s y el CI
completo más): lánzalo en segundo plano a un fichero de log y lee el `exit code`.
