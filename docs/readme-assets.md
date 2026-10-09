# README graphics and evidence

## Render saved evidence

Use Node 24 and a Cited checkout with its existing `@playwright/test` dependency and Chromium installed. `CITED_REPO` selects the checkout; the renderer defaults to `../community-main`. No rendering dependency is added to this plugin and its lockfiles are untouched.

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

The renderer reads local templates in `scripts/readme-graphics/`, embeds font and flame bytes, validates the saved events against the transcript and writes fourteen PNGs plus `docs/images/render-report.json`. All requests are blocked and counted. A missing font/image, mismatched evidence, unresolved placeholder, overflowing element or total PNG size of 3 MB fails the run. A successful report lists dimensions, bytes, SHA-256, font readiness, overflow and request counts. Review both themes visually after changing templates. GitHub pictures select the dark variant and fall back to light. Banner and installation graphics are localized for English, Spanish and Chinese. Use `--lang=es` or `--lang=zh` for a targeted render. Chinese glyphs use an installed system CJK face. The answer graphic preserves Spanish model output; adjacent text explains it in each language.

## Capture a new real answer

The capture script uses the built source CLI identified by `DSH_INSTALL` (default host search: `../deepseek-harness`, then `../../deepseek-harness`), not the desktop application. Prerequisites:

- `DEEPSEEK_API_KEY` in the process environment, for a real `deepseek-v4-flash` call.
- A Cited sample-only server at `http://127.0.0.1:3240`, configurable with `CITED_CAPTURE_URL`.
- Its token file at the OS temporary directory's `cited-capture/token`, configurable with `CITED_TOKEN_FILE`.
- Its SQLite sample database at `cited-capture/store.sqlite`, configurable with `CITED_CAPTURE_DATABASE`.

Never point this command at customer data. Only the public sample question/passages may be sent to the model. If the capture server is unavailable, prepare an isolated sample server using `scripts/mcp-seed.ts` and `next start` as demonstrated in `scripts/gate.mjs`; select that server, token file and database through the variables above before rerunning. Capture fails closed until prerequisites are available.

```sh
npx -y -p node@24 node scripts/capture-readme-evidence.mjs
```

The script creates a fresh OS temporary `DSH_HOME`, installs `github:RonnieGex/dsh-cited` into `headless`, and tries at most three natural questions. The patch references environment variables instead of embedding the MCP token. It retains only the tool call/result and final answer events, never model reasoning or credentials. It requires a successful exit, successful complete Cited tool results and citations pointing to returned passages. It compares row counts and SHA-256 fingerprints of all sample tables before/after. Search must leave them unchanged; `cited_ask` can add model-call records. The round-two canonical run uses `cited_ask`; its `supportingEvidence` points to the complete separately recorded search that returned the highlighted passage. The renderer validates that source before rendering. Every attempted run is retained under a dated `natural-*` directory, including failed or refused answers and the previous canonical evidence. A failed capture does not replace the last successful public evidence. `CITED_CAPTURE_START=1` resumes at the second question after an interrupted invocation; do not exceed three total questions for a review round. Model wording can change: review all three README quotes/alt text before regenerating and publishing.

The temporary harness directory retains isolated session state, including the public sample question and passages. It never modifies the user's normal `DSH_HOME`, the desktop profile or global client configuration. The token and API key are checked against serialized evidence before publication.

Run `npx -y -p node@24 node scripts/check-readme-http.mjs` against that server to execute curl checks. Authorization is supplied to curl over stdin, never as a command-line token. It records authenticated HTTP 200 with both tools and unauthenticated HTTP 401 in `docs/evidence/mcp-http.json`.

## Asset provenance and licenses

- `docs/fonts/outfit/outfit-latin.woff2`, `outfit-latin-ext.woff2` and `OFL.txt` were copied byte-for-byte from Cited's `public/fonts/outfit/`. Outfit is licensed under the included SIL OFL; the renderer uses the Latin subset.
- `docs/brand/katalis-flame-192.png` and `katalis-flame-ink-192.png` were copied byte-for-byte from Cited's `public/brand/`, supplied by the project owner for this use. The light flame appears on ink, the ink flame on paper.
- Colors: ink `#171717`, paper `#FAFAF9`, citation lime `#DDF469`. Only terminal text uses a system monospace family. No commercial font is included.

The renderer reuses the reference pipeline's approach to local assets, HTML templates and browser measurements. It contains no Cited ingestion, roadmap or application capture code.

## Round-two evidence

Three natural questions were executed on 2026-10-09. The first chose `cited_ask` and refused. The second chose `cited_search` twice and answered with citations. The third chose `cited_ask` and answered with citations. The first validator only allowed one search; both successful runs were revalidated from their unchanged saved events after widening the validator. No extra model call was made. The concise third run is canonical, and the second supplies the highlighted passage. The canonical answer updated `model_calls` state; the search left all tables unchanged. Raw model text, including Markdown and punctuation, is retained unchanged in downloadable evidence.
