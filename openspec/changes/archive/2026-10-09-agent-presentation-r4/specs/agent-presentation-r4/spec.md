## ADDED Requirements

### Requirement: Source emphasis at the returned passage
The real-answer graphic SHALL emphasize the returned tune-up price inside TOOL RESULT and SHALL NOT add a separate Passage 1 panel.

#### Scenario: Rendering the selected exchange
- **WHEN** the canonical answer is rendered in each locale and theme
- **THEN** the Sources entry has citation chip 1, the exact returned 380-peso line has lime highlighting, document/heading/position remain visible, and the price list is not repeated below the terminal.

### Requirement: Superscript brand citation
The banner citation SHALL read as a citation attached to Harness.

#### Scenario: Rendering the banner
- **WHEN** the banner is rendered
- **THEN** the chip uses vertical-align 0.9em, font-size 0.4em and margin-left 0.08em rather than a detached baseline object.

### Requirement: Ask output excludes the token
The cited_ask regression suite SHALL verify the configured MCP token is absent from both serialized return value and rendered text.

#### Scenario: Successful cited ask
- **WHEN** citedAskTool returns a fake-server supported answer
- **THEN** JSON.stringify(value) and the rendered answer text both exclude the configured fake secret.
