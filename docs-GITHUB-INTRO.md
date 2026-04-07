# OpenClaw Website Clone Kit

## A practical website analysis and rebuild skill for OpenClaw

OpenClaw Website Clone Kit turns a public URL into a structured rebuild task.

Instead of pretending to perfectly clone any website in one shot, it works in a staged and recoverable way:

- inspect the target
- capture evidence
- generate a rebuild brief
- scaffold a local implementation
- keep going even when browser automation is unavailable

That makes it more useful in real OpenClaw environments, where browser access, system dependencies, and permissions may vary.

## Highlights

- one-command complete run entrypoint
- fallback-safe analysis workflow
- rebuild spec generation
- first-pass implementation scaffold generation
- structured output in `deliveries/website-clone-runs/<slug>/`
- content-data generation for follow-up iteration

## How it works

A complete run attempts browser capture first. If the browser stack is currently unavailable, it falls back to HTTP-based extraction and still produces:

- inspection metadata
- rebuild spec
- starter implementation scaffold

This means the task keeps moving instead of failing empty.

## Intended use

Best for:
- landing pages
- marketing sites
- public brochure sites
- website rebuild planning
- reverse-engineering structure before implementation

Less suited for:
- authenticated apps
- dashboards
- animation-heavy experiences
- exact pixel-perfect recreation without browser inspection

## Current status

The skill is already usable for structured analysis and scaffold generation.

The main remaining environment-dependent upgrade is restoring full browser capture by completing Playwright host dependencies in this container.
