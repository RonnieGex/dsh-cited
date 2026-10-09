# Validation

`npm test` -> 64/64; `node scripts/build.mjs --check` -> GREEN, both lib files match src. `CITED_REPO=../community-cap npm run gate` -> GREEN 14/14; isolated headless installation, real search and unconfigured ask. The gate additionally preserves its own 19 sample table hashes in evidence/database-state.json.

From the parent workspace, `node tasks/snapshot-agents-r4.mjs before` and `node tasks/snapshot-agents-r4.mjs after` -> 19 identical table counts and SHA-256 hashes. The measured database is `community-readme/.data/katalis.sqlite`, the public sample store, not production. The helper is the versioned `dsh-cited/scripts/lib/database-snapshot.mjs`: DatabaseSync readOnly, SELECT name FROM sqlite_master for non-sqlite tables, SELECT * per table, sorted JSON rows and SHA-256. The before/after arrays are retained here. No client documents or credentials were used. The static landing and plugin own no database. No new real model batch was run.
