import { spawn, spawnSync } from 'node:child_process'
import { closeSync, openSync, readFileSync } from 'node:fs'

function log(path) {
  return { path, fd: openSync(path, 'w') }
}

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

export function run(command, args, options = {}) {
  const out = log(options.stdoutPath)
  const err = log(options.stderrPath)
  try {
    const result = spawnSync(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', out.fd, err.fd],
      windowsHide: true,
    })
    return {
      status: result.status === null ? 1 : result.status,
      error: result.error,
      stdout: read(options.stdoutPath),
      stderr: read(options.stderrPath),
    }
  } finally {
    closeSync(out.fd)
    closeSync(err.fd)
  }
}

export function start(command, args, options = {}) {
  const out = log(options.stdoutPath)
  const err = log(options.stderrPath)
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ['ignore', out.fd, err.fd],
    windowsHide: true,
  })
  closeSync(out.fd)
  closeSync(err.fd)
  let exited = false
  child.once('exit', () => { exited = true })
  return {
    pid: child.pid,
    hasExited: () => exited,
    output: () => ({ stdout: read(options.stdoutPath), stderr: read(options.stderrPath) }),
    stop: () => new Promise((resolve) => {
      if (exited) {
        resolve()
        return
      }
      child.once('exit', resolve)
      child.kill()
      setTimeout(resolve, 5000).unref()
    }),
  }
}
