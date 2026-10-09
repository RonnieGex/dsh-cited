import { lstat, realpath, symlink } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const target = await realpath(join(root, 'ai-specs/agents'))
for (const tool of ['.claude', '.codex', '.cursor']) {
  const link = join(root, tool, 'agents')
  try {
    await lstat(link)
    if (await realpath(link) !== target) throw new Error(`${tool}/agents already points elsewhere; left unchanged`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await symlink(process.platform === 'win32' ? target : '../ai-specs/agents', link, process.platform === 'win32' ? 'junction' : 'dir')
  }
  console.log(`LINK: ${tool}/agents -> ai-specs/agents`)
}
