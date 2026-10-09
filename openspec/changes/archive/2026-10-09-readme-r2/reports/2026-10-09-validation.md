# Round-two verification

Authority: Fable round-two assignment. Implementer: Codex.

- `npx -y -p node@24 node --test tests/readme.test.mjs` before implementation: 2 passed, 2 failed for localized assets and token-generation instructions. After implementation: 4 passed.
- `npx -y -p node@24 node scripts/capture-readme-evidence.mjs`: first natural question chose cited_ask but refused. Legacy validation then stopped on model-call state change. `CITED_CAPTURE_START=1` with the same command ran exactly the two remaining questions; both returned cited answers, initially rejected by the one-search-only validator. Revalidation from the saved events accepted both after broadening the validator. No fourth question was executed. All three attempts and earlier directed evidence are retained in docs/evidence/natural-*.
- Canonical third attempt is the complete natural Spanish cited_ask run. The second run provides the separately labelled price passage. Its database was unchanged across 19 tables. Canonical model_calls had one row before and after, with a changed hash; documentation correctly says updated state.
- `npx -y -p node@24 npm test`: 57 passed, 0 failed, including real Loader composition.
- `CITED_REPO=../community-main npx -y -p node@24 npm run gate`: failed seeding because this checkout lacks scripts/mcp-seed.ts; terminated owned process. No desktop state used.
- `CITED_REPO=../community-cap npx -y -p node@24 npm run gate`: GREEN, 13/13 claims; 57 tests; isolated sample installation, MCP search and ask error path; source checkout unchanged.
- `npx -y -p node@24 node scripts/check-readme-http.mjs`: GREEN, curl authenticated 200 with two tools, unauthenticated 401, no token output.
- `npx -y -p node@24 node scripts/build.mjs --check`: GREEN, two runtime files unchanged.
- `npx -y -p node@24 node scripts/render-readme-graphics.mjs`: fourteen PNGs, all banners 1280x340, font ready, zero overflow and zero external requests. Natural answer and supporting passage visually inspected.
- `openspec validate readme-r2 --strict --json`: 1 valid, 0 issues.

Independent adversarial review is recorded separately. No merge or production deployment is authorized.
