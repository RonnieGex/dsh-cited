import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CitedError } from '../lib/cited.js'
import { citedAskTool, citedSearchTool } from '../lib/index.js'
import { ANSWERED, PASSAGES, REFUSED, startFakeCited } from './helpers/fake-mcp.mjs'

const exec = { signal: new AbortController().signal }

async function messageOf(action) {
  try {
    await action()
  } catch (error) {
    assert.ok(error instanceof CitedError, `expected a CitedError, got ${String(error)}`)
    return error.message
  }
  throw new Error('the call was expected to fail')
}

async function withCited(run) {
  const cited = await startFakeCited()
  try {
    return await run(cited)
  } finally {
    await cited.close()
  }
}

describe('cited_search', () => {
  it('declares the name, the query, the optional limit and the timeout of the configuration', () => {
    const tool = citedSearchTool({ url: 'https://cited.example.com', token: 't', timeoutMs: 1234 })
    assert.equal(tool.name, 'cited_search')
    assert.match(tool.description, /passages/)
    assert.deepEqual(Object.keys(tool.parameters.properties), ['query', 'limit'])
    assert.deepEqual(tool.parameters.required, ['query'])
    assert.equal(tool.timeoutMs, 1234)
    assert.equal(tool.output.schema.properties.passages.items.properties.document.type, 'string')
  })

  it('returns the passages of Cited as they arrive, with the numbered text for the model', async () => {
    await withCited(async (cited) => {
      const tool = citedSearchTool({ url: cited.url, token: cited.token })
      const value = await tool.execute({ query: 'afinación de bicicleta' }, exec)
      assert.deepEqual(value, { passages: PASSAGES })
      const content = tool.output.render({ query: 'afinación de bicicleta' }, value)
      assert.equal(content[0].type, 'text')
      assert.match(content[0].text, /1\. cafe-la-horquilla\.md · Precios/)
      assert.match(content[0].text, /\n2\. bike-workshop-policies\.md\n/)
      assert.match(content[0].text, /380 pesos/)
      assert.match(content[0].text, /like \[1\]/)
    })
  })

  it('asks for the default of five passages and for the limit it was given', async () => {
    await withCited(async (cited) => {
      const tool = citedSearchTool({ url: cited.url, token: cited.token })
      await tool.execute({ query: 'precios' }, exec)
      assert.equal(JSON.parse(cited.requests[0].body).params.arguments.limit, 5)
      const one = await tool.execute({ query: 'precios', limit: 1 }, exec)
      assert.equal(one.passages.length, 1)
      assert.equal(JSON.parse(cited.requests[1].body).params.arguments.limit, 1)
    })
  })

  it('says the documents hold no match instead of inventing one', async () => {
    const tool = citedSearchTool({ url: 'https://cited.example.com', token: 't' })
    const content = tool.output.render({ query: 'nada' }, { passages: [] })
    assert.equal(content[0].text, 'No passage of the documents of this installation matches "nada".')
  })

  it('refuses an empty query and a limit outside 1 to 8', async () => {
    const tool = citedSearchTool({ url: 'https://cited.example.com', token: 't' })
    assert.match(await messageOf(() => tool.execute({ query: '   ' }, exec)), /non-empty/)
    assert.match(await messageOf(() => tool.execute({ query: 'x', limit: 0 }, exec)), /between 1 and 8/)
    assert.match(await messageOf(() => tool.execute({ query: 'x', limit: 12 }, exec)), /between 1 and 8/)
  })

  it('refuses arguments the model cannot satisfy', async () => {
    const tool = citedSearchTool({ url: 'https://cited.example.com', token: 't' })
    await assert.rejects(() => tool.execute({}, exec))
    await assert.rejects(() => tool.execute({ query: 7 }, exec))
  })
})

describe('cited_ask', () => {
  it('declares the question, the optional session and the timeout of the configuration', () => {
    const tool = citedAskTool({ url: 'https://cited.example.com', token: 't', timeoutMs: 4321 })
    assert.equal(tool.name, 'cited_ask')
    assert.match(tool.description, /citations/)
    assert.deepEqual(Object.keys(tool.parameters.properties), ['question', 'sessionId'])
    assert.deepEqual(tool.parameters.required, ['question'])
    assert.equal(tool.timeoutMs, 4321)
    assert.deepEqual(tool.output.schema.properties.status.enum, ['answered', 'refused'])
  })

  it('returns the answer with its citations and renders them as sources', async () => {
    await withCited(async (cited) => {
      const tool = citedAskTool({ url: cited.url, token: cited.token })
      const value = await tool.execute({ question: '¿Cuánto cuesta una afinación?' }, exec)
      assert.equal(value.status, 'answered')
      assert.equal(value.answer, ANSWERED.answer)
      assert.deepEqual(value.citations, ANSWERED.citations)
      const content = tool.output.render({ question: '¿Cuánto cuesta una afinación?' }, value)
      assert.match(content[0].text, /380 pesos/)
      assert.match(content[0].text, /Sources:/)
      assert.match(content[0].text, /1\. cafe-la-horquilla\.md · Precios \(position 2\)/)
      assert.ok(content[0].text.endsWith(`1. cafe-la-horquilla.md · Precios (position 2)\n${ANSWERED.citations[0].excerpt}`))
    })
  })

  it('renders every exact excerpt in order, including missing headings and multiline text', () => {
    const tool = citedAskTool({ url: 'https://cited.example.com', token: 't' })
    const value = { ...ANSWERED, citations: PASSAGES.map((passage) => ({ ...passage, lead: 0 })) }
    value.citations[1].excerpt = '  Unchanged **text**.\nSecond line.  '
    const before = structuredClone(value)
    assert.equal(tool.output.render({}, value)[0].text, `${value.answer}\n\nSources:\n1. cafe-la-horquilla.md · Precios (position 2)\n${value.citations[0].excerpt}\n2. bike-workshop-policies.md (position 3)\n${value.citations[1].excerpt}`)
    assert.deepEqual(value, before)
    value.citations[1].heading = '   '
    assert.ok(tool.output.render({}, value)[0].text.includes('2. bike-workshop-policies.md (position 3)\n'))
  })

  it('carries the honest refusal, without citations', async () => {
    await withCited(async (cited) => {
      const tool = citedAskTool({ url: cited.url, token: cited.token })
      const value = await tool.execute({ question: 'refuse: ¿tienen clases de piano?' }, exec)
      assert.deepEqual(value, { status: 'refused', answer: REFUSED.answer, citations: [] })
      const content = tool.output.render({ question: 'refuse' }, value)
      assert.equal(content[0].text, REFUSED.answer)
    })
  })

  it('rejects missing required citation fields without fabricating an excerpt', async () => {
    for (const field of ['n', 'document', 'position', 'excerpt', 'lead']) {
      const answer = structuredClone(ANSWERED)
      delete answer.citations[0][field]
      const cited = await startFakeCited({ answer })
      try {
        const tool = citedAskTool({ url: cited.url, token: cited.token })
        assert.match(await messageOf(() => tool.execute({ question: 'price' }, exec)), /citation in an unexpected form/)
      } finally { await cited.close() }
    }
  })

  it('sends the sessionId only when the model gave one', async () => {
    await withCited(async (cited) => {
      const tool = citedAskTool({ url: cited.url, token: cited.token })
      await tool.execute({ question: 'una' }, exec)
      assert.deepEqual(JSON.parse(cited.requests[0].body).params.arguments, { question: 'una' })
      await tool.execute({ question: 'dos', sessionId: 's-1' }, exec)
      assert.deepEqual(JSON.parse(cited.requests[1].body).params.arguments, { question: 'dos', sessionId: 's-1' })
    })
  })

  it('refuses an empty question', async () => {
    const tool = citedAskTool({ url: 'https://cited.example.com', token: 't' })
    assert.match(await messageOf(() => tool.execute({ question: '  ' }, exec)), /non-empty/)
  })
})

describe('an installation that is not configured yet', () => {
  it('tells the user which field is missing, without breaking the call', async () => {
    const search = citedSearchTool({})
    const ask = citedAskTool({})
    assert.match(await messageOf(() => search.execute({ query: 'x' }, exec)), /`url`/)
    assert.match(await messageOf(() => ask.execute({ question: 'x' }, exec)), /`url`/)
  })

  it('names the token field when the address is set and the token is not', async () => {
    const tool = citedSearchTool({ url: 'https://cited.example.com', token: '' })
    assert.match(await messageOf(() => tool.execute({ query: 'x' }, exec)), /`token`/)
  })
})

describe('the token never reaches a result', () => {
  it('keeps the token out of cited_ask values and rendered answers, including refusal', async () => {
    const secret = ['cited', 'ask', 'fixture'].join('-')
    const cited = await startFakeCited({ token: secret })
    try {
      const tool = citedAskTool({ url: cited.url, token: secret })
      for (const question of ['precios', 'refuse: piano']) {
        const value = await tool.execute({ question }, exec)
        assert.equal(JSON.stringify(value).includes(secret), false)
        assert.equal(tool.output.render({ question }, value)[0].text.includes(secret), false)
      }
    } finally {
      await cited.close()
    }
  })

  it('keeps the token out of the passages and out of a failure', async () => {
    const secret = ['cited', 'fixture', 'value'].join('-')
    const cited = await startFakeCited({ token: secret })
    try {
      const tool = citedSearchTool({ url: cited.url, token: secret })
      const value = await tool.execute({ query: 'precios' }, exec)
      assert.equal(JSON.stringify(value).includes(secret), false)
      const content = tool.output.render({ query: 'precios' }, value)
      assert.equal(content[0].text.includes(secret), false)
    } finally {
      await cited.close()
    }

    const refused = citedSearchTool({ url: 'https://cited.example.com', token: secret })
    const message = await messageOf(() => refused.execute({ query: 'x' }, exec))
    assert.equal(message.includes(secret), false)
  })
})
