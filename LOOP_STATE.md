# dsh-cited — loop state

STATUS: RUNNING

- Phase: implementation finished; the gate has printed `GATE: GREEN 13/13 claims passed`.
- Gate: green, run over the working tree of the commits below.
- Red runs of the gate so far: 2 (a name collision inside `scripts/gate.mjs`, and a first run whose `gitleaks` claim passed
  without a repository to scan). Both were fixed before the green run.
- Next: the closing report in `katalis-dev/tasks/entrega-dsh-cited-plugin.md` and `STATUS: DONE`.

## Contract

`tasks/mision-dsh-cited-plugin.md` of `katalis-dev` is the contract: P1 install in one step, P2 configuration in the
card, P3 `cited_search` and `cited_ask` over `POST <url>/api/mcp`, P4 the token never leaves the plugin, P5 the unit
tests, the Loader composition and the isolated installation against a live Cited, P6 the README.

## How to run it

```bash
node scripts/link-host-deps.mjs   # once, links the host packages of the local DeepSeek Harness
npm run build
npm test
npm run gate
```

`DSH_INSTALL` points at the DeepSeek Harness root and `CITED_REPO` at the checkout of Cited that serves the live
installation on port 3231. The gate installs this repository into a temporary `DSH_HOME` under `.tmp/`, never into the
real one.
