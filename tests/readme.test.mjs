import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createHash } from 'node:crypto'
import { transcriptOf } from '../scripts/readme-graphics/evidence.mjs'

const root = new URL('../', import.meta.url)
const read = (name) => readFile(new URL(name, root), 'utf8')

test('English guarantee evidence requires a supported source in the selected exchange', async () => {
  const { canonicalOf, hasOwnPassage, displayTranscriptOf } = await import('../scripts/readme-graphics/evidence.mjs')
  const record = { exitCode: 0, language: 'en', prompt: 'Is there a guarantee on repairs at the bike workshop?', events: [
    { type: 'tool_call', callId: 'one', tool: 'cited_ask', input: { question: 'Is there a guarantee on repairs at the bike workshop?' } },
    { type: 'tool_result', callId: 'one', status: 'completed', result: 'Repairs have a 90 day guarantee on the work [1].\n\nSources:\n1. bike-workshop-policies.md · Guarantee (position 4)\nGuarantee\nEvery repair carries a 90 day guarantee on the work. Parts carry the guarantee of their maker.' },
    { type: 'final', text: 'Repairs carry a **90 day guarantee** on the work [1].' },
  ] }
  assert.equal(hasOwnPassage(record, 'cited_ask'), true)
  assert.equal(canonicalOf([record]), record)
  for (const [from, to] of [['bike-workshop-policies.md', 'other.md'], [' · Guarantee', ' · Storage'], ['Every repair carries a 90 day guarantee on the work.', 'No guarantee.']]) {
    const invalid = structuredClone(record)
    invalid.events[1].result = invalid.events[1].result.replace(from, to)
    assert.equal(hasOwnPassage(invalid), false)
  }
  const refused = structuredClone(record)
  refused.events[2].text = 'I cannot find a guarantee [1].'
  assert.equal(hasOwnPassage(refused), false)
  const earlier = [{ type: 'tool_call', callId: 'zero', tool: 'cited_ask', input: {} }, { type: 'tool_result', callId: 'zero', status: 'completed', result: 'No relevant passage.' }]
  const multiple = { ...record, events: [...earlier, ...record.events] }
  assert.equal(displayTranscriptOf(multiple), displayTranscriptOf(record))
})

test('English guarantee validation rejects refusals and unrelated durations in either answer', async () => {
  const { hasOwnPassage } = await import('../scripts/readme-graphics/evidence.mjs')
  const record = JSON.parse(await read('docs/evidence/headless-answer-en.json'))
  for (const text of ['I cannot confirm a 90-day guarantee on repair work [1].', 'Repairs do not have a 90-day guarantee [1].', 'The storage period is 90 days [1].', 'I cannot confirm the repair guarantee [1].\n\nSource: Every repair carries a 90 day guarantee on the work.', 'Does repair work have a 90-day guarantee [1]?', 'Repair work may have a 90-day guarantee [1].']) {
    for (const type of ['final', 'tool_result']) {
      const invalid = structuredClone(record)
      const event = invalid.events.find((entry) => entry.type === type)
      if (type === 'final') event.text = text
      else event.result = text + '\n\nSources:\n' + event.result.split('\n\nSources:\n')[1]
      invalid.transcript = transcriptOf(invalid.events, invalid.prompt)
      assert.equal(hasOwnPassage(invalid), false, `${type}: ${text}`)
    }
  }
})

test('English recorded outcomes remain reproducible beside unchanged Spanish evidence', async () => {
  const { hasOwnPassage, canonicalOf } = await import('../scripts/readme-graphics/evidence.mjs')
  const record = JSON.parse(await read('docs/evidence/headless-answer-en.json'))
  const summary = JSON.parse(await read('docs/evidence/natural-summary-en.json'))
  const attempts = await Promise.all(summary.attempts.map(({ artifact }) => read(`docs/evidence/${artifact}`).then(JSON.parse)))
  assert.equal(attempts.length, 3)
  assert.equal(summary.answeredWithCitation, attempts.filter((attempt) => hasOwnPassage(attempt)).length)
  assert.ok(summary.answeredWithCitation > 0)
  assert.deepEqual(record.events, canonicalOf(attempts).events)
  assert.equal(record.language, 'en')
  assert.equal(record.installationSource, 'github:RonnieGex/dsh-cited#main')
  assert.match(record.sourceCommit, /^[0-9a-f]{40}$/)
  assert.equal(record.pluginSha256, record.installedSha256)
  assert.equal(await read('docs/evidence/headless-answer-en.txt'), `${transcriptOf(record.events, record.prompt)}\n`)
  for (const file of ['README.md', 'README.zh.md']) assert.ok((await read(file)).includes('headless-answer-en.txt'))
  assert.ok((await read('README.es.md')).includes('headless-answer.txt'))
})

test('source chip presentation does not retain the raw list period', async () => {
  const renderer = await read('scripts/render-readme-graphics.mjs')
  assert.doesNotMatch(renderer, /source-chip">1<\/span>\./)
  assert.match(renderer, /source-chip">1<\/span>/)
})

test('round four presents one source in the tool result and one closing provenance paragraph', async () => {
  assert.doesNotMatch(await read('scripts/readme-graphics/real-answer.html'), /supporting|SUPPORTLABEL/)
  for (const file of ['README.md', 'README.es.md', 'README.zh.md']) {
    const text = await read(file)
    const section = text.split(/^## /m).find((part) => part.includes('docs/images/real-answer'))
    assert.equal(section.match(/^> /gm).length, 1, file)
    assert.doesNotMatch(section, /deepseek-v4-flash|model_calls/)
    assert.ok(section.includes('docs/evidence/compatibility.md'))
    assert.equal((text.match(/^(?:Not verified:|Sin verificar:|尚未验证：)/gm) ?? []).length, 1)
    assert.match(text, /\[1\].*\[5\]/)
  }
})

test('malformed capture events retain valid evidence and cannot become canonical', async () => {
  const { captureEvents, canonicalOf } = await import('../scripts/readme-graphics/evidence.mjs')
  const parsed = captureEvents('{"type":"final","text":"saved"}\n{"type":\n')
  assert.deepEqual(parsed.events, [{ type: 'final', text: 'saved' }])
  assert.equal(parsed.validationError, '1 malformed JSON event line(s)')
  const record = JSON.parse(await read('docs/evidence/headless-answer.json'))
  assert.equal(canonicalOf([{ ...record, validationError: parsed.validationError }]), undefined)
})

test('current evidence selects one own-source exchange while preserving all raw calls', async () => {
  const { displayTranscriptOf, hasOwnPassage } = await import('../scripts/readme-graphics/evidence.mjs')
  const record = JSON.parse(await read('docs/evidence/headless-answer.json'))
  const summary = JSON.parse(await read('docs/evidence/natural-summary.json'))
  const attempts = await Promise.all(summary.attempts.map((attempt) => read(`docs/evidence/${attempt.artifact}`).then(JSON.parse)))
  assert.equal(attempts.length, 3)
  assert.equal(summary.answeredWithCitation, attempts.filter((record) => hasOwnPassage(record)).length)
  assert.deepEqual(attempts.map((record) => hasOwnPassage(record)), [false, true, true])
  assert.ok(record.events.some((event) => event.tool === 'cited_search'))
  const display = displayTranscriptOf(record)
  assert.ok(display.endsWith(record.events.findLast((event) => event.type === 'final').text))
  assert.equal(display.includes('cited_search'), false)
  assert.ok(display.includes('cited_ask'))
  assert.equal(record.pluginSha256, createHash('sha256').update(await read('lib/index.js')).digest('hex'))
  assert.equal(record.installedSha256, record.pluginSha256)
  assert.deepEqual(record.citedAnswerModel, record.serverConfiguration.citedAnswerModel)
  assert.equal(record.citedAnswerModel.provider, 'deepseek')
  assert.equal(record.citedAnswerModel.model, 'deepseek-v4-flash')
})

test('canonical selection prefers an ask with its own numbered price passage', async () => {
  const { canonicalOf } = await import('../scripts/readme-graphics/evidence.mjs')
  const make = (tool) => ({ exitCode: 0, prompt: 'Price?', events: [
    { type: 'tool_call', callId: '1', tool, input: {} },
    { type: 'tool_result', callId: '1', status: 'completed', result: '1. cafe-la-horquilla.md · Precios (position 2)\nAfinación de bicicleta: 380 pesos.' },
    { type: 'final', text: '380 pesos [1].' },
  ] })
  const search = make('cited_search')
  const ask = make('cited_ask')
  assert.equal(canonicalOf([search, ask]), ask)
  const unsupported = structuredClone(ask)
  unsupported.events[1].result = '1. cafe-la-horquilla.md · Precios (position 2)'
  assert.equal(canonicalOf([unsupported, search]), search)
  assert.equal(canonicalOf([unsupported]), undefined)
  const wrongSource = structuredClone(ask)
  wrongSource.events[1].result = '1. other.md · Elsewhere (position 9)\nAfinación de bicicleta: 380 pesos.'
  assert.equal(canonicalOf([wrongSource]), undefined)
  const refusalWithCitations = structuredClone(ask)
  refusalWithCitations.events[2].text = "The price is not in these documents [1]."
  assert.equal(canonicalOf([refusalWithCitations]), undefined)
})

test('evidence rejects invented, failed, unmatched and truncated tool results', () => {
  const events = [
    { type: 'tool_call', callId: '1', tool: 'cited_search', input: { query: 'price', limit: 1 } },
    { type: 'tool_result', callId: '1', status: 'completed', result: '1. sample.md · Prices\n380 pesos' },
    { type: 'final', text: '380 pesos [1].' },
  ]
  assert.match(transcriptOf(events, 'How much?'), /380 pesos \[1\]/)
  assert.match(transcriptOf(events.map((e) => e.type === 'tool_call' ? { ...e, tool: 'cited_ask' } : e), 'How much?'), /Tool result/)
  for (const invalid of [
    events.slice(1), events.slice(0, 2),
    events.map((e) => e.type === 'tool_result' ? { ...e, status: 'error' } : e),
    events.map((e) => e.type === 'tool_result' ? { ...e, callId: 'other' } : e),
    events.map((e) => e.type === 'tool_result' ? { ...e, truncated: true } : e),
    events.map((e) => e.type === 'final' ? { ...e, text: '380 pesos [2].' } : e),
    [events[0], events[1], events[1], events[2]],
    [events[0], events[0], events[1], events[2]],
    [events[1], events[0], events[2]],
    [...events, { ...events[1], callId: 'orphan' }],
    [events[0], events[2], events[1]],
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
      const language = file === 'README.md' ? '' : file.includes('.es.') ? '-es' : '-zh'
      for (const theme of ['light', 'dark']) assert.ok(text.includes(`docs/images/${asset}${language}-${theme}.png`))
    }
    const paths = [...text.matchAll(/(?:src|srcset)="([^"#]+)"|\]\(([^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1] ?? m[2])
    for (const path of paths.filter((p) => !/^https?:/.test(p))) await readFile(new URL(path, root))
  }
})

test('round-two documentation leads with verified installation and actionable configuration', async () => {
  for (const file of ['README.md', 'README.es.md', 'README.zh.md']) {
    const text = await read(file)
    assert.ok(text.indexOf('dsh plugin add github:RonnieGex/dsh-cited') < text.indexOf('Plugins → Add plugin'))
    for (const value of ['openssl rand -base64 32', '401', '404']) assert.ok(text.includes(value), `${file}: ${value}`)
  }
  const base = await read('scripts/readme-graphics/base.html')
  assert.match(base, /font-weight:800/)
  assert.doesNotMatch(base, /\.terminal \.label\{color:#DDF469/)
  assert.doesNotMatch(await read('scripts/readme-graphics/banner.html'), /banner-footer/)
})

test('published transcript is derived from successful saved model events', async () => {
  const record = JSON.parse(await read('docs/evidence/headless-answer.json'))
  assert.equal(record.exitCode, 0)
  assert.equal(record.profile, 'headless')
  const transcript = transcriptOf(record.events, record.prompt)
  assert.equal(await read('docs/evidence/headless-answer.txt'), `${transcript}\n`)
  assert.equal(record.transcript, transcript)
})
