# Design

## Fixed decisions
1. Keep canonical round-three attempt-2 unchanged. Render its complete cited_ask exchange and complete final answer. The linked raw transcript retains every exchange, including cited_search.
2. Inside TOOL RESULT, place the numbered citation-chip 1 on the Sources: 1. entry and apply the existing mark highlight to the returned bicycle tune-up line containing 380 pesos. Preserve document, heading and position 2. Remove the supporting panel and its styles.
3. Use the title "Selected cited_ask exchange · complete answer". The footer links the full transcript and explains selection, so the title does not repeat every disclosure.
4. Render the banner citation as a true superscript: vertical-align 0.9em, font-size 0.4em and margin-left 0.08em in banner.html and base.html.
5. Each localized README quotes only the first answer line. The section ends with one short provenance paragraph containing a bold 2 of 3 result, keyword-only search without embeddings, the English-over-Spanish limitation and transcript/compatibility links. Exact model slugs and database hashes reside in docs/evidence/compatibility.md.
6. Merge the consecutive Not verified paragraphs into one per language. Disclose both observed English false claims with existing record links and explicitly state that the agent's [1] through [5] marks do not support its false claim; only the tool-result citations carry the demonstrated support.
7. Add both serialized-value and rendered-text assertions for the fake secret in citedAskTool tests. Do not change runtime token handling.
8. Regenerate English, Spanish and Chinese banner, steps and answer images in both themes. Preserve local fonts, identity, exact evidence and truthful alt text.

## Validation
Use Node 24. Add failing presentation regressions before edits. Run the complete plugin tests, build and real integration gate with the isolated sample server. Measure the public-sample SQLite database read-only before and after validation with scripts/lib/database-snapshot.mjs; retain per-table counts and hashes, distinguishing expected gate fixture writes from unchanged real sample state. Never substitute Git state for database state.

Execute curl checks with authorization provided through stdin. Run Playwright rendering and inspect both themes/all locales for source placement, no duplicate panel, overflow, external requests and footer bounds. Run strict OpenSpec validation and gitleaks before commit; require existing PR checks green. No merge or deployment.

## Historical contract reconciliation
This change supersedes R3's raw-Markdown graphic wording, selection-title verbosity, separate supporting-panel interpretation and main-text model/hash density. It preserves the original evidence, Markdown escaping, supported-answer denominator and full-download fidelity.
