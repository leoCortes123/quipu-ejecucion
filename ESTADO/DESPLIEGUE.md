# DESPLIEGUE — cómo levantar el Sistema A con OpenCode

> **Parcialmente desactualizado.** La flota se portó a Claude Code el 26-08-2026
> (commit `3189469`) y conviven dos configuraciones de agentes, `.claude/` y `.opencode/`,
> sin que ningún documento declare cuál manda. Lo de este archivo que **sigue vigente**:
> las herramientas de `bin/`, el modo sombra y sus umbrales, y el procedimiento de cierre
> de fase (§5). Lo que describe el arranque sobre OpenCode con modelos DeepSeek hay que
> leerlo sabiendo eso. Registrado en `ARCHIVO/TRABAJO-SIN-TAREA.md` § 2.

## 0. Requisitos previos (una sola vez)

- Docker corriendo y `opencode` instalado.
- **Proveedor DeepSeek autenticado**: `opencode auth login` → DeepSeek → pega la API key.
  Verifica los ids exactos dentro de opencode con `/models` (formato `proveedor/modelo`).
- Repo con working tree limpio: `git -C /mnt/datos/Programacion/QUIPU_ENTERPRISE status`.
- **Sin MCPs ni skills**: F0 y F1 son bash/docker/git/edición. El servidor MCP propio de
  Quipu se incorpora en F2+, no antes. Cada MCP activo mete sus esquemas de tools en
  TODOS los turnos: es coste puro mientras no se use.

## 1. Layout desplegado (estado vigente)

El paquete vive **bajo `sistema-a/`** (no en la raíz: la raíz duplicaría PLAN/ y TAREAS/
y crearía dos fuentes de verdad). Lo único que se despliega en la raíz es lo que OpenCode
sólo sabe descubrir ahí:

| Ruta raíz | Qué es |
|---|---|
| `opencode.json` | config del Sistema A: modelo por defecto, permisos, `instructions` |
| `.opencode/agents/{orquestador,ejecutor,verificador}.md` | copia desplegada de `sistema-a/.opencode/agents/` |
| `opencode.ui.json` | config alternativa para trabajo de UI (agentes ui-* + MCPs). No se carga sola |
| `../metodologia/contexto/estilo-ui.md` | reglas de estilo del front (antes mal ubicada dentro de `agents/`) |

`AGENTS.md` se carga vía `"instructions": ["CLAUDE.md", "sistema-a/AGENTS.md"]`
en vez de copiarse a la raíz — así el contrato tiene un solo original. Por eso las rutas
dentro del paquete se citan con prefijo `sistema-a/`, que resuelve igual desde la raíz del
repo y desde cualquier worktree.

Si cambias un agente **o la config**, edita el original bajo `sistema-a/` y redespliega:

```bash
cp sistema-a/.opencode/agents/*.md .opencode/agents/
cp sistema-a/opencode.json opencode.json
```

`opencode.json` de la raíz es copia desplegada de `opencode.json` de este paquete, igual que los
agentes: editar sólo el del paquete no surte efecto, porque OpenCode lee el de la raíz.

## 1.1 Arranque de la flota

```bash
sistema-a/bin/flota.sh          # modo sombra (lo vigente)
```

Arranca desde la raíz del repo con `QUIPU_VERIF_DETERMINISTA` puesto, e imprime el estado
del despliegue en sombra antes de entrar. Existe para que el flag no dependa de acordarse
de un `export`: sin él, el modo sombra no recoge nada y la racha se queda en 0 para siempre.

| Valor | Qué hace |
|---|---|
| `0` | verificación determinista apagada; el Verificador hace los pasos a mano |
| `sombra` | `verificar.sh` observa y **no decide**; el Orquestador registra la comparación |
| `1` | vinculante: `FALLA` rechaza. **Sólo tras 5/5** — lo autoriza el humano, no la flota |

El estado se consulta con `bin/sombra.sh estado`; el criterio de corte y el de
rollback están en `../metodologia/normativa/VALIDACION.md`.

### Herramientas del paquete (`bin/`)

| Script | Para qué |
|---|---|
| `flota.sh` | arranca la flota con el entorno correcto |
| `estado.sh` | proyección compacta de `progress.json` — **léelo en vez del ledger entero** |
| `checkpoint.sh` | valida contra `../metodologia/normativa/HANDOFF.md` y anexa al ledger; `auditar` mide la deriva |
| `metricas.sh` | consumo LLM por sesión y por agente desde la base de opencode (sólo lectura) |
| `verificar.sh` | pasos mecánicos del Verificador → JSON `veredicto_mecanico` |
| `sombra.sh` | registro de discrepancias del modo sombra y criterio de corte |

## 2. Modelo por agente (obligatorio, no opcional)

Cada agente fija su modelo en el frontmatter. **No cambiar el modelo de un agente a mitad
de una tarea**: invalida el prefijo cacheado y convierte cache-hit ($0,007–0,022/M) en
cache-miss ($0,22–0,66/M), un factor de 30×.

| Agente | Modelo | Por qué |
|---|---|---|
| `orquestador` | `deepseek/deepseek-v4-pro` | planifica y decide escalamientos: rol de criterio |
| `ejecutor` | `deepseek/deepseek-v4-flash` | carga todo el volumen de tokens |
| `verificador` | `deepseek/deepseek-v4-pro` | Default-FAIL: un verificador barato que aprueba de más cuesta más en retrabajo que lo que ahorra |

Franja horaria (Bogotá, UTC-5): DeepSeek cobra el doble en peak (01–04 y 06–10 UTC, L-V).
Off-peak = **L-V 05:00–20:00**, L-J 23:00–01:00 y **viernes 20:00 → domingo 20:00** entero.
Evita lanzar fases entre las 20:00 y las 23:00 de domingo a jueves.

## 3. Lanzar (modo recomendado: subagentes)

```bash
cd /mnt/datos/Programacion/QUIPU_ENTERPRISE
opencode        # entra como agente Build → pulsa Tab hasta "orquestador"
```

Y dale la orden inicial, por ejemplo:

> Ejecuta la fase F1 según sistema-a/PLAN/F1-execplan.md. Estado actual: T00 y T01 cerradas;
> T02 con ejecutor terminado en `3d86aaf` sobre la worktree `wt/f1-t02-migraciones` y
> **verificación pendiente** (foco S5). Retoma ahí: lanza `@verificador` sobre esa worktree
> antes que nada. Después T03, T04 y T05 en worktrees paralelas, y T06 sobre main.
> Escala sólo clase C.

El Orquestador despacha cada tarea a `@ejecutor`, convoca `@verificador` sobre el
resultado (agente distinto, regla dura), reintenta máx 2 ciclos y te consulta clase C
mediante la herramienta de pregunta con formato cerrado.

### Modo alternativo: sesiones manuales

Si prefieres control fino (sin subagentes), abre una terminal por tarea:

```bash
git worktree add ../wt/f1-t03-tools -b wt/f1-t03-tools
cd ../wt/f1-t03-tools && opencode   # pega: "Ejecuta sistema-a/TAREAS/F1/T03-tools-lectura.md"
```

y en otra terminal una sesión `verificador` sobre la misma worktree al terminar.
El contrato es idéntico; lo único que cambia es quién despacha (tú en vez del Task tool).

## 4. Qué NO instalar

- MCPs: ninguno para F0 ni F1. El servidor MCP propio de Quipu (`php artisan mcp:start quipu`
  + token Sanctum) se incorpora cuando las fases empiezan a operar contra la BD (F2+),
  no antes.
- Skills: innecesarias — el paquete ES la instrucción (markdown plano versionado).
- Plugins/formatters: el CI ya cubre lint/format dentro de contenedores.

## 5. Al cerrar una fase

- Los checkpoints quedan en `sesiones/progress.json` (append-only): es tu registro de
  auditoría de la flota.
- Fusiona las worktrees aprobadas a `main` en orden de dependencias, corre CI final y
  borra las worktrees (`git worktree remove …`). La rama principal es **main** (post-F0).
- Siguiente fase: generar `PLAN/F<n>-execplan.md` con este mismo formato.
