## MODIFIED Requirements

### Requirement: Source emphasis at the returned passage
The real-answer graphic SHALL emphasize the returned tune-up price inside TOOL RESULT, SHALL render source citation chip 1 without an orphan following period, and SHALL NOT add a separate Passage 1 panel.

#### Scenario: Rendering the selected exchange
- **WHEN** the canonical answer is rendered in each locale and theme
- **THEN** the Sources entry has citation chip 1 followed by its source without a period after the chip, the exact returned 380-peso line has lime highlighting, document/heading/position remain visible, and the price list is not repeated below the terminal.

#### Scenario: Preserving canonical output
- **WHEN** displayed text is compared with the canonical raw transcript
- **THEN** only the source-chip presentation is normalized back to the raw numbered-source punctuation, the full selected exchange and answer match, and canonical evidence files remain unchanged.
