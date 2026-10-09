import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function appBootEntry(dir) {
  const candidates = [
    ['packages', 'boot', 'app-boot'],
    ['node_modules', '@deepseek-ai', 'dsh-app-boot'],
  ]
  for (const relative of candidates) {
    const entry = join(dir, ...relative, 'lib', 'index.js')
    if (existsSync(entry)) return entry
  }
  return undefined
}

export function hostInstallation() {
  const candidates = [
    process.env.DSH_INSTALL,
    resolve(root, '..', 'deepseek-harness'),
    resolve(root, '..', '..', 'deepseek-harness'),
  ].filter((candidate) => typeof candidate === 'string' && candidate.length > 0)
  for (const candidate of candidates) {
    const dir = resolve(candidate)
    if (existsSync(join(dir, 'apps', 'cli', 'lib', 'bin.js')) && appBootEntry(dir) !== undefined) return dir
  }
  throw new Error('no DeepSeek Harness installation found; set DSH_INSTALL to its root')
}

export function hostBin() {
  return join(hostInstallation(), 'apps', 'cli', 'lib', 'bin.js')
}

export async function hostRuntime() {
  const dir = hostInstallation()
  const boot = await import(pathToFileURL(join(dir, 'apps', 'cli', 'lib', 'profile-boot.js')).href)
  const appBoot = await import(pathToFileURL(appBootEntry(dir)).href)
  return { runProfile: boot.runProfile, loadLayeredEnv: appBoot.loadLayeredEnv }
}
