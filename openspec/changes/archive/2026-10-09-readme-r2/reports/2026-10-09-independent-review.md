# Independent adversarial review: README round two

Date: 2026-10-09. Reviewer: independent Codex review agent, separate from the implementer and specification author. Scope: dsh-cited on feature/readme-pro, Fable's round-two assignment, plugin art findings 1-8 and UX findings P1-P8. Product files were read-only for this reviewer; only this report was written.

Verdict: **PASS** for the reviewed implementation after the implementer corrected the findings below. No open Blocker, Major or Minor implementation finding remains. This verdict does not certify a future commit or remote CI run.

## Findings and independent recheck

| Severity | Finding discovered | Final disposition |
|---|---|---|
| Major | A future successful cited_ask capture could overwrite canonical evidence without the supporting passage required by the renderer. | Resolved. The capture retains an attempt without publishing when supportingEvidence is unavailable. Supporting evidence requires exit 0, a completed non-truncated result linked by callId to cited_search, a valid transcript and unchanged database state. |
| Major | Database comparison used one baseline outside the attempts loop, so an earlier ask could make a later search appear to mutate the database. | Resolved. snapshot() now runs immediately before each individual question. |
| Major | READMEs and asset documentation said the canonical ask added a row. Its recorded model_calls count was 1 before and 1 after; only the hash changed. | Resolved. EN/ES/ZH now describe updated model-call state; the validation report states the precise row-count/hash result. |
| Minor | Capture success output always claimed one search and an unchanged database, including ask calls. | Resolved. Output now lists actual tools and database unchanged status. |
| Minor | The answer graphic fixed its heading to CITED_ASK and its footer to Spanish even though later captures can select search and use an English prompt. | Resolved. Tool names and prompt framing are derived from evidence; the footer says original model output. Supporting labels distinguish the same recorded run from a separate run. |

The final capture guard was re-read after the implementer's last correction. No additional live model question was executed by the reviewer, preserving the three-question limit. Future capture behavior was reviewed statically; the existing canonical and supporting events were validated independently.

## Requirement coverage

| Review IDs | Evidence and result |
|---|---|
| Art 1 | Neutral uppercase terminal labels; lime marks the exact Spanish price passage and square citation chips. The supporting passage is visibly labelled as a separate recorded search. |
| Art 2-3 | Six localized banner variants are 1280x340. No banner footer row; 180px citation square; display weight 800 and step headings 600. |
| Art 4-6 | Repeated triple-fragment slogans removed; three benefit lines precede mechanics; process notes removed from reader sections; verification limits consolidated. |
| Art 7-8 | EN/ES/ZH banner and steps paths resolve. Chinese banner displays CJK glyphs. Footer flame uses alt="Katalis" in all READMEs. |
| UX P1 | 0.2.0-rc.2 row explicitly says installed and answered locally on the recorded date, with no raw log retained. Inherited verification remains distinct from fresh evidence. |
| UX P2/P7 | Canonical prompt is a natural Spanish question without tool instructions. Saved events show autonomous cited_ask selection, successful result and exact cited final answer. Alt text explains both the answer and separately sourced passage. |
| UX P3-P4 | Verified CLI leads installation in all languages; the app path describes the same manager without a click-test claim. Requirements, token generation command and MCP guide are present. |
| UX P5-P6 | Process notes moved to maintenance documentation; four actionable troubleshooting rows cover missing configuration, 404, 401 and timeout. |
| UX P8 | url rows describe removal of query strings and fragments in all languages. |

No desktop application or desktop profile was operated. The runtime src/ and lib/ are unchanged. Old Cited graphics are outside this review's scope, consistent with Fable's exception.

## Executed independent checks

- `npx -y -p node@24 npm test`: 57 passed, 0 failed, including the real Loader composition.
- `npx -y -p node@24 node --test tests/readme.test.mjs`: 4 passed, 0 failed, repeated after the final capture correction.
- `npx -y -p node@24 node scripts/build.mjs --check`: GREEN, two files match src/.
- A read-only Node 24 stdin inspection using transcriptOf regenerated the canonical and supporting transcripts: both matched their saved events. All supporting tool calls were cited_search, and its result contained the exact highlighted price line. Canonical state changed only in model_calls, retaining one row.
- A read-only Node 24 SHA-256 comparison checked all 14 generated images against render-report.json: no mismatches. The report's evidence hash matched the canonical transcript. The implementer subsequently regenerated the answer images after the footer correction; those final images were visually inspected.
- Visual inspection covered the answer in light and dark, the Chinese dark banner, and the Spanish light installation graphic. Price highlight, citation marks, localized glyphs, readable terminal typography and unclipped content were observed.
- Read the saved integration evidence: gate.txt reports GREEN 13/13; mcp-http.json records curl 200 with both tools and unauthenticated 401. These are the implementer's recorded executions, not independently repeated integration runs.
- Read the portable CI workflow and the round-two validation report. CI includes portable tests, build equivalence and secret scanning. It correctly excludes the external-checkout integration gate from its stated scope.

The first stdin literal-passage probe used a non-ASCII string through PowerShell's pipe and returned false because the command text was encoded incorrectly. Repeating with the Unicode escape `\u00f3` returned true; this was a reviewer probe issue, not a repository defect.

## Issues

- NOT DONE: Remote CI for the final commit, archive, final secret scan, commit and push were still closure work owned by the implementer at this review point. Do not treat this report as evidence that those later actions passed.
- UNKNOWN: Future real-model wording and tool selection are nondeterministic. Capture guards were reviewed, but no fourth live question was run.
