# evidencia/ — artefactos de verificación commiteados

Convención: evidencia/<bloque-o-change>/<qué-prueba>.<ext>
Reglas:

- Cada archivo prueba UN criterio citado por un test o un scenario OpenSpec.
- Es artefacto DERIVADO: se regenera ejecutando lo que lo produce; nunca se edita
  a mano para "arreglar" un resultado.
- Cuando la evidencia viva en la BD de Quipu (capability planificada), este
  directorio queda deprecado y se elimina en bloque.
