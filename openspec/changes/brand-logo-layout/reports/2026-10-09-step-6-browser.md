# Browser and visual validation

`CITED_REPO=<workspace>/community-brand-logos node scripts/render-readme-graphics.mjs` -> exit 0, 18 EN/ES/ZH light/dark PNGs validated. Only the six banners changed. The optical-gap difference is 0.000949 px in dark and 0.499051 px in light for all three languages, below the 1 px tolerance. Local fonts loaded; no overflow, failed images or external requests. Exact values live in docs/images/render-report.json; renderer output is in step-2-render.txt.
