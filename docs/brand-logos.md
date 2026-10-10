# Official brand logos

Brand marks identify compatibility through nominative use. All product names and trademarks remain the property of their owners. Their presence does not imply endorsement or sponsorship. Simple Icons artwork is CC0-1.0; trademark rights remain separate. Official vendor favicons are retained as vendor marks, not relicensed as project artwork.

## Sources pinned on 2026-10-09

| Mark | Source | Version or commit | Asset SHA-256 | License |
| --- | --- | --- | --- | --- |
| deepseek | [deepseek.svg](https://cdn.jsdelivr.net/npm/simple-icons@16.34.0/icons/deepseek.svg) | `16.34.0` | `7a55a0a7391d116eba7d32807d6838478f9209f6034612941e74fbb14934e2ef` | CC0-1.0 |

The machine-readable inventory is `docs/brand/logos/sources.json`. Existing Claude and Codex source bytes are preserved. Shared marks are byte-identical across Cited, the plugin and the landing wherever used. Claude matches simple-icons@13.21.0; the existing Codex asset matched the published SVGL URL on retrieval. All additional Simple Icons marks are pinned to 16.34.0 except OpenAI 13.21.0. No package dependency or lockfile is added.

## Rendering contract

Keep every viewBox, path, rectangle, transform, fill-rule and clip-rule. Render full SVG trees; never extract paths into a generic square. Inline IDs and local references receive a unique prefix. Local inline SVGs are decorative next to readable names (`aria-hidden=true`, `focusable=false`). Geometry uses equal optical containers without distortion. Groq and libSQL preserve separate foreground/background paints using the surrounding theme, with a DOM guard against collapsed paints. Brand names and verification states remain separate. Recorded transcripts, commands, URLs and hidden copy variants are not decorated.

## Maintenance

Use Node 24.21.0. Reproduce with:

```sh
CITED_REPO=../community-brand-logos node scripts/render-readme-graphics.mjs
```

Browser audits check every authored visible brand occurrence, expected mark inventory, readable SVG dimensions, distinct paints and unique local definition references. Source tests compare original geometry and pinned file hashes. Keep updated provenance and run the relevant unit/build/browser checks after changing marks. API contracts, runtime behavior, data models and canonical evidence are unchanged.
