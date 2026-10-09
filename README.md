# dsh-cited

**Cited inside DeepSeek Harness.** Search the documents of a [Cited](https://katalis.dev) installation and answer from
them, with numbered citations, from any agent of the harness.

Cited already speaks the Model Context Protocol over `POST <url>/api/mcp`. This plugin is the native alternative: one
step to install, one card to configure, and two tools (`cited_search` and `cited_ask`) that behave like any other DSH
tool — no MCP client row in `cordis.yml`.

## Install in one step

In DeepSeek Harness, open **Plugins → Add plugin** and paste either of these:

```
github:RonnieGex/dsh-cited
```

```
https://github.com/RonnieGex/dsh-cited
```

The bundle ships its compiled `lib/` in the repository, so the installation compiles nothing and asks for no
`allowBuilds` permission. The card **Cited** appears with the description of the package.

## Configure it

Open the card's configuration and fill in two fields:

| Field | What it is |
|---|---|
| `url` | The address of your Cited installation, like `https://cited.example.com`. The plugin calls `<url>/api/mcp`. |
| `token` | The `CITED_MCP_TOKEN` of that installation. The field is marked as a secret, so the harness never sends it back to the browser. |
| `timeoutMs` | How long one call may take. 30 seconds by default. |

An installation without a token has its MCP endpoint off. Start Cited with a long random value and give that same value
to this plugin:

```bash
openssl rand -base64 32
CITED_MCP_TOKEN=<that value> npm start
```

Both fields start empty on purpose: an invalid configuration would fail the load of the plugin, and you install before
you configure. Until you fill them in, the two tools answer an error that names the missing field and nothing else
breaks.

## The two tools

### `cited_search`

`{ query: string, limit?: 1..8 }` → the passages of the documents that match, best first, each with its document, its
section, its position and its text. It never writes an answer and never calls a language model, so a search spends none
of your balance. The model receives the passages numbered and cites them as `[1]`.

> Search the price list of the business.

### `cited_ask`

`{ question: string, sessionId?: string }` → `answered` with the answer and its numbered citations, or `refused` with
the honest sentence when the documents do not hold the answer. With a `sessionId` the turn is stored like any other
conversation of the installation.

> Ask Cited how much a bicycle tune-up costs and where you got that from.

## What the plugin does with your token

- The token is sent only in the `Authorization: Bearer` header of a request to the `url` you configured. The plugin
  opens no other connection.
- The token is never written to a log, to a tool result, or to the transcript.
- A `401`, a `403`, a `404`, a timeout and an unreachable host become short sentences the model can read. None of them
  contains the token.
- Failures of Cited arrive as a tool error, never as a crash of the harness.

## Development

The plugin is plain ESM JavaScript. `src/` is the source and `lib/` is the compiled artifact that ships in the
repository:

```bash
node scripts/link-host-deps.mjs   # links the host packages of your DSH installation
npm run build                     # src/ -> lib/
npm test                          # unit tests and a real Loader composition
npm run gate                      # every claim of the contract, ending in GATE: GREEN
```

`link-host-deps.mjs` uses the DeepSeek Harness installation at `$DSH_INSTALL`, at `../deepseek-harness`, or at
`../../deepseek-harness`. The tests import the host copy of `@deepseek-ai/dsh-tools` and `@deepseek-ai/schemastery`, so
they exercise the same revision your harness runs.

The gate also installs the plugin from its local path into a temporary `DSH_HOME` (never your own), boots the
`headless` profile there, reads the plugin card back from the plugin manager, and calls `cited_search` against a Cited
installation served from a sibling worktree on port 3231. Set `CITED_REPO` to that worktree and `DSH_INSTALL` to your
harness when the two do not sit where the defaults look for them.

## What was tested

Measured on Windows with Node v24.11.0, DeepSeek Harness built from the repository checkout
`deepseek-harness/apps/cli/lib/bin.js`, and `Cited` served by `next start` from the `community-mcp` worktree with a
store seeded from its own `samples/`:

- the unit tests and the Loader composition: green;
- `dsh plugin --profile headless add <this repository>`: exit 0, and `dsh --profile headless --dump-config` prints the
  `# == dsh-cited` layer;
- the booted profile lists the plugin card with the description of the package;
- `cited_search` through the registry returns the passages of `samples/`;
- `cited_ask` against that installation answers the honest refusal, because the installation has no chat provider.

Anything else — other harness revisions, `cited_ask` with a live chat provider, the Web card in a browser — is
**not** verified by this repository.

## License

Apache-2.0. See `LICENSE` and `NOTICE`. Built by Katalis.

Brief versions of this document: [Español](README.es.md) · [中文](README.zh.md).
