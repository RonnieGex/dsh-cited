import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { start } from './lib/process.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const cited = resolve(process.env.CITED_REPO ?? join(root, '../community-cap'))
const temp = await mkdtemp(join(tmpdir(), 'cited-r3-'))
const database = join(temp, 'store.sqlite')
const token = randomBytes(24).toString('base64url')
const endpoint = 'http://127.0.0.1:3243'
const startup = {
  endpoint, citedAnswerModel: { provider: 'deepseek', model: 'deepseek-v4-flash', source: 'capture server startup configuration' },
  embeddingsProvider: '', data: 'Public Cited samples only',
}
const seed = spawnSync(process.execPath, [join(cited, 'scripts/mcp-seed.ts'), database, 'samples/'], { cwd: cited, encoding: 'utf8', windowsHide: true })
if (seed.status !== 0) throw new Error('Sample seed failed')
await writeFile(join(temp, 'token'), token)
await writeFile(join(temp, 'configuration.json'), JSON.stringify(startup, null, 2))
const environment = { ...process.env, DATABASE_URL: database, CITED_MCP_TOKEN: token, CHAT_PROVIDER: startup.citedAnswerModel.provider, CHAT_MODEL: startup.citedAnswerModel.model, EMBEDDINGS_PROVIDER: '', NEXT_TELEMETRY_DISABLED: '1' }
const server = start(process.execPath, [join(cited, 'node_modules/next/dist/bin/next'), 'start', '--port', '3243'], { cwd: cited, env: environment, stdoutPath: join(temp, 'server.log'), stderrPath: join(temp, 'server.stderr.log') })
try {
  let ready = false
  for (let attempt = 0; attempt < 60 && !ready; attempt++) {
    if (server.hasExited()) throw new Error('Isolated capture server exited')
    try {
      const response = await fetch(`${endpoint}/api/mcp`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }), signal: AbortSignal.timeout(1000) })
      ready = response.status === 200
      await response.text()
    } catch {}
    if (!ready) await new Promise((done) => setTimeout(done, 500))
  }
  if (!ready) throw new Error('Isolated capture server did not become ready')
  const captureEnv = { ...process.env, CITED_CAPTURE_URL: endpoint, CITED_CAPTURE_DATABASE: database, CITED_TOKEN_FILE: join(temp, 'token'), CITED_CAPTURE_CONFIG: join(temp, 'configuration.json') }
  for (const script of ['capture-readme-evidence.mjs', 'check-readme-http.mjs']) {
    const result = spawnSync(process.execPath, [join(root, 'scripts', script)], { cwd: root, env: captureEnv, stdio: 'inherit', windowsHide: true, timeout: 900000 })
    if (result.status !== 0) throw new Error(`${script} failed; saved attempts remain available`)
  }
} finally { await server.stop() }
