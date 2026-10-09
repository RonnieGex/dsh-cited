# Repository standards

Use approved OpenSpec specifications before implementation. Specification, implementation and adversarial review have separate authors. At most two changes remain open; finish the previous change before opening another. Work on `feature/<change>` branches. Close in this order: verify, independent adversarial review, archive, commit. Blockers stop archiving.

Write code, tests, commits and technical documentation in English. Maintain complete Spanish and Chinese README translations. Deliver reports to the owner in Mexican Spanish with an Issues section and BROKEN, RISK, NOT DONE and UNKNOWN classifications. Mark tasks complete only with executed commands and outcomes.

Use Node 24 for validation. Never add unnecessary dependencies. Regenerate npm lockfiles only on Linux. Keep automated tests and CI. Run gitleaks before each commit. Never commit credentials, private customer material or commercial font files. Production deployment is outside this repository change and requires the owner's explicit approval through its designated operator.

The brand uses ink `#171717`, paper `#FAFAF9` and lime `#DDF469`, with coral reserved for failures. Self-host Outfit under OFL; use system monospace only within terminals. Use the authentic flame beside maker attribution, square corners and fine borders. Do not use shadows, text gradients, glass effects, decorative side stripes, emoji or em dashes.

The plugin is a client of Cited and owns no database. Validate fixture database state before and after search checks. Use public synthetic sample documents exclusively for demonstration evidence. Do not open or control DeepSeek Harness desktop; use a temporary `DSH_HOME` with the headless profile.
