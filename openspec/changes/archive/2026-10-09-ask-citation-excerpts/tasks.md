# Tasks

Authority: Fable's approved round-three assignment. Author: independent contracts agent. Check a task only after adding its executed command and result to the linked report. Reports live in this change and archive with it.

- [x] 0. Record branch baseline and Node 24 in `reports/2026-10-09-step-0-baseline.md`; reuse existing `feature/readme-pro` under the assignment's explicit branch authorization instead of creating `feature/ask-citation-excerpts`.
- [x] 1. TDD: add public tool tests for exact excerpts, multiple citations, null heading, refusals and existing invalid-shape behavior; run tests before runtime edits and record expected failures in `reports/2026-10-09-step-1-tdd.md`.
- [x] 2. Add the excerpt immediately after each citation address in `src/index.js` and rebuild `lib/` with `npm run build`; record commands in `reports/2026-10-09-step-2-runtime.md`.
- [x] 3. Review and update existing tool, built-module and package tests for this contract; preserve structured output and unrelated search behavior.
- [x] 4. Run `npm test` and `npm run gate` under Node 24. Record actual isolated database counts and hashes before and after integration calls, explain plugin database non-ownership, and account for model_calls/conversations mutations in `reports/2026-10-09-step-4-validation.md`.
- [x] 5. Execute authenticated and missing-token curl checks using the existing HTTP checker, protecting the token from logs and command-line arguments; record sanitized HTTP results in `reports/2026-10-09-step-5-curl.md`.
- [x] 6. Record that the runtime has no frontend and no new browser flow; existing graphical E2E belongs to the separately specified presentation change.
- [x] 7. Update API/tool documentation and project manual to state that ask text includes exact numbered source excerpts.
- [x] 8. `/verify`: run OpenSpec strict validation and reconcile requirements against executed evidence in `reports/2026-10-09-step-8-verify.md`.
- [x] 9. `/adversarial-review`: an independent reviewer records evidence, Blocker/Major/Minor findings and PASS/PASS WITH GAPS/FAIL in `reports/2026-10-09-step-9-adversarial-review.md`; corrections receive independent review.
- [x] 10. `/archive`: archive the change and reports only after Blockers and Majors are resolved.
- [ ] 11. `/commit`: run tests, CI-required checks and gitleaks before committing; update PR #1 without merging. Report actual checks and unresolved issues, never unverified completion.
