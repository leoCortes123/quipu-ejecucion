# T04 — Tools gated de escritura, promoción y resolución sólo humanas

> **Tarea EJECUTADA y VERIFICADA — fase F1 cerrada.** Registro histórico del encargo;
> no se reescribe. Las rutas `code/web/evidencia/…` de su texto hoy son `evidencia/…`, y
> los documentos normativos que cita viven en `NORMATIVA/`. Mapa: `INDICE.md`.

Fase: F1 · Rol: Ejecutor (worktree `wt/f1-t04-gated`) · Nivel: L3 · Presupuesto: ~4 h
Depende de: T02, T03 y T05, las tres **ya consolidadas en main**. Arranca tu worktree desde
el main que las contiene: `cambio.dominio_slug` (T05) y las cuatro tools de lectura (T03)
tienen que existir antes de empezar, porque el paso 6 las modifica.

## Propósito
Los agentes PROPONEN decisiones y ABREN contradicciones; los humanos PROMUEVEN y RESUELVEN.
La frontera de autoridad queda mecánica en las tres capas: sin tool MCP de promoción ni de
resolución, con `ability` que sólo lleva una credencial humana, y con Postgres rechazando la
fila aunque alguien llegue por `psql`.

Esta tarea aplica la **opción C** que resolvió el humano el 2026-08-31 sobre la decisión 2
del ExecPlan: `registrar_contradiccion` sigue siendo tool de agente, pero (1) pasa por un
permiso nuevo `contradiccion.abrir`, revocable por rol en datos, y (2) T04 entrega además la
salida humana `POST /api/contradicciones/{id}/resolver`, que el ExecPlan y T05 diferían a una
fase posterior. Sin esa salida, abrir una contradicción sería un bloqueo sin escape por vía
legítima: es la misma migración la que congela y la que abre la puerta.

## Contexto

Lecturas obligatorias ANTES de escribir una línea. Manda el archivo real, no este resumen:

| Qué | Dónde | Para qué |
|---|---|---|
| tabla `decision`, `fn_decision_promovida`, `ck_dec_promovida` | `database/migrations/2026_08_26_100000_create_dominio_y_decision.php` | el gate ya existe: exige firma `promuevo` de un `human_admin` sobre la huella actual, en INSERT **y** UPDATE |
| tabla `contradiccion` | `database/migrations/2026_08_26_100300_create_contradiccion.php` | columnas reales: `resolucion`, `abierta_por`, `resuelta_por`, `resuelta_at`; `ck_con_resolucion`; `uq_con_cambio_invariante` |
| `fn_firmante_humano` | `database/migrations/2026_07_20_110100_create_firmante_humano.php` | patrón literal de «esto lo hace una persona»: `member.member_type <> 'human'` → RAISE nombrando al responsable |
| `FirmaService::firmar()` | `app/Protocol/FirmaService.php:31` | firma: `(Member, entidadTipo, entidadId, significado, canal)`. La huella la sella el trigger, no se pasa |
| patrón de permiso | `app/Protocol/EnlaceService.php:67-75` | `hasPermission()` + `PermissionDenied::permiso(<permiso>, <acción>)` |
| patrón de tool con permiso | `app/Mcp/Tools/ProponerRevalidacion.php` | tool de agente cuya escritura depende de un permiso revocable |
| patrón de ruta humana | `routes/api.php:160-169` | `->middleware('ability:bloque:aprobar')` sobre la ruta, no en el controlador |
| abilities | `config/quipu.php:65-83` | `human => ['*']`, `agent => [lista explícita]`. Lee abajo la nota, que corrige el texto de la versión anterior de esta tarea |
| permisos y matriz de roles | `database/seeders/RolePermissionSeeder.php` (`PERMISSIONS`, `ROLE_PERMISSIONS`) | dónde nacen los permisos y qué rol los lleva |
| vigías que vas a mover | `tests/Feature/SeederTest.php:12-16` (cuenta exacta), `tests/Feature/RolesDemandaTest.php` (`matrizDocumentada()`, fila a fila) | son los dos ÚNICOS tests ajenos que puedes tocar |
| vigías que NO puedes tocar | `tests/Feature/McpToolsTest.php`, `tests/Feature/FirmaTest.php` | si se ponen rojos, lo que está mal es tu código |

**Nota sobre las abilities (corrige el texto anterior de esta tarea):** `human` es `['*']`,
así que **no hay nada que añadirle**. Lo que hace mecánica la frontera es que
`decision:aprobar` y `contradiccion:resolver` NO estén en el array `agent`. Añade sólo un
comentario que lo diga; una ability escrita dentro de `human` sería ruido que aparenta una
regla inexistente.

## Pasos

1. **Migración `2026_08_26_120000_gobierno_contradiccion.php`** — que resolver sea humano
   deja de depender de que no exista la ruta:
   - `fn_contradiccion_resuelta_humana()`, `BEFORE INSERT OR UPDATE OF resolucion ON
     contradiccion`: si `NEW.resolucion` es una resuelta (`lookup_contradiccion_resolucion.
     es_resuelta`) y el `member_type` de `NEW.resuelta_por` no es `human` → `RAISE EXCEPTION`
     en español nombrando al agente y a su responsable. Patrón literal: `fn_firmante_humano`.
   - INSERT además de UPDATE **a propósito**: si sólo mirara el UPDATE, insertar la fila ya
     `aceptada` sería la puerta de servicio. Es exactamente el hueco que el humano mandó
     cerrar en `fn_decision_promovida` durante T02; no lo reabras aquí.
   - Comenta en la cabecera de la migración, con el estilo de las de F1, por qué abrir es de
     cualquiera y resolver no.

2. **`app/Protocol/DecisionService.php`** — toda escritura pasa por aquí; las tools y los
   controladores son finos. Errores `ProtocolViolation` (422) / `PermissionDenied` (403), en
   español, siempre nombrando el permiso o el estado que falta:
   - `proponer(Project, string $dominioSlug, string $titulo, ?string $cuerpo, Member $propuestor)`:
     crea la decisión en `propuesta` con código secuencial del dominio (`CORE-001`, siguiente
     número **por dominio**, respetando `ck_dec_codigo`). Nunca nace `vigente`.
   - `superseder(...)` o el argumento equivalente: si la propuesta reemplaza a otra, crea
     también la arista en `decision_supersede` exigiendo `motivo_reemplazo`.
   - `promover(Decision $decision, Member $humano)`: transiciona a `vigente` escribiendo
     `estado` y `promovida_por` **en el mismo UPDATE** (contrato endurecido en T02: ningún
     camino deja una vigente sin quién la promovió). No crea la firma: la firma `promuevo` se
     pone antes por la vía de firma existente, y este método deja que el trigger la exija.
   - `registrarContradiccion(Cambio, Invariante, string $explicacion, Member $autor)`: exige
     `contradiccion.abrir`; crea la fila `pendiente`. Traduce `uq_con_cambio_invariante` a un
     422 legible («esa objeción ya está abierta»), no a un 500.
   - `resolverContradiccion(Contradiccion, string $resolucion, Member $humano)`: acepta sólo
     `aceptada|revocada`; escribe `resuelta_por` y `resuelta_at` en el mismo UPDATE; 422 si ya
     estaba resuelta.

3. **Permisos nuevos** en `RolePermissionSeeder`:
   - `contradiccion.abrir` — «Abrir una contradicción entre un cambio y un invariante
     vigente». Lo llevan `builder_api`, `builder_web`, `analista` y `human_admin`. Que un rol
     pueda perderlo en datos es el punto de la opción C.
   - `contradiccion.resolver` — «Resolver una contradicción: aceptarla o revocarla». **Sólo
     `human_admin`**, igual que `block.approve`.
   - Actualiza las dos vigías, y sólo esas dos: la cuenta de `SeederTest` (20 → 22) y la
     `matrizDocumentada()` de `RolesDemandaTest`. Tocar cualquier otro test ajeno es falla.

4. **Tools MCP** (regístralas en `QuipuServer`, grupo «Cadena normativa», orden alfabético
   como el resto del array):
   - `decision_proponer(project_slug, dominio, titulo, cuerpo?, decision_id_superseded?)`:
     nace `propuesta` SIEMPRE; con predecesora, exige motivo.
   - `registrar_contradiccion(project_slug, cambio_id, invariante_id, explicacion)`: sin
     `contradiccion.abrir` → 403 nombrando el permiso.
   - **Ninguna tool más.** No hay tool de promoción ni de resolución, y no la habrá.

5. **Rutas humanas** (`routes/api.php`, junto al bloque de `blocks/{block}/approve`, con un
   comentario del mismo tono):
   - `POST decisiones/{decision}/promover` → `->middleware('ability:decision:aprobar')`.
   - `POST contradicciones/{contradiccion}/resolver` → `->middleware('ability:contradiccion:resolver')`,
     cuerpo `{ "resolucion": "aceptada|revocada" }`.
   - Controladores finos que resuelven el member autenticado y delegan en `DecisionService`.

6. **Los dos ajustes heredados de T03** (entran aquí porque tocan los mismos archivos y no
   merecen una tarea con su propio ciclo de CI):
   - `app/Mcp/Tools/VerificarContradicciones.php`: `invariantes_aplicables` se acota al
     dominio del cambio ahora que `cambio.dominio_slug` existe (T05). Si el cambio no tiene
     dominio, se mantiene el comportamiento conservador actual —todos los vigentes del
     proyecto—. **Corrige también el docblock**, que hoy afirma que esa columna no existe.
   - `app/Mcp/Tools/InvariantesDe.php`: añade `project_slug` **opcional** (trait
     `ResolvesProject`, `resolveProject()` devuelve null si no se nombra). Con él, filtra por
     proyecto; sin él, el comportamiento de hoy no cambia.

7. **Tests `tests/Feature/DecisionMcpTest.php`** — uno solo, con las tres familias:
   - Vigía por reflexión sobre `QuipuServer::$tools`: ningún nombre contiene `promuev|aprueb|
     resuelv` ni `firma|sign` como palabra. Rojo si alguien añade la tool que no debe existir.
   - Ciclo de la decisión: agente propone → `propuesta`; token de agente contra
     `/api/decisiones/{id}/promover` → 403; humano sin firma → 422 nombrando la firma que
     falta; con firma `promuevo` de `human_admin` → `vigente` y `promovida_por` no nulo.
   - Ciclo de la contradicción: agente con `contradiccion.abrir` abre → `pendiente`; el mismo
     agente sin el permiso → 403 nombrando `contradiccion.abrir`; token de agente contra
     `/api/contradicciones/{id}/resolver` → 403; humano `human_admin` → `aceptada` con
     `resuelta_por`/`resuelta_at`; UPDATE directo por SQL poniendo `resuelta_por` a un agente
     → rechazado por el trigger (prueba de que la regla vive en Postgres, no en PHP).
   - **Hueco de cobertura heredado de T05**, que cierras aquí porque es el mismo flujo: el
     acote `i.project_id = NEW.project_id` de `fn_cambio_sin_contradicciones` no lo vigila
     ningún test —los 10 de `ContradiccionGateTest` usan un solo proyecto—, así que hoy borrar
     esa línea de la migración deja el CI verde. Añade **a `ContradiccionGateTest.php`** (es la
     excepción a «no toques tests ajenos»: se añade un test, no se modifica ninguno) el caso de
     dos proyectos que comparten dominio: una contradicción pendiente del proyecto B no congela
     un cambio del proyecto A. El Verificador de T05 ya lo probó a mano por SQL; falta que lo
     vigile la suite.

8. `docker compose exec -T -e COMPOSER_PROCESS_TIMEOUT=1800 api composer ci` en segundo plano
   a fichero. Verde sin excepciones ni ignores. Commit:
```
MCP+REST: agentes proponen decisiones y abren contradicciones; promover y resolver son humanos

F1/T04 · frontera de autoridad mecánica: permiso contradiccion.abrir revocable,
abilities humanas, firma promuevo y trigger de resolución humana. Ninguna tool de gobierno
```

## Criterios de aceptación (GWT)
- DADO un agente, CUANDO llama `decision_proponer`, ENTONCES la decisión nace `propuesta`
  con su código de dominio y consta quién la propuso.
- DADO la lista de tools MCP, CUANDO se busca una que promueva, resuelva o firme, ENTONCES no
  existe (test rojo si aparece).
- DADO un token de agente, CUANDO hace POST a promover o a resolver, ENTONCES 403 por ability.
- DADO un humano con firma `promuevo` vigente, CUANDO promueve, ENTONCES la decisión queda
  `vigente` y `promovida_por` es esa persona.
- DADO un miembro sin `contradiccion.abrir`, CUANDO llama `registrar_contradiccion`, ENTONCES
  403 nombrando el permiso; DADO que lo tiene, ENTONCES la contradicción nace `pendiente`.
- DADO una contradicción pendiente, CUANDO un `human_admin` la resuelve por REST, ENTONCES
  queda `aceptada|revocada` con `resuelta_por` y `resuelta_at`, y el cambio que congelaba
  vuelve a avanzar (gate de T05).
- DADO un UPDATE directo por SQL que pone `resuelta_por` a un agente, CUANDO se ejecuta,
  ENTONCES Postgres lo rechaza nombrando al responsable humano.
- DADO un cambio con dominio, CUANDO llama `verificar_contradicciones`, ENTONCES
  `invariantes_aplicables` trae sólo los de ese dominio; sin dominio, todos los del proyecto.
- DADO dos proyectos que comparten dominio, CUANDO el proyecto B tiene una contradicción
  pendiente, ENTONCES un cambio del proyecto A avanza igual (y el test lo vigila: borrar el
  acote de la migración de T05 tiene que poner el CI en rojo).
- DADO todas las suites pre-T04, CUANDO corre `composer ci`, ENTONCES verde, con los únicos
  tests ajenos tocados siendo `SeederTest`, `RolesDemandaTest` y `ContradiccionGateTest` —los
  dos primeros modificados, el tercero sólo ampliado con el caso de dos proyectos.

## Retrabajo — ciclo 2 (sólo esto; lo del ciclo 1 está verificado y no se toca)

El ciclo 1 quedó APROBADO en sus doce criterios. El Verificador midió, además, un hueco que el
ciclo 1 dejó abierto y que **sí está dentro del texto de esta tarea**: el paso 4 enumera
`registrar_contradiccion(project_slug, cambio_id, invariante_id, explicacion)` y la tool se
entregó **sin `project_slug`**, sin declarar la desviación. La consecuencia está medida, no
supuesta: un agente abrió una contradicción entre un cambio del proyecto A y un invariante del
proyecto B, y nada la rechazó. Como el gate de T05 congela por match directo de `cambio_id` sin
mirar el proyecto, eso permite **congelar un cambio citando norma ajena**.

No arrastres nada más a este ciclo. Son tres cosas:

1. **La regla, primero en Postgres.** Cruza dos tablas, así que un CHECK no puede: va como trigger.
   En `2026_08_26_120000_gobierno_contradiccion.php` —**esta migración sí se edita**, contra la
   regla habitual de no tocar migraciones viejas, porque todavía no está consolidada en main y
   vive sólo en esta rama: añade `fn_contradiccion_mismo_proyecto()`, `BEFORE INSERT OR UPDATE ON
   contradiccion`, que compare `cambio.project_id` con `invariante.project_id` y rechace con
   `RAISE EXCEPTION` en español nombrando ambos proyectos y explicando que una contradicción
   enfrenta un cambio con la norma **de su propio proyecto**.
2. **`registrar_contradiccion` gana `project_slug` requerido**, con `ResolvesProject` como las
   otras tools de la cadena normativa, y `DecisionService::registrarContradiccion()` comprueba
   que cambio e invariante pertenezcan a ese proyecto antes de escribir: `ProtocolViolation` (422)
   con mensaje legible, para que el usuario no reciba el texto crudo del trigger cuando el camino
   es el normal. El trigger es la red que sostiene la regla aunque alguien llegue por `psql`; la
   comprobación en PHP es la que da el buen mensaje. Las dos, no una.
3. **Amplía el disparo de `fn_contradiccion_resuelta_humana` a `UPDATE OF resolucion,
   resuelta_por`.** Hoy es `UPDATE OF resolucion`, así que un `UPDATE` que cambie **sólo**
   `resuelta_por` sobre una fila ya resuelta pasa: medido y aceptado por el Verificador. Reescribir
   a posteriori quién retiró una objeción es exactamente lo que `ck_con_resolucion` existe para
   impedir. El flanco equivalente de `decision.promovida_por` (T02) **no** se toca aquí: queda
   documentado en T06 como límite y se decide en F2.

Tests, en `DecisionMcpTest.php` (no toques ningún otro fichero de test en este ciclo):
- DADO un cambio del proyecto A y un invariante del proyecto B, CUANDO un agente llama
  `registrar_contradiccion`, ENTONCES 422 nombrando ambos proyectos y no se crea ninguna fila.
- DADO ese mismo par, CUANDO se inserta directo por SQL, ENTONCES el trigger lo rechaza.
- DADO una contradicción ya resuelta por un humano, CUANDO un `UPDATE` cambia sólo
  `resuelta_por` a un agente, ENTONCES el trigger lo rechaza.

CI completo verde otra vez (baseline a batir: 559 passed / 3397 assertions), y **un commit nuevo**
—nunca un amend sobre `90e256d`, que ya está verificado—:
```
Contradicción: exige mismo proyecto y protege quién la resolvió

F1/T04 ciclo 2 · project_slug en registrar_contradiccion, trigger de mismo
proyecto, y resuelta_por deja de ser reescribible sobre una fila ya resuelta
```

## Evidencia
Salida pest completa de `DecisionMcpTest`, salida del `composer ci` final con su exit code,
la sesión `psql` del intento de resolución por un agente (comando + error literal),
`diff_review` (server + rutas + config + seeder) y el commit.

## Fuera de alcance
UI web de decisiones, invariantes o contradicciones (F4). Grafo de transiciones de `decision`
—la resurrección `superada → vigente`, hallazgo S4— **diferido a F2 por decisión humana**: no
lo cierres aquí. Importar nada de Chasqui. Tabla puente multi-dominio. Modificar
`fn_cambio_transicion`, `fn_cambio_autorizado` ni el gate `fn_cambio_sin_contradicciones` de
T05. Tocar `block-workflow`. Añadir dependencias de composer o npm.
