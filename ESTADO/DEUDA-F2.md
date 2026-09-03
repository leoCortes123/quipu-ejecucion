# DEUDA-F2 — todo lo que entra a la próxima fase, en un solo sitio

Antes de este documento la deuda vivía en tres lugares que nadie leía juntos:
`ESTADO/ESTADO.md` § «Deuda declarada», el array `abierto[]` del ledger
(`.session/progress.json`, 5 entradas vivas) y `PLAN/FLOTA/PLAN_IMPLEMENTACION.md` §6.4.
Aquí está consolidada, clasificada y con dueño. **Este es el insumo del ExecPlan de F2.**

Fecha de consolidación: 2026-09-01. Ninguna entrada se inventa: cada una cita su origen.

---

## A. Bloqueantes de F2 — hay que decidirlos antes de escribir el plan

| # | Asunto | Por qué bloquea | Origen |
|--:|---|---|---|
| A1 | **`openspec validate --all --strict` nunca se ha ejecutado.** `npx` y `node` están denegados en `.claude/settings.json` y `opencode.json`. Toda la validación estructural ha sido manual | F2 importa Chasqui: habrá muchos más changes que validar, y la validación manual no escala. Decidir: abrir el permiso, o declarar por escrito que la validación es manual | `abierto[]` de `F1/orquestacion` |
| A2 | **No existe `PLAN/F2-execplan.md` ni `TAREAS/F2/`.** Sin ellos ningún agente tiene alcance pre-aprobado | Es la fase entera. `AGENTS.md` § Nivel de autonomía ya lo refleja: sin fase abierta, todo es clase C | esta reorganización |
| A3 | **Alcance real de F2.** `PLAN/F1-execplan.md` la describe como «importar Chasqui», pero el origen (`/mnt/datos/Programacion/chasqui_n8n`) sigue siendo sólo-lectura y nadie ha inventariado qué contiene ni cuánto es | Sin inventario del origen, el presupuesto de F2 es una adivinanza | `PLAN/F1-execplan.md` § Propósito |

---

## B. Deuda técnica de `decision-chain` — decidida a conciencia en F1

Los cuatro límites del modelo están **verificados empíricamente** por los Verificadores de
T02 y T05, con comandos de reproducción en
`openspec/changes/archive/f1-decision-chain/proposal.md`. No se corrigieron en F1 porque
estaban fuera del alcance textual de las tareas, no por descuido.

| # | Límite | Naturaleza | Recomendación |
|--:|---|---|---|
| B1 | `TRUNCATE decision_supersede` sortea `trg_supersede_no_huerfana` y deja una decisión `superada` con cero aristas | **Sistémico**, no de esta capability: `grep -rn TRUNCATE` sobre migraciones y `app` da cero coincidencias, o sea que ninguna regla del motor —`fn_firma_inmutable` incluida— se defiende de `TRUNCATE` | Tratarlo como asunto de motor, no de `decision-chain`. Un `EVENT TRIGGER` o revocar el privilegio son las dos vías; elegir es diseño → clase C |
| B2 | `trg_supersede_no_huerfana` no es `CONSTRAINT TRIGGER DEFERRABLE`: DELETE-luego-INSERT dentro de una transacción se rechaza aunque acabe consistente | Limitación con dos caminos legítimos documentados (`UPDATE` de `sucesora_id`, o INSERT antes del DELETE) | Barato de arreglar; decidir si compensa cambiar un trigger ya aplicado (regla 11: se escribe uno nuevo, no se edita) |
| B3 | `fk_ds_sucesora` en `RESTRICT` impide borrar un proyecto con decisiones superadas: gana al `CASCADE` de `fk_dec_project` | Efecto lateral real | Sólo importa si borrar proyectos es un caso de uso. Verificar antes de tocar |
| B4 | `trg_cambio_autorizado` se dispara antes que `trg_cambio_sin_contradicciones` (Postgres ordena los triggers de fila alfabéticamente): un cambio sin firma **y** congelado enseña el error de firma, no el de la contradicción | Ninguna regla se viola; engaña el orden de los mensajes | T06 lo dejó decidido para F2, «donde tocar `fn_cambio_autorizado` sí estará en alcance» |
| B5 | **S4: resurrección `superada → vigente`.** `decision` no tiene grafo de transiciones como dato, a diferencia de `cambio` (`cambio_transicion_permitida`). Una decisión superada puede volver a `vigente` sin acto de gobierno | **Riesgo medio** — es el único de los cinco que permite un estado que el método no quiere | Diferido a F2 por decisión humana en T06. Es el candidato natural a primera tarea normativa de F2 |
| B6 | Colisión de `uq_cambio_codigo` entre proyectos, y `ck_dec_codigo` frente a slugs con guion | Detectado al cerrar F1 | `abierto[]` de `F1/orquestacion`, riesgo medio |

---

## C. Deuda de entorno y operación — de F0, aún viva

| # | Asunto | Origen |
|--:|---|---|
| C1 | Servicio `web` sin healthcheck definido en `docker-compose.yml` | F0/T01 |
| C2 | `docker-compose.yml` cambiado a `restart: "no"` — **pendiente confirmación del propietario** desde F0 | F0/T01 |
| C3 | Las worktrees necesitan replicar a mano `.env`, `bootstrap/cache` y `storage/framework`. Costó tiempo en T02 y volvió a costarlo en T06 | F0/T02, F1/T06 |
| C4 | La pila Docker es exclusiva (`name: quipu-enterprise`, monta `./code` relativo al cwd): levantarla desde una worktree sustituye la del repo principal, así que los CI de tareas paralelas **se serializan** | `CLAUDE.md` § Entorno |
| C5 | Merge de `docs/congelamiento` a `main` en el repo QUIPU v1 — acción humana pendiente desde F0/T06 | `abierto[]` de `F0/T06` |

C3 y C4 juntos son la razón de que las fases paralelas rindan poco. Si F2 es grande,
resolverlos primero tiene mejor retorno que cualquier optimización de contexto.

---

## D. Deuda del propio Sistema A — el proyecto de la flota

Origen: `PLAN/FLOTA/PLAN_IMPLEMENTACION.md` §6.4. **Nada de esto aparecía en
`ESTADO/ESTADO.md`**: era deuda invisible.

| # | Asunto | Estado real |
|--:|---|---|
| D1 | **Paso 1.0 — normalizar el esquema de checkpoint.** El plan lo marcaba bloqueante de la Ola 1 y no se hizo | Parcialmente superado: `bin/checkpoint.sh` ya impone el contrato desde el 31-08, así que la deriva **nueva** está cortada. Lo que queda son las 41 entradas antiguas, que el ledger append-only no reescribe |
| D2 | **Ola 2 — estabilidad de prefijo entre sesiones** | Sin empezar |
| D3 | **§3.3 — consulta de MISS por relectura.** Es el KPI que valida la Ola 1 | Sin hacer: la mejora de −97,7 % en tamaño de lectura está medida, pero su efecto en coste no |
| D4 | **Ola 3 (gate determinista) se construyó estando RETIRADA** y ninguna de sus tres condiciones de reapertura se cumple hoy (bash 17,5 % vs ≥25 %; 1 sesión de Verificador vs ≥10) | Coste de tenerlo sin usar: cero. `QUIPU_VERIF_DETERMINISTA` en `0` por omisión, racha de sombra 0/5, y pasar a vinculante es decisión humana |
| D5 | La flota se portó a Claude Code el 26-08, así que `bin/metricas.sh` —que lee `opencode.db`— **ya no ve la actividad real** | La instrumentación de coste quedó ciega tras el port |

D5 es el que más conviene mirar antes de invertir más en D2/D3: optimizar contra una
telemetría que ya no se alimenta es trabajo perdido.

---

## E. Documentación

| # | Asunto |
|--:|---|
| E1 | `README.md` del repo del producto decía «Cuatro capacidades hoy»; son cinco desde F1. Corregido el 2026-09-01 |
| E2 | `CONTEXTO-PROYECTO.md` describe la arquitectura sin mencionar `decision-chain` ni sus tablas. Es el documento que `opencode.json` carga en **todos** los turnos: su desactualización se paga en cada sesión |
| E3 | Evidencia huérfana de julio (`f1-b11`, `f1-b12`) archivada en `ARCHIVO/evidencia-pre-punto-cero/`. Se resuelve en F4, cuando la evidencia pase a la BD |
| E4 | Once commits de trabajo ejecutado sin tarea ni plan. Inventariados en `ARCHIVO/TRABAJO-SIN-TAREA.md` |
