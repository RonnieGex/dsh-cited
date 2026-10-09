import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import {
  CitedError,
  DEFAULT_SEARCH_LIMIT,
  DEFAULT_TIMEOUT_MS,
  MAX_SEARCH_LIMIT,
  callCitedTool,
  citedSettings,
  searchLimitOf,
} from './cited.js'

export const name = 'dsh-cited'
export const inject = ['tools']

export const Config = Schema.object({
  url: Schema.string()
    .default('')
    .description('The address of the Cited installation, like https://cited.example.com. The plugin calls <url>/api/mcp.'),
  token: Schema.string()
    .role('secret')
    .default('')
    .description('The CITED_MCP_TOKEN of that installation. Without it the two tools answer an error that names this field.'),
  timeoutMs: Schema.number()
    .min(1)
    .default(DEFAULT_TIMEOUT_MS)
    .description('How long one call to Cited may take, in milliseconds.'),
})

const nValue = { type: 'integer', description: 'The number the answer cites, like [1].' }
const documentValue = { type: 'string', description: 'The name of the document the passage came from.' }
const headingValue = {
  oneOf: [
    { type: 'string', description: 'The section of the document.' },
    { type: 'null', description: 'The document has no section here.' },
  ],
  description: 'The section of the document, when it has one.',
}
const positionValue = { type: 'integer', description: 'The position of the passage inside its document.' }
const excerptValue = { type: 'string', description: 'The text of the passage, so the answer can be checked.' }
const leadValue = { type: 'integer', description: 'How many characters of the excerpt repeat the passage before it.' }

function required(spec) {
  return { ...spec, required: true }
}

const passageValue = {
  type: 'object',
  additionalProperties: false,
  properties: {
    n: required(nValue),
    document: required(documentValue),
    heading: required(headingValue),
    position: required(positionValue),
    excerpt: required(excerptValue),
  },
}

const citationValue = {
  type: 'object',
  additionalProperties: false,
  properties: {
    n: required(nValue),
    document: required(documentValue),
    heading: required(headingValue),
    position: required(positionValue),
    excerpt: required(excerptValue),
    lead: required(leadValue),
  },
}

function recordOf(value, what) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new CitedError(`Cited answered with ${what} in an unexpected form.`)
  }
  return value
}

function placeOf(raw, what) {
  const record = recordOf(raw, what)
  const shaped =
    Number.isInteger(record.n) &&
    typeof record.document === 'string' &&
    Number.isInteger(record.position) &&
    typeof record.excerpt === 'string'
  if (shaped === false) throw new CitedError(`Cited answered with ${what} in an unexpected form.`)
  return {
    n: record.n,
    document: record.document,
    heading: typeof record.heading === 'string' ? record.heading : null,
    position: record.position,
    excerpt: record.excerpt,
  }
}

function passagesOf(structured) {
  if (Array.isArray(structured.passages) === false) throw new CitedError('Cited answered without a list of passages.')
  return structured.passages.map((passage) => placeOf(passage, 'a passage'))
}

function answersOf(structured) {
  if (structured.status !== 'answered' && structured.status !== 'refused') {
    throw new CitedError('Cited answered the question without a status of answered or refused.')
  }
  if (typeof structured.answer !== 'string') throw new CitedError('Cited answered the question without an answer.')
  if (Array.isArray(structured.citations) === false) throw new CitedError('Cited answered the question without its citations.')
  const citations = structured.citations.map((raw) => {
    const place = placeOf(raw, 'a citation')
    const lead = recordOf(raw, 'a citation').lead
    if (Number.isInteger(lead) === false) throw new CitedError('Cited answered with a citation in an unexpected form.')
    return { ...place, lead }
  })
  return { status: structured.status, answer: structured.answer, citations }
}

function whereOf(document, heading) {
  const section = typeof heading === 'string' ? heading.trim() : ''
  return section.length === 0 ? document : `${document} · ${section}`
}

function passagesText(passages, query) {
  if (passages.length === 0) return `No passage of the documents of this installation matches "${query}".`
  const lines = passages.map((passage) => `${passage.n}. ${whereOf(passage.document, passage.heading)}\n${passage.excerpt}`)
  return [
    `Cited found ${passages.length} passage(s) for "${query}". Cite each one by its number, like [1].`,
    '',
    ...lines,
  ].join('\n')
}

function answerText(value) {
  if (value.citations.length === 0) return value.answer
  const sources = value.citations
    .map((citation) => `${citation.n}. ${whereOf(citation.document, citation.heading)} (position ${citation.position})\n${citation.excerpt}`)
    .join('\n')
  return `${value.answer}\n\nSources:\n${sources}`
}

export function citedSearchTool(settings) {
  const resolved = citedSettings(settings)
  return defineTool({
    name: 'cited_search',
    description:
      'Read the passages of the Cited documents that match a query, with the document, the section, the position and the text of each one. Cite each passage by its number, like [1]. It never writes an answer and never calls a language model.',
    parameters: {
      query: { type: 'string', required: true, description: 'The words to look for in the documents of the business.' },
      limit: {
        type: 'integer',
        description: `How many passages to return, between 1 and ${MAX_SEARCH_LIMIT}. ${DEFAULT_SEARCH_LIMIT} by default.`,
      },
    },
    timeoutMs: resolved.timeoutMs,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          passages: required({
            type: 'array',
            description: 'The passages of the documents that match the query, best first.',
            items: passageValue,
          }),
        },
      },
      render: (args, value) => [{ type: 'text', text: passagesText(value.passages, args.query) }],
    },
    async execute(args, exec) {
      const query = args.query.trim()
      if (query.length === 0) throw new CitedError('the query must be a non-empty string')
      const limit = searchLimitOf(args.limit)
      const structured = await callCitedTool({
        name: 'cited_search',
        arguments: { query, limit },
        settings: resolved,
        signal: exec === undefined ? undefined : exec.signal,
      })
      return { passages: passagesOf(structured) }
    },
  })
}

export function citedAskTool(settings) {
  const resolved = citedSettings(settings)
  return defineTool({
    name: 'cited_ask',
    description:
      'Answer a question from the documents of Cited, with numbered citations and the passage each one came from. When the documents do not hold the answer it returns refused instead of inventing it; pass that refusal to the user.',
    parameters: {
      question: { type: 'string', required: true, description: 'The question to answer from the documents of the business.' },
      sessionId: {
        type: 'string',
        description: 'The same value across a conversation, so a follow-up keeps its thread.',
      },
    },
    timeoutMs: resolved.timeoutMs,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: required({ type: 'string', enum: ['answered', 'refused'] }),
          answer: required({ type: 'string', description: 'The answer, or the sentence of the refusal.' }),
          citations: required({ type: 'array', description: 'The passages the answer cites, numbered.', items: citationValue }),
        },
      },
      render: (_args, value) => [{ type: 'text', text: answerText(value) }],
    },
    async execute(args, exec) {
      const question = args.question.trim()
      if (question.length === 0) throw new CitedError('the question must be a non-empty string')
      const argumentsOfCall =
        args.sessionId === undefined ? { question } : { question, sessionId: args.sessionId }
      const structured = await callCitedTool({
        name: 'cited_ask',
        arguments: argumentsOfCall,
        settings: resolved,
        signal: exec === undefined ? undefined : exec.signal,
      })
      return answersOf(structured)
    },
  })
}

export function apply(ctx, config) {
  const settings = citedSettings(config)
  ctx.tools.register(citedSearchTool(settings))
  ctx.tools.register(citedAskTool(settings))
}
