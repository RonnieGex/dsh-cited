# Project manual

## Runtime and data model

`src/index.js` registers `cited_search` and `cited_ask` with the host tool service. `src/cited.js` sends authenticated JSON-RPC requests to the configured Cited server. `lib/` contains the distributable build. The plugin owns no tables, migrations or persistent document store. Cited owns documents, passages and conversation state.

## API contract

The configuration has `url`, secret `token` and `timeoutMs` with a 30000 ms default. The client targets `POST /api/mcp` and sends the token in the Authorization bearer header. Search accepts a non-empty `query` and integer `limit` from 1 to 8, default 5. It returns numbered passages. Ask accepts `question` and an optional `sessionId`, returning `answered` or `refused`, answer text and citations. A session ID enables server-side conversation persistence. Host secret-field handling does not encrypt the plugin's local configuration file.

## Development

The text projection of `cited_ask` includes each numbered source's document, section, position and exact excerpt. Structured citations remain unchanged. Refusals without citations return the original refusal text without a source block.

Run `npm test`, `node scripts/build.mjs --check` and `npm run gate` under Node 24. `scripts/link-host-deps.mjs` links dependencies from `DSH_INSTALL`. The gate uses `CITED_REPO` for a built Cited checkout containing `scripts/mcp-seed.ts` and `.next/`, creates sample state under `.tmp/gate` and boots an isolated headless harness. Never direct it at desktop state. For this verification, `CITED_REPO=../community-cap` supplied that build. Regenerate `lib/` with `npm run build` only after a runtime source change.

README asset generation and evidence commands are in [readme-assets.md](readme-assets.md). The renderer uses `CITED_REPO` to locate existing Playwright, defaulting to `../community-main`. The gate's default remains `../cited`; set the variable explicitly when switching commands. `capture-readme-evidence.mjs` checks sample database fingerprints before and after the real search. See [the captured record](evidence/headless-answer.json).

The CI workflow tests portable contracts without a sibling harness checkout. Full local `npm test` also runs the actual Loader composition. The headless integration gate and graphics renderer require the external checkouts described above and are not represented as CI coverage.

## Maintenance

After cloning, run `npx -y -p node@24 node scripts/link-agent-contracts.mjs` to restore `.claude/agents`, `.codex/agents` and `.cursor/agents` from `ai-specs/agents`. These machine-local links are ignored by Git. The script uses junctions on Windows and relative directory symlinks on other platforms, preserves a correct existing link and refuses an unrelated path. OpenSpec-generated tool skills and commands are tracked normally.

Keep source and packaged `lib/` synchronized. Update all three READMEs whenever public behavior changes. Keep compatibility claims dated and linked to saved evidence, distinguish documented clients from exercised clients, and keep secrets out of graphics. Preserve the OFL license with Outfit assets and identify the original brand asset provenance.

## README evidence

The current runtime includes exact citation excerpts. Use `scripts/capture-english-evidence.mjs` only for an authorized new English batch; [readme-assets.md](readme-assets.md) documents its isolated port 3246, temporary headless home, GitHub main installation and three fixed natural questions. English evidence has the `-en` suffix and never replaces the Spanish evidence. English/Chinese graphics select English; Spanish graphics select Spanish. Rendering 18 images is offline.

`natural-summary-en.json` records 3/3 English guarantee answers. `natural-summary.json` preserves the historical Spanish-example batch's 2/3, including its English failure. The validator rejects unrelated citations, refusals and unrelated durations, and chooses a supported callId before displaying that exchange. Raw downloads preserve every event and original model punctuation. Keyword-only search can still miss a Spanish passage asked about in English.

Harness uses deepseek-official/deepseek-v4-flash; the isolated Cited server uses deepseek/deepseek-v4-flash. The English record identifies the GitHub main commit and matching installed runtime SHA-256. Merge the English-example plugin PR before its Cited consumer PR and landing publication. No production deployment belongs to these commands. API/data model and runtime source remain unchanged.

## Round-four maintenance

Keep source highlighting inside TOOL RESULT and preserve raw transcripts. Each README uses one answer line and one closing provenance paragraph. Keep the merged compatibility limits and distinguish unsupported agent marks [1] through [5] from the citations returned by Cited. `node --test tests/tools.test.mjs` checks that cited_ask values and rendered answers/refusals contain no configured secret. Runtime and shipped lib hashes remain unchanged.

Round-five source-chip presentation omits the raw list period after chip 1. Run `node scripts/render-readme-graphics.mjs` with `CITED_REPO=../community-readme` under Node 24.21.0; exact transcript comparison restores the chip punctuation only for validation. Do not edit the raw evidence to match the visual formatting.

## Official brand marks

Round seven uses vendored official marks beside authored product names and keeps compatibility status as separate text. See [brand sources and maintenance](brand-logos.md). The renderer preserves full SVG geometry and audits visible brand coverage. Runtime, API, data model and saved evidence contracts are unchanged.

```sh
CITED_REPO=../community-brand-logos node scripts/render-readme-graphics.mjs
```
