import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseSnapshot } from './lib/database-snapshot.mjs'
import { start } from './lib/process.mjs'
import { hostBin, hostInstallation } from './host.mjs'
import { transcriptOf, captureEvents, hasOwnPassage, canonicalOf } from './readme-graphics/evidence.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const cited = resolve(process.env.CITED_REPO ?? join(root, '../community-cap'))
const endpoint = 'http://127.0.0.1:3246'
const evidence = join(root, 'docs/evidence')
const attempts = join(evidence, `natural-en-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`)
const home = await mkdtemp(join(tmpdir(), 'dsh-cited-english-'))
const database = join(home, 'store.sqlite')
const token = randomBytes(24).toString('base64url')
if (!process.env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is required')
const redact = (value) => String(value ?? '').split(token).join('<redacted>').split(process.env.DEEPSEEK_API_KEY).join('<redacted>').split(home).join('<temporary DSH_HOME>').split(home.replaceAll('\\', '/')).join('<temporary DSH_HOME>').split(process.env.USERPROFILE).join('<user>').split(process.env.USERPROFILE.replaceAll('\\', '/')).join('<user>')
const save = async (path, value) => {
  const text = typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`
  for (const secret of [token, process.env.DEEPSEEK_API_KEY]) assert.ok(!text.includes(secret), 'Secret in evidence')
  await writeFile(path, text)
}
const run = (command, args, options = {}) => spawnSync(command, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024, timeout: 180000, ...options })
const main = run('git', ['ls-remote', 'https://github.com/RonnieGex/dsh-cited.git', 'refs/heads/main'])
assert.equal(main.status, 0, 'Resolve GitHub main')
const sourceCommit = main.stdout.trim().split(/\s+/)[0]
assert.match(sourceCommit, /^[0-9a-f]{40}$/)
const mainLib = run('git', ['show', `${sourceCommit}:lib/index.js`], { cwd: root, encoding: 'buffer' })
assert.equal(mainLib.status, 0, 'Fetched main runtime')
const pluginSha256 = createHash('sha256').update(mainLib.stdout).digest('hex')
const startup = {
  endpoint, citedAnswerModel: { provider: 'deepseek', model: 'deepseek-v4-flash', source: 'capture server startup configuration' },
  embeddingsProvider: '', data: 'Public Cited samples only',
}
const seed = run(process.execPath, [join(cited, 'scripts/mcp-seed.ts'), database, 'samples/'], { cwd: cited })
assert.equal(seed.status, 0, 'Seed fresh public sample database')
const seeded = databaseSnapshot(database)
await mkdir(attempts, { recursive: true })
await save(join(attempts, 'seed.json'), { command: 'node <CITED_REPO>/scripts/mcp-seed.ts <temporary DSH_HOME>/store.sqlite samples/', output: redact(seed.stdout), database: seeded })
const environment = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1', README_CITED_TOKEN: token, README_CITED_URL: endpoint }
const host = (args) => run(process.execPath, [hostBin(), ...args], { cwd: home, env: environment })
const installed = host(['plugin', '--profile', 'headless', 'add', 'github:RonnieGex/dsh-cited'])
await save(join(attempts, 'installation.json'), { sourceCommit, command: 'dsh plugin --profile headless add github:RonnieGex/dsh-cited', exitCode: installed.status, stdout: redact(installed.stdout), stderr: redact(installed.stderr) })
assert.equal(installed.status, 0, 'Install GitHub main into temporary headless state')
const installedRoot = join(home, 'profiles/headless/node_modules/dsh-cited')
const manifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'))
const installedSha256 = createHash('sha256').update(await readFile(join(installedRoot, 'lib/index.js'))).digest('hex')
assert.equal(installedSha256, pluginSha256, 'Installed module matches main runtime')
const lock = await readFile(join(home, 'profiles/headless/pnpm-lock.yaml'), 'utf8')
assert.ok(lock.includes(sourceCommit), 'Installed lock resolves the recorded main commit')
const harness = JSON.parse(await readFile(join(hostInstallation(), 'apps/cli/package.json'), 'utf8'))
const patch = join(home, 'capture.patch.yml')
await writeFile(patch, '- id: cited\n  config:\n    url: !!js process.env.README_CITED_URL\n    token: !!js process.env.README_CITED_TOKEN\n- id: agent-default-model\n  config:\n    provider: deepseek-official\n    model: deepseek-v4-flash\n- id: llm-deepseek\n  config:\n    thinking: disabled\n    models:\n      - id: deepseek-v4-flash\n        contextWindow: 128000\n')
const server = start(process.execPath, [join(cited, 'node_modules/next/dist/bin/next'), 'start', '--port', '3246'], {
  cwd: cited, env: { ...environment, DATABASE_URL: database, CITED_MCP_TOKEN: token, CHAT_PROVIDER: 'deepseek', CHAT_MODEL: 'deepseek-v4-flash', EMBEDDINGS_PROVIDER: '' },
  stdoutPath: join(home, 'server.log'), stderrPath: join(home, 'server.stderr.log'),
})
try {
  let ready = false
  for (let i = 0; i < 60 && !ready; i++) {
    if (server.hasExited()) throw new Error('Isolated server exited')
    try {
      const response = await fetch(`${endpoint}/api/mcp`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }), signal: AbortSignal.timeout(1000) })
      ready = response.status === 200
      await response.text()
    } catch {}
    if (!ready) await new Promise((done) => setTimeout(done, 500))
  }
  assert.ok(ready, 'Isolated server ready')
  const http = []
  for (const authorized of [true, false]) {
    const config = `url = ${JSON.stringify(`${endpoint}/api/mcp`)}\nheader = "Content-Type: application/json"\ndata = "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"tools/list\\"}"\n${authorized ? `header = ${JSON.stringify(`Authorization: Bearer ${token}`)}\n` : ''}`
    const response = run(process.platform === 'win32' ? 'curl.exe' : 'curl', ['--silent', '--show-error', '--max-time', '20', '--config', '-', '--write-out', '\n%{http_code}'], { input: config })
    assert.equal(response.status, 0)
    const lines = response.stdout.trim().split('\n')
    const status = Number(lines.pop())
    assert.equal(status, authorized ? 200 : 401)
    const tools = authorized ? JSON.parse(lines.join('\n')).result.tools.map(({ name }) => name).sort() : []
    if (authorized) assert.deepEqual(tools, ['cited_ask', 'cited_search'])
    http.push({ authorized, status, tools })
  }
  await save(join(attempts, 'mcp-http.json'), { command: 'curl --config - (credentials over stdin)', results: http })
  console.log('CURL: authenticated 200, unauthenticated 401')
  const records = []
  const prompts = ['Is there a guarantee on repairs at the bike workshop?', 'How long is the guarantee on repair work at the bike workshop?', 'What does the bike workshop guarantee cover, and do I need my ticket?']
  for (const [index, prompt] of prompts.entries()) {
    const before = databaseSnapshot(database)
    const output = host(['--profile', 'headless', '--patch', patch, '--json', prompt])
    const parsed = captureEvents(output.stdout ?? '')
    let transcript = null
    let validationError = parsed.validationError
    try { if (!validationError) transcript = transcriptOf(parsed.events, prompt) } catch (error) { validationError = error.message }
    const after = databaseSnapshot(database)
    const record = {
      capturedAt: new Date().toISOString(), platform: process.platform, node: process.version,
      harnessVersion: harness.version, pluginVersion: manifest.version, profile: 'headless',
      provider: 'deepseek-official', model: 'deepseek-v4-flash', exitCode: output.status, promptKind: 'natural', validationError,
      command: 'node scripts/capture-english-evidence.mjs', citedAnswerModel: startup.citedAnswerModel, serverConfiguration: startup,
      pluginSha256, installedSha256, sourceCommit, installationSource: 'github:RonnieGex/dsh-cited#main',
      installCommand: 'dsh plugin --profile headless add github:RonnieGex/dsh-cited', installOutput: redact(installed.stdout),
      data: 'Public Cited samples, keyword search; no embedding provider', prompt, events: parsed.events, transcript, language: 'en',
      database: { before, after, unchanged: JSON.stringify(before) === JSON.stringify(after) },
    }
    await save(join(attempts, `attempt-${index + 1}.json`), record)
    await save(join(attempts, `attempt-${index + 1}.txt`), `${transcript ?? `Question\n${prompt}\n\n${JSON.stringify(parsed.events, null, 2)}`}\n`)
    await save(join(attempts, `attempt-${index + 1}-diagnostics.json`), { exitCode: output.status, signal: output.signal, error: output.error?.code ?? null, stderr: redact(output.stderr) })
    assert.deepEqual(after.filter(({ table }) => table !== 'model_calls'), before.filter(({ table }) => table !== 'model_calls'), 'Only model usage accounting changes')
    records.push({ ...record, artifact: `${basename(attempts)}/attempt-${index + 1}.json` })
    console.log(`CAPTURE ${index + 1}: ${hasOwnPassage(record) ? 'supported guarantee answer' : 'no supported guarantee answer'}; complete attempt saved`)
  }
  const canonical = canonicalOf(records)
  const summary = { capturedAt: new Date().toISOString(), total: records.length, answeredWithCitation: records.filter((record) => hasOwnPassage(record)).length, canonical: canonical?.artifact ?? null, attempts: records.map((record) => ({ artifact: record.artifact, language: record.language, prompt: record.prompt, tools: record.events.filter((event) => event.type === 'tool_call').map((event) => event.tool), answeredWithCitation: hasOwnPassage(record) })) }
  await save(join(attempts, 'summary.json'), summary)
  await save(join(evidence, 'natural-summary-en.json'), summary)
  assert.ok(canonical, 'No supported English capture; all attempts retained')
  canonical.summary = 'natural-summary-en.json'
  await save(join(evidence, 'headless-answer-en.json'), canonical)
  await save(join(evidence, 'headless-answer-en.txt'), `${canonical.transcript}\n`)
  console.log(`CAPTURE: ${summary.answeredWithCitation}/${summary.total} supported answers; canonical ${canonical.artifact}`)
} finally {
  await server.stop()
  console.log('Isolated capture server stopped')
}
