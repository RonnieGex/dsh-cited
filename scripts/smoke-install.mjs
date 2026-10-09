import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hostBin, hostInstallation, hostRuntime } from './host.mjs'
import { run } from './lib/process.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))

function parseArgs(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (key === '--no-install') {
      options.noInstall = true
      continue
    }
    if (key.startsWith('--')) {
      options[key.slice(2)] = argv[index + 1]
      index += 1
    }
  }
  return options
}

const options = parseArgs(process.argv.slice(2))
const home = resolve(options.home ?? join(root, '.tmp', 'smoke-home'))
const logs = resolve(options.logs ?? join(root, '.tmp', 'smoke-logs'))
const url = options.url
const token = options.token
const samples = resolve(options.samples ?? join(root, '..', 'community-mcp', 'samples'))
const query = options.query ?? 'afinación de bicicleta'

if (url === undefined || token === undefined) {
  console.error('usage: node scripts/smoke-install.mjs --home <dir> --url <cited-url> --token <token> [--samples <dir>] [--logs <dir>]')
  process.exit(2)
}

const lines = []
const failures = []

function check(claim, ok, detail) {
  lines.push(`${ok ? 'PASS' : 'FAIL'} ${claim}${detail === undefined ? '' : ` — ${detail}`}`)
  if (ok === false) failures.push(claim)
  console.log(lines.at(-1))
}

function note(text) {
  lines.push(`INFO ${text}`)
  console.log(lines.at(-1))
}

const environment = {
  ...process.env,
  DSH_HOME: home,
  DSH_TELEMETRY_DISABLED: '1',
  NEXT_TELEMETRY_DISABLED: '1',
  npm_config_store_dir: join(home, 'pnpm', 'store'),
  npm_config_cache: join(home, 'pnpm', 'cache'),
  npm_config_state_dir: join(home, 'pnpm', 'state'),
  PNPM_HOME: join(home, 'pnpm', 'home'),
}

await mkdir(logs, { recursive: true })

if (options.noInstall !== true) {
  const installed = run(process.execPath, [hostBin(), 'plugin', '--profile', 'headless', 'add', root], {
    cwd: hostInstallation(),
    env: environment,
    stdoutPath: join(logs, 'install.stdout.txt'),
    stderrPath: join(logs, 'install.stderr.txt'),
  })
  check('dsh plugin --profile headless add <this repository> exits 0', installed.status === 0, `status ${installed.status}`)
} else {
  note('the installation step was skipped by --no-install')
}

const profileManifestPath = join(home, 'profiles', 'headless', 'package.json')
const profileManifest = JSON.parse(await readFile(profileManifestPath, 'utf8'))
check(
  'the profile manifest lists dsh-cited among the installed dependencies and bundles',
  profileManifest.dependencies?.['dsh-cited'] !== undefined
    && profileManifest.dsh?.profile?.bundles?.includes('dsh-cited') === true,
  JSON.stringify(profileManifest.dependencies ?? {}),
)

const overlayPath = join(logs, 'gate-overlay.yml')
await writeFile(
  overlayPath,
  [
    '# Written by scripts/smoke-install.mjs for the isolated installation test.',
    '- id: cited',
    '  config:',
    `    url: '${url}'`,
    `    token: '${token}'`,
    '',
    '# The one-shot task runner stays off: this test calls the tool through the registry',
    '# itself, so it needs no model provider and no network.',
    '- id: headless-runner',
    '  disabled: true',
    '',
  ].join('\n'),
  'utf8',
)

process.env.DSH_HOME = home
const runtime = await hostRuntime()
note(`booting the headless profile of ${basename(hostInstallation())} with the isolated home ${home}`)
const booted = await runtime.runProfile({
  environment: runtime.loadLayeredEnv('dsh'),
  profile: 'headless',
  patchFiles: [overlayPath],
  args: [],
})
const ctx = booted.ctx

let detail = ''
try {
  const manager = ctx.get('pluginManager')
  check('the booted profile serves the plugin manager the card is read from', manager !== undefined)
  const bundles = manager === undefined ? [] : await manager.listBundles()
  const card = bundles.find((bundle) => bundle.name === 'dsh-cited')
  check('the plugin card of dsh-cited exists in the isolated profile', card !== undefined)
  if (card !== undefined) {
    const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
    check('the card is installed and enabled', card.installed === true && card.enabled === true, `version ${card.version}`)
    check('the card carries the description of the package', card.description === manifest.description, JSON.stringify(card.description))
    check(
      'the card carries the row of the bundle patch',
      Array.isArray(card.rows) && card.rows.some((row) => row.rowId === 'cited'),
      JSON.stringify((card.rows ?? []).map((row) => row.rowId)),
    )
    detail = JSON.stringify({ name: card.name, version: card.version, description: card.description, enabled: card.enabled, rows: (card.rows ?? []).map((row) => row.rowId) })
    note(`card ${detail}`)
  }

  const search = await ctx.tools.execute({
    signal: new AbortController().signal,
    callId: 'smoke-search',
    name: 'cited_search',
    arguments: { query },
  })
  check('cited_search through the registry is not a tool error', search.isError === false, firstText(search))
  const passages = search.value?.passages ?? []
  check('cited_search returns at least one passage of the live Cited', passages.length >= 1, `${passages.length} passage(s)`)
  const documents = readdirSync(samples)
  const fromSamples = passages.filter((passage) => documents.includes(passage.document))
  check('at least one passage comes from the samples of Cited', fromSamples.length >= 1, fromSamples.map((passage) => passage.document).join(', '))
  check('the token is not in the result of the tool', JSON.stringify(search).includes(token) === false)
  check('the numbered text reaches the model', /\[1\]/.test(firstText(search)), firstText(search).slice(0, 120).replace(/\n/g, ' | '))

  const ask = await ctx.tools.execute({
    signal: new AbortController().signal,
    callId: 'smoke-ask',
    name: 'cited_ask',
    arguments: { question: '¿Cuánto cuesta una afinación de bicicleta?' },
  })
  const askText = firstText(ask)
  note(`cited_ask answered isError=${ask.isError} status=${ask.value?.status ?? '-'} text ${JSON.stringify(askText.slice(0, 160))}`)
  check(
    'a failure of cited_ask names no environment variable and carries no token',
    /CITED_|MCP_RATE|DAILY_MODEL|MAX_QUESTION|process\.env/.test(askText) === false && askText.includes(token) === false,
  )
} finally {
  await ctx.fiber.dispose()
}

if (options.evidence !== undefined) {
  await mkdir(resolve(options.evidence, '..'), { recursive: true })
  await writeFile(resolve(options.evidence), `${lines.join('\n')}\n`, 'utf8')
}

if (failures.length > 0) {
  console.log(`INSTALL: RED ${failures.length} claim(s) failed${detail === '' ? '' : ` (${detail})`}`)
  process.exitCode = 1
} else {
  console.log('INSTALL: GREEN')
  process.exitCode = 0
}

function firstText(result) {
  const content = result?.content
  if (Array.isArray(content) === false) return ''
  return content.filter((block) => block?.type === 'text').map((block) => block.text).join('\n')
}
