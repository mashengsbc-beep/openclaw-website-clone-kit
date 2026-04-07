# OpenClaw Website Clone Kit

A practical website analysis and rebuild skill for OpenClaw.

Point it at a public URL, and it will inspect the page, generate a rebuild brief, and scaffold a first-pass local implementation you can keep iterating on — even when browser capture is unavailable.

## Why it exists

Most “clone this website” workflows break in one of two ways:

- they promise pixel-perfect automation, then fail hard when browser tooling or environment dependencies are incomplete
- they stop at vague analysis without leaving behind usable project files

This skill takes a more practical route:

- inspect first
- generate a rebuild spec
- scaffold a usable local implementation
- degrade gracefully instead of failing outright
- fit the real OpenClaw workspace and delivery model

The goal is not to fake a perfect clone. The goal is to leave every run with useful artifacts that can be inspected, resumed, and improved.

## What it does

A complete run can:

1. inspect a target URL
2. attempt browser-based capture
3. fall back to HTTP-based extraction when the browser stack is unavailable
4. generate a rebuild spec in Markdown
5. scaffold a first-pass local implementation
6. write structured content data for follow-up iteration

## Quick start

Run a full pass:

```bash
node /home/node/OpenClawBox/skills/openclaw-website-clone-kit/scripts/run-complete.js \
  --url "https://example.com" \
  --slug example
```

This creates a run directory under:

```text
/home/node/OpenClawBox/deliveries/website-clone-runs/<slug>/
```

## Output structure

Each run produces a recoverable task folder:

```text
deliveries/website-clone-runs/<slug>/
├── README.md
├── inspection/
│   └── <slug>.json
├── spec/
│   └── website-rebuild-spec.md
└── implementation/
    ├── README.md
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── globals.css
        │   └── page.tsx
        ├── components/
        └── data/
            └── page-content.ts
```

When browser capture is healthy, runs can also include screenshots and richer inspection artifacts.

## Example run

A more realistic public demo run was generated against `https://vercel.com/ai`.

That run produced:

- inspection metadata
- rebuild spec
- first-pass implementation scaffold
- structured content data for follow-up iteration

See `docs/EXAMPLE-RUNS.md` for details.

## Included scripts

- `scripts/run-complete.js` — one-command entry point for analysis + scaffold generation
- `scripts/analyze-website.js` — inspect one URL and generate the analysis package
- `scripts/scaffold-implementation.js` — generate a first-pass implementation scaffold from an existing run
- `scripts/init-run.sh` — initialize a run folder skeleton

## Design principles

### 1. Spec-first, not hype-first
The skill writes down what it found and what should be rebuilt before pretending the page is “done.”

### 2. Graceful degradation
If browser automation fails, the workflow falls back to HTTP extraction instead of stopping completely.

### 3. Workspace-native output
Everything is written into the OpenClaw workspace in a recoverable structure.

### 4. Honest scaffolding
The generated implementation is intentionally shallow but usable. It is a starting point for real reconstruction, not a fake claim of finished fidelity.

## Best fit

This skill is strongest for:

- landing pages
- marketing sites
- brochure sites
- simple public homepages
- early-stage reverse-engineering and rebuild planning

It is weaker for:

- authenticated apps
- dashboards
- animation-heavy experiences
- pages that depend on deep client-side behavior
- pixel-perfect cloning without working browser inspection

## Browser setup

Full screenshot-rich inspection still depends on Playwright host libraries being present in the container.

See `docs/BROWSER-SETUP.md` for the current state and one-shot fix path.

## Current limitations

- Full browser capture still depends on a healthy Playwright + system library setup
- Without browser capture, screenshots and interaction behavior are unavailable
- Generated implementation is a first-pass scaffold, not a final clone
- Complex visual systems still require deeper extraction and manual refinement

## Status

Current state:

- usable for structured analysis and scaffold generation
- resilient when browser automation is unavailable
- still limited by the current Playwright host setup for screenshot-rich runs

## Roadmap

Planned upgrades:

- restore full browser inspection in this environment
- improve section extraction quality
- generate richer component scaffolds
- extract more assets and structure from the target site
- push the scaffold closer to a real first-pass rebuild

## Philosophy

This skill follows one rule:

**never leave a website-clone task empty-handed**

Even when browser automation is unavailable, a run should still leave behind:

- a structured run folder
- inspection metadata
- a rebuild spec
- a starter implementation

That makes the workflow resumable, debuggable, and useful in real OpenClaw sessions.
