# T03 — Tools MCP de lectura normativa

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Ejecutor (worktree `wt/f1-t03-lectura`) · Nivel: L3 · Presupuesto: ~2 h
Depende de: T02.

## Propósito
Dar a los agentes la mitad pasiva del protocolo Chasqui: ANTES de actuar, ver el dominio;
ANTES de cerrar, verificar contradicciones. «El primer movimiento es dominio_contexto».

## Contexto
Tools de referencia obligatorias (léelas): `GetCambioDetail.php` (lectura completa con
traits y schema didáctico), `ListarNecesidades.php`, registro en `QuipuServer.php` (grupo
con comentario), test de referencia `McpToolsTest.php`.

## Pasos

1. **`DominioContexto.php`** — `#[Name('dominio_contexto')]`. Args: `project_slug`,
   `dominio`. Devuelve: decisiones vigentes (id, titulo, fecha, invariantes), superadas con
   su sucesor y motivo, invariantes con evidencia, y decisiones relacionadas de otros
   dominios (`relacionada_con` no existe como tabla: derívala de las aristas supersede y
   del mismo project; si el campo Chasqui `relacionada_con` se necesita, guárdalo en el
   cuerpo y anótalo en checkpoint). Si el dominio no existe: 422 listando slugs válidos.
2. **`DecisionLeer.php`** — `decision_leer(codigo)`: decisión completa + historia supersede
   (predecesoras y sucesoras con motivos) + estado de sus invariantes.
3. **`InvariantesDe.php`** — `invariantes_de(ruta)`: invariantes cuyo `evidencia` empieza
   con la ruta dada o coincide tras los dos puntos (match por prefijo de ruta o símbolo
   exacto). Sin resultados: lista vacía con hint, nunca error.
4. **`VerificarContradicciones.php`** — `verificar_contradicciones(project_slug, cambio_id)`:
   reporte previo obligatorio — cruza el `dominio_slug` del cambio contra invariantes
   vigentes del proyecto y contradicciones pendientes; devuelve `{ok, pendientes[],
   invariantes_aplicables[]}`. Es lectura pura: no muta nada.
5. Registra las 4 en `QuipuServer::$tools` bajo un grupo nuevo con comentario
   («Cadena normativa: …»). Actualiza el `#[Instructions]` del server con una línea:
   consultar el dominio antes de proponer cambios sobre él.
6. **`tests/Feature/DominioContextoTest.php`**: dado project+dominio sembrado con 2 vigentes,
   1 superada con sucesor y 2 invariantes → la tool las devuelve; slugs inválidos → error
   con sugerencia; `invariantes_de` encuentra por ruta y por símbolo;
   `verificar_contradicciones` ok sin pendientes.
7. `docker compose exec api composer ci`. Commit:
```
MCP: dominio_contexto, decision_leer, invariantes_de y verificar_contradicciones

F1/T03 · la mitad pasiva del protocolo: leer antes de actuar
```

## Criterios de aceptación (GWT)
- DADO un dominio con decisiones e invariantes, CUANDO el agente llama dominio_contexto,
  ENTONCES recibe vigentes, superadas con sucesor/motivo, e invariantes con evidencia.
- DADO una ruta con invariantes asociados, CUANDO se consulta invariantes_de,
  ENTONCES aparecen todos los que la citan en evidencia.
- DADO un cambio sin contradicciones, CUANDO se verifica, ENTONCES ok=true con la lista
  de invariantes aplicables.

## Evidencia
Salida pest, diff_review (incluye QuipuServer), commit.

## Fuera de alcance
Escrituras (T04); tocar demand-chain; pantallas web.
