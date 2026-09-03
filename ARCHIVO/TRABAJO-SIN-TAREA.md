# Trabajo ejecutado sin tarea ni plan (inventario)

Once commits del repo del producto entregaron trabajo real que **ningún archivo de
`TAREAS/` encargó y ningún ExecPlan de `PLAN/` contempló**. No se está juzgando: se está
inventariando, porque un agente que lea `PLAN/` y `TAREAS/` creyendo que ahí está todo lo
hecho se formará un mapa falso del repositorio.

Reconstruido el 2026-09-01 desde `git log` y `.session/progress.json`.

## 1. Optimización de contexto de la flota (9 commits)

`62178cc`, `14df3eb`, `7400111`, `6d17f9e`, `ed2dab8`, `0955537`, `16f351f`, `c8b5c98`,
`81676a2`, más `ec10fbd`.

Entregó todo `bin/` (`estado.sh`, `checkpoint.sh`, `verificar.sh`, `sombra.sh`,
`metricas.sh`, `flota.sh`), el modo sombra, el gate determinista y el contrato mecánico de
checkpoint.

**Rastro documental:** `PLAN/FLOTA/PLAN_IMPLEMENTACION.md`, escrito el 30-08 y ampliado con
su §6 el 31-08, *después* de ejecutar. Es un documento honesto —admite que la Ola 3 se
construyó estando RETIRADA y que la Ola 1 se implantó sin su Paso 1.0 bloqueante— pero es
un registro *a posteriori*, no un plan que gobernara la ejecución.

**Por qué importa:** es un segundo proyecto completo, con su propia Fase 0, olas, KPIs y
cinco pendientes vivos (§6.4), que nunca entró en `ESTADO/ESTADO.md`. Su deuda está ahora
consolidada en `ESTADO/DEUDA-F2.md` § D.

## 2. Port de la flota a Claude Code

`3189469` — «Sistema A: flota agéntica portada a Claude Code».

**Rastro documental: ninguno.** `ESTADO/DESPLIEGUE.md` sigue describiendo el despliegue
sobre OpenCode con modelos DeepSeek y su tabla de franjas horarias. Conviven dos
configuraciones de agentes (`.claude/agents/` y `.opencode/agents/`) sin que ningún
documento diga cuál manda.

**Consecuencia medida:** `bin/metricas.sh` lee `opencode.db`, así que desde el 26-08 la
instrumentación de coste no ve la actividad real de la flota (`ESTADO/DEUDA-F2.md` D5).

## 3. Guía de usuario y guías HTML

`94c1e7e` — «Docs: guía de usuario; ignora artefactos locales de sesión», que creó
`GUIA-USUARIO.md` (17,8 KB) en la raíz del repo del producto. Más
`guias/quipu-guia-tecnica.html` y `guias/quipu-guia-usuario.html` (164 KB), que al
2026-09-01 **siguen sin rastrear en git**.

**Rastro documental:** una entrada de ledger `post-F0/guia-usuario-y-chasqui`, sin archivo
de tarea, sin criterios GWT y sin verificación independiente.

## 4. Reorganización a `sistema-a/` y salida del control de versiones

`aa23105` — «Saca de versión el andamiaje de desarrollo; el repo publica solo el producto».

Movió todo el andamiaje bajo `sistema-a/` y añadió `/sistema-a/` al `.gitignore` raíz,
dejando **527 archivos rastreados en cero**.

**Rastro documental:** el antiguo `README.md` del paquete, escrito después del hecho
(conservado en `ARCHIVO/mudanza-2026-09-01.md`). Sin checkpoint en el ledger, sin tarea,
sin verificación.

**Consecuencia:** `openspec/specs/` —que la regla 7 de `NORMATIVA/CONSTITUCION.md` declara
fuente de verdad sobre cualquier otro documento— quedó sin historial, sin diff y sin
respaldo. Resuelto el 2026-09-01 dando a `sistema-a/` su propio repositorio git.

## 5. Apertura de permisos

`bcbe63a` — «Permisos: PLAN y TAREAS dejan de estar denegados para Claude».

Cambio en el `deny` de `.claude/settings.json`, es decir en la frontera de lo que un agente
puede tocar. Sin tarea ni registro de la decisión.

---

## Qué hacer con esto

Nada retroactivo: reescribir `TAREAS/` para inventar tareas que no existieron sería
falsificar el historial, y es exactamente el vicio que el flujo OpenSpec existe para
evitar. Lo que sí corresponde:

1. Que este inventario exista y se lea (por eso está enlazado desde `INDICE.md`).
2. Que su deuda esté en `ESTADO/DEUDA-F2.md` en vez de invisible.
3. Que de F2 en adelante **todo trabajo tenga tarea antes que commit**. La regla ya existe
   —`NORMATIVA/CONSTITUCION.md` regla 13, `AGENTS.md` regla de oro 1— y lo que faltó no fue
   la regla sino aplicarla al trabajo sobre el propio Sistema A, que quedó fuera del
   perímetro que la flota se aplica a sí misma.
