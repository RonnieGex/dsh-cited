# Revisión adversarial independiente: ask-citation-excerpts

Fecha: 2026-10-09. Rama: feature/readme-pro. Base: 8872f98b7cf871fc499a91d42435f481a76e6249.
Revisor: agente runtime_review, distinto del autor de especificación contracts y del implementador root. El revisor no modificó implementación ni pruebas.

Veredicto: PASS. Sin Blockers ni Majors abiertos. Dos observaciones Minor fueron corregidas por el implementador y verificadas nuevamente por el revisor.

## Evidencia revisada

Se leyeron completos proposal.md, design.md, tasks.md y specs/ask-citation-excerpts/spec.md, los reportes de pasos 0, 1, 2, 4, 5 y 8, y el diff de src/index.js, lib/index.js, tests/tools.test.mjs, tests/helpers/fake-mcp.mjs, scripts/gate.mjs, README.md y docs/project-manual.md. Se inspeccionaron scripts/lib/database-snapshot.mjs y el contrato real en ../community-readme/lib/mcp/tools.ts.

El único cambio de producción agrega el extracto inmediatamente después de la dirección de cada cita, en el mismo orden y sin transformarlo. answersOf, placeOf, los esquemas, la ejecución MCP y la negativa sin citas conservan su implementación. lib/index.js refleja el mismo cambio. No hay cambios de servidor, dependencias ni búsquedas adicionales.

El contrato upstream exige excerpt en las citas y devuelve outcome.citations en structuredContent. La ausencia del checkout community-main está documentada; se verificó el contrato en community-readme.

## Comandos ejecutados por el revisor

Todos se ejecutaron desde dsh-cited.

- `node --version`: v24.11.0.
- `node --test "tests/**/*.test.mjs"`: 58 pruebas aprobadas, 0 fallidas antes de la corrección de cobertura señalada abajo. Incluyó la composición real de Loader.
- `node scripts/build.mjs --check`: GREEN, 2 archivos coinciden con src; repetido después de las correcciones, también GREEN.
- `node --test tests/tools.test.mjs`: 16 pruebas aprobadas, 0 fallidas después de incorporar la regresión de campos obligatorios.
- `git diff -- src/index.js lib/index.js tests/tools.test.mjs scripts/gate.mjs` y revisión posterior del diff de README.md y tests/helpers/fake-mcp.mjs: sin cambios en structured/refusal y correcciones limitadas a documentación y fixture/prueba.

También se ejecutó el siguiente probe mediante un here-string de PowerShell enviado a `node --input-type=module`. Resultado: `REVIEW: GREEN source and built projection/refusal; 10 malformed-citation rejections; 19-table database replay`.

```js
import assert from 'node:assert/strict'
import { citedAskTool as sourceTool } from './src/index.js'
import { citedAskTool as builtTool } from './lib/index.js'
import { databaseSnapshot } from './scripts/lib/database-snapshot.mjs'
import { readFileSync } from 'node:fs'
const citation = { n: 2, document: 'source.md', heading: '', position: 0, excerpt: '  raw **text**\r\nlast line  ', lead: 0 }
const originalFetch = globalThis.fetch
let payload
try {
  globalThis.fetch = async () => new Response(JSON.stringify({ result: { structuredContent: payload } }), { status: 200 })
  for (const factory of [sourceTool, builtTool]) {
    const tool = factory({ url: 'http://127.0.0.1', token: 'fixture' })
    payload = { status: 'answered', answer: 'Exact answer.', citations: [citation] }
    const value = await tool.execute({ question: 'q' })
    assert.deepEqual(value, payload)
    assert.equal(tool.output.render({}, value)[0].text, 'Exact answer.\n\nSources:\n2. source.md (position 0)\n' + citation.excerpt)
    payload = { status: 'refused', answer: '  Exact refusal.\n', citations: [] }
    const refused = await tool.execute({ question: 'q' })
    assert.deepEqual(refused, payload)
    assert.equal(tool.output.render({}, refused)[0].text, payload.answer)
    for (const field of ['n', 'document', 'position', 'excerpt', 'lead']) {
      const malformed = { ...citation }
      delete malformed[field]
      payload = { status: 'answered', answer: 'x', citations: [malformed] }
      await assert.rejects(() => tool.execute({ question: 'q' }), /unexpected form/)
    }
  }
} finally { globalThis.fetch = originalFetch }
const evidence = JSON.parse(readFileSync('evidence/database-state.json', 'utf8'))
assert.equal(evidence.unchanged, true)
assert.deepEqual(evidence.before, evidence.after)
assert.deepEqual(databaseSnapshot('.tmp/gate/cited.sqlite'), evidence.after)
assert.equal(evidence.before.length, 19)
console.log('REVIEW: GREEN source and built projection/refusal; 10 malformed-citation rejections; 19-table database replay')
```

## Gate, base de datos y límites

El revisor leyó evidence/gate.txt: GREEN 14/14, con 58 pruebas en esa corrida. No volvió a ejecutar el gate. evidence/database-state.json contiene conteos y hashes de 19 tablas, iguales antes y después, incluidos model_calls=0 y conversations=0. El probe independiente volvió a leer la base real y obtuvo exactamente el snapshot posterior registrado. databaseSnapshot abre SQLite en readOnly, no inicializa ni migra, escapa identificadores y ordena la representación de filas antes de calcular SHA-256. Los snapshots rodean las llamadas reales de smoke-install.

Este gate cubre búsqueda viva y error controlado de ask sin modelo configurado. No prueba una respuesta exitosa de un proveedor real. Los reportes lo declaran; las corridas naturales nuevas pertenecen al siguiente cambio de presentación. docs/evidence/mcp-http.json registra curl autenticado 200 y sin autorización 401. Estas llamadas fueron ejecutadas por el implementador y no se atribuyen al revisor.

Se revisó la CI existente: ejecuta contratos portables, tools y build con Node 24, además de gitleaks sobre el historial. La revisión no afirma que la CI remota del futuro commit esté aprobada. El escaneo previo al commit debe cubrir los cambios nuevos; el gate histórico por sí solo no demuestra eso.

## Hallazgos

- Blocker: ninguno.
- Major: ninguno.
- Minor M1, resuelto: README.md introducía `source?s`; el implementador corrigió a `source's` y el revisor confirmó el diff.
- Minor M2, resuelto: se declaraba cobertura de cita inválida sin una regresión persistente específica. El implementador agregó un fixture configurable y una prueba que elimina n, document, position, excerpt y lead individualmente; el revisor leyó el diff y ejecutó las 16 pruebas de tools con éxito. El probe independiente comprobó el rechazo tanto en src como en lib. No se exigió cambiar la normalización histórica de heading, fuera del alcance aprobado.

## Issues

- NOT DONE: archivo, commit y CI remota del nuevo SHA quedan para el cierre del implementador después de esta revisión; este PASS valida el cambio técnico revisado, no declara esos pasos ejecutados.
