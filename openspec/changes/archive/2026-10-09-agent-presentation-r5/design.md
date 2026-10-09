# Design

## Fixed decisions
1. Remove only the orphan period immediately after the source chip in the TOOL RESULT displayed by real-answer.html. The actual substitution belongs to scripts/render-readme-graphics.mjs, which supplies TRANSCRIPT; leave the placeholder-only template unchanged unless an assertion requires a named hook. The source still reads Sources:, chip 1, document, section and position.
2. Preserve the complete selected exchange and final answer, the exact highlighted returned price, raw Markdown and every canonical evidence byte. In text-equivalence assertions, normalize only the rendered source-chip punctuation back to the raw `1.`; do not remove punctuation globally or weaken transcript equality.
3. Regenerate the existing localized/theme real-answer outputs through the standard renderer. The renderer may regenerate its existing 18-output set, but unchanged banner/tool assets remain byte-identical. Preserve runtime src/ and lib/ hashes and all source/privacy guards.
4. No copy rewrite, typography change or new model capture is included. Document this presentation-only normalization in docs/readme-assets.md and docs/project-manual.md.

## Validation
Use Node 24.21.0. Add a failing source-chip-period regression first. Run npm test and node scripts/build.mjs --check. Existing renderer Playwright checks must verify source chip followed by space/document, not a period, in EN/ES/ZH and both themes, exact raw transcript correspondence after narrowly scoped normalization, local fonts, no clipping and no external requests. The integration gate and read-only database before/after evidence remain required. Use the existing HTTP curl check with secrets supplied safely. Keep PR #1 open and require its final-SHA CI green; no merge/deploy.
