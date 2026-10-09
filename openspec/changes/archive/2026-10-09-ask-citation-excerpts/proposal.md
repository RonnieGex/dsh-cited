# Ask citation excerpts

## Why

Fable approved this product change in `tasks/encargo-codex-agentes-r3.md` on 2026-10-09. The MCP response already contains citation excerpts but the plugin hides them from its text result, preventing one natural answer from carrying its own supporting passage.

## What changes

Include each citation's document, section, position and exact excerpt in `cited_ask` text output. Preserve structured output and refusal behavior. Rebuild the shipped `lib/` distribution.

## Scope and authority

The upstream contract was verified in `community-readme/lib/mcp/tools.ts`: citation schema requires `n`, `document`, `heading`, `position`, `excerpt` and `lead`; successful ask returns `outcome.citations`. `community-main/lib/mcp/tools.ts` is absent. No Cited server change is authorized. Specification author: independent contracts agent. Implementation and independent review must have different authors from this specification and each other. Reuse `feature/readme-pro`, expressly authorized by Fable.
