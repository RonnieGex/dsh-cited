# Compatibility evidence provenance

Date: 2026-10-09. Separate fresh execution from inherited verification.

## Fresh execution in this change

`headless-answer.json` records the new GitHub installation and real DeepSeek search/answer on the source CLI 0.1.6-alpha.2, Windows, Node 24. It includes actual tool events, installation output, model identity and before/after sample database fingerprints. `headless-answer.txt` is the readable transcript generated from those events. The integration gate also verifies local installation and both tool paths, including the unconfigured answer-model error.

## Earlier verification supplied with the approved assignment

The owner-approved assignment dated 2026-10-09, titled "Cited con agentes, README y landing a 9.5", reports these observations:

| Client | Reported observation |
|---|---|
| DeepSeek Harness 0.2.0-rc.2 bundled CLI | GitHub plugin installation without compilation; a DeepSeek agent called cited_search and answered that a bike tune-up costs 380 pesos [1], citing cafe-la-horquilla.md. |
| Claude Code | Connected to Cited MCP and listed cited_search and cited_ask. |
| Codex | Connected to Cited MCP and listed cited_search and cited_ask. |
| Cursor | Configuration documented, not tested. |

Those observations were supplied as prior verification, not rerun by this change. Their raw client logs are not part of this repository. Do not promote them to end-to-end model calls. They concern Cited's MCP endpoint; this package is the native DeepSeek Harness plugin. No desktop UI click-through claim is made.
