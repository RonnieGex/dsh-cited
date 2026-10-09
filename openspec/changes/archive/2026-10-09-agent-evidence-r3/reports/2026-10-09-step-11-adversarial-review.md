# Revisión adversarial independiente: agent-evidence-r3

Fecha: 2026-10-09. Rama: feature/readme-pro. Base: fda732d49027048f4a97b56c88c0f9d75c020a38.
Revisor: runtime_review, independiente del especificador contracts y del implementador root. El revisor no escribió código de implementación ni pruebas del producto y no repitió la captura.

Veredicto: PASS WITH GAPS. Cero Blockers y cero Majors abiertos. El comportamiento, la evidencia y los gráficos revisados cumplen el contrato; queda una limitación Minor de evidencia histórica de TDD descrita abajo.

## Alcance y reconciliación

Se leyeron proposal.md, design.md, tasks.md, spec.md, los reportes de pasos 0, 1, 3, 3-revalidation, 6, 7, 8 y 10, ambos documentos de crítica R2, el diff de captura/renderizado/documentación/pruebas y los registros originales de los tres intentos. Se revisaron los tres README, compatibility.md, readme-assets.md y project-manual.md.

Los registros contienen las tres preguntas naturales aprobadas, sin instrucciones de herramienta. La corrida inglesa buscó dos veces y luego recibió una negativa de ask; sus citas no sustentan un precio. Los dos intentos en español devolvieron su propio pasaje con 380 pesos y respondieron ese precio con cita. El resumen correcto es 2/3. La canónica conserva attempt-2, incluyendo sus llamadas ask y search; la imagen muestra una selección explícita de pregunta, ask completo y respuesta final completa. Los TXT conservan todas las llamadas.

La canónica usa la instalación local compilada. Los SHA-256 del módulo instalado, el registro y lib/index.js coinciden. Las filas de compatibilidad EN/ES/ZH distinguen esa instalación de la verificación histórica desde GitHub. El modelo de Cited se atribuye a la configuración real del servidor aislado, separado del agente Harness. No se infiere la identidad del proveedor histórico desconocido.

Las tres corridas sólo cambian model_calls; conversations permanece en cero. Cada snapshot conserva 19 tablas. La negativa inglesa incluye sessionId, por lo que la documentación correctamente condiciona la persistencia también al resultado del servidor. Las negativas y afirmaciones falsas nuevas e históricas tienen enlaces concretos y no se presentan como pruebas de que falte el servicio en el corpus.

## Validación propia ejecutada

Desde dsh-cited, con Node v24.11.0:

- `node --test "tests/**/*.test.mjs"`: 62 aprobadas, 0 fallidas, incluida composición real de Loader.
- `node scripts/build.mjs --check`: GREEN, 2 archivos coinciden con src.
- `node --test tests/readme.test.mjs`, después de corregir el validador: 7 aprobadas, 0 fallidas.
- Probes mediante here-strings enviados a `node --input-type=module`: clasificación real [false, true, true], elección exacta de attempt-2, igualdad de eventos canónicos, igualdad de SHA local/instalado, reproducción exacta de cada TXT desde eventos, preservación completa del resultado ask y respuesta final en la selección, 19 tablas por intento y únicamente model_calls modificado. Resultado: `REVIEW: GREEN 3 attempts; 2 supported answers; canonical attempt 2; source hash; full and selected transcripts; 18 image hashes`.
- Probe adversarial de duplicados, huérfanos, resultados antes de llamadas, final antes de resultado y dos finales: los cinco rechazan transcriptOf y no califican hasOwnPassage. Resultado: `REVIEW: GREEN 5 adversarial pairing/order/final mutations rejected`.
- Recalculé SHA-256 de los 18 PNG finales contra render-report.json y comprobé fuentes, overflow vacío y cero solicitudes externas. Resultado: `REVIEW: GREEN final 18 image hashes and audits match`.

Reproducción del probe adversarial final:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasOwnPassage, transcriptOf } from './scripts/readme-graphics/evidence.mjs'
const r = JSON.parse(readFileSync('docs/evidence/headless-answer.json', 'utf8'))
const ask = r.events.find(e => e.type === 'tool_call' && e.tool === 'cited_ask')
const result = r.events.find(e => e.type === 'tool_result' && e.callId === ask.callId)
const final = r.events.findLast(e => e.type === 'final')
for (const events of [
  [ask, { ...result, result: '1. unrelated.md\nNo price passage.' }, result, final],
  [ask, result, { ...result, callId: 'orphan' }, final],
  [result, ask, final],
  [ask, final, result],
  [ask, result, final, final]
]) {
  assert.equal(hasOwnPassage({ ...r, events }, 'cited_ask'), false)
  assert.throws(() => transcriptOf(events, r.prompt))
}
```

Se inspeccionaron visualmente real-answer EN claro, ZH oscuro, ES claro final, how-it-works claro y banner oscuro. El banner conserva 340 px y chip superíndice. El comando está en una sola línea monoespaciada. La respuesta completa es legible, conserva Markdown crudo y lleva la nota de resaltado de citas. El encabezado final explica que la transcripción contiene todas las llamadas.

## Evidencia ejecutada por el implementador

Se leyó el gate final: GREEN 14/14, suite 62/62, build equivalente, instalación headless y herramientas. evidence/database-state.json registra 19 tablas inmutables durante búsqueda viva y ask sin modelo. Ese gate no se confunde con los ask exitosos de la captura.

Se verificaron los resultados registrados de curl: tools/list 200 autenticado y 401 sin token, suministrado por stdin. Se reconciliaron el reporte de renderizado final de 18 PNG y el reporte de OpenSpec estricto válido. El revisor no ejecutó nuevamente gate, curl ni captura, y no se atribuye esas ejecuciones.

## Hallazgos y correcciones independientes

- Blocker: ninguno.
- Major R1, resuelto: las filas ES/ZH aún afirmaban nueva instalación desde GitHub. El implementador corrigió a compilación local y evidencia histórica separada; el revisor confirmó las tres traducciones y los documentos de procedencia.
- Major R2, resuelto: JSON.parse sin protección abortaba captura ante una línea malformada antes de conservar el intento. captureEvents ahora conserva eventos válidos, registra un error sanitizado y evita promover el intento, sin abortar las siguientes preguntas por ese error. Se revisó su integración y pasó la regresión persistente.
- Major R3, resuelto: resultados duplicados con el mismo callId podían aprobar una fuente que transcriptOf omitía. Probe inicial reprodujo `duplicateResultAccepted=true` y `transcriptOmitsPricePassage=true`. El implementador agregó TDD y validación biyectiva de llamadas/resultados, unicidad y orden. El probe propio posterior rechaza las cinco mutaciones indicadas.
- Minor R4, resuelto: faltaban regresiones persistentes para resumen real, SHA y selección de display; se incorporaron. Se detectó y corrigió también el uso de filter(hasOwnPassage), cuyo segundo argumento se interpretaba como herramienta.
- Minor R5, resuelto: el gráfico no explicitaba que el TXT incluía todas las llamadas. Se agregaron las tres traducciones y se regeneraron/verificaron los 18 gráficos.
- Minor R6, brecha procedimental confirmada: step-3-revalidation.md demuestra el resultado verde y la revalidación real, pero su rojo citado corresponde a canonicalOf ausente. El implementador confirmó que agregó el rechazo de negativa con citas y corrigió el conteo en el mismo paso, sin ejecutar primero la prueba roja específica que exige la tarea 3.1. No se inventa esa ejecución ni se repite la captura. Esto no invalida las pruebas actuales ni la clasificación correcta observada.

## Issues

- NOT DONE: no se ejecutó la prueba roja específica antes de corregir la clasificación, como se documenta en Minor R6. Es una brecha de proceso histórica; la regresión actual y el resultado 2/3 sí están verificados.
- RISK: enlaces públicos a main dependen de fusionar dsh-cited PR #1 antes de Cited PR #18; la documentación conserva esa restricción.
- NOT DONE: archivo, commit, escaneo de los cambios nuevos y CI remota del siguiente SHA corresponden al cierre del implementador. El gate escanea historial existente, por lo que no reemplaza el escaneo previo al commit.

