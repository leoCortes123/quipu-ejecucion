# T02 — Migraciones normativas: decisiones, supersede, invariantes, contradicciones

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Ejecutor (worktree `wt/f1-t02-migraciones`) · Nivel: L3 · Presupuesto: ~3 h
Depende de: T01 (el delta spec es tu contrato).

## Propósito
Crear las 5 tablas de la capa normativa con sus lookups y triggers, de modo que las reglas
1, 2 y 4 del delta sean IMPOSIBLES de violar desde cualquier cliente.

## Contexto
Migraciones de referencia obligatorias (léelas antes de escribir una línea):
`2026_07_20_140000_create_cambio.php` (lookups+tabla+triggers en un archivo, grafo de
transiciones como dato), `2026_07_20_130000_create_necesidad.php` (CONSTRAINT TRIGGER
DEFERRABLE), `2026_07_19_110000_create_precinto_huella.php` + uso en create_cambio
(`lookup_artefacto_tipo`, `fn_mantener_huella`, `instalar_propagacion`).

## Pasos

1. **`2026_08_26_100000_create_dominio_y_decision.php`**:
   - `dominio`: `slug VARCHAR(30) PK`, `nombre`, `descripcion`; siembra inicial mínima
     (`core`, `producto`) — el vocabulario crece por datos.
   - `lookup_decision_estado (propuesta|vigente|superada|descartada)` con `es_final`.
   - `decision`: `id SERIAL`, `project_id FK project`, `codigo VARCHAR(30) UNIQUE`
     (formato `DOMINIO-NNN`, compatible con Chasqui), `dominio_slug FK dominio`,
     `estado DEFAULT 'propuesta'`, `titulo VARCHAR(300)`, `cuerpo TEXT NULL` (prosa humana),
     `fecha DATE NOT NULL DEFAULT hoy`, `propuesto_por FK member`,
     `promovida_por FK member NULL`, `huella VARCHAR(64)`, timestamps.
   - Precinto: fila en `lookup_artefacto_tipo` + trigger huella + `instalar_propagacion`.
   - `fn_decision_promovida` (trigger BEFORE UPDATE OF estado): propuesta→vigente exige
     firma `entidad_tipo='decision'`, significado `promuevo`, firmante con rol `human_admin`
     y huella vigente (patrón literal de `fn_cambio_autorizado`). Añade a
     `lookup_significado_firma` la fila que necesites leyendo ANTES su migración real.
2. **`2026_08_26_100100_create_decision_supersede.php`**:
   - Arista: `predecesora_id FK decision`, `sucesora_id FK decision`, `motivo_reemplazo
     TEXT NOT NULL`, PK compuesta; no reflexiva (`ck_ds_no_reflexiva`).
   - `fn_decision_superada` (BEFORE UPDATE OF estado ON decision): pasar a `superada` sin
     arista saliente → RAISE EXCEPTION en español; `descartada` no exige sucesor.
   - `fn_supersede_sin_ciclos` (BEFORE INSERT ON decision_supersede): CTE recursivo hacia
     adelante por `sucesora_id`; si la cadena llega a `predecesora_id`, rechaza nombrando
     el ciclo. Probar mentalmente A→B→A y A→B→C→A.
3. **`2026_08_26_100200_create_invariante.php`**:
   - `invariante`: `id SERIAL`, `project_id FK`, `dominio_slug FK`, `enunciado TEXT NOT NULL`,
     `evidencia VARCHAR(500) NULL` (formato `ruta:símbolo`), `etiqueta FK
     lookup_invariante_etiqueta (confirmado|inferido)`, `decision_id FK decision NULL`.
   - `ck_inv_confirmado_evidencia CHECK (etiqueta <> 'confirmado' OR (evidencia IS NOT NULL AND evidencia <> ''))`.
4. **`2026_08_26_100300_create_contradiccion.php`**:
   - `contradiccion`: `cambio_id FK cambio`, `invariante_id FK invariante`, `explicacion
     TEXT NOT NULL`, `resolucion DEFAULT 'pendiente'` FK `lookup_contradiccion_resolucion
     (pendiente|aceptada|revocada)`, `abierta_por FK member`, `resuelta_por/resuelta_at NULL`.
   - `ck_con_resolucion`: aceptada/revocadas exigen resuelta_por y resuelta_at.
5. **Tests `tests/Feature/DecisionChainTest.php`** (Pest, `$this->seed()`, factories/inserts
   directos, esperando `QueryException` con nombre de constraint — patrón CambioTest):
   superada sin arista rechaza; arista cierra ciclo rechaza; confirmado sin evidencia
   rechaza; propuesta→vigente sin firma humana rechaza; y el camino feliz: propuesta +
   firma promuevo human_admin → vigente OK.
6. `down()` completos en orden inverso. Corre `docker compose exec api composer ci`.
7. Commit:
```
decision-chain: dominios, decisiones con grafo supersede, invariantes y contradicciones

F1/T02 · las reglas viven en Postgres: superada sin sucesor, ciclos y confirmados
sin evidencia son imposibles; promover exige firma humana
```

## Criterios de aceptación (GWT)
- DADO una decisión vigente, CUANDO se marca superada sin arista, ENTONCES QueryException
  nombrando fn_decision_superada.
- DADO A→B vigentes, CUANDO se inserta B→A, ENTONCES rechaza nombrando el ciclo.
- DADO invariante confirmado sin evidencia, CUANDO se inserta, ENTONCES rechaza
  ck_inv_confirmado_evidencia.
- DADO decisión propuesta, CUANDO un humano firma promuevo y se promueve, ENTONCES queda
  vigente con promovida_por registrado.

## Evidencia
Salida completa de pest para DecisionChainTest, diff_review de migraciones, commit.

## Fuera de alcance
Tools MCP (T03/T04), columnas en demanda (T05), UI web, seeders de datos reales de Chasqui.
