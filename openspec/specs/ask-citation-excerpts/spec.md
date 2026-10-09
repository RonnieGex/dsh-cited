# ask-citation-excerpts Specification

## Purpose
TBD - created by archiving change ask-citation-excerpts. Update Purpose after archive.
## Requirements
### Requirement: Ask text exposes source passages
The plugin SHALL include every returned citation's document, section, position and exact excerpt in the `cited_ask` text result without changing structured output.

#### Scenario: Answer with multiple citations
- **WHEN** Cited returns an answered result with validated citations
- **THEN** each source address is immediately followed by its own unchanged excerpt, in upstream order.

#### Scenario: Missing section title
- **WHEN** a citation heading is null or empty
- **THEN** the address retains document and position without an empty section separator, and the excerpt is still included.

#### Scenario: Refusal without citations
- **WHEN** Cited returns a refusal with no citations
- **THEN** the text remains exactly the refusal answer without a Sources block.

#### Scenario: Invalid upstream citation
- **WHEN** an upstream citation fails existing required-field validation
- **THEN** the tool preserves its existing error behavior without inventing a passage.

### Requirement: Shipped module matches source
The repository SHALL ship the rebuilt `lib/` implementation and pass automated unit and integration gates under Node 24.

#### Scenario: Installed distribution
- **WHEN** the built plugin receives the same fixture as the source plugin
- **THEN** its text includes the same citation excerpts and its structured result remains unchanged.

