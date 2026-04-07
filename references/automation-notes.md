# Automation Notes

`analyze-website.js` is the first reliable automation layer for this skill.

## Current validation status
- `analyze-website.js` was exercised in this workspace.
- The current blocker is environment-level: Playwright Chromium executable is missing from the expected cache path.
- The script should work after reinstalling the browser binary used by the existing docker browser operator.

## What it does
- creates a stable run folder
- calls the existing docker browser capture script
- stores screenshot + metadata under `inspection/`
- generates a first-pass `spec/website-rebuild-spec.md`
- writes a short run `README.md`

## Fallback behavior
If browser launch fails, the script now falls back to a direct HTTP fetch and still produces:
- `inspection/<slug>.json`
- `spec/website-rebuild-spec.md`
- run `README.md`

This fallback does not capture screenshots or interaction behavior, but it keeps the workflow moving.

## What it does not yet do
- full DOM extraction
- asset downloading
- desktop/tablet/mobile multi-pass capture
- exact design-token extraction
- automatic code generation beyond simple scaffolding decisions

## Upgrade path
Future versions can add:
1. multiple viewport captures
2. better section segmentation
3. asset harvesting
4. generated implementation scaffold
5. section-by-section component prompts or code stubs
