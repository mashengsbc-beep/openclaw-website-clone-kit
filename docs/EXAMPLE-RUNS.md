# Example Runs

## Vercel AI demo

A representative public demo was generated against:

- URL: `https://vercel.com/ai`

Two run variants now exist:

### 1. Fallback-safe run
- Run slug: `vercel-ai-demo`
- Result: analysis package + first-pass implementation scaffold
- Capture mode: `http-fallback`

### 2. Browser-backed run
- Run slug: `vercel-ai-demo-browser`
- Result: analysis package + screenshot + first-pass implementation scaffold
- Capture mode: `browser`

### Observed output

The run produced:

- inspection metadata
- rebuild spec
- implementation scaffold
- structured page content data

### Notable extracted sections

- Deploy AI at the speed of frontend
- AI Cloud
- Build applications with AI
- AI SDK
- AI Gateway
- Vercel Agent
- Sandbox
- Core Platform
- CI/CD
- Content Delivery

### Why this example matters

This is a better showcase than `example.com` because it resembles a modern public AI landing page with multiple sections and clearer marketing structure.

### Current caveat

The browser-backed path is working now, but the project still keeps the fallback-safe path because browser dependencies can break again in new environments.
