import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CitedError,
  callCitedTool,
  citedSettings,
  endpointOf,
  searchLimitOf,
  timeoutOf,
  tokenOf,
} from '../lib/cited.js'
import { PASSAGES, startFakeCited } from './helpers/fake-mcp.mjs'

async function withCited(mode, run) {
  const cited = await startFakeCited({ mode })
  try {
    return await run(cited)
  } finally {
    await cited.close()
  }
}

async function messageOf(action) {
  try {
    await action()
  } catch (error) {
    assert.ok(error instanceof CitedError, `expected a CitedError, got ${String(error)}`)
    return error.message
  }
  throw new Error('the call was expected to fail')
}

describe('the address of the installation', () => {
  it('appends /api/mcp to the base address, with or without a trailing slash', () => {
    assert.equal(endpointOf('https://cited.example.com').href, 'https://cited.example.com/api/mcp')
    assert.equal(endpointOf('https://cited.example.com/').href, 'https://cited.example.com/api/mcp')
    assert.equal(endpointOf('http://127.0.0.1:3231').href, 'http://127.0.0.1:3231/api/mcp')
  })

  it('keeps an address that already names the endpoint', () => {
    assert.equal(endpointOf('https://cited.example.com/api/mcp').href, 'https://cited.example.com/api/mcp')
    assert.equal(endpointOf('https://cited.example.com/api/mcp/').href, 'https://cited.example.com/api/mcp')
  })

  it('keeps the path prefix of a reverse proxy', () => {
    assert.equal(endpointOf('https://example.com/cited').href, 'https://example.com/cited/api/mcp')
    assert.equal(endpointOf('https://example.com/cited/').href, 'https://example.com/cited/api/mcp')
  })

  it('refuses an empty address, naming the field to set', () => {
    assert.throws(
      () => endpointOf('   '),
      (error) => error instanceof CitedError && error.message.includes('`url`'),
    )
  })

  it('refuses a relative address and a scheme that is not http', () => {
    assert.throws(() => endpointOf('cited.example.com'), CitedError)
    assert.throws(() => endpointOf('ftp://cited.example.com'), CitedError)
  })
})

describe('the token and the other settings', () => {
  it('refuses an empty token, naming the field to set', () => {
    assert.throws(
      () => tokenOf(''),
      (error) => error instanceof CitedError && error.message.includes('`token`'),
    )
  })

  it('fills the timeout with 30 seconds when the configuration has none', () => {
    assert.equal(timeoutOf(undefined), 30000)
    assert.equal(timeoutOf(0), 30000)
    assert.equal(timeoutOf(-5), 30000)
    assert.equal(timeoutOf(1500), 1500)
  })

  it('reads a whole configuration, keeping unknown and missing fields out', () => {
    assert.deepEqual(citedSettings({ url: ' http://a ', token: ' t ', timeoutMs: 10 }), {
      url: ' http://a ',
      token: ' t ',
      timeoutMs: 10,
    })
    assert.deepEqual(citedSettings(undefined), { url: '', token: '', timeoutMs: 30000 })
    assert.deepEqual(citedSettings({ url: 7, token: null }), { url: '', token: '', timeoutMs: 30000 })
  })

  it('accepts a limit between 1 and 8 and refuses everything else', () => {
    assert.equal(searchLimitOf(undefined), 5)
    assert.equal(searchLimitOf(1), 1)
    assert.equal(searchLimitOf(8), 8)
    assert.throws(() => searchLimitOf(0), CitedError)
    assert.throws(() => searchLimitOf(9), CitedError)
    assert.throws(() => searchLimitOf(1.5), CitedError)
    assert.throws(() => searchLimitOf('3'), CitedError)
  })
})

describe('one tools/call against a Cited installation', () => {
  it('sends the bearer, the JSON-RPC message and the protocol version of the transport', async () => {
    await withCited('ok', async (cited) => {
      const value = await callCitedTool({
        name: 'cited_search',
        arguments: { query: 'afinación de bicicleta', limit: 5 },
        settings: { url: cited.url, token: cited.token },
      })
      assert.deepEqual(value.passages, PASSAGES)
      const request = cited.requests[0]
      assert.equal(request.method, 'POST')
      assert.equal(request.url, '/api/mcp')
      assert.equal(request.headers.authorization, `Bearer ${cited.token}`)
      assert.equal(request.headers['mcp-protocol-version'], '2025-06-18')
      assert.match(request.headers.accept, /application\/json/)
      assert.deepEqual(JSON.parse(request.body), {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'cited_search', arguments: { query: 'afinación de bicicleta', limit: 5 } },
      })
    })
  })

  it('carries the answered question with its citations', async () => {
    await withCited('ok', async (cited) => {
      const value = await callCitedTool({
        name: 'cited_ask',
        arguments: { question: '¿Cuánto cuesta una afinación?' },
        settings: { url: `${cited.url}/`, token: cited.token },
      })
      assert.equal(value.status, 'answered')
      assert.equal(value.citations[0].document, 'cafe-la-horquilla.md')
      assert.equal(value.citations[0].lead, 0)
    })
  })

  it('turns a tool error of Cited into a clear message', async () => {
    await withCited('ok', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_unsupported',
        arguments: {},
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /Unknown tool: cited_unsupported/)
    })
  })

  it('turns a JSON-RPC error of Cited into a clear message', async () => {
    await withCited('ok', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'json-rpc-error' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /-32602: the query is not valid/)
    })
  })

  it('names a rejected bearer, a refused request and a missing endpoint', async () => {
    await withCited('unauthorized', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /401/)
      assert.match(message, /`token`/)
    })
    await withCited('forbidden', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /403/)
    })
    await withCited('off', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /404/)
      assert.match(message, /CITED_MCP_TOKEN/)
    })
  })

  it('names a body that is not JSON and a server failure', async () => {
    await withCited('malformed', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /not JSON/)
    })
    await withCited('server-error', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token },
      }))
      assert.match(message, /500/)
    })
  })

  it('gives up after the configured timeout', async () => {
    await withCited('hang', async (cited) => {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token, timeoutMs: 250 },
      }))
      assert.match(message, /within 250 ms/)
    })
  })

  it('names an installation it cannot reach', async () => {
    const closed = await startFakeCited()
    const url = closed.url
    await closed.close()
    const message = await messageOf(() => callCitedTool({
      name: 'cited_search',
      arguments: { query: 'x' },
      settings: { url, token: 'some-token' },
    }))
    assert.match(message, /could not be reached/)
  })

  it('stops when the caller cancels the call', async () => {
    await withCited('hang', async (cited) => {
      const controller = new AbortController()
      const captured = callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: cited.token, timeoutMs: 10000 },
        signal: controller.signal,
      }).then(() => null, (error) => error)
      controller.abort()
      const error = await captured
      assert.ok(error instanceof CitedError, `expected a CitedError, got ${String(error)}`)
      assert.match(error.message, /cancelled/)
    })
  })
})

describe('the token never leaves the plugin', () => {
  const secret = ['cited', 'fixture', 'value'].join('-')

  it('keeps the configured token out of every failure of the transport', async () => {
    const failures = []
    for (const mode of ['unauthorized', 'forbidden', 'off', 'malformed', 'server-error']) {
      const cited = await startFakeCited({ mode, token: secret })
      try {
        failures.push(await messageOf(() => callCitedTool({
          name: 'cited_search',
          arguments: { query: 'x' },
          settings: { url: cited.url, token: secret },
        })))
      } finally {
        await cited.close()
      }
    }
    const closed = await startFakeCited()
    const url = closed.url
    await closed.close()
    failures.push(await messageOf(() => callCitedTool({
      name: 'cited_search',
      arguments: { query: 'x' },
      settings: { url, token: secret },
    })))
    failures.push(await messageOf(() => callCitedTool({
      name: 'cited_search',
      arguments: { query: 'x' },
      settings: { url: 'not-an-address', token: secret },
    })))
    assert.equal(failures.length, 7)
    for (const message of failures) assert.equal(message.includes(secret), false, message)
  })

  it('keeps the token out of the message of a real endpoint that answers 401', async () => {
    const cited = await startFakeCited({ token: 'the-other-token' })
    try {
      const message = await messageOf(() => callCitedTool({
        name: 'cited_search',
        arguments: { query: 'x' },
        settings: { url: cited.url, token: secret },
      }))
      assert.equal(message.includes(secret), false)
      assert.match(message, /401/)
    } finally {
      await cited.close()
    }
  })
})
