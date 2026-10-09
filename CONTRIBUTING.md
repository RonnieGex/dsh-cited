# Contributing

Use Node 24 and follow [the project SDD standard](docs/base-standards.md). Specify changes before implementation, separate specification, implementation and review authors, and retain command evidence in the active OpenSpec change. Close with verification, independent adversarial review, archive and commit, in that order.

Run `npm test`, `node scripts/build.mjs --check` and `npm run gate` with the prerequisites in the [project manual](docs/project-manual.md). Run `gitleaks git --redact --no-banner` and scan staged content before each commit. Never commit credentials or private documents.

For README changes, update all three languages and read the [asset guide](docs/readme-assets.md). Regenerate both themes, inspect the output, verify all local links, and distinguish freshly observed behavior from prior verification. Capture only public samples in temporary headless state. Never use the desktop profile for tests.
