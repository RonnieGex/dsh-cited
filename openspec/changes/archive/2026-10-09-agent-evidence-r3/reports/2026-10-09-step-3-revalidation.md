# Revalidation of saved events

No model batch was repeated. The original capture printed 3/3 because it accepted a refusal containing citations. The saved English events show no price source and an ask refusal; canonical attempt-2 is unchanged.

`npx -y -p node@24 node --test tests/readme.test.mjs`: first canonical-selection TDD run had 4 passes / 1 failure (missing canonicalOf). Added own-source address and price checks, including a final refusal-with-citations rejection. Revalidated the three JSON files with hasOwnPassage and wrote natural-summary.json and its dated copy: [false, true, true], 2/3. This used Node24 stdin and no HTTP/model call.

The permanent test `current evidence selects one own-source exchange while preserving all raw calls` reproduces revalidation from all three original JSON files, verifies canonical attempt-2, compares installed/lib SHA and keeps the exact complete final answer. Final gate command `CITED_REPO=../community-cap npx -y -p node@24 npm run gate`: 62/62 tests, GREEN14/14. Independent duplicate-result probe led to a separate red run (6/7) and the corrected bijective transcript validator; final targeted README suite7/7. See step-1-tdd and independent review.
