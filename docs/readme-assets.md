# README graphics and evidence

## Render saved evidence

Use Node 24 and a Cited checkout with its existing `@playwright/test` dependency and Chromium installed. `CITED_REPO` selects the checkout; the renderer defaults to `../community-main`. No rendering dependency is added to this plugin and its lockfiles are untouched.

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

The renderer reads local templates in `scripts/readme-graphics/`, embeds font and flame bytes, validates the saved events against the transcript and writes eighteen PNGs plus `docs/images/render-report.json`. All requests are blocked and counted. A missing font/image, mismatched evidence, unresolved placeholder, overflowing element or total PNG size of 3 MB fails the run. A successful report lists dimensions, bytes, SHA-256, font readiness, overflow and request counts. Review both themes visually after changing templates. GitHub pictures select the dark variant and fall back to light. Banner, installation and answer graphics are localized for English, Spanish and Chinese. Use `--lang=es` or `--lang=zh` for a targeted render. Chinese glyphs use an installed system CJK face. The answer graphic preserves Spanish model output; adjacent text explains it in each language.

## Capture a new real answer

Use Node 24, a built `../community-cap` checkout (override `CITED_REPO`), the built Harness source CLI (`DSH_INSTALL`) and `DEEPSEEK_API_KEY` in the environment. Run:

```sh
npx -y -p node@24 node scripts/capture-round-three.mjs
```

The wrapper seeds public samples in a new OS temporary SQLite database, starts its own Cited on port 3243 with `CHAT_PROVIDER=deepseek`, `CHAT_MODEL=deepseek-v4-flash` and no embeddings, and stops that server afterward. The existing server on 3240 is untouched. Startup provider/model values are recorded, never keys. Only the public sample corpus is sent to the model. The capture command is intentionally not part of ordinary tests or rendering.

The inner `capture-readme-evidence.mjs` uses a fresh temporary `DSH_HOME` and profile `headless`, installs the local built plugin and verifies its SHA-256 against the installed lib/index.js. This is not a GitHub-install claim. The separately recorded round-two installation verifies `dsh plugin add github:RonnieGex/dsh-cited`.

Exactly three original natural questions run in order, including English. No early success stops the batch. All tool call/result and final events are saved; raw output is never rewritten. Before and after each question, all sample table row counts and hashes are read without migration. Search-only runs must leave them unchanged. Ask can change model-call state; conversation persistence depends on sessionId and the server outcome.

The first complete ask with its own cited price excerpt is canonical. The selection requires the returned source identity and price passage, a final price of 380 and citations, not merely citation-shaped text. A cited refusal does not count as a price answer. `natural-summary.json` lists all three attempts and the canonical artifact. If no ask qualifies, a complete search qualifies; if neither does, the old evidence remains and capture fails.

Round three produced two supported price answers out of three questions. The English question received a Cited refusal; its agent response cited other search passages and falsely claimed the tune-up price was absent. The initial summary counted it because it had citations; that summary was corrected from the same saved events without another model call. The canonical attempt-2 includes both ask and search; visuals select the complete ask exchange and complete final answer and say so. Downloads retain every original call. Its price excerpt comes from its own ask, with document, section and position. The old paired record remains historical only.

The wrapper also executes `check-readme-http.mjs`: curl authenticated tools/list 200 and unauthenticated 401, with bearer supplied over stdin. Capture metadata contains only allowed startup values. Serialized evidence is checked for the bearer and API key before publication; run gitleaks before committing.

## Asset provenance and licenses

- `docs/fonts/outfit/outfit-latin.woff2`, `outfit-latin-ext.woff2` and `OFL.txt` were copied byte-for-byte from Cited's `public/fonts/outfit/`. Outfit is licensed under the included SIL OFL; the renderer uses the Latin subset.
- `docs/brand/katalis-flame-192.png` and `katalis-flame-ink-192.png` were copied byte-for-byte from Cited's `public/brand/`, supplied by the project owner for this use. The light flame appears on ink, the ink flame on paper.
- Colors: ink `#171717`, paper `#FAFAF9`, citation lime `#DDF469`. Only terminal text uses a system monospace family. No commercial font is included.

The renderer reuses the reference pipeline's approach to local assets, HTML templates and browser measurements. It contains no Cited ingestion, roadmap or application capture code.

## Historical round-two evidence

Three natural questions were executed on 2026-10-09. The first chose `cited_ask` and refused. The second chose `cited_search` twice and answered with citations. The third chose `cited_ask` and answered with citations. The first validator only allowed one search; both successful runs were revalidated from their unchanged saved events after widening the validator. No extra model call was made. The concise third run is canonical, and the second supplies the highlighted passage. The canonical answer updated `model_calls` state; the search left all tables unchanged. Raw model text, including Markdown and punctuation, is retained unchanged in downloadable evidence.
