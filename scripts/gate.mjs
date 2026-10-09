import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { createConnection } from 'node:net'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hostBin, hostInstallation } from './host.mjs'
import { run, start } from './lib/process.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const temp = join(root, '.tmp', 'gate')
const logs = join(temp, 'logs')
const evidence = join(root, 'evidence')
const dshHome = join(temp, 'dsh-home')
const citedRepo = resolve(process.env.CITED_REPO ?? join(root, '..', 'community-mcp'))
const citedPort = Number(process.env.CITED_PORT ?? 3231)
const token = randomBytes(24).toString('base64url')
const query = 'afinación de bicicleta'

const lines = []
let failed = 0

function claim(text, ok, detail) {
  const line = `${ok ? 'PASS' : 'FAIL'} ${text}${detail === undefined || detail === '' ? '' : ` — ${detail}`}`
  lines.push(line)
  console.log(line)
  if (ok !== true) failed += 1
}

function note(text) {
  lines.push(`INFO ${text}`)
  console.log(lines.at(-1))
}

function outcome(result) {
  const stdout = (result.stdout ?? '').trim().split('\n').filter(Boolean)
  const stderr = (result.stderr ?? '').trim().split('\n').filter(Boolean)
  return {
    status: result.status,
    last: [...stderr, ...stdout].at(-1) ?? '',
    text: `${stdout.join('\n')}\n${stderr.join('\n')}`,
  }
}

function summaryOf(tests) {
  const pass = /ℹ pass (\d+)/.exec(tests.text)
  const fail = /ℹ fail (\d+)/.exec(tests.text)
  return `${pass === null ? '?' : pass[1]} passed, ${fail === null ? '?' : fail[1]} failed`
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function portIsFree(port) {
  return await new Promise((done) => {
    const socket = createConnection({ host: '127.0.0.1', port })
    socket.once('connect', () => { socket.destroy(); done(false) })
    socket.once('error', () => done(true))
    socket.setTimeout(1000, () => { socket.destroy(); done(true) })
  })
}

async function waitForCited(port, secrets) {
  let detail = 'no answer yet'
  const deadline = Date.now() + 90000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/mcp`, {
        method: 'POST',
        headers: { authorization: `Bearer ${secrets}`, 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
        signal: AbortSignal.timeout(3000),
      })
      await response.text()
      if (response.status === 200) return { ok: true, detail: 'tools/list answered 200' }
      detail = `status ${response.status}`
    } catch (error) {
      detail = error instanceof Error ? error.message : String(error)
    }
    await sleep(500)
  }
  return { ok: false, detail }
}

await rm(temp, { recursive: true, force: true })
await mkdir(logs, { recursive: true })
await mkdir(evidence, { recursive: true })

const environment = { ...process.env, DSH_HOME: dshHome, DSH_TELEMETRY_DISABLED: '1', NEXT_TELEMETRY_DISABLED: '1' }
const paths = {
  tests: join(logs, 'tests.txt'),
  testsErr: join(logs, 'tests.stderr.txt'),
  build: join(logs, 'build.txt'),
  buildErr: join(logs, 'build.stderr.txt'),
  seed: join(logs, 'seed.txt'),
  seedErr: join(logs, 'seed.stderr.txt'),
  cited: join(logs, 'cited.txt'),
  citedErr: join(logs, 'cited.stderr.txt'),
  smoke: join(logs, 'smoke.txt'),
  smokeErr: join(logs, 'smoke.stderr.txt'),
  dump: join(logs, 'dump.txt'),
  dumpErr: join(logs, 'dump.stderr.txt'),
  scan: join(logs, 'gitleaks.txt'),
  scanErr: join(logs, 'gitleaks.stderr.txt'),
}

claim('the DeepSeek Harness installation is present', existsSync(hostBin()), hostInstallation())
claim('the checkout of Cited is present', existsSync(join(citedRepo, 'package.json')) && existsSync(join(citedRepo, '.next')), citedRepo)

const statusBefore = run('git', ['-C', citedRepo, 'status', '--porcelain'], {
  stdoutPath: join(logs, 'cited-before.txt'),
  stderrPath: join(logs, 'cited-before.stderr.txt'),
})

const first = run(process.execPath, ['--test', 'tests/**/*.test.mjs'], {
  cwd: root,
  env: process.env,
  stdoutPath: paths.tests,
  stderrPath: paths.testsErr,
})
let tests = outcome(first)
if (tests.status !== 0 && /EPERM/.test(tests.text) && /spawn/.test(tests.text)) {
  note('this sandbox denies a child process with piped stdio; the suite runs in one process instead')
  tests = outcome(run(process.execPath, ['--test', '--experimental-test-isolation=none', 'tests/**/*.test.mjs'], {
    cwd: root,
    env: process.env,
    stdoutPath: paths.tests,
    stderrPath: paths.testsErr,
  }))
}
claim('the unit tests and the Loader composition pass', tests.status === 0, summaryOf(tests))

const build = outcome(run(process.execPath, ['scripts/build.mjs', '--check'], {
  cwd: root,
  env: process.env,
  stdoutPath: paths.build,
  stderrPath: paths.buildErr,
}))
claim('lib/ equals a fresh build of src/', build.status === 0 && /\n?BUILD: GREEN/.test(build.text), build.last)

let cited
try {
  let waited = 0
  while ((await portIsFree(citedPort)) === false && waited < 60000) {
    note(`port ${citedPort} is busy; waiting for it to be free`)
    await sleep(2000)
    waited += 2000
  }
  claim(`port ${citedPort} is free for the test installation`, await portIsFree(citedPort))

  const seed = outcome(run(process.execPath, [join(citedRepo, 'scripts', 'mcp-seed.ts'), join(temp, 'cited.sqlite'), 'samples/'], {
    cwd: citedRepo,
    env: process.env,
    stdoutPath: paths.seed,
    stderrPath: paths.seedErr,
  }))
  claim('the store of the test installation is seeded from samples/', seed.status === 0 && /documents \d+, store/.test(seed.text), seed.last)

  cited = start(process.execPath, [join(citedRepo, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '--port', String(citedPort)], {
    cwd: citedRepo,
    env: { ...process.env, DATABASE_URL: join(temp, 'cited.sqlite'), CITED_MCP_TOKEN: token, NEXT_TELEMETRY_DISABLED: '1' },
    stdoutPath: paths.cited,
    stderrPath: paths.citedErr,
  })
  const ready = await waitForCited(citedPort, token)
  claim('Cited answers POST /api/mcp on the test port', ready.ok, ready.detail)

  const smoke = outcome(run(process.execPath, [
    'scripts/smoke-install.mjs',
    '--home', dshHome,
    '--url', `http://127.0.0.1:${citedPort}`,
    '--token', token,
    '--samples', join(citedRepo, 'samples'),
    '--logs', join(logs, 'smoke'),
    '--evidence', join(evidence, 'installed-plugin.txt'),
  ], {
    cwd: root,
    env: environment,
    stdoutPath: paths.smoke,
    stderrPath: paths.smokeErr,
  }))
  for (const line of smoke.text.split('\n')) {
    if (/^(PASS|FAIL|INFO) /u.test(line)) note(`smoke: ${line}`)
  }
  claim('the isolated installation boots the headless profile and calls cited_search', smoke.status === 0 && smoke.text.includes('INSTALL: GREEN'), smoke.last)

  const dump = outcome(run(process.execPath, [hostBin(), '--profile', 'headless', '--dump-config'], {
    cwd: hostInstallation(),
    env: environment,
    stdoutPath: paths.dump,
    stderrPath: paths.dumpErr,
  }))
  claim('--dump-config prints the composed layer `# == dsh-cited`', dump.status === 0 && dump.text.includes('# == dsh-cited') && dump.text.includes('name: dsh-cited'), dump.last)
  const composed = dump.text.split('\n')
  const layerAt = composed.findIndex((line) => line.includes('# == dsh-cited'))
  await writeFile(join(evidence, 'composed-config.txt'), `${composed.slice(Math.max(0, layerAt - 2), layerAt + 4).join('\n')}\n`, 'utf8')

  claim('the test never put the token in an evidence line', lines.join('\n').includes(token) === false)
} finally {
  if (cited !== undefined) await cited.stop()
}

const statusAfter = run('git', ['-C', citedRepo, 'status', '--porcelain'], {
  stdoutPath: join(logs, 'cited-after.txt'),
  stderrPath: join(logs, 'cited-after.stderr.txt'),
})
claim('the checkout of Cited keeps the same tracked files', statusBefore.stdout === statusAfter.stdout, statusAfter.stdout.trim().split('\n')[0] ?? 'clean')

const head = run('git', ['rev-list', '--count', 'HEAD'], {
  cwd: root,
  stdoutPath: join(logs, 'commits.txt'),
  stderrPath: join(logs, 'commits.stderr.txt'),
})
const commits = Number(head.stdout.trim())
claim('the repository has a history to scan', head.status === 0 && Number.isInteger(commits) && commits > 0, `${head.stdout.trim()} commit(s)`)

const scan = outcome(run('gitleaks', ['git', '--redact', '--no-banner'], {
  cwd: root,
  env: process.env,
  stdoutPath: paths.scan,
  stderrPath: paths.scanErr,
}))
const scanned = /(\d+) commits scanned/.exec(scan.text)
claim(
  'gitleaks finds no secret in the history of this repository',
  scan.status === 0 && scanned !== null && Number(scanned[1]) > 0 && /not a git repository/.test(scan.text) === false,
  scanned === null ? scan.last : `${scanned[1]} commits scanned`,
)
await writeFile(join(evidence, 'gitleaks.txt'), `${scan.text.trim()}\n`, 'utf8')

const passed = lines.filter((line) => line.startsWith('PASS ')).length
const verdict = failed === 0 ? 'GREEN' : 'RED'
await writeFile(join(evidence, 'gate.txt'), `${lines.join('\n')}\nGATE: ${verdict} ${passed}/${lines.filter((line) => /^(PASS|FAIL) /u.test(line)).length} claims\n`, 'utf8')
await writeFile(join(evidence, 'tests.txt'), `${tests.text.trim()}\n`, 'utf8')
console.log(`GATE: ${verdict} ${passed}/${lines.filter((line) => /^(PASS|FAIL) /u.test(line)).length} claims passed`)
process.exitCode = failed === 0 ? 0 : 1
