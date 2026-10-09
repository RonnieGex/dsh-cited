# Compatibility evidence provenance

Date: 2026-10-09. Separate fresh execution from inherited verification.

## Fresh English execution in round six

[The English canonical run](headless-answer-en.json) is the first of [three natural English questions](natural-summary-en.json) about the public English `bike-workshop-policies.md` sample. All three received a supported 90-day repair-work guarantee answer and the numbered Guarantee passage from their own `cited_ask` call. No prompt names a tool. The [raw transcript](headless-answer-en.txt) preserves the complete exchange and final answer, including original model punctuation.

`node scripts/capture-english-evidence.mjs` installed `github:RonnieGex/dsh-cited` from main in a temporary `DSH_HOME`, profile `headless`. The installed lock resolves main commit `802abfa509df343c970b96e2b7fbfb5aae00a7f3`; the installed runtime hash equals that commit's `lib/index.js`. The record identifies Harness 0.1.6-alpha.2, Node 24.21.0 and both effective models: Harness deepseek-official/deepseek-v4-flash and Cited deepseek/deepseek-v4-flash. The isolated sample server used port 3246 and was stopped after capture. No desktop profile or production server was used.

The new batch scored 3/3. The historical batch behind the Spanish example remains 2/3 and includes two Spanish successes plus one English failure over a Spanish price passage. Keyword search without embeddings can miss such cross-language passages; the new English success does not establish cross-language reliability. Each English attempt retains all events, validation results and all 19 database fingerprints before/after; only model_calls changed, and conversations remained empty. Installation, fresh-fixture seed and authenticated/unauthenticated curl results accompany the attempts.

English and Chinese graphics use the English record; Spanish graphics retain the historical Spanish record byte for byte. The validator selects a supported exchange by callId, rejects unsupported durations and refusals, and the renderer never stitches separate runs. The English-example plugin PR must merge before the corresponding Cited PR or landing publication, so the new main-branch evidence links resolve.

## Fresh execution in round three

[The canonical run](headless-answer.json) records a local built-plugin installation on source CLI 0.1.6-alpha.2, Windows, Node 24, in a temporary headless profile. The installed lib/index.js SHA-256 matches the checkout. It does not claim installation from an unmerged GitHub main branch. [The transcript](headless-answer.txt) preserves all original calls; the visual selects the ask exchange and the complete final answer, labeled explicitly.

[All three outcomes](natural-summary.json): two Spanish price questions answered with their own price citation; the English question was refused. Search used keywords without embeddings. Cited used deepseek/deepseek-v4-flash from the recorded startup configuration; Harness used deepseek-official/deepseek-v4-flash. The prior server’s model_calls has only day/count and no saved provider settings, so its historical answering model remains unknown.

The [English record](natural-2026-10-09T17-01-01-501Z/attempt-1.json) includes the refusal and false agent generalizations that the price was absent and a tune-up necessarily required inspection. The [historical English record](natural-2026-10-09T16-16-13-632Z/attempt-1.json) also contains the false assertion that the documents lacked bicycle services. The agent's citation marks [1] to [5] do not support its false claim, and it misspells a source filename. Those agent marks are not Cited's guarantee: only the tool result's citations carry its source support. Neither is hidden. A final response with citations to irrelevant passages is not counted as a supported price answer.

All three runs changed model_calls only. Conversations stayed empty, including the refused English ask that supplied sessionId. The gate separately checks an unconfigured ask and a live search, with all 19 table fingerprints unchanged in [database-state.json](../../evidence/database-state.json). The new ask text exposes its own citation excerpt; no separate-run passage is used in the current visuals.

## Earlier verification supplied with the approved assignment

The owner-approved assignment dated 2026-10-09, titled "Cited con agentes, README y landing a 9.5", reports these observations:

| Client | Reported observation |
|---|---|
| DeepSeek Harness 0.2.0-rc.2 bundled CLI | GitHub plugin installation without compilation; a DeepSeek agent called cited_search and answered that a bike tune-up costs 380 pesos [1], citing cafe-la-horquilla.md. |
| Claude Code | Connected to Cited MCP and listed cited_search and cited_ask. |
| Codex | Connected to Cited MCP and listed cited_search and cited_ask. |
| Cursor | Configuration documented, not tested. |

Those observations were supplied as prior verification, not rerun by this change. Their raw client logs are not part of this repository. Do not promote them to end-to-end model calls. Claude Code, Codex and Cursor concern Cited’s MCP endpoint; the DeepSeek Harness row concerns this native plugin. No desktop UI click-through claim is made.

The prior GitHub installation and paired evidence are preserved in [the previous canonical record](natural-2026-10-09T17-01-01-501Z/previous-answer.json). They identify historical verification separately from the main-installed round-six runtime.
