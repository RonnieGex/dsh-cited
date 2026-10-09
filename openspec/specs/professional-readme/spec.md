# professional-readme Specification

## Purpose
TBD - created by archiving change readme-pro. Update Purpose after archive.
## Requirements
### Requirement: Complete multilingual documentation
The repository SHALL provide complete English, Spanish and Chinese README documents with installation, configuration, both tools, token handling, dated compatibility, development, license, maker attribution, badges and a short contents list.

#### Scenario: Reader follows documentation
- **WHEN** a reader opens any README
- **THEN** they find the same substantive information, working local links, three themed pictures and a link to the full genuine transcript.

#### Scenario: Reader checks compatibility
- **WHEN** a reader reads a client compatibility row
- **THEN** the row states the tested date, exact observed capability and evidence level, and Cursor remains documented-only without a new exercised record.

### Requirement: Reproducible brand graphics
The renderer SHALL generate light and dark banner, three-step installation and actual-answer PNG graphics from local HTML, local OFL Outfit fonts, authentic flame files and saved evidence.

#### Scenario: Renderer executes
- **WHEN** the documented Node 24 render command executes with the documented Playwright prerequisite
- **THEN** all six PNGs exist, total less than 3 MB, use ink/paper/lime branding, have no unresolved placeholders or overflow, and make no external font request.

#### Scenario: Theme changes
- **WHEN** GitHub selects a light or dark color scheme
- **THEN** every picture uses its matching image, with equivalent text and descriptive fallback alt text.

### Requirement: Genuine isolated answer evidence
The capture script SHALL execute a fresh headless agent run through the plugin against public sample documents in temporary harness state and save a sanitized transcript.

#### Scenario: Capture succeeds
- **WHEN** the agent calls cited_search and answers using the returned passages
- **THEN** the record contains the actual prompt, tool call, passages, cited final answer, run date and harness version, and the answer graphic derives from that record.

#### Scenario: Capture fails
- **WHEN** no successful model-backed answer is obtained
- **THEN** capture exits unsuccessfully and no fabricated success transcript replaces the missing evidence.

#### Scenario: Capture server is unavailable
- **WHEN** the selected sample server cannot be reached
- **THEN** capture fails closed without starting a server or replacing previous successful evidence, and the asset manual explains isolated sample-server setup and the URL, token-file and database environment overrides for a retry.

#### Scenario: Protect user state and secrets
- **WHEN** capture, rendering and validation execute
- **THEN** no desktop profile is opened or controlled, no global client configuration changes, no token value enters tracked evidence, and sample database state is measured before and after search.

### Requirement: Validated documentation delivery
The change SHALL retain green unit tests and the real integration gate, add documentation contract checks and CI, retain unchanged runtime artifacts and complete the independent SDD lifecycle.

#### Scenario: Verify the change
- **WHEN** validation runs
- **THEN** npm test, npm run gate, build equivalence, graphics browser checks, curl checks and secret scanning have exact commands and results in change reports.

#### Scenario: Reproduce HTTP validation
- **WHEN** the documented `scripts/check-readme-http.mjs` command executes against the sample server
- **THEN** it invokes curl with authorization through stdin, records authenticated and unauthenticated HTTP results in sanitized evidence and keeps the token out of command-line arguments.

#### Scenario: Restore canonical agent links after cloning
- **WHEN** the documented `scripts/link-agent-contracts.mjs` command executes
- **THEN** the ignored local agent paths link to tracked `ai-specs/agents/` using Windows junctions and Linux relative symbolic links, existing correct links are preserved, and real directories and incorrect links are not overwritten.

#### Scenario: Close the change
- **WHEN** independent adversarial review reports no unresolved Blocker or Major
- **THEN** the verified specifications and evidence are archived before commit, the feature branch is proposed to main without merging, and the final owner report includes Issues and CI status.

### Requirement: Round-two evidence and presentation
The documentation SHALL preserve approved evidence and identity while applying Fable's R4 source emphasis and concise documentation decisions.

#### Scenario: Natural capture
- **WHEN** recorded natural evidence is presented
- **THEN** every existing attempt remains available, canonical attempt-2 remains selected and no fresh model call is needed for presentation changes.

#### Scenario: Read translated documentation
- **WHEN** a reader opens English, Spanish or Chinese documentation
- **THEN** installation starts with the verified CLI, requirements and troubleshooting are actionable, the answer quote contains only its first line, localized banners and steps remain, and concise limits link to complete compatibility evidence.

#### Scenario: Inspect graphics
- **WHEN** the renderer generates both themes
- **THEN** the banner is 340px high, display weights are 800, labels are neutral, and the returned TOOL RESULT passage and citation chip carry lime without a separate supporting panel.

