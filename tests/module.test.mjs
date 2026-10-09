import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as plugin from '../lib/index.js'

describe('the module DeepSeek Harness loads', () => {
  it('exports the function-plugin form: name, inject, Config and apply', () => {
    assert.equal(plugin.name, 'dsh-cited')
    assert.deepEqual(plugin.inject, ['tools'])
    assert.equal(typeof plugin.apply, 'function')
    assert.equal(plugin.default, undefined)
    assert.equal(typeof plugin.Config, 'function')
    assert.deepEqual(Object.keys(plugin.Config.dict), ['url', 'token', 'timeoutMs'])
  })

  it('starts unconfigured instead of failing to load', () => {
    assert.deepEqual(plugin.Config({}), { url: '', token: '', timeoutMs: 30000 })
    assert.deepEqual(plugin.Config({ url: 'https://cited.example.com' }), {
      url: 'https://cited.example.com',
      token: '',
      timeoutMs: 30000,
    })
  })

  it('marks the token as a secret', () => {
    assert.equal(plugin.Config.dict.token.meta.role, 'secret')
    assert.equal(plugin.Config.dict.url.meta.role, undefined)
  })

  it('refuses a timeout that is not a positive number', () => {
    assert.throws(() => plugin.Config({ timeoutMs: 0 }))
    assert.throws(() => plugin.Config({ timeoutMs: -1 }))
    assert.throws(() => plugin.Config({ timeoutMs: 'soon' }))
  })

  it('registers exactly the two tools of Cited', () => {
    const registered = []
    plugin.apply({ tools: { register: (tool) => registered.push(tool.name) } }, plugin.Config({}))
    assert.deepEqual(registered, ['cited_search', 'cited_ask'])
  })
})
