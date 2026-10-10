# Executed validation

Agent: Codex implementer. Node v24.21.0 was placed first on PATH for every authoritative command. npm scripts were invoked as `node <node-installation>/node_modules/npm/bin/npm-cli.js run <script>` to preserve the pinned runtime.

| Command | Observed result |
| --- | --- |
| `node --test tests/**/*.test.mjs` | Exit 0; 71 tests, 11 suites passed |
| `node scripts/build.mjs` | Exit 0; 2 files written |

## Database state

The before inventory was captured before the full unit/build/E2E run, without opening the application or initializing a store. The after inventory was captured after E2E completed. See the adjacent database-before.json and database-after.json files. Only .data and data local test files were opened, using SQLite mode=ro, with no row contents read. Landing and plugin have no database files.

Observed differences:

```json
[]
```

Cited E2E fixtures are public sample businesses from the repository. Its default katalis.sqlite business tables retained their counts; test fixture hashes may change as tests rebuild them. No client database was accessed.
