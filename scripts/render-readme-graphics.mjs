import { auditBrandLogos } from "./readme-graphics/audit-brand-logos.mjs"
import { logo, brandText } from "./readme-graphics/brand-logos.mjs"
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copy } from './readme-graphics/copy.mjs'
import { transcriptOf, hasOwnPassage, displayTranscriptOf, evidenceContractOf, supportedExchangeOf } from './readme-graphics/evidence.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const cited = resolve(process.env.CITED_REPO ?? join(root, '..', 'community-main'))
const { chromium } = createRequire(join(cited, 'package.json'))('@playwright/test')
const read = (path) => readFile(join(root, path), 'utf8')
const base = await read('scripts/readme-graphics/base.html')
const font = (await readFile(join(root, 'docs/fonts/outfit/outfit-latin.woff2'))).toString('base64')
const records = {}
for (const lang of ['en', 'es']) {
  const filename = `headless-answer${lang === 'en' ? '-en' : ''}`
  const record = JSON.parse(await read(`docs/evidence/${filename}.json`))
  const transcript = transcriptOf(record.events, record.prompt)
  if (record.language !== lang || record.exitCode !== 0 || record.transcript !== transcript || await read(`docs/evidence/${filename}.txt`) !== `${transcript}\n`) throw new Error('Evidence does not match its events or language')
  if (!hasOwnPassage(record)) throw new Error('Supporting own-source evidence is missing')
  records[lang] = record
}

const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const fill = (html, values) => html.replace(/\{\{([A-Z]+)\}\}/g, (_, name) => {
  if (!(name in values)) throw new Error(`Missing template field ${name}`)
  return values[name]
})
const selected = process.argv.find((arg) => arg.startsWith('--lang='))?.slice(7)
if (selected && !(selected in copy)) throw new Error('Unknown language')
const browser = await chromium.launch()
const outputs = []
await mkdir(join(root, 'docs/images'), { recursive: true })
try {
  for (const [name, template] of [['readme-banner', 'banner'], ['how-it-works', 'how-it-works'], ['real-answer', 'real-answer']]) {
    for (const lang of selected ? [selected] : Object.keys(copy)) {
    const record = records[lang === 'es' ? 'es' : 'en']
    const contract = evidenceContractOf(record)
    const exchange = supportedExchangeOf(record, 'cited_ask') ?? supportedExchangeOf(record, 'cited_search')
    for (const theme of ['light', 'dark']) {
      const dark = theme === 'dark'
      const flame = (await readFile(join(root, `docs/brand/katalis-flame${dark ? '' : '-ink'}-192.png`))).toString('base64')
      const brandedCopy = Object.fromEntries(Object.entries(copy[lang]).map(([key, value]) => [key, brandText(value)]))
      const values = { ...brandedCopy, DEEPSEEK: logo("deepseek"), EVIDENCEPATH: `docs/evidence/headless-answer${lang === 'es' ? '' : '-en'}.txt`, EXCHANGELABEL: copy[lang].EXCHANGELABEL.replace('cited_ask', exchange.call.tool), TOOLS: [...new Set(record.events.filter((e) => e.type === 'tool_call').map((e) => e.tool.toUpperCase()))].join(' + '), LANG: lang, KIND: name, TITLE: name, FONT: font, PAPER: dark ? '#171717' : '#FAFAF9', INK: dark ? '#FAFAF9' : '#171717', MUTED: dark ? '#B8B8B4' : '#555551', LINE: dark ? '#50504C' : '#CDCDC7', FLAME: flame, VERSION: escape(record.harnessVersion), DATE: record.capturedAt.slice(0, 10), TRANSCRIPT: escape(displayTranscriptOf(record)).replace(/((?:Tool result|Passages)\n)([\s\S]*?)(\n\nAnswer\n)/, (_, label, result, end) => label + result.replace(escape(exchange.sourceLine), escape(exchange.sourceLine).replace(/^1\./, '<span class="mark citation-chip source-chip">1</span>')).replace(escape(contract.highlight), `<span class="mark source-passage">${escape(contract.highlight)}</span>`) + end).replace(/^(Question|Tool call|Tool result|Passages|Answer)$/gm, '<span class="label">$1</span>').replace(/\[1\]/g, '<span class="mark citation-chip">1</span>') }
      const content = fill(await read(`scripts/readme-graphics/${template}.html`), values)
      const page = await browser.newPage({ viewport: { width: 1280, height: 1 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' })
      const requests = []
      await page.route('**/*', (route) => { requests.push(route.request().url()); return route.abort() })
      await page.setContent(fill(base, { ...values, CONTENT: content }), { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      if (name === 'real-answer') {
        if (await page.locator('.evidence-footer .muted').textContent() !== values.EVIDENCEPATH) throw new Error('Transcript reference differs from selected language')
        const source = await page.locator('.source-passage').textContent()
        if (source !== contract.highlight || await page.locator('.terminal .source-chip').count() !== 1 || await page.locator('.supporting').count() !== 0) throw new Error('Expected one in-tool source highlight')
        const displayed = await page.locator('.terminal pre').evaluate((node, documentName) => {
          const chip = node.querySelector('.source-chip')
          if (!chip.nextSibling.textContent.startsWith(` ${documentName}`)) throw new Error('Orphan source-chip punctuation')
          const raw = node.cloneNode(true)
          raw.querySelector('.source-chip').textContent = '1.'
          return raw.textContent
        }, contract.document)
        if (displayed !== displayTranscriptOf(record).replace(/\[1\]/g, '1')) throw new Error('Displayed evidence text changed')
      }
      const brands = await auditBrandLogos(page, ["deepseek"])
      if (name === 'readme-banner') {
        brands.opticalSpacing = await page.evaluate(() => {
          const flame = document.querySelector('.brand img')
          const canvas = document.createElement('canvas')
          canvas.width = flame.naturalWidth
          canvas.height = flame.naturalHeight
          const context = canvas.getContext('2d')
          context.drawImage(flame, 0, 0)
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
          let right = 0
          for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (pixels[(y * canvas.width + x) * 4 + 3]) right = Math.max(right, x + 1)
          const flameBox = flame.getBoundingClientRect()
          const signatureGap = document.querySelector('.brand span').getBoundingClientRect().left - (flameBox.left + right * flameBox.width / canvas.width)
          const mark = document.querySelector('.banner .brand-logo')
          const markBox = mark.getBoundingClientRect()
          const shape = mark.getBBox()
          const markRight = markBox.left + (shape.x + shape.width) * markBox.width / mark.viewBox.baseVal.width
          const harnessGap = document.querySelector('.banner .brand-name > span').getBoundingClientRect().left - markRight
          return { signatureGap, harnessGap, difference: Math.abs(signatureGap - harnessGap) }
        })
        if (brands.opticalSpacing.difference > 1) throw new Error(`Banner optical spacing differs: ${JSON.stringify(brands.opticalSpacing)}`)
      }
      const audit = await page.evaluate(() => ({
        font: document.fonts.check('600 52px Outfit'), height: document.documentElement.scrollHeight,
        failedImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
        overflow: [...document.querySelectorAll('main *')].filter((element) => {
          const box = element.getBoundingClientRect()
          return box.left < 0 || box.right > 1280.5 || element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline'
        }).map((element) => element.className || element.tagName),
      }))
      if (!audit.font || audit.failedImages || audit.overflow.length || requests.length) throw new Error(`${name}/${theme}: ${JSON.stringify({ ...audit, requests })}`)
      const filename = `${name}${lang === 'en' ? '' : `-${lang}`}-${theme}.png`
      const png = await page.screenshot({ path: join(root, 'docs/images', filename), fullPage: true, animations: 'disabled' })
      outputs.push({ brands, file: filename, theme, width: 1280, height: audit.height, bytes: png.length, sha256: createHash('sha256').update(png).digest('hex'), ...audit, externalRequests: requests.length })
      await page.close()
      console.log(`RENDER: ${filename} 1280x${audit.height}; Outfit loaded; no overflow; no external requests`)
    }
    }
  }
} finally { await browser.close() }
if (outputs.reduce((sum, output) => sum + output.bytes, 0) >= 3000000) throw new Error('PNG budget exceeded')
await writeFile(join(root, 'docs/images/render-report.json'), `${JSON.stringify({ evidenceSha256: Object.fromEntries(Object.entries(records).map(([lang, record]) => [lang, createHash('sha256').update(record.transcript).digest('hex')])), outputs }, null, 2)}\n`)
