<h1 align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/readme-banner-dark.png"><img src="docs/images/readme-banner-light.png" alt="Cited inside DeepSeek Harness: ask your documents and get an answer with its source" width="1280"></picture></h1>

<p align="center">Your documents. Your agent. An answer you can check.</p>

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-171717)](LICENSE)
[![dsh-tools peer range](https://img.shields.io/badge/dsh--tools-0.1%20%2F%200.2-171717)](#compatibility)
[![CI](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml/badge.svg)](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml)
![Status: early development](https://img.shields.io/badge/status-early%20development-DDF469?labelColor=171717)

[English](README.md) · [Español](README.es.md) · [中文](README.zh.md)

**Cited inside DeepSeek Harness.** Two native tools let your agent search a [Cited](https://github.com/RonnieGex/cited) installation and answer from its documents with numbered citations. The plugin connects to your configured installation over `POST /api/mcp`.

**Early development.** Installation and a real cited answer have been exercised headlessly. Desktop click-through and a live model answer through `cited_ask` remain unverified. See the dated [compatibility table](#compatibility).

[How it works](#how-it-works) · [Real answer](#a-real-answer) · [Install](#install) · [Configure](#configure) · [Tools](#the-two-tools) · [Token](#your-token) · [Compatibility](#compatibility) · [Development](#development) · [License](#license)

## How it works

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/how-it-works-dark.png"><img src="docs/images/how-it-works-light.png" alt="Paste the plugin link, configure url and token, ask your agent for a cited answer" width="1280"></picture>

1. Paste the repository link in **Plugins → Add plugin**.
2. Open the plugin configuration and set **url** and **token**.
3. Ask your agent. `cited_search` returns numbered passages; the agent uses them to answer with `[1]`.

Cited hosts documents and retrieval. DeepSeek Harness hosts the agent and this plugin. No MCP client row in `cordis.yml` is needed for these native tools.

## A real answer

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/real-answer-dark.png"><img src="docs/images/real-answer-light.png" alt="Real headless run: cited_search returns cafe-la-horquilla.md, Precios; DeepSeek answers A bicycle tune-up costs 380 pesos [1]" width="1280"></picture>

On **2026-10-09**, a new temporary `DSH_HOME` installed the plugin from GitHub. DeepSeek searched Cited's public sample documents and answered:

> A bicycle tune-up costs 380 pesos [1].

The image typesets the saved question, actual tool call, passage and answer. It is not a desktop screenshot. [Plain text](docs/evidence/headless-answer.txt) · [Run record](docs/evidence/headless-answer.json). Retrieval used keyword search without an embedding provider; the agent used a real DeepSeek model. All 19 sample database tables were unchanged after the search.

## Install

In DeepSeek Harness, open **Plugins → Add plugin** and paste:

```text
https://github.com/RonnieGex/dsh-cited
```

The shorthand also works:

```text
github:RonnieGex/dsh-cited
```

The repository ships `lib/`: installation needs no compilation or `allowBuilds` permission. The plugin manager lists `dsh-cited` and its description. The new headless GitHub install succeeded. Its package manager reported missing host peers; the running harness supplied them successfully. The desktop UI path is documented but was not click-tested.

You need DeepSeek Harness within the declared peer range, a running Cited server with MCP enabled, and its token. The plugin declares Node `>=22.19`; development and evidence here use Node 24.

## Configure

Open the plugin configuration:

| Field | Value |
|---|---|
| `url` | Your Cited address, such as `https://cited.example.com`. The plugin appends `/api/mcp`, or preserves it when already present. |
| `token` | The server's `CITED_MCP_TOKEN`. Marked as a secret field. |
| `timeoutMs` | Positive call timeout in milliseconds; **30000** by default. |

Without a server token, Cited's MCP endpoint is off. Generate a long random token locally, set `CITED_MCP_TOKEN` in the Cited server environment, and enter the same value in the plugin. Keep it out of prompts, screenshots and Git.

`url` and `token` start empty so you can install before configuring. A call reports the missing field as a tool error without breaking the harness. After filling both, ask your agent to search a phrase present in your documents.

## The two tools

| Tool | Input | Result |
|---|---|---|
| `cited_search` | `query: string`, `limit?: integer` from **1 to 8**, default **5** | `{ passages: [{ n, document, heading, position, excerpt }] }` |
| `cited_ask` | `question: string`, `sessionId?: string` | `{ status, answer, citations }`; status is `answered` or `refused` |

**Search, then let your agent answer.** `cited_search` retrieves passages without calling Cited's answer model. Each has its source and citation number. No matches means no passages, not an invented answer. The calling agent's model and any configured embedding provider can still incur charges.

**Let Cited write the answer.** `cited_ask` invokes Cited's answering pipeline and returns a cited answer or an explicit refusal. Citations have the passage fields above plus `lead`, the overlap length. Reuse `sessionId` to persist a conversation and its thread on Cited. This can consume that server's model budget. The live test server has no answer model connected, so only its error path was exercised. Answered/refused paths are covered by unit tests.

## Your token

- Sent as `Authorization: Bearer` to the configured endpoint; not added to tool arguments or normal output.
- Marked secret in the configuration schema for the harness's field handling. This does not establish encryption at rest. Protect the configuration; use HTTPS for remote servers.
- Redacted from transport failures, together with URL credentials. Rejected authorization, disabled endpoint, timeout and unreachable host become short tool errors.
- The plugin owns no document database. Cited stores documents and conversations created through `cited_ask`.

## Compatibility

Declared `@deepseek-ai/dsh-tools` peer range:

```text
>=0.1.6-alpha.2 <0.3.0-0 || >=0.2.0-rc.0 <0.3.0-0
```

A range is not proof of every version. MCP clients below connect directly to **Cited**, without this native plugin.

| Client | Date | Evidence and limit |
|---|---|---|
| DeepSeek Harness 0.1.6-alpha.2, source CLI | 2026-10-09 | New GitHub install and real DeepSeek `cited_search` answer in isolated headless state. [Record](docs/evidence/headless-answer.json); [gate](evidence/gate.txt). |
| DeepSeek Harness 0.2.0-rc.2, bundled CLI | 2026-10-09 | Prior verification: GitHub install without compilation and a real search answer. Not rerun here. [Provenance](docs/evidence/compatibility.md). |
| Claude Code → Cited MCP | 2026-10-09 | Prior verification: connected and listed both tools. No model tool call claimed. [Provenance](docs/evidence/compatibility.md). |
| Codex → Cited MCP | 2026-10-09 | Prior verification: connected and listed both tools. No model tool call claimed. [Provenance](docs/evidence/compatibility.md). |
| Cursor → Cited MCP | 2026-10-09 | Documented only; not tested. [Provenance](docs/evidence/compatibility.md). |

Not verified: desktop installation clicks, a live `cited_ask` answer through the plugin, other operating systems and remote HTTPS deployments. This evidence requires no desktop control.

## Development

Use **Node 24**. Keep a built DeepSeek Harness checkout at `../deepseek-harness`, or set `DSH_INSTALL` to its root:

```sh
npx -y -p node@24 node scripts/link-host-deps.mjs
npx -y -p node@24 npm test
npx -y -p node@24 node scripts/build.mjs --check
npx -y -p node@24 npm run gate
```

Before the gate, set `CITED_REPO` to a built Cited checkout containing `scripts/mcp-seed.ts` and `.next/` (gate default: `../cited`). It creates sample data and a temporary `DSH_HOME` under `.tmp/gate`, starts Cited on port **3231**, installs the local plugin, checks its card and tools, and scans Git history with **gitleaks**. Override `CITED_PORT` for another free test port. It never uses the desktop profile.

`src/` is source; `lib/` is the shipped artifact. `npm run build` refreshes `lib/` after runtime changes. This documentation change leaves both unchanged.

CI runs portable transport, module, package, tool and documentation tests, build equivalence and secret scanning. Real Loader composition and the integration gate run locally with external checkouts; CI does not claim those integrations.

Render using Cited's existing Playwright dependency and installed Chromium. Set `CITED_REPO` to that checkout (renderer default: `../community-main`):

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

Rendering uses saved evidence offline. A new capture uses a real model and API key. See the [asset/evidence guide](docs/readme-assets.md), [project manual](docs/project-manual.md) and [contribution rules](CONTRIBUTING.md).

## License

[Apache-2.0](LICENSE). Keep [NOTICE](NOTICE) in redistributions. Outfit uses the [SIL Open Font License](docs/fonts/outfit/OFL.txt). See [asset provenance](docs/readme-assets.md).

<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/brand/katalis-flame-192.png"><img src="docs/brand/katalis-flame-ink-192.png" alt="" height="48"></picture> <a href="https://katalis.dev">Built by Katalis</a></p>
