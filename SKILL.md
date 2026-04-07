---
name: openclaw-website-clone-kit
description: Analyze, plan, and scaffold website cloning or website rebuild tasks inside the OpenClaw workspace. Use when the user wants to clone, imitate, rebuild, reverse-engineer, or recreate a public website or landing page; when you need to inspect a URL, capture structure/content/screenshots, generate a rebuild plan, or scaffold a clean local project for later implementation. Especially use when adapting ideas from ai-website-cloner-template into a skill that works inside this OpenClaw environment.
---

# OpenClaw Website Clone Kit

Use this skill to turn a target website into a structured rebuild task that this OpenClaw workspace can actually execute.

Do not pretend you have capabilities you have not verified. In this workspace, prefer a staged workflow:
1. inspect the target site
2. capture evidence and artifacts
3. write a rebuild spec
4. scaffold a local implementation target
5. only then start component-by-component rebuilding

## Core rule

This skill is for **analysis + planning + scaffold + optional implementation start**.
It is not permission to claim a pixel-perfect clone before evidence exists.

If the task requires browser inspection, use the local Docker browser workflow first.
Read `references/browser-flow.md` before running browser steps.

If the task requires deciding whether a site is suitable for cloning, read `references/evaluation.md`.

If the task requires generating a reusable rebuild brief, read `references/spec-template.md`.

## Quick start

For a first-pass complete run, run:

```bash
node /home/node/OpenClawBox/skills/openclaw-website-clone-kit/scripts/run-complete.js \
  --url "https://example.com" \
  --slug example
```

This calls the analyzer and then leaves you with a run folder containing both the analysis package and the first-pass implementation scaffold.

This creates a recoverable run folder under:

`/home/node/OpenClawBox/deliveries/website-clone-runs/<slug>/`

with:
- `inspection/<slug>.png` when browser capture works
- `inspection/<slug>.json`
- `spec/website-rebuild-spec.md`
- `implementation/` first-pass scaffold
- `README.md`

If browser launch fails, the script automatically falls back to HTTP-only analysis so the run still completes.
It also attempts to generate a first-pass implementation scaffold automatically.

Read `references/browser-flow.md` before modifying the browser part of the workflow.
If browser launch fails, follow the Playwright reinstall note there before claiming the skill is broken.

## Default workflow

### 1. Validate scope
Determine:
- target URL
- whether the user wants analysis only, a clone plan, or an actual local rebuild
- whether fidelity should be rough, close, or pixel-focused
- whether legal/brand constraints matter

If scope is unclear, ask the smallest useful clarification.

### 2. Inspect the target
Use the docker browser operator or another verified local path to gather:
- page title and final URL
- screenshot(s)
- visible text outline
- obvious sections from top to bottom
- visible assets and interaction hints

Save artifacts under `/home/node/OpenClawBox/deliveries/browser-runs/` or a task folder under `deliveries/website-clone-runs/`.

### 3. Produce a rebuild spec
Create a concise but actionable spec in Markdown including:
- site summary
- section inventory
- style observations
- assets to recreate or download
- responsive notes
- implementation risks
- proposed component list
- recommended stack and folder layout

Use `references/spec-template.md`.

### 4. Decide implementation path
Choose one:
- **analysis-only**: stop after the spec and recommendations
- **scaffold**: create a local starter project/folder structure
- **rebuild-first-pass**: implement the page shell and major sections with placeholder or extracted content

### 5. Verify honestly
If code was created, verify with the relevant local checks. Report:
- what is done
- what is approximate
- what still needs browser-level extraction

## Workspace fit

- Prefer creating deliverables inside `/home/node/OpenClawBox/deliveries/` when the user may want direct access.
- Prefer creating implementation work under `/home/node/OpenClawBox/deliveries/website-clone-runs/<slug>/` unless the user specifies a repo path.
- Keep generated notes and specs with the run so the task is recoverable.

## Guardrails

- Do not clone deceptive login pages, payment pages, or branded phishing targets.
- Do not imply legal clearance you do not have.
- Do not overclaim pixel-perfect fidelity without browser evidence and side-by-side checking.
- For complex apps, position the result as a front-end reconstruction unless backend parity is explicitly built.

## References

- `references/browser-flow.md` — how to inspect a site in this Docker/OpenClaw environment
- `references/evaluation.md` — how to judge clone difficulty and fit
- `references/spec-template.md` — reusable rebuild brief structure
- `references/scaffold-patterns.md` — how to lay out local clone runs and starter code

## Scripts

- `scripts/init-run.sh` — create a run folder skeleton
- `scripts/analyze-website.js` — inspect one URL and generate an initial analysis package
- `scripts/scaffold-implementation.js` — generate a first-pass implementation scaffold from an existing run
- `scripts/run-complete.js` — one-command entry point for analysis + scaffold generation
