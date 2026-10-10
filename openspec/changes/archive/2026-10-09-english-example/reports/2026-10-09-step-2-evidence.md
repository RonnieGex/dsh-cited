# Step 2: evidence

Date: 2026-10-09. Executor: parent Codex, implementation role. Branch: feature/english-example. Inspected base SHA: 802abfa509df343c970b96e2b7fbfb5aae00a7f3, with the R6 working tree. Contract: r6_contract; independent reviewer: r6_review.

Executed in dsh-cited: CITED_REPO=<workspace>/community-cap node scripts/capture-english-evidence.mjs. One batch of exactly three natural English questions, 3/3 supported answers, canonical attempt 1. Installation command dsh plugin --profile headless add github:RonnieGex/dsh-cited resolved main 802abfa509df343c970b96e2b7fbfb5aae00a7f3. Temporary DSH_HOME, public sample fixture, port 3246. Harness 0.1.6-alpha.2 and DeepSeek v4-flash. All attempts, installation, seed state, MCP HTTP and database diagnostics retained under natural-en-2026-10-09T21-56-48-866Z. No desktop profile. node tasks/verify-agents-r6.mjs verified 23 historical evidence files byte-identical and all 16 English artifacts identical across consumers; see r6-integrity.json. Initial integrity-script failure included compatibility.md, a deliberately updated document; restricting the snapshot to raw evidence artifacts resolved that validation-script mistake without changing historical evidence.

Verdict: PASS for this step. Machine-local prefixes in logs are normalized to <workspace>; no command arguments or outcomes are otherwise rewritten.
