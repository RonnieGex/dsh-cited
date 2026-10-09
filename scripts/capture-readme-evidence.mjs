import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
const prompt = 'How much does a bicycle tune-up cost?\nUse only cited_search with query "afinación de bicicleta" and limit 1. Answer in one short English sentence with the numbered citation. Do not use any other tool.'
const environment = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1', README_CITED_TOKEN: token, README_CITED_URL: endpoint }
const run = (args) => {
  const result = spawnSync(process.execPath, [hostBin(), ...args], { cwd: home, env: environment, encoding: 'utf8', timeout: 180000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`Headless command failed (exit ${result.status}); no evidence published`)
  return result.stdout
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
const before = snapshot()
const installed = run(['plugin', '--profile', 'headless', 'add', 'github:RonnieGex/dsh-cited'])
await writeFile(join(home, 'capture.patch.yml'), `- id: cited\n  config:\n    url: !!js process.env.README_CITED_URL\n    token: !!js process.env.README_CITED_TOKEN\n- id: agent-default-model\n  config:\n    provider: deepseek-official\n    model: deepseek-v4-flash\n- id: llm-deepseek\n  config:\n    thinking: disabled\n    models:\n      - id: deepseek-v4-flash\n        contextWindow: 128000\n`)
const output = run(['--profile', 'headless', '--patch', join(home, 'capture.patch.yml'), '--json', prompt])
const events = output.split(/\r?\n/).filter((line) => line.startsWith('{')).map((line) => JSON.parse(line)).filter((event) => ['tool_call', 'tool_result', 'final'].includes(event.type))
const transcript = transcriptOf(events, prompt)
const after = snapshot()
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Search changed the sample database; no evidence published')
const harness = JSON.parse(await readFile(join(hostInstallation(), 'apps', 'cli', 'package.json'), 'utf8'))
const manifest = JSON.parse(await readFile(join(home, 'profiles', 'headless', 'node_modules', 'dsh-cited', 'package.json'), 'utf8'))
const record = {
  capturedAt: new Date().toISOString(), platform: process.platform, node: process.version,
  harnessVersion: harness.version, pluginVersion: manifest.version, profile: 'headless',
  provider: 'deepseek-official', model: 'deepseek-v4-flash', exitCode: 0,
  command: 'npx -y -p node@24 node scripts/capture-readme-evidence.mjs',
  installCommand: 'dsh plugin --profile headless add github:RonnieGex/dsh-cited',
  installOutput: installed.split(home).join('<temporary DSH_HOME>').split(home.replaceAll('\\', '/')).join('<temporary DSH_HOME>').split(process.env.USERPROFILE ?? '__unused__').join('<user>'),
  data: 'Public Cited samples, keyword search; no embedding provider', prompt, events, transcript,
  database: { before, after, unchanged: true },
}
const serialized = JSON.stringify(record, null, 2)
for (const secret of [token, process.env.DEEPSEEK_API_KEY]) if (serialized.includes(secret)) throw new Error('Secret detected; no evidence published')
const evidence = join(root, 'docs', 'evidence')
await mkdir(evidence, { recursive: true })
await writeFile(join(evidence, 'headless-answer.json'), `${serialized}\n`)
await writeFile(join(evidence, 'headless-answer.txt'), `${transcript}\n`)
console.log(`CAPTURE: GREEN; headless ${harness.version}; one search, cited answer; ${before.length} database tables unchanged; no secret in evidence`)
