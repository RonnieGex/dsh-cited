# Contract and bootstrap evidence

Date: 2026-10-09. Specification author: spec_readme_a. No README, rendering, capture, CI or runtime implementation was performed by this author.

## Source and authorization

Read the complete authorized Task A assignment and the complete global SDD standard. Scope is limited to the dsh-cited README work and common rules. The parent agent created `feature/readme-pro`; `git -C dsh-cited branch --show-current` returned `feature/readme-pro` before bootstrap.

`memanto recall "estándar SDD" --tool deepseek-harness` exited 1 with an Ollama embeddings request error. Retrieval of that standard failed. The complete local source was read instead. `memanto recall --recent --tool deepseek-harness` exited 0 and returned ten recent memories; unrelated project contents were not copied here.

## Executed commands

```text
C:/Users/Franc/AppData/Roaming/npm/openspec.cmd --version
1.1.1

C:/Users/Franc/AppData/Roaming/npm/openspec.cmd init --tools claude,codex,cursor
OpenSpec Setup Complete
Created: Claude Code, Codex, Cursor
10 skills and 10 commands in .claude, .codex, .cursor/
Config: skipped (non-interactive mode)

C:/Users/Franc/AppData/Roaming/npm/openspec.cmd validate readme-pro --strict --json
items: readme-pro, valid: true, issues: []
totals: 1 passed, 0 failed
```

The custom configuration, standards, project manual and canonical agent contract describe this plugin's actual ESM stack. There is one open change. Proposal, design, tasks and the capability delta specify the assigned documentation work.

## Windows links

`New-Item -ItemType SymbolicLink` failed because symbolic-link creation requires unavailable administrator privileges. `New-Item -ItemType Junction` succeeded for each of `.claude/agents`, `.codex/agents` and `.cursor/agents`, targeting this checkout's `ai-specs/agents` directory. The returned LinkType is Junction, not SymbolicLink. Git staging must not accidentally duplicate the canonical agent definition through these local junctions. Portable symbolic links remain to be resolved during integration and reviewed independently.

## Contract handoff

The implementation agent must review this independent contract before implementation, write its own validation evidence and obtain a separate adversarial reviewer. This report demonstrates bootstrap and strict schema validity, not implementation completion or adversarial approval.

## Independent contract amendment

The same specification author amended design decisions 5, 11 and 13, their capability scenarios and implementation tasks before independent delivery review. The parent implementation author requested these closed technical decisions within the authorized documentation scope:

- Capture fails closed when its selected sample endpoint or prerequisites are absent. It never starts a server automatically. The asset manual documents the gate-based isolated sample-server preparation and `CITED_CAPTURE_URL`, `CITED_TOKEN_FILE` and `CITED_CAPTURE_DATABASE` overrides.
- `scripts/check-readme-http.mjs` executes repeatable curl checks with the bearer supplied through stdin and writes sanitized HTTP evidence.
- Local agent links are ignored rather than serialized as duplicate tracked directories. `scripts/link-agent-contracts.mjs` restores Windows junctions and Linux relative symbolic links after cloning, preserving valid links and refusing destructive replacement. The project manual documents that command.
- The repository's adapted standards source is `docs/base-standards.md`, which is already referenced by OpenSpec configuration and the canonical agent README.

The specification author changed only the design, specification, tasks and this report; the implementation author owns the corresponding scripts, gitignore and manual updates. This amendment is not an implementation review.

Executed after amendment:

```text
C:/Users/Franc/AppData/Roaming/npm/openspec.cmd validate readme-pro --strict --json
readme-pro valid: true, issues: []
totals: 1 passed, 0 failed

rg -n 'katalis-sdd-standard|base-standards' openspec/config.yaml docs ai-specs openspec/changes/readme-pro/design.md
openspec/config.yaml and ai-specs/README.md reference docs/base-standards.md.
design.md explicitly names that source and disallows a nonexistent alternate standard file.
```

## Issues

- RISK: Native symbolic-link creation is unavailable in this Windows process. The amended contract requires ignored local links and a portable restoration script; the implementation author and independent reviewer must validate that solution before closure.
- UNKNOWN: Semantic memory recall is unavailable for the required standard query; the local authoritative standard was read completely.
