## MODIFIED Requirements

### Requirement: Accurate translated documentation
English, Spanish and Chinese READMEs SHALL describe tool choice, retrieval limits and session-dependent persistence accurately, with one answer quote line and one closing provenance paragraph. Exact model identifiers and database hashes SHALL reside in linked compatibility evidence.

#### Scenario: Assessing sample reliability
- **WHEN** a reader opens any README answer section
- **THEN** its single closing provenance paragraph states a bold two-of-three supported price result, keyword-only retrieval without embeddings and English-question misses over Spanish documents, with transcript and compatibility links.

#### Scenario: Understanding ask persistence
- **WHEN** a reader reaches token and privacy documentation
- **THEN** conversation creation is qualified by sessionId and is not asserted for the canonical run without database evidence.

#### Scenario: Unsupported agent citation marks
- **WHEN** a reader opens the consolidated Not verified paragraph
- **THEN** it discloses both recorded English false claims with evidence links and states that the false claim's agent marks [1] through [5] are unsupported and only the tool-result citations have demonstrated support.

### Requirement: Consistent source-centered graphics
Graphics SHALL use the accepted identity, a superscript banner citation, an unbroken monospace install command and safely rendered answer Markdown with truthful footer.

#### Scenario: Source inspection
- **WHEN** the real-answer graphic renders
- **THEN** the actual TOOL RESULT excerpt carries lime highlighting and citation chip 1, its address and position 2 remain visible, no separate passage panel exists, and the linked transcript retains raw output.

### Requirement: Explicit single-run display selection
The graphic SHALL display the complete original question, complete cited_ask exchange and complete final answer from canonical attempt-2 under "Selected cited_ask exchange · complete answer"; the raw download SHALL retain every original exchange.

#### Scenario: Canonical run also searched
- **WHEN** the full canonical run contains cited_ask and cited_search
- **THEN** the concise selection title and full-transcript footer identify the selected presentation, linked compatibility evidence acknowledges both tools, and the raw download preserves every call/result in order.
