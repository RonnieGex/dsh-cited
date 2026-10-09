import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const token = (await readFile(process.env.CITED_TOKEN_FILE ?? join(tmpdir(), 'cited-capture/token'), 'utf8')).trim()
const endpoint = `${process.env.CITED_CAPTURE_URL ?? 'http://127.0.0.1:3240'}/api/mcp`
const results = []
for (const authorized of [true, false]) {
  const config = `url = ${JSON.stringify(endpoint)}\nheader = "Content-Type: application/json"\ndata = "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"tools/list\\"}"\n${authorized ? `header = ${JSON.stringify(`Authorization: Bearer ${token}`)}\n` : ''}`
  const result = spawnSync(process.platform === 'win32' ? 'curl.exe' : 'curl', ['--silent', '--show-error', '--max-time', '20', '--config', '-', '--write-out', '\n%{http_code}'], { input: config, encoding: 'utf8', windowsHide: true })
  assert.equal(result.status, 0, 'curl exit status')
  assert.equal(result.stdout.includes(token), false, 'no token in curl response')
  const lines = result.stdout.trim().split('\n')
  const status = Number(lines.pop())
  assert.equal(status, authorized ? 200 : 401)
  const tools = authorized ? JSON.parse(lines.join('\n')).result.tools.map(({ name }) => name).sort() : []
  if (authorized) assert.deepEqual(tools, ['cited_ask', 'cited_search'])
  results.push({ authorized, status, tools })
}
await writeFile(new URL('../docs/evidence/mcp-http.json', import.meta.url), `${JSON.stringify({ date: new Date().toISOString(), command: 'node scripts/check-readme-http.mjs', transport: 'curl --config - (authorization supplied over stdin)', results }, null, 2)}\n`)
console.log('CURL: GREEN; authenticated 200, two tools; unauthenticated 401; no token in output')
