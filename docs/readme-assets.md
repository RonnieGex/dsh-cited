# README graphics and evidence

## Render saved evidence

Use Node 24 and a Cited checkout with its existing `@playwright/test` dependency and Chromium installed. `CITED_REPO` selects the checkout; the renderer defaults to `../community-main`. No rendering dependency is added to this plugin and its lockfiles are untouched.

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

The renderer reads local templates in `scripts/readme-graphics/`, embeds font and flame bytes, validates the saved events against the transcript and writes six PNGs plus `docs/images/render-report.json`. All requests are blocked and counted. A missing font/image, mismatched evidence, unresolved placeholder, overflowing element or total PNG size of 3 MB fails the run. A successful report lists dimensions, bytes, SHA-256, font readiness, overflow and request counts. Review both themes visually after changing templates. GitHub pictures select the dark variant and fall back to light. All languages use the same English graphics with translated descriptions and complete adjacent text.

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

The script creates a fresh OS temporary `DSH_HOME`, installs `github:RonnieGex/dsh-cited` into `headless`, and runs the real model once. The patch references environment variables instead of embedding the MCP token. It retains only the tool call/result and final answer events, never model reasoning or credentials. It requires a successful exit, one successful complete search result and citations pointing to returned passages. It compares row counts and SHA-256 fingerprints of all sample tables before/after. A failed capture does not replace the last successful public evidence. Model wording can change: review all three README quotes/alt text before regenerating and publishing.

The temporary harness directory retains isolated session state, including the public sample question and passages. It never modifies the user's normal `DSH_HOME`, the desktop profile or global client configuration. The token and API key are checked against serialized evidence before publication.

Run `npx -y -p node@24 node scripts/check-readme-http.mjs` against that server to execute curl checks. Authorization is supplied to curl over stdin, never as a command-line token. It records authenticated HTTP 200 with both tools and unauthenticated HTTP 401 in `docs/evidence/mcp-http.json`.

## Asset provenance and licenses

- `docs/fonts/outfit/outfit-latin.woff2`, `outfit-latin-ext.woff2` and `OFL.txt` were copied byte-for-byte from Cited's `public/fonts/outfit/`. Outfit is licensed under the included SIL OFL; the renderer uses the Latin subset.
- `docs/brand/katalis-flame-192.png` and `katalis-flame-ink-192.png` were copied byte-for-byte from Cited's `public/brand/`, supplied by the project owner for this use. The light flame appears on ink, the ink flame on paper.
- Colors: ink `#171717`, paper `#FAFAF9`, citation lime `#DDF469`. Only terminal text uses a system monospace family. No commercial font is included.

The renderer reuses the reference pipeline's approach to local assets, HTML templates and browser measurements. It contains no Cited ingestion, roadmap or application capture code.
