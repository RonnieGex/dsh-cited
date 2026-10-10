## ADDED Requirements

### Requirement: Authentic source-preserving logos

The renderer SHALL use locally vendored authentic marks from the fixed source/version mapping in design.md, preserving full source geometry and viewBox. Shared files SHALL be byte-identical across participating repositories. Provenance SHALL include exact source/version, hash, license and nominative-use note.

#### Scenario: Logo rendered from a verified source
- **WHEN** a specified brand is rendered
- **THEN** its local mark retains source geometry and accessible adjacent brand text, with theme-appropriate paint and equal optical alignment
- **AND** the documentation identifies the reproducible asset source and hash

### Requirement: Complete scoped coverage and truthful status

The output SHALL satisfy this exact coverage: Place DeepSeek beside every authored DeepSeek Harness brand label in banner, how-it-works and real-answer template chrome. Render all eighteen PNG variants: three graphics, English/Spanish/Chinese, light/dark. Preserve the visible Katalis flame and maker attribution at their existing size and prominence. Raw recorded terminal text remains byte-equivalent after its existing citation normalization; do not inject marks inside transcripts.

#### Scenario: All prescribed variants render
- **WHEN** the renderer builds the required localized/theme outputs
- **THEN** every specified authored brand mention has its authentic mark and no generic status glyph replaces it
- **AND** the documented verification levels, Katalis identity and raw evidence remain unchanged

### Requirement: Deterministic accessible offline validation

The implementation SHALL pass the validations and closure boundaries defined here: Run npm test and npm run build under Node 24, render all eighteen assets with CITED_REPO pointing to the dependency-installed Cited worktree, and check the existing image/font/overflow/external-request budget. Serve graphics locally for agent-executed curl. Runtime src/lib and package dependency contracts remain unchanged. Branch docs/brand-logos is the explicit brief override. Open an unmerged PR with required checks green.

#### Scenario: Validation of finished outputs
- **WHEN** the agent executes the tests, rendering, local curl and browser checks
- **THEN** commands and actual outcomes are recorded under the change reports, missing evidence remains unchecked, and blockers prevent archive
- **AND** no desktop profile, external model call, production change or lockfile modification occurs
