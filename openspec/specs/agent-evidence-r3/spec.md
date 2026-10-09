# agent-evidence-r3 Specification

## Purpose
TBD - created by archiving change agent-evidence-r3. Update Purpose after archive.
## Requirements
### Requirement: Three truthful natural capture attempts
The capture SHALL execute all three approved natural questions with the rebuilt local plugin in temporary headless state and retain every sanitized outcome.

#### Scenario: First question succeeds
- **WHEN** an early question produces a complete cited answer
- **THEN** capture still executes the remaining approved questions and publishes all three records and their observed success denominator.

#### Scenario: Citation markers without a supported price
- **WHEN** a final response includes citations to irrelevant search results but the run lacks its own verified price passage or its final answer does not contain `380`
- **THEN** the attempt is not counted as a successful cited price answer even when structural citation validation passes.

#### Scenario: Reclassifying the recorded English failure
- **WHEN** the three round-three records are revalidated
- **THEN** the summary reports two supported cited price answers out of three, preserves attempt-2 as canonical and makes no additional model calls.

#### Scenario: Local plugin installation
- **WHEN** the new capture starts
- **THEN** the installed lib/index.js hash equals the rebuilt checkout hash and the evidence explicitly identifies local installation rather than claiming a GitHub installation.

#### Scenario: Model attribution
- **WHEN** a Cited answer is captured from the isolated 3243 server
- **THEN** the record identifies the Cited provider and model from actual public startup configuration, separately from the Harness agent, without leaking credentials or inferring the older server's identity.

### Requirement: Canonical passage belongs to its answer
The canonical record SHALL prefer the first valid ask result with its own excerpt, then the first valid search result with its own passage, after all attempts complete.

#### Scenario: Ask source is present
- **WHEN** a valid ask run includes exact returned citation passages
- **THEN** the published answer and passage come from that one run and consumers remove separate-search stitching.

#### Scenario: No complete candidate
- **WHEN** no new run passes answer-and-passage verification
- **THEN** previous paired evidence is preserved with explicit same-document separate-search labels and the unmet capture is reported.

#### Scenario: Refusal and agent overstatement
- **WHEN** a natural question receives a refusal or the agent adds an unsupported claim
- **THEN** its raw record remains public, the actual outcome count includes it and the README discloses the unsupported claim under Not verified.

#### Scenario: Both observed English overstatements
- **WHEN** a reader opens Not verified
- **THEN** it discloses both the historical bicycle-services overstatement and the new false price-not-stated claim with links to their actual records.

### Requirement: Accurate translated documentation
English, Spanish and Chinese READMEs SHALL describe actual tool choice, answering model, retrieval limits and session-dependent persistence accurately.

#### Scenario: Assessing sample reliability
- **WHEN** a reader opens any README
- **THEN** a concise sentence states cited answers out of three questions, keyword-only retrieval without embeddings and possible English-question misses over Spanish documents.

#### Scenario: Understanding ask persistence
- **WHEN** a reader reaches token and privacy documentation
- **THEN** conversation creation is qualified by sessionId and not asserted for the canonical run without database evidence.

### Requirement: Consistent source-centered graphics
Graphics SHALL use the accepted identity, a superscript banner citation, an unbroken monospace install command and exact raw terminal Markdown with truthful footer.

#### Scenario: Source inspection
- **WHEN** the real-answer graphic renders
- **THEN** the actual excerpt carries the same numbered citation chip as the answer, its address is visible and the footer explains citation highlighting while terminal Markdown remains raw.

### Requirement: Explicit single-run display selection
The graphic SHALL display the complete original question, complete cited_ask exchange and complete final answer from canonical attempt-2 as an explicitly labeled selection; the raw download SHALL retain every original exchange.

#### Scenario: Canonical run also searched
- **WHEN** a full canonical run contains cited_ask and cited_search
- **THEN** the graphic selection label explains the omitted complete search exchanges, provenance acknowledges both tools, and the download preserves every raw call/result in order without changing the canonical run.

