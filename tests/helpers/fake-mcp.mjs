import { createServer } from 'node:http'

export const PASSAGES = [
  {
    n: 1,
    document: 'cafe-la-horquilla.md',
    heading: 'Precios',
    position: 2,
    excerpt: 'Afinación de bicicleta: 380 pesos.',
  },
  {
    n: 2,
    document: 'bike-workshop-policies.md',
    heading: 'Garantía',
    position: 3,
    excerpt: 'Las reparaciones tienen 30 días de garantía.',
  },
]

export const ANSWERED = {
  status: 'answered',
  answer: 'La afinación de bicicleta cuesta 380 pesos [1].',
  citations: [
    {
      n: 1,
      document: 'cafe-la-horquilla.md',
      heading: 'Precios',
      position: 2,
      excerpt: 'Afinación de bicicleta: 380 pesos.',
      lead: 0,
    },
  ],
}

export const REFUSED = {
  status: 'refused',
  answer: 'Eso no está en los documentos de este negocio.',
  citations: [],
}

function passageText(passages, query) {
  const lines = passages.map((passage) => `${passage.n}. ${passage.document}\n${passage.excerpt}`)
  return [`Cited found ${passages.length} passage(s) for "${query}". Cite each one by its number, like [1].`, '', ...lines].join('\n')
}

export async function startFakeCited(options = {}) {
  const state = { mode: options.mode ?? 'ok', token: options.token ?? 'cited-test-token' }
  const requests = []

  const server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => {
      requests.push({ method: request.method, url: request.url, headers: request.headers, body })
      const send = (status, payload, headers = {}) => {
        const text = payload === undefined ? '' : typeof payload === 'string' ? payload : JSON.stringify(payload)
        const contentType = typeof payload === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8'
        response.writeHead(status, { 'content-type': contentType, ...headers })
        response.end(text)
      }
      if (state.mode === 'hang') return
      if (state.mode === 'unauthorized' || request.headers.authorization !== `Bearer ${state.token}`) {
        return send(401, 'unauthorized\n', { 'www-authenticate': 'Bearer' })
      }
      if (state.mode === 'forbidden') return send(403, 'forbidden\n')
      if (state.mode === 'off') return send(404)
      if (state.mode === 'malformed') return send(200, 'not json')
      if (state.mode === 'server-error') return send(500, 'boom\n')
      if (request.method !== 'POST') return send(405, 'method not allowed\n')
      let message
      try {
        message = JSON.parse(body)
      } catch {
        return send(400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'the body is not valid JSON' } })
      }
      const toolName = message?.params?.name
      const args = message?.params?.arguments ?? {}
      if (toolName === 'cited_search') {
        if (args.query === 'json-rpc-error') {
          return send(200, { jsonrpc: '2.0', id: message.id, error: { code: -32602, message: 'the query is not valid' } })
        }
        const passages = args.limit === 1 ? PASSAGES.slice(0, 1) : PASSAGES
        return send(200, {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [{ type: 'text', text: passageText(passages, args.query) }],
            structuredContent: { passages },
          },
        })
      }
      if (toolName === 'cited_ask') {
        const value = String(args.question).includes('refuse') ? REFUSED : ANSWERED
        return send(200, {
          jsonrpc: '2.0',
          id: message.id,
          result: { content: [{ type: 'text', text: value.answer }], structuredContent: value },
        })
      }
      return send(200, {
        jsonrpc: '2.0',
        id: message.id,
        result: { content: [{ type: 'text', text: `Unknown tool: ${String(toolName)}` }], isError: true },
      })
    })
  })

  await new Promise((resolve) => { server.listen(0, '127.0.0.1', resolve) })
  const { port } = server.address()

  return {
    url: `http://127.0.0.1:${port}`,
    token: state.token,
    requests,
    setMode: (mode) => { state.mode = mode },
    close: () => new Promise((resolve) => {
      server.closeAllConnections()
      server.close(resolve)
    }),
  }
}
