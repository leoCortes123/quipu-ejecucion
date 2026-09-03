# T05 — Integración con la cadena de demanda

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Ejecutor (worktree `wt/f1-t05-demanda`) · Nivel: L3 · Presupuesto: ~2 h
Depende de: T02.

## Propósito
Conectar lo normativo nuevo con lo existente: necesidad/cambio declaran su dominio, los
criterios pueden citar invariantes, y una contradicción pendiente congela el avance.
Es el port de «la decisión se escribe primero».

## Contexto
Lee antes: `2026_07_20_140000_create_cambio.php` (fn_cambio_transicion/fn_cambio_autorizado),
migraciones de necesidad y `requisito_criterio`, y el delta spec (requirements 5 y 6).
Regla: NO edites migraciones viejas — añade una nueva que altera.

## Pasos

1. **`2026_08_26_110000_integrar_decision_chain_demanda.php`**:
   - `ALTER TABLE necesidad ADD COLUMN dominio_slug VARCHAR(30) NULL REFERENCES dominio(slug)`.
   - Igual en `cambio`.
   - `ALTER TABLE requisito_criterio ADD COLUMN invariante_id INT NULL REFERENCES invariante(id)`.
   - `fn_invariante_vigente` como CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED sobre
     requisito_criterio (INSERT/UPDATE OF invariante_id): si el invariante citado pertenece
     a decisión no vigente → RAISE EXCEPTION nombrando la decisión. Patrón literal:
     `fn_necesidad_anclada`.
   - `fn_cambio_sin_contradicciones` (BEFORE UPDATE OF estado ON cambio): si NEW.estado
     distinto de OLD.estado Y distinto de 'rechazado' Y EXISTS contradicción pendiente
     cuyo invariante esté en el dominio del cambio (o referencie directamente ese cambio)
     → RAISE EXCEPTION en español listando las contradicciones que congelan. Sin dominio,
     sólo aplican las contradicciones directas del cambio.
2. **Tests `tests/Feature/ContradiccionGateTest.php`**:
   - Dado cambio con dominio D e invariante vigente de D con contradicción pendiente →
     intentar autorizar → QueryException/422 nombrando la contradicción; intentar avanzar
     a en_analisis → igual; pasar a rechazado → permitido.
   - Resuelta la contradicción (aceptada por humano vía UPDATE directo simulando REST
     futuro) → el mismo avance ahora pasa.
   - Criterio cita invariante de decisión superada → rechaza al COMMIT (diferido).
   - Cambios SIN dominio siguen transitando normal (regresión de suites viejas).
3. Verifica regresión completa: `docker compose exec api composer ci`
   (las suites de demanda existentes deben seguir verdes sin tocarlas).
4. Commit:
```
demand-chain: dominios en necesidad/cambio, criterios citan invariantes, gate de contradicciones

F1/T05 · un cambio con contradicción pendiente no avanza; única salida: rechazar o resolver
```

## Criterios de aceptación (GWT)
- DADO un cambio sobre dominio con invariante vigente contradictorio, CUANDO se intenta
  autorizar, ENTONCES 422 nombrando la contradicción.
- DADO contradicción aceptada por humano, CUANDO se reintenta el avance, ENTONCES procede.
- DADO A→B→A en supersede ya cubierto en T02, nada aquí.
- DADO todas las suites pre-F1, CUANDO corre composer ci, ENTONCES verde sin edición de tests ajenos.

## Evidencia
Salida pest completa, diff_review, commit.

## Fuera de alcance
Endpoint REST de resolución de contradicciones; UI web; tabla puente multi-dominio;
modificar fn_cambio_transicion/fn_cambio_autorizado existentes.
