# Secret scans

Executed `gitleaks dir . --redact --no-banner`. Exit 1: one pre-existing ignored synthetic fixture at `.tmp/gate/logs/smoke/gate-overlay.yml:5`, rule generic-api-key. Confirmed using a redacted JSON report. It is not part of this change. This is the same R7 finding; no exception was added.

Executed `git diff --cached --check` and `gitleaks git --pre-commit --staged --redact --no-banner` after preparing the final diff: both exit 0, no leaks. Repeat the staged scan immediately before any future commit.
