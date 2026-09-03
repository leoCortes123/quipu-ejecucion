# T00 — Resolver el estado pendiente del repositorio

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor · Nivel: L3 con decisión humana previa · Presupuesto: ~30 min
Depende de: nada. ES EL PRIMER PASO DE LA FASE: sin él no hay worktrees válidas
(los worktrees nacen de HEAD, no del working tree — cualquier tarea paralela vería un
repo viejo y sin `openspec/`).

## Propósito

El repositorio tiene 31 cambios SIN commitear: una reestructuración coherente pero
inacabada. Este estado es la "basura" real detectada antes de iniciar. Objetivo:
dejar master limpio, con la reestructuración preservada en commits revisables.

## Contexto — qué hay exactamente (verificado 2026-08)

Borrados NO commiteados (`git status` muestra D):
- `docs/GUIA_AGENTE.md`, `GUIA_USUARIO.md`, `INFORME_QUIPU.md`, `ONBOARDING.md`, `README.md`
- `docs/enterprise/01..08` (resumen ejecutivo, hoja de ruta, adopción, glosario…)
- `docs/spec/QUIPU_DB_SCHEMA.md` (1.510 líneas), `QUIPU_SPEC.md` (354),
  `QUIPU_ENTERPRISE_NUCLEO.md` (875)
- `.claude/commands/bloque.md`, `continuar.md`; `.obsidian/*`

Modificados NO commiteados: `CLAUDE.md`, `README.md`, `docker-compose.yml`,
`.opencode/agents/AGENTS.md`, `opencode.json`

No rastreados (nunca commiteados): `openspec/` COMPLETO, `.claude/commands/opsx/`,
`.claude/skills/`, `.opencode/commands/`, `.opencode/skills/`

Lectura correcta: una sesión anterior migró el proyecto al flujo OpenSpec, absorbió la
documentación en specs y añadió comandos/skills del flujo — pero murió antes de hacer
commit. El trabajo parece intencional y coherente; NO se revierte.

## Pasos

1. Captura el inventario completo: `git status --porcelain` y `git diff --stat`
   → al checkpoint como evidencia inicial.
2. Revisa los diffs de los 5 modificados (`git diff <archivo>`) para confirmar que son
   parte de la misma reestructuración (esperado: CLAUDE.md gana la sección OpenSpec;
   README apunta a specs; opencode.json/docker-compose ajustes del flujo).
   Si ALGUNO parece ajeno o roto → ESCALAMIENTO C mostrando su diff.
3. Verifica que `openspec/` está completo y válido: las 4 capabilities en
   `openspec/specs/`, `config.yaml` presente, `changes/archive/` vacío.
4. Comita en DOS commits coherentes (facilita revertir por partes si hiciera falta):
   ```
   OpenSpec: adopta flujo delta — specs normativas y tooling del flujo

   Incluye openspec/ completo, comandos opsx y skills del flujo.
   ```
   (todo lo no rastreado)
   ```
   Docs: absorbe documentación heredada en specs OpenSpec

   Elimina docs/ v1 y guías sustituidas; actualiza CLAUDE.md, README,
   docker-compose y configs opencode/.claude.
   ```
   (borrados + modificados)
5. Confirma: `git status --porcelain` VACÍO y `git log --oneline -3` mostrando los dos
   commits sobre `e0f1c94`.

## Criterios de aceptación (GWT)

- DADO master tras la tarea, CUANDO `git status --porcelain`, ENTONCES no devuelve nada.
- DADO el historial, CUANDO se listan los últimos 3 commits, ENTONCES existen exactamente
  los 2 commits especificados con sus mensajes literales.
- DADO el árbol commiteado, CUANDO se lista `openspec/specs/`, ENTONCES están las 4
  capabilities y `openspec/` ya no aparece como no rastreado.
- DADO cualquier diff dudoso del paso 2, ENTONCES nunca se commitea sin escalar antes.

## Evidencia
`command_output` (status inicial y final, log), `diff_review` de los 5 archivos
modificados, ambos commits.

## Fuera de alcance
Recuperar contenido borrado (si el humano lo pide después: `git checkout <sha> -- <ruta>`
en tarea aparte); tocar el contenido de las specs; iniciar T01–T06 en este mismo paso.
