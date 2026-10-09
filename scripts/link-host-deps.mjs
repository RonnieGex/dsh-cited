import { existsSync, lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const HOST_PACKAGES = {
  '@deepseek-ai/cordis': 'vendor/cordis',
  '@deepseek-ai/dsh-tools': 'packages/core/tools',
  '@deepseek-ai/schemastery': 'vendor/schemastery',
}

function installation() {
  const candidates = [
    process.env.DSH_INSTALL,
    resolve(root, '..', 'deepseek-harness'),
    resolve(root, '..', '..', 'deepseek-harness'),
  ].filter((candidate) => typeof candidate === 'string' && candidate.length > 0)
  for (const candidate of candidates) {
    const dir = resolve(candidate)
    if (existsSync(join(dir, 'apps', 'cli', 'lib', 'bin.js')) && existsSync(join(dir, 'packages', 'core', 'tools', 'package.json'))) {
      return dir
    }
  }
  throw new Error('link-host-deps: no DeepSeek Harness installation found; set DSH_INSTALL to its root')
}

function sameLink(path, target) {
  try {
    return lstatSync(path).isSymbolicLink() && resolve(readlinkSync(path)) === resolve(target)
  } catch {
    return false
  }
}

const install = installation()
const scope = join(root, 'node_modules', '@deepseek-ai')
mkdirSync(scope, { recursive: true })

for (const [packageName, relative] of Object.entries(HOST_PACKAGES)) {
  const target = join(install, relative)
  const link = join(scope, packageName.slice('@deepseek-ai/'.length))
  if (existsSync(target) === false) throw new Error(`link-host-deps: ${target} does not exist`)
  if (sameLink(link, target)) {
    console.log(`LINK: ${packageName} -> ${target}`)
    continue
  }
  if (existsSync(link)) {
    if (lstatSync(link).isSymbolicLink() === false) {
      console.log(`LINK: ${packageName} is already an installed directory, left alone`)
      continue
    }
    rmSync(link, { recursive: true, force: true })
  }
  symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir')
  console.log(`LINK: ${packageName} -> ${target}`)
}
