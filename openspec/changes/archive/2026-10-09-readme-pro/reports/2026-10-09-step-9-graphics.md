# Graphics and documentation validation

`npx -y -p node@24 node scripts/render-readme-graphics.mjs`: exit 0. Playwright resolved from the existing community-main dependency, Chromium headless, no new dependency. Both themes rendered with local Outfit loaded, zero failed images, zero overflowing elements and zero external requests.

| Files under docs/images | Dimensions | Combined bytes |
|---|---|---:|
| readme-banner-light.png, readme-banner-dark.png | 1280 x 603 | 109341 |
| how-it-works-light.png, how-it-works-dark.png | 1280 x 652 | 128104 |
| real-answer-light.png, real-answer-dark.png | 1280 x 1036 | 195349 |

Total PNG bytes: 432794, below 3 MB. `docs/images/render-report.json` contains image and transcript SHA-256 values. The answer is rendered verbatim from the saved transcript, with line wrapping and label styling only.

All six images were opened and visually inspected with the local image viewer: authentic flame next to the maker name; correct ink/paper/lime; square corners and fine rules; no shadows, text gradients or repeated card grid; system monospace only in the terminal. The banner's excess blank lower band was removed by measuring full content height.

The three README documents include matching themed assets, full sections, translated alt text and a readable transcript link. `npm test` checks each local asset/link, peer-range agreement, tool/configuration fields and no em dashes. `docs/readme-assets.md`, `docs/project-manual.md` and CONTRIBUTING.md document prerequisites, provenance, limits, capture, rendering, curl and safe post-clone agent links.
