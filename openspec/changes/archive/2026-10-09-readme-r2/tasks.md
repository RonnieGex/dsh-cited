# Tasks

Specification authority: Fable's approved round-two assignment. Implementation: Codex. Independent review required before archive.

- [x] 0. Reuse `feature/readme-pro` as explicitly assigned. `git status --short --branch`: clean, tracking the same PR branch.
- [x] 1. TDD: run updated evidence and documentation guards before implementation.
- [x] 2. Capture natural questions and preserve every attempted run and the previous directed evidence.
- [x] 3. Correct graphics and complete EN/ES/ZH documentation in small steps.
- [x] 4. Review existing tests; run unit tests, build equivalence and gate with sample database state before and after.
- [x] 5. Execute agent-run curl checks and Playwright graphic checks in both themes.
- [x] 6. Update asset documentation and project manual.
- [x] 7. Verify, obtain independent adversarial review, archive, scan secrets, commit and push to PR #1; check CI. Do not merge.

Executed commands and results for steps 1-6: [validation report](reports/2026-10-09-validation.md).

Closure evidence: independent review PASS; `openspec archive readme-r2 --yes` succeeded after verify/review (only this closure checkbox remained); `gitleaks git --pre-commit --staged --redact --no-banner` found no leaks; commit e6ef9c86317fb19257441211e284f3e837e752de pushed to PR #1; `gh pr view 1 --json headRefOid,statusCheckRollup,url` confirmed that SHA and all four CI jobs SUCCESS. A broad directory scan also found an ephemeral token solely in ignored .tmp/gate/logs/smoke/gate-overlay.yml; it is not staged or published.
