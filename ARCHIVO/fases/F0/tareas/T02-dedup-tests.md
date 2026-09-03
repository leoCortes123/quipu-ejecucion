# T02 — Deduplicación de suites de test

> **Tarea EJECUTADA y VERIFICADA — fase F0 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F0 · Rol: Ejecutor (worktree `wt/f0-t02-dedup`) · Nivel: L3 · Presupuesto: ~60 min
Depende de: T01 (inventario).

## Propósito
Resolver los dos pares de suites posiblemente duplicadas detectados en la auditoría, sin
perder ningún caso de prueba que aporte cobertura única.

## Contexto
Pares objetivo (en `code/api/tests/Feature/`):
- `AdopcionTest.php` (~319 líneas) y `AdoptionTest.php` (~354 líneas)
- `AuthTokenTest.php` y `AgentTokenTest.php`

Hipótesis de la auditoría: uno cubre el camino MCP y otro el REST, o hay solapamiento
real. Verifícalo; no lo supongas.

## Pasos

1. Lee ambos archivos de cada par y clasifica cada test: `mcp`, `rest`, `duplicado-exacto`
   (misma aserción por otro transporte), `único`.
2. Aplica la regla de decisión:
   - Test duplicado-exacto → conserva UNA copia (la del transporte con más cobertura del
     par) y elimina la otra.
   - Tests únicos en ambas → fusiónalos en una sola suite cuyo nombre describa el tema
     (`AdopcionTest.php`, `AgentTokenTest.php`), conservando TODO lo único.
   - Si tras fusionar un par queda un archivo sin sentido separado, elimínalo.
3. Actualiza referencias si algún test era citado desde `Pest.php` u otros tests.
4. Corre las suites afectadas individualmente:
   `docker compose exec api ./vendor/bin/pest tests/Feature/<archivo>`
5. Corre CI completo.
6. Commit único:
   ```
   Tests: deduplicación de suites Adopcion/Adoption y AuthToken/AgentToken

   F0/T02 · sin pérdida de casos únicos · composer ci verde
   ```

## Criterios de aceptación (GWT)

- DADO cada par resuelto, CUANDO se lista `tests/Feature`, ENTONCES existe exactamente
  una suite por tema y ninguna clase de test duplicada-exacta permanece.
- DADO el baseline de T01, CUANDO corre el pest completo, ENTONCES pasa el mismo número
  de aserciones o más (suite-diff: nada que pasaba deja de pasar).
- DADO el diff final, CUANDO `git status --porcelain`, ENTONCES sólo aparecen archivos
  bajo `code/api/tests/`.
- DADO un caso donde AMBAS suites tienen tests únicos extensos y la fusión excede ~30 min,
  ENTONCES es ESCALAMIENTO C (elegir cuál sobrevive es del humano).

## Evidencia
`diff_review` (el diff completo), `command_output` (pest afectado + CI completo),
tabla de clasificación mcp/rest/duplicado/único en el checkpoint.

## Fuera de alcance
Renombrar o reorganizar otras suites; mejorar aserciones débiles aunque las veas
(regístralas en `hallazgos_no_aplicados`); tocar código productivo.
