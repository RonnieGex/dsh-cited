import assert from 'node:assert/strict'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { startFakeCited } from './helpers/fake-mcp.mjs'
import { hostRuntime } from '../scripts/host.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const home = join(root, '.tmp', 'loader-home')
const profileDir = join(home, 'profiles', 'cited-loader')
const pluginEntry = pathToFileURL(join(root, 'lib', 'index.js')).href

let cited
let ctx

function patchFile(citedUrl) {
  return [
    '- insert:',
    '    - id: system-prompt',
    "      name: '@deepseek-ai/dsh-system-prompt'",
    '',
    '    - id: tools',
    "      name: '@deepseek-ai/dsh-tools'",
    '',
    '    - id: cited',
    `      name: '${pluginEntry}'`,
    '      config:',
    `        url: '${citedUrl}'`,
    `        token: '${cited.token}'`,
    '        timeoutMs: 10000',
    '',
  ].join('\n')
}

describe('the plugin loaded by the real DeepSeek Harness composition', () => {
  before(async () => {
    cited = await startFakeCited()
    await rm(home, { recursive: true, force: true })
    await mkdir(profileDir, { recursive: true })
    await writeFile(
      join(profileDir, 'package.json'),
      `${JSON.stringify({ name: 'dsh-profile-cited-loader', private: true, dsh: { profile: { bundles: [] } } }, null, 2)}\n`,
      'utf8',
    )
    await writeFile(join(profileDir, 'cordis.patch.yml'), patchFile(cited.url), 'utf8')
    await writeFile(join(profileDir, 'cordis.yml'), '[]\n', 'utf8')

    const { runProfile, loadLayeredEnv } = await hostRuntime()
    const previous = process.env.DSH_HOME
    process.env.DSH_HOME = home
    try {
      const booted = await runProfile({
        environment: loadLayeredEnv('dsh'),
        profile: 'cited-loader',
        patchFiles: [],
        args: [],
      })
      ctx = booted.ctx
    } finally {
      if (previous === undefined) delete process.env.DSH_HOME
      else process.env.DSH_HOME = previous
    }
  })

  after(async () => {
    if (ctx !== undefined) await ctx.fiber.dispose()
    if (cited !== undefined) await cited.close()
    await rm(home, { recursive: true, force: true })
  })

  it('registers the two tools of Cited on the registry of the composition', () => {
    assert.notEqual(ctx, undefined)
    assert.deepEqual(
      ctx.tools.schemas().map((schema) => schema.name).sort(),
      ['cited_ask', 'cited_search'],
    )
  })

  it('runs cited_search through the registry and returns the passages of Cited', async () => {
    const result = await ctx.tools.execute({
      signal: new AbortController().signal,
      callId: 'loader-search',
      name: 'cited_search',
      arguments: { query: 'afinación de bicicleta' },
    })
    assert.equal(result.isError, false)
    assert.equal(result.value.passages[0].document, 'cafe-la-horquilla.md')
    assert.equal(result.value.passages[1].heading, null)
    assert.match(result.value.passages[1].excerpt, /garantía/)
    assert.match(result.content[0].text, /380 pesos/)
    const request = JSON.parse(cited.requests.at(-1).body)
    assert.equal(request.method, 'tools/call')
    assert.equal(request.params.name, 'cited_search')
    assert.equal(cited.requests.at(-1).headers.authorization, `Bearer ${cited.token}`)
  })

  it('runs cited_ask through the registry and returns the citations', async () => {
    const result = await ctx.tools.execute({
      signal: new AbortController().signal,
      callId: 'loader-ask',
      name: 'cited_ask',
      arguments: { question: '¿Cuánto cuesta una afinación?' },
    })
    assert.equal(result.isError, false)
    assert.equal(result.value.status, 'answered')
    assert.equal(result.value.citations.length, 1)
  })

  it('answers a failure of the transport as a tool error, not as a crash', async () => {
    cited.setMode('off')
    try {
      const result = await ctx.tools.execute({
        signal: new AbortController().signal,
        callId: 'loader-off',
        name: 'cited_search',
        arguments: { query: 'precios' },
      })
      assert.equal(result.isError, true)
      assert.match(result.content[0].text, /404/)
    } finally {
      cited.setMode('ok')
    }
  })

  it('turns an invalid call into a tool error of the registry', async () => {
    const result = await ctx.tools.execute({
      signal: new AbortController().signal,
      callId: 'loader-invalid',
      name: 'cited_search',
      arguments: {},
    })
    assert.equal(result.isError, true)
    assert.match(result.content[0].text, /query/)
  })
})
