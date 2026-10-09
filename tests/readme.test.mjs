import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { transcriptOf } from '../scripts/readme-graphics/evidence.mjs'

const root = new URL('../', import.meta.url)
const read = (name) => readFile(new URL(name, root), 'utf8')

test('evidence rejects invented, failed, unmatched and truncated tool results', () => {
  const events = [
    { type: 'tool_call', callId: '1', tool: 'cited_search', input: { query: 'price', limit: 1 } },
    { type: 'tool_result', callId: '1', status: 'completed', result: '1. sample.md · Prices\n380 pesos' },
    { type: 'final', text: '380 pesos [1].' },
  ]
  assert.match(transcriptOf(events, 'How much?'), /380 pesos \[1\]/)
  for (const invalid of [
    events.slice(1), events.slice(0, 2),
    events.map((e) => e.type === 'tool_result' ? { ...e, status: 'error' } : e),
    events.map((e) => e.type === 'tool_result' ? { ...e, callId: 'other' } : e),
    events.map((e) => e.type === 'tool_result' ? { ...e, truncated: true } : e),
    events.map((e) => e.type === 'final' ? { ...e, text: '380 pesos [2].' } : e),
  ]) assert.throws(() => transcriptOf(invalid, 'How much?'))
})

test('all translations resolve local assets and carry the complete contracts', async () => {
  const pkg = JSON.parse(await read('package.json'))
  for (const file of ['README.md', 'README.es.md', 'README.zh.md']) {
    const text = await read(file)
    assert.doesNotMatch(text, /\u2014/)
    assert.ok(text.includes(pkg.peerDependencies['@deepseek-ai/dsh-tools']))
    for (const word of ['cited_search', 'cited_ask', 'sessionId', 'timeoutMs', 'CITED_MCP_TOKEN', 'Cursor', '2026-10-09', 'npm run gate']) assert.ok(text.includes(word), `${file}: ${word}`)
    assert.ok((text.match(/^## /gm) ?? []).length >= 9, file)
    for (const asset of ['readme-banner', 'how-it-works', 'real-answer']) {
      for (const theme of ['light', 'dark']) assert.ok(text.includes(`docs/images/${asset}-${theme}.png`))
    }
    const paths = [...text.matchAll(/(?:src|srcset)="([^"#]+)"|\]\(([^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1] ?? m[2])
    for (const path of paths.filter((p) => !/^https?:/.test(p))) await readFile(new URL(path, root))
  }
})

test('published transcript is derived from successful saved model events', async () => {
  const record = JSON.parse(await read('docs/evidence/headless-answer.json'))
  assert.equal(record.exitCode, 0)
  assert.equal(record.profile, 'headless')
  const transcript = transcriptOf(record.events, record.prompt)
  assert.equal(await read('docs/evidence/headless-answer.txt'), `${transcript}\n`)
  assert.equal(record.transcript, transcript)
})
