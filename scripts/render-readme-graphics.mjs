import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transcriptOf } from './readme-graphics/evidence.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const cited = resolve(process.env.CITED_REPO ?? join(root, '..', 'community-main'))
const { chromium } = createRequire(join(cited, 'package.json'))('@playwright/test')
const read = (path) => readFile(join(root, path), 'utf8')
const base = await read('scripts/readme-graphics/base.html')
const font = (await readFile(join(root, 'docs/fonts/outfit/outfit-latin.woff2'))).toString('base64')
const record = JSON.parse(await read('docs/evidence/headless-answer.json'))
const transcript = transcriptOf(record.events, record.prompt)
if (record.exitCode !== 0 || record.transcript !== transcript || await read('docs/evidence/headless-answer.txt') !== `${transcript}\n`) throw new Error('Evidence does not match its events')
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const fill = (html, values) => html.replace(/\{\{([A-Z]+)\}\}/g, (_, name) => {
  if (!(name in values)) throw new Error(`Missing template field ${name}`)
  return values[name]
})
const browser = await chromium.launch()
const outputs = []
await mkdir(join(root, 'docs/images'), { recursive: true })
try {
  for (const [name, template] of [['readme-banner', 'banner'], ['how-it-works', 'how-it-works'], ['real-answer', 'real-answer']]) {
    for (const theme of ['light', 'dark']) {
      const dark = theme === 'dark'
      const flame = (await readFile(join(root, `docs/brand/katalis-flame${dark ? '' : '-ink'}-192.png`))).toString('base64')
      const values = { TITLE: name, FONT: font, PAPER: dark ? '#171717' : '#FAFAF9', INK: dark ? '#FAFAF9' : '#171717', MUTED: dark ? '#B8B8B4' : '#555551', LINE: dark ? '#50504C' : '#CDCDC7', FLAME: flame, VERSION: escape(record.harnessVersion), DATE: record.capturedAt.slice(0, 10), TRANSCRIPT: escape(transcript).replace(/^(Question|Tool call|Passages|Answer)$/gm, '<span class="label">$1</span>') }
      const content = fill(await read(`scripts/readme-graphics/${template}.html`), values)
      const page = await browser.newPage({ viewport: { width: 1280, height: 1 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' })
      const requests = []
      await page.route('**/*', (route) => { requests.push(route.request().url()); return route.abort() })
      await page.setContent(fill(base, { ...values, CONTENT: content }), { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      const audit = await page.evaluate(() => ({
        font: document.fonts.check('600 52px Outfit'), height: document.documentElement.scrollHeight,
        failedImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
        overflow: [...document.querySelectorAll('main *')].filter((element) => {
          const box = element.getBoundingClientRect()
          return box.left < 0 || box.right > 1280.5 || element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline'
        }).map((element) => element.className || element.tagName),
      }))
      if (!audit.font || audit.failedImages || audit.overflow.length || requests.length) throw new Error(`${name}/${theme}: ${JSON.stringify({ ...audit, requests })}`)
      const filename = `${name}-${theme}.png`
      const png = await page.screenshot({ path: join(root, 'docs/images', filename), fullPage: true, animations: 'disabled' })
      outputs.push({ file: filename, theme, width: 1280, height: audit.height, bytes: png.length, sha256: createHash('sha256').update(png).digest('hex'), ...audit, externalRequests: requests.length })
      await page.close()
      console.log(`RENDER: ${filename} 1280x${audit.height}; Outfit loaded; no overflow; no external requests`)
    }
  }
} finally { await browser.close() }
if (outputs.reduce((sum, output) => sum + output.bytes, 0) >= 3000000) throw new Error('PNG budget exceeded')
await writeFile(join(root, 'docs/images/render-report.json'), `${JSON.stringify({ evidenceSha256: createHash('sha256').update(transcript).digest('hex'), outputs }, null, 2)}\n`)
