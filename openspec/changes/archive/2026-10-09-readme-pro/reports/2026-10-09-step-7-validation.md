# Implementation and validation

Date: 2026-10-09. Implementer: parent Codex agent.

## Changes

Complete English, Spanish and Chinese READMEs, six themed pictures, local Outfit/OFL and flame assets, minimal HTML renderer, real headless capture, reproducible curl checks, CI and project documentation. No runtime behavior or dependencies changed. Existing transport/module/package/tool/Loader tests were reviewed and retained. Three evidence/documentation tests were added.

## Executed commands

| Command | Result |
|---|---|
| `npx -y -p node@24 node scripts/capture-readme-evidence.mjs` | Exit 0; CAPTURE GREEN; source CLI 0.1.6-alpha.2, installed from GitHub, real deepseek-v4-flash called cited_search and answered with [1]. |
| `npx -y -p node@24 npm test` | Exit 0; 56 tests passed, zero failures, including real Loader composition. |
| `$env:CITED_REPO = (Resolve-Path '../community-cap').Path; npx -y -p node@24 npm run gate` | Exit 0; GATE GREEN 13/13; isolated local installation, 4 sample documents, registry calls, no token in evidence, Cited tracked status unchanged. |
| `npx -y -p node@24 node scripts/build.mjs --check` | Exit 0; BUILD GREEN, 2 files match src/. |
| `git diff --exit-code -- src lib package.json` | Exit 0; runtime and dependency manifest unchanged. |
| `npx -y -p node@24 npm install --ignore-scripts --package-lock=false` in a fresh `.tmp/portable-ci-*` copy without node_modules | Exit 0; 22 public packages installed, zero vulnerabilities; no lockfile generated. |
| `npx -y -p node@24 node --test tests/cited.test.mjs tests/module.test.mjs tests/package.test.mjs tests/tools.test.mjs tests/readme.test.mjs` in that copy | Exit 0; all 51 portable tests passed. |
| `npx -y -p node@24 node scripts/link-agent-contracts.mjs` | Exit 0; three correct existing canonical agent links preserved. |
| `git diff --check` | Exit 0; no whitespace errors. |

The first gate attempt selected community-main, which lacks scripts/mcp-seed.ts. It failed the seed prerequisite and was stopped along with its own port-3231 child. The corrected run selected the existing built community-cap checkout. Neither checkout was modified by this task. This is an environment selection correction, not a runtime fix.

## Database before and after

The plugin owns no database. The sample Cited store was opened read-only for before/after measurements around the actual model search. All 19 table row counts and content SHA-256 values match in `docs/evidence/headless-answer.json`.

| Table | Before | After |
|---|---:|---:|
| documents | 4 | 4 |
| passages | 11 | 11 |
| conversations | 0 | 0 |
| model_calls | 0 | 0 |
| provider_settings | 0 | 0 |

The model belongs to the harness; the Cited server used keyword retrieval with no embedding provider. The real answer is "A bicycle tune-up costs 380 pesos [1]." The source is cafe-la-horquilla.md, Precios. Only public samples were sent to the model. The record excludes credentials, local user paths and model reasoning.

## Boundaries

CI tests only portable contracts, build equivalence and secrets. The real Loader and gate need sibling checkouts. Prior rc.2, Claude Code and Codex observations are labeled prior verification with provenance, never claimed as new runs. Cursor remains documented-only. The live cited_ask error was exercised; a live model-backed cited_ask answer was not.
