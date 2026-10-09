# Design

1. Change only the source text projection of validated `cited_ask` citations. For each citation emit the existing `n. document · heading (position N)` line followed by a newline and the exact `excerpt` string. Keep citation order and the existing `Sources:` heading. A null or empty heading continues to omit the section separator.
2. Preserve the answer string, structured data and all validation of upstream shape. Do not synthesize, translate, trim or infer excerpt content. Multiple citations each carry their own excerpt. An empty citation list returns only the answer, including refusals.
3. Rebuild `lib/` using the existing build command. Introduce no dependency, network call, extra search, persistence write or server change.
4. Test the public tool invocation with complete structured MCP fixtures before changing implementation. Cover exact passage text, multiple citations, null heading, empty citation lists and existing malformed-result rejection. Verify source and built-module behavior through existing package coverage.
5. Node 24 is mandatory for validation. The plugin has no database. The integration gate must record the isolated Cited database state before and after actual calls, including model_calls and conversations; do not equate repository status with database state.
6. Runtime changes complete verify, independent adversarial review and archive before the plugin presentation change opens. Existing feature branch is reused; no merge or deployment occurs.
