import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseSnapshot } from './lib/database-snapshot.mjs'
import { hostBin, hostInstallation } from './host.mjs'
import { transcriptOf, canonicalOf, hasOwnPassage, captureEvents } from './readme-graphics/evidence.mjs'

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
const snapshot = () => databaseSnapshot(database)
const startup = JSON.parse(await readFile(process.env.CITED_CAPTURE_CONFIG, 'utf8'))
const records = []
const installed = run(['plugin', '--profile', 'headless', 'add', root])
if (installed.status !== 0) throw new Error(`Headless install failed (exit ${installed.status})`)
await writeFile(join(home, 'capture.patch.yml'), `- id: cited\n  config:\n    url: !!js process.env.README_CITED_URL\n    token: !!js process.env.README_CITED_TOKEN\n- id: agent-default-model\n  config:\n    provider: deepseek-official\n    model: deepseek-v4-flash\n- id: llm-deepseek\n  config:\n    thinking: disabled\n    models:\n      - id: deepseek-v4-flash\n        contextWindow: 128000\n`)
const harness = JSON.parse(await readFile(join(hostInstallation(), 'apps', 'cli', 'package.json'), 'utf8'))
const manifest = JSON.parse(await readFile(join(home, 'profiles', 'headless', 'node_modules', 'dsh-cited', 'package.json'), 'utf8'))
const pluginSha256 = createHash('sha256').update(await readFile(join(root, 'lib/index.js'))).digest('hex')
const installedSha256 = createHash('sha256').update(await readFile(join(home, 'profiles/headless/node_modules/dsh-cited/lib/index.js'))).digest('hex')
if (pluginSha256 !== installedSha256) throw new Error('Installed plugin differs from local build')
const evidence = join(root, 'docs', 'evidence')
const attempts = join(evidence, `natural-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`)
await mkdir(attempts, { recursive: true })
for (const extension of ['json', 'txt']) await copyFile(join(evidence, `headless-answer.${extension}`), join(attempts, `previous-answer.${extension}`))
for (const [index, prompt] of prompts.entries()) {
const before = snapshot()
const output = run(['--profile', 'headless', '--patch', join(home, 'capture.patch.yml'), '--json', prompt])
const parsed = captureEvents(output.stdout ?? '')
const events = parsed.events
let transcript = null
let validationError = parsed.validationError
try { if (!validationError) transcript = transcriptOf(events, prompt) } catch (error) { validationError = error.message }
const after = snapshot()
const unchanged = JSON.stringify(before) === JSON.stringify(after)
const record = {
  capturedAt: new Date().toISOString(), platform: process.platform, node: process.version,
  harnessVersion: harness.version, pluginVersion: manifest.version, profile: 'headless',
  provider: 'deepseek-official', model: 'deepseek-v4-flash', exitCode: output.status, promptKind: 'natural', validationError,
  command: 'npx -y -p node@24 node scripts/capture-round-three.mjs',
  citedAnswerModel: startup.citedAnswerModel, serverConfiguration: startup, pluginSha256, installedSha256,
  installationSource: 'local built checkout; not the unmerged GitHub main',
  installCommand: 'dsh plugin --profile headless add <local built checkout>',
  installOutput: installed.stdout.split(root).join('<local built checkout>').split(root.replaceAll('\\', '/')).join('<local built checkout>').split(home).join('<temporary DSH_HOME>').split(home.replaceAll('\\', '/')).join('<temporary DSH_HOME>').split(process.env.USERPROFILE ?? '__unused__').join('<user>'),
  data: 'Public Cited samples, keyword search; no embedding provider', prompt, events, transcript,
  language: prompt.startsWith('¿') ? 'es' : 'en',
  database: { before, after, unchanged },
}
const serialized = JSON.stringify(record, null, 2)
for (const secret of [token, process.env.DEEPSEEK_API_KEY]) if (serialized.includes(secret)) throw new Error('Secret detected; no evidence published')
await writeFile(join(attempts, `attempt-${index + 1}.json`), `${serialized}\n`)
await writeFile(join(attempts, `attempt-${index + 1}.txt`), `${transcript ?? `Question\n${prompt}\n\n${JSON.stringify(events, null, 2)}`}\n`)
if (!unchanged && events.every((event) => event.tool !== 'cited_ask')) throw new Error('Search changed the sample database; attempt retained without replacing canonical evidence')
records.push({ ...record, artifact: `${basename(attempts)}/attempt-${index + 1}.json` })
console.log(`CAPTURE ${index + 1}: ${hasOwnPassage(record) ? 'supported price answer' : 'no supported price answer'}; saved; database unchanged: ${unchanged}`)
}
const canonical = canonicalOf(records)
const summary = { capturedAt: new Date().toISOString(), total: records.length, answeredWithCitation: records.filter((record) => hasOwnPassage(record)).length, canonical: canonical?.artifact ?? null, attempts: records.map((record) => ({ artifact: record.artifact, language: record.language, prompt: record.prompt, tools: record.events.filter((event) => event.type === 'tool_call').map((event) => event.tool), answeredWithCitation: hasOwnPassage(record) })) }
await writeFile(join(attempts, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
await writeFile(join(evidence, 'natural-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
if (!canonical) throw new Error('No complete own-source run; previous evidence retained')
canonical.summary = 'natural-summary.json'
await writeFile(join(evidence, 'headless-answer.json'), `${JSON.stringify(canonical, null, 2)}\n`)
await writeFile(join(evidence, 'headless-answer.txt'), `${canonical.transcript}\n`)
console.log(`CAPTURE: GREEN; ${summary.answeredWithCitation}/${summary.total} cited answers; canonical ${canonical.artifact}`)
