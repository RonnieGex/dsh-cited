import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { hostBin, hostInstallation } from './host.mjs'
import { transcriptOf } from './readme-graphics/evidence.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const endpoint = process.env.CITED_CAPTURE_URL ?? 'http://127.0.0.1:3240'
const token = (await readFile(process.env.CITED_TOKEN_FILE ?? join(tmpdir(), 'cited-capture', 'token'), 'utf8')).trim()
const database = process.env.CITED_CAPTURE_DATABASE ?? join(tmpdir(), 'cited-capture', 'store.sqlite')
if (!token || !process.env.DEEPSEEK_API_KEY) throw new Error('A capture token file and DEEPSEEK_API_KEY are required')
const home = await mkdtemp(join(tmpdir(), 'dsh-cited-readme-'))
const prompts = ['How much does a bicycle tune-up cost at Café La Horquilla?', '¿Cuánto cuesta la afinación de bicicleta en Café La Horquilla?', '¿Qué precio tiene afinar una bicicleta en Café La Horquilla?']
const environment = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1', README_CITED_TOKEN: token, README_CITED_URL: endpoint }
const run = (args) => {
  const result = spawnSync(process.execPath, [hostBin(), ...args], { cwd: home, env: environment, encoding: 'utf8', timeout: 180000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 })
  return result
}
function snapshot() {
  const db = new DatabaseSync(database, { readOnly: true })
  try {
    return db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({ name }) => {
      const rows = db.prepare(`SELECT * FROM "${name.replaceAll('"', '""')}"`).all()
      const serialized = rows.map((row) => JSON.stringify(row)).sort().join('\n')
      return { table: name, rows: rows.length, sha256: createHash('sha256').update(serialized).digest('hex') }
    })
  } finally { db.close() }
}
const installed = run(['plugin', '--profile', 'headless', 'add', 'github:RonnieGex/dsh-cited'])
if (installed.status !== 0) throw new Error(`Headless install failed (exit ${installed.status})`)
await writeFile(join(home, 'capture.patch.yml'), `- id: cited\n  config:\n    url: !!js process.env.README_CITED_URL\n    token: !!js process.env.README_CITED_TOKEN\n- id: agent-default-model\n  config:\n    provider: deepseek-official\n    model: deepseek-v4-flash\n- id: llm-deepseek\n  config:\n    thinking: disabled\n    models:\n      - id: deepseek-v4-flash\n        contextWindow: 128000\n`)
const harness = JSON.parse(await readFile(join(hostInstallation(), 'apps', 'cli', 'package.json'), 'utf8'))
const manifest = JSON.parse(await readFile(join(home, 'profiles', 'headless', 'node_modules', 'dsh-cited', 'package.json'), 'utf8'))
const evidence = join(root, 'docs', 'evidence')
const attempts = join(evidence, `natural-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`)
await mkdir(attempts, { recursive: true })
for (const extension of ['json', 'txt']) await copyFile(join(evidence, `headless-answer.${extension}`), join(attempts, `previous-answer.${extension}`))
let supportingEvidence
for (const [index, prompt] of prompts.entries()) {
if (index < Number(process.env.CITED_CAPTURE_START ?? 0)) continue
const before = snapshot()
const output = run(['--profile', 'headless', '--patch', join(home, 'capture.patch.yml'), '--json', prompt])
const events = (output.stdout ?? '').split(/\r?\n/).filter((line) => line.startsWith('{')).map((line) => JSON.parse(line)).filter((event) => ['tool_call', 'tool_result', 'final'].includes(event.type))
let transcript = null
let validationError = null
try { transcript = transcriptOf(events, prompt) } catch (error) { validationError = error.message }
const after = snapshot()
const unchanged = JSON.stringify(before) === JSON.stringify(after)
const hasPassage = events.some((event) => event.type === 'tool_result' && event.status === 'completed' && !event.truncated && event.result?.includes('Afinación de bicicleta: 380 pesos.') && events.some((call) => call.type === 'tool_call' && call.tool === 'cited_search' && call.callId === event.callId))
if (output.status === 0 && hasPassage && transcript && unchanged) supportingEvidence = `${basename(attempts)}/attempt-${index + 1}.json`
const record = {
  capturedAt: new Date().toISOString(), platform: process.platform, node: process.version,
  harnessVersion: harness.version, pluginVersion: manifest.version, profile: 'headless',
  provider: 'deepseek-official', model: 'deepseek-v4-flash', exitCode: output.status, promptKind: 'natural', validationError,
  command: 'npx -y -p node@24 node scripts/capture-readme-evidence.mjs',
  installCommand: 'dsh plugin --profile headless add github:RonnieGex/dsh-cited',
  installOutput: installed.stdout.split(home).join('<temporary DSH_HOME>').split(home.replaceAll('\\', '/')).join('<temporary DSH_HOME>').split(process.env.USERPROFILE ?? '__unused__').join('<user>'),
  data: 'Public Cited samples, keyword search; no embedding provider', prompt, events, transcript,
  language: prompt.startsWith('¿') ? 'es' : 'en', supportingEvidence,
  database: { before, after, unchanged },
}
const serialized = JSON.stringify(record, null, 2)
for (const secret of [token, process.env.DEEPSEEK_API_KEY]) if (serialized.includes(secret)) throw new Error('Secret detected; no evidence published')
await writeFile(join(attempts, `attempt-${index + 1}.json`), `${serialized}\n`)
await writeFile(join(attempts, `attempt-${index + 1}.txt`), `${transcript ?? `Question\n${prompt}\n\n${JSON.stringify(events, null, 2)}`}\n`)
if (!unchanged && events.every((event) => event.tool !== 'cited_ask')) throw new Error('Search changed the sample database; attempt retained without replacing canonical evidence')
if (output.status !== 0 || transcript === null || !supportingEvidence) {
  console.log(`CAPTURE ${index + 1}: unsuccessful; sanitized attempt saved`)
  continue
}
await writeFile(join(evidence, 'headless-answer.json'), `${serialized}\n`)
await writeFile(join(evidence, 'headless-answer.txt'), `${transcript}\n`)
console.log(`CAPTURE: GREEN; headless ${harness.version}; ${events.filter((event) => event.type === 'tool_call').map((event) => event.tool).join(', ')}; database unchanged: ${unchanged}; no secret in evidence`)
break
}
