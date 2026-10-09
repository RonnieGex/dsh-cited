# Validation

`npx -y -p node@24 npm test`: 58 tests passed, 0 failed. `CITED_REPO=../community-cap npx -y -p node@24 npm run gate`: GREEN 14/14. Live isolated headless registry search returns sample passages; ask without configured model returns existing controlled error. Actual successful ask projection is covered by public MCP fixture tests, while presentation change will capture real model answers.

`evidence/database-state.json` records all 19 sample table row counts and SHA-256 hashes immediately before and after live integration calls: identical. model_calls=0 and conversations=0 before and after. Plugin owns no database. `node scripts/build.mjs --check` ran inside gate: GREEN, 2 files match source. No frontend changed.
