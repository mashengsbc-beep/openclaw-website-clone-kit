# Browser Flow

Use this when a website task needs actual page inspection.

## Preferred path

Use the existing Docker browser operator skill and its validated script:

```bash
node /home/node/OpenClawBox/skills/docker-browser-operator/scripts/browse.js \
  --url "https://example.com" \
  --slug example
```

## Environment note

This flow depends on a working Playwright Chromium install. If launch fails with a missing executable under `/home/node/.cache/ms-playwright/`, install browsers first:

```bash
cd /home/node/OpenClawBox/deliveries/browser-lab && npx playwright install chromium
```

Then retry the browser step.

## What to collect first

For the first pass, collect only the evidence needed to decide next steps:
- page title
- final URL after redirects
- screenshot path
- concise visible-text summary
- major sections visible on the page

## If deeper inspection is needed

Add targeted follow-up runs rather than trying to do everything in one pass. Examples:
- desktop and mobile screenshots
- one run per important page
- content extraction for specific sections
- screenshot recapture after interaction

## Delivery rule

Write inspection artifacts to a stable run folder. Reuse that folder in later steps so the clone task remains recoverable.
