# T04 — ESTADO.md: inventario del proyecto

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor (worktree `wt/f0-t04-estado`) · Nivel: L3 · Presupuesto: ~45 min
Depende de: T01 y T02 (necesita el resultado de la deduplicación).

## Propósito
Crear `ESTADO.md` en la raíz del repo: el mapa único de qué está completo, a medias,
heredado-congelado o eliminado. Es el documento que consume cualquier sesión futura
(humana o agéntica) para no re-descubrir el proyecto.

## Contexto
Fuentes verificadas para el inventario (léelas, no las supongas):
`openspec/specs/*/spec.md`, `code/api/app/Mcp/Tools/` (41 tools),
`code/api/database/migrations/` (cadena demanda completa hasta 2026-07-21),
`code/api/tests/Feature/` (tras T02), `CLAUDE.md`, README.md.
Ítems heredados de Quipu v1 sin spec propia: `project_template`, `knowledge_entry`,
`changelog_entry/changelog_block`, `screen_component*`, `entity_asset`.

## Pasos

1. Crea `ESTADO.md` en la raíz con exactamente estas secciones:

```markdown
# ESTADO — Quipu Enterprise

## Capabilities OpenSpec (normativas)
| Capability | Estado | Notas |
|---|---|---|
| block-workflow   | completa | <1 línea: qué cubre> |
| traceability     | completa | <…> |
| demand-chain     | completa | <incluye vía rápida y retrofit> |
| mcp-interface    | completa | <2 transportes, 41 tools> |

## En diseño / siguiente
- decision-chain (F1 del plan externo): dominios, decisiones supersede, invariantes,
  contradicciones. Sin implementar.

## Heredado de Quipu v1 sin spec (congelado)
| Feature | Tablas principales | Estado |
|---|---|---|
| Templates bootstrap | project_template, … | congelado: se revisa en F4 |
| Conocimiento | knowledge_entry | congelado: idem |
| Changelog | changelog_entry/block | congelado: idem |
| Catálogo UI | screen_component*, interaction_* | congelado: idem |
| Assets | entity_asset | congelado: idem |

## Tests
- Suites API: <número tras T02>, suites web: <n>. Duplicaciones resueltas: <lista>.
- CI medido en T01: api <t>, web <t>.

## Deuda declarada
- <lo que T01–T03 hayan registrado; si nada: "ninguna registrada en F0">
```

2. Rellena cada `<…>` leyendo las fuentes; cero suposiciones. Un dato que no encuentres
   → ESCALAMIENTO C (no lo inventes).
3. Commit único:
   ```
   Docs: ESTADO.md — inventario de capabilities, heredado y tests

   F0/T04 · fuente única de estado del repo
   ```

## Criterios de aceptación (GWT)

- DADO `ESTADO.md`, CUANDO se contrasta contra `openspec/specs/`, ENTONCES las 4
  capabilities aparecen con estado correcto y ninguna capability real falta.
- DADO los ítems heredados listados arriba, CUANDO se busca cada tabla en
  `database/migrations/`, ENTONCES aparece en la sección "Heredado" (o se escala).
- DADO el número de suites, CUANDO se compara con el inventario de T01 menos lo
  deduplicado en T02, ENTONCES coincide.
- DADO el diff final, CUANDO `git status --porcelain`, ENTONCES sólo aparece `ESTADO.md`.

## Evidencia
`file_content` de ESTADO.md, `diff_review`, commit.

## Fuera de alcance
Proponer destino final de los ítems congelados (eso es F4); documentar código interno;
tocar specs.
