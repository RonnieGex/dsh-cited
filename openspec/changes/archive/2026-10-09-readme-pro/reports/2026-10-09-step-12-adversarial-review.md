# Independent adversarial review: readme-pro

Date: 2026-10-09. Reviewer: `review_readme_a`, separate from both the contract and implementation authors. Scope: Task A and the common rules of the approved assignment. Verified branch: `feature/readme-pro`. No implementation changes, new model calls or desktop control were performed.

**Technical verdict: PASS. Blocker: 0. Major: 0. Minor: 0.** The change may proceed to archive and commit. This does not declare push, PR creation or hosted CI complete, and does not replace the final design critique led by Fable.

## Evidence reviewed

The complete assignment, SDD standard, proposal, design, specification, tasks, verify and implementation reports were read. All three translations were checked against `src/index.js` and `src/cited.js`, saved events, transcript text, database records and the capture, HTTP, rendering and link scripts.

The transcript preserves the actual question, call, result and answer reported by the capture. Rendering derives its content from those events and rejects incomplete results or citations without a passage. All 19 before/after fingerprints match. This review validates the consistency of the existing record; it does not claim to have repeated the paid model call. The saved gate records 13/13 checks and distinguishes the live `cited_ask` error from the answered/refused paths covered by tests.

All three versions include the complete contracts and limitations, local links, token handling, configuration, development and licenses. Earlier rc.2, Claude Code and Codex observations are labeled as earlier evidence with provenance; Cursor remains untested. Scripts isolate DSH_HOME and use headless. Credentials are absent from curl arguments and the public transcript. The client and distributed artifacts remain unchanged.

## Commands executed by the reviewer

From the `dsh-cited` root:

| Command | Observed result |
|---|---|
| `npx -y -p node@24 npm test` | 56 tests passed, 0 failed, including the real Loader. |
| `npx -y -p node@24 node scripts/build.mjs --check` | BUILD GREEN, 2 files match. |
| `git diff HEAD --exit-code -- src lib package.json package-lock.json` | No differences, exit 0. Includes staged and unstaged changes. |
| `git branch --show-current` | feature/readme-pro. |
| `$env:CITED_REPO='C:/Users/Franc/Documents/katalis-dev/community-main'; npx -y -p node@24 node scripts/render-readme-graphics.mjs` | Six PNGs reproduced, 432794 bytes total; Outfit loaded, complete images, zero overflow and zero external requests. |
| `npx -y -p node@24 node scripts/link-agent-contracts.mjs` | Preserves all three existing links to ai-specs/agents. |
| `gitleaks git --pre-commit --staged --redact --no-banner` | 425172 bytes scanned, no secrets detected. |
| `openspec validate readme-pro --strict --json` | 1 passed, 0 failed, no issues. |
| `git diff --check` | No findings in unstaged differences. |
| `git diff --cached --check` | Reports trailing whitespace in OFL.txt:21. The file was confirmed identical to the supplied original; the license is preserved intact. This second command is not reported as clean. |

Node 24 was also executed through stdin with binary equality assertions for all five copied font/license/flame files, database fingerprint equality and link checks in two fresh temporary directories. All passed. Restoration created three correct junctions, a second execution preserved them, and the case with `.claude/agents` as a real directory failed without replacing it. The Linux branch of the script was reviewed statically; no Linux execution is claimed.

All six `docs/images/{readme-banner,how-it-works,real-answer}-{light,dark}.png` files were visually inspected with `view_image`. The flame matches the authentic asset, Outfit is used outside the terminal, content is readable at its resolution and nothing is clipped. The banner, three-step flow and evidence block follow ink/paper/lime, square corners and fine borders without shadows or repeated cards. Rendering hashes produced no differences from the staged snapshot.

## Maintenance and scope assessment

The renderer centralizes the base template and a small evidence validator; it adds no dependencies and does not copy the complete Cited pipeline. The generated bootstrap for three tools adds substantial text, but follows the mandatory standard and does not alter runtime. Reducing it is not required as a correction for this task. Local links remain ignored and are rebuilt from canonical contracts.

The workflow covers portable tests, build equivalence and secrets with Node 24; it accurately describes that Loader, gate and rendering require external checkouts. Hosted execution still depends on the authorized push. No technical defect was found that prevents that next step.

## Issues

- UNKNOWN: Hosted CI and the final PR status do not yet exist at the time of this pre-commit review; they must be verified in the final delivery.
- NOT DONE: Final design critique by Fable and its critics, explicitly assigned to Fable by the assignment. This technical review does not award a 9.5 rating.
- RISK: Desktop, a real answer through cited_ask, other operating systems and remote HTTPS remain outside executed evidence, as declared in all three READMEs.
- UNKNOWN: `memanto recall "estándar SDD" --tool deepseek-harness` failed because of Ollama embeddings; the complete local source was read. `memanto recall --recent --tool deepseek-harness` succeeded. Successful semantic retrieval is not claimed.
