# T06 — Cierre: delta reconciliado, sync, archive, ESTADO y evidencia de fase

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Orquestador/Verificador (sobre main, tras fusionar T03–T05) · Nivel: L3 ·
Presupuesto: ~2.5 h
Depende de: T03, T04 y T05 fusionadas en main y CI verde en main.

## Propósito
Cerrar el change `f1-decision-chain` según el propio flujo del repo y dejar la fase
documentada con evidencia reproducible. Éste es **el primer change del historial delta**
después del punto cero: el rigor del formato importa más que nunca, y lo que quede escrito
aquí es lo que F2 leerá como verdad.

## Contexto
Formatos: `openspec/specs/demand-chain/spec.md` (spec final sincronizado),
`openspec/changes/archive/BASE-000-punto-cero.md`, convención de evidencia en
`code/web/evidencia/README.md`, `ESTADO.md` vigente.
El CLI `openspec` no está instalado en el host: validación best-effort con
`npx -y openspec validate --all --strict`; que el CLI falle por no existir **no** es fallo de
la tarea, pero dilo en el checkpoint en vez de callarlo.

## Encargos acumulados durante la fase

Estos cinco puntos vienen resueltos por el Orquestador o por el humano durante T02–T05. No se
re-discuten: se ejecutan.

1. **El delta gana una sección `## MODIFIED Requirements` sobre `demand-chain`.** T05 alteró
   `necesidad`, `cambio` y `requisito_criterio`: sin esa sección, el delta miente por omisión y
   la capability `demand-chain` queda desincronizada. Va en
   `openspec/changes/f1-decision-chain/specs/demand-chain/spec.md`, con el requirement
   modificado citando su test (`ContradiccionGateTest.php`).
2. **`tasks.md` del change se reconcilia con el esquema real, y manda el esquema.** Divergencias
   ya declaradas y aceptadas como clase B, todas de T02: `motivo_reemplazo` vive en la **arista**
   `decision_supersede`, no en `decision`; `dominio.slug` es **PK**, sin `uq_dom_slug` redundante;
   `contradiccion` **no** lleva `project_id` ni `dominio_slug` propios —los alcanza por su cambio
   y por su invariante—. Hay una tercera divergencia en la sección 2: `invariantes_de` busca por
   **ruta o símbolo en la evidencia**, no «de una decisión o de un dominio» como decía el texto.
   Corrige el documento, nunca la base.
3. **La convención `- **Verificado por**: <ruta de test>` queda bendecida** y se sincroniza tal
   cual al spec final. Ojo: las cuatro specs existentes **no la usan** (cero apariciones), así
   que `decision-chain` la estrena. Es deliberado —es el hábito que sostiene «cada escenario cita
   su test»—; anótalo en el checkpoint para que F2 sepa que es el patrón nuevo, no un desliz.
4. **Los límites declarados del modelo se documentan donde queden visibles al cerrar la fase.**
   Son tres, todos verificados empíricamente por el Verificador de T02, y ninguno es un defecto a
   corregir aquí:
   - `TRUNCATE decision_supersede` sortea `trg_supersede_no_huerfana` y deja una decisión
     `superada` con cero aristas. Es **sistémico**, no de esta capability: `grep -rn TRUNCATE`
     sobre migraciones y `app` da cero coincidencias, o sea que ninguna regla del motor
     —`fn_firma_inmutable` incluida— se defiende hoy de TRUNCATE.
   - `trg_supersede_no_huerfana` no es `CONSTRAINT TRIGGER DEFERRABLE`: sustituir la sucesora con
     DELETE-luego-INSERT dentro de una transacción se rechaza aunque acabe consistente. Quedan
     dos caminos legítimos: `UPDATE` de `sucesora_id`, o INSERT antes del DELETE. **Documenta el
     orden exigido**; no lo hagas deferrable en esta tarea.
   - Un proyecto con decisiones superadas ya no se puede borrar: `fk_ds_sucesora` en RESTRICT
     gana al CASCADE de `fk_dec_project`.

   Y un cuarto, que aportó el Verificador de T05: **`trg_cambio_autorizado` se dispara antes que
   `trg_cambio_sin_contradicciones`** —Postgres ordena los triggers de fila alfabéticamente—, así
   que un cambio que exige firma y además está congelado por una contradicción le enseña al
   usuario el error de las firmas que faltan, no el de la contradicción. Ninguna regla se viola;
   lo que engaña es el orden de los mensajes. Se documenta y se deja decidido a conciencia para
   F2, donde tocar `fn_cambio_autorizado` sí estará en alcance.
5. **El delta gana el requirement que falta sobre la resolución de contradicciones.** La opción C
   (resolución humana por REST, permiso `contradiccion.abrir`, trigger
   `fn_contradiccion_resuelta_humana`) llegó a T04 después de escrito el delta: hoy hay regla en
   Postgres sin requirement que la declare. Añádelo como `ADDED` en el delta de `decision-chain`
   —con el mismo tono que «Sólo humanos promueven decisiones»— y su escenario citando
   `DecisionMcpTest.php`. Sin esto, el change se archivaría dejando una regla fuera de la spec.

## Pasos

1. **Reconciliar el delta y `tasks.md`** según los encargos 1, 2 y 5. Marca en `tasks.md` los
   ítems realmente hechos, y no marques los que no se hicieron: un `tasks.md` todo en verde que
   no corresponde con el código es exactamente el vicio que este flujo existe para evitar.
2. **Sync**: escribe `openspec/specs/decision-chain/spec.md` final a partir del delta:
   `# decision-chain Specification` + `## Purpose` (2-4 líneas) + `## Requirements` con todos los
   requirements y sus scenarios, SIN secciones `ADDED`/`MODIFIED` (formato idéntico a
   `demand-chain`), conservando los `- **Verificado por**:` (encargo 3).
3. **Sync de `demand-chain`**: aplica al spec final de `demand-chain` lo que diga la sección
   `MODIFIED` del delta. Una capability tocada y no sincronizada rompe la regla dura del flujo.
4. **Archive**: `git mv openspec/changes/f1-decision-chain openspec/changes/archive/f1-decision-chain`.
   El delta queda como historial; añade al inicio del proposal una nota con fecha y, debajo, la
   sección **«Límites declarados del modelo»** del encargo 4, con los tres puntos y el comando
   que los reprodujo.
5. **`ESTADO.md`**: mueve `decision-chain` de «En diseño / siguiente» a la tabla de capabilities
   completas, con nota «promoción y resolución humanas; gates en Postgres», más una línea que
   remita a los límites declarados del proposal archivado. Actualiza también el conteo de tools
   de `mcp-interface` —dice 40, con T03 ya fusionada son 44 y con T04 serán 46— y el de suites
   de la sección «Tests». Cuenta de verdad (`ls app/Mcp/Tools/*.php | wc -l`), no estimes.
6. **`sistema-a/AGENTS.md` NO se edita en esta tarea.** Sigue en el `deny` de
   `.claude/settings.json` junto a los demás actos de gobierno del paquete, y por decisión humana
   del 2026-08-31 lo aplica el humano al cerrar. Lo que T06 entrega es **el texto propuesto** de
   la regla 7 de oro —desde F1 la BD también gobierna decisiones, invariantes y contradicciones;
   las pantallas web de esta capa siguen pendientes— dentro de su checkpoint, listo para pegar.
7. **Evidencia**: `code/web/evidencia/f1-decision-chain/` con salidas derivadas reales, generadas
   por redirección de la ejecución y nunca editadas a mano:
   `pest_decision_chain.txt`, `pest_contradiccion_gate.txt`, `pest_decision_mcp.txt`,
   `pest_dominio_contexto.txt`, `composer_ci_final.txt`.
8. **CI final medido** sobre main fusionado, en segundo plano a fichero:
   `docker compose exec -T -e COMPOSER_PROCESS_TIMEOUT=1800 api composer ci` y
   `docker compose exec -T web pnpm run ci`. Ambos verdes, con tiempos anotados y comparados
   contra el baseline de T01.
9. **Checkpoint** (`HANDOFF.md`, vía `bin/checkpoint.sh anexar`): estado final, el texto propuesto
   de AGENTS.md, las desviaciones registradas (campos de Chasqui pospuestos, las divergencias
   clase B del encargo 2) y los hallazgos no aplicados que siguen vivos para F2.
10. Commits (uno por bloque coherente, mensajes al estilo del repo):
```
OpenSpec: sincroniza decision-chain y demand-chain, y archiva el primer change

Docs: ESTADO.md — decision-chain completa, con sus límites declarados

Evidencia: F1 decision-chain — pest por suite y CI final medidos
```

## Criterios de aceptación (GWT)
- DADO `openspec/specs/`, CUANDO se lista, ENTONCES existe `decision-chain/spec.md` con todos
  sus requirements —los 7 del delta más el de resolución humana— y cada escenario cita un test
  que existe y pasa.
- DADO el delta archivado, CUANDO se busca `MODIFIED Requirements`, ENTONCES existe la sección
  sobre `demand-chain` y `openspec/specs/demand-chain/spec.md` la refleja.
- DADO `tasks.md` del change, CUANDO se compara ítem a ítem con el esquema real, ENTONCES no
  queda ninguna afirmación falsa sobre columnas, tablas o comportamiento de tools.
- DADO `changes/`, CUANDO se lista, ENTONCES `f1-decision-chain` está en `archive/` y el
  directorio activo queda vacío.
- DADO `QuipuServer::$tools` por reflexión, CUANDO se listan nombres, ENTONCES están las 6
  nuevas y ninguna de gobierno.
- DADO el proposal archivado y `ESTADO.md`, CUANDO se buscan los tres límites del modelo,
  ENTONCES están escritos con el comando que los reprodujo.
- DADO ambos CI sobre main, CUANDO terminan, ENTONCES verdes, con tiempos anotados.

## Evidencia
Los archivos del paso 7, el checkpoint y los commits.

## Fuera de alcance
Cualquier código nuevo. Cerrar los límites del encargo 4 (triggers `ON TRUNCATE`, hacer
deferrable `trg_supersede_no_huerfana`, revisar el RESTRICT): se **documentan**, no se arreglan.
El grafo de transiciones de `decision` (hallazgo S4, resurrección `superada → vigente`), diferido
a F2 por decisión humana. Editar `sistema-a/AGENTS.md`. Resolver cualquier otra deuda descubierta
—se registra en el checkpoint—. Iniciar F2.
