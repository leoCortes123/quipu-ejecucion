# INDICE — ejecución del desarrollo de Quipu (agnóstico al harness)

**Si eres un agente, este es tu punto de entrada a la ejecución** (no `QUIPU_ENTERPRISE/`,
donde vive sólo el producto). Lee `../metodologia/AGENTS.md` primero: fija el orden.

Estado al 2026-09-03: **F0 y F1 cerradas. No hay fase activa.** El plan nuevo aún no está
escrito, así que ningún agente tiene alcance pre-aprobado
(`../metodologia/AGENTS.md` § Nivel de autonomía).

---

## Si eres un agente: lee sólo esto, en este orden

Lo fija `../metodologia/AGENTS.md` y manda. Todo lo demás es contexto desperdiciado.

1. `../metodologia/AGENTS.md` — contrato de entrada
2. `../metodologia/normativa/CONSTITUCION.md` — reglas no negociables
3. `../metodologia/normativa/ESCALAMIENTO.md` — qué decides tú y qué para al humano
4. `../metodologia/normativa/VALIDACION.md` — qué significa «terminado»
5. El ExecPlan de tu fase: `fase-activa/F<n>-execplan.md`
6. TU tarea, y sólo la tuya: `fase-activa/tareas/T<nn>-*.md`

Si algo que necesitas no está ni en tu tarea ni en esos documentos, es
`../metodologia/normativa/ESCALAMIENTO.md` clase C: paras y consultas. `../conocimiento/`
no se lee durante la ejecución salvo autorización explícita de tu tarea — y el plan
completo que vive ahí no se lee nunca.

## Si eres el humano: por dónde empezar según qué quieras

| Quiero… | Abre |
|---|---|
| Saber qué está hecho y qué no | `ESTADO/ESTADO.md` |
| Comprobar que F1 terminó de verdad | `ESTADO/CIERRE-F1.md` |
| Planificar la fase siguiente | `../conocimiento/plan/README.md` — y su deuda en `ESTADO/DEUDA-F2.md` |
| Levantar la flota | `ESTADO/DESPLIEGUE.md` |
| Ver el estado del ledger sin leerlo entero | `../metodologia/scripts/estado.sh` |
| Entender qué se hizo sin tarea que lo encargara | `ARCHIVO/TRABAJO-SIN-TAREA.md` |

---

## Qué vive en este repositorio

| Ruta | Qué es |
|---|---|
| `fase-activa/` | el ExecPlan y las tareas de la fase abierta. **Vacío si no hay fase** |
| `ESTADO/ESTADO.md` | inventario de capabilities, herencia congelada, tests y deuda |
| `ESTADO/CIERRE-F1.md` | comprobación de que F1 terminó, tarea por tarea y contra el árbol real |
| `ESTADO/DEUDA-F2.md` | toda la deuda consolidada: bloqueantes, técnica, entorno, flota |
| `ESTADO/DESPLIEGUE.md` | cómo se levanta la flota, modelos por agente, herramental |
| `sesiones/progress.json` | ledger append-only de checkpoints. **No se lee entero: `../metodologia/scripts/estado.sh`** |
| `sesiones/sombra.json` | registro del modo sombra de verificación determinista |
| `sesiones/baseline-*.json` | líneas base de consumo LLM y de suites |
| `evidencia/` | artefactos derivados que citan escenarios OpenSpec |
| `ARCHIVO/fases/F0/`, `F1/` | ExecPlans y tareas de las fases cerradas, tal como se encargaron |
| `ARCHIVO/mudanza-2026-09-01.md` | el traslado del andamiaje a `sistema-a/`, tal como se escribió |
| `ARCHIVO/TRABAJO-SIN-TAREA.md` | inventario de los 11 commits ejecutados sin tarea ni plan |
| `ARCHIVO/evidencia-pre-punto-cero/` | capturas de julio que ningún escenario cita |

Los ExecPlans y las tareas de fases cerradas son **registro histórico**: describen el
encargo tal como se dio. No se reescriben aunque hayan quedado desactualizados, porque
reescribirlos falsificaría contra qué se verificó el trabajo. Por eso conservan sus rutas
originales (`sistema-a/…`, `PLAN/…`) sin corregir.

## Qué NO vive aquí

| Cosa | Dónde | Por qué |
|---|---|---|
| El plan completo | `../conocimiento/plan/` | la ejecución sólo ve su fase |
| La normativa y los scripts | `../metodologia/` | contrato estable, ritmo distinto |
| Las specs | `../QUIPU_ENTERPRISE/openspec/` | son la fuente de verdad de lo que el sistema hace (regla 7); viven con el producto |
| La investigación y el porqué | `../conocimiento/` | solo lectura durante la ejecución |

## Harnesses: ninguno manda por defecto

Los perfiles por harness viven en `../metodologia/adapters/` (`claude/`, `opencode/`). La
flota se portó de uno a otro el 26-08 (`3189469`), pero `ESTADO/DESPLIEGUE.md` sigue
describiendo el despliegue original. **Ningún documento declara cuál manda hoy**: se
trabaja con el que el humano indique por fase y se registra en el ledger. Es la decisión
DEC-7, pendiente. Detalle en `../metodologia/adapters/README.md`; historia del cambio en
`ARCHIVO/TRABAJO-SIN-TAREA.md` § 2.

## Historial versionado

El andamiaje original tuvo repositorio git propio. Tras la separación del 2026-09-03 ese
historial queda archivado en `../archivo/sistema-a/`, y `metodologia/`, `conocimiento/` y
este repositorio arrancan con historia propia.
