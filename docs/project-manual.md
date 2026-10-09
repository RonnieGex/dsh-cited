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

The current runtime includes exact citation excerpts. Run the round-three capture wrapper documented in [readme-assets.md](readme-assets.md) only when a new model batch is authorized. Saved evidence is rendered offline into 18 localized graphics. `natural-summary.json` separates a supported price answer from a refusal that happens to contain citations. The current result is 2/3, with both Spanish questions supported and the English question refused. Canonical evidence has its own ask passage; downloads retain additional same-run search calls. The token section describes conversation persistence only with sessionId.

Harness uses deepseek-official/deepseek-v4-flash; the isolated Cited server uses deepseek/deepseek-v4-flash. The recorded plugin hash identifies the local built checkout. Fable merges plugin PR #1 before Cited PR #18 so concrete main-branch evidence links resolve. No production deployment belongs to these commands.
