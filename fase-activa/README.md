# fase-activa — la única parte del plan que la ejecución ve

Vacío: **no hay fase activa.** F0 y F1 están cerradas; el plan nuevo aún no se ha escrito
(`../../conocimiento/plan/README.md`), así que no hay fase que abrir.

Cuando el humano abre una fase, publica aquí —y sólo aquí— esa fase:

```
fase-activa/
├── F<n>-execplan.md      el ExecPlan de la fase, extraído del plan completo
└── tareas/
    └── T<nn>-*.md        las tareas aprobadas, una por archivo, autosuficientes
```

Al cerrarla, todo esto se mueve a `../ARCHIVO/fases/F<n>/` —junto a la evidencia contra la
que se verificó— y este directorio vuelve a quedar vacío.

**Por qué existe la copia.** El plan completo vive en `../../conocimiento/plan/` y la
ejecución no lo lee nunca: un agente que ve las ocho fases replanifica, prioriza por su
cuenta y gasta contexto en trabajo que no le toca. Publicar una fase es el acto humano que
convierte plan en encargo.
