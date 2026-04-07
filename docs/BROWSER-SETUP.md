# Browser Setup

Full browser capture for this skill depends on both:

1. Playwright browser binaries
2. required host system libraries

## Current state in this environment

The Chromium binaries were installed, but browser launch still fails because the container is missing required shared libraries such as:

- `libnspr4`
- `libnss3`
- `libatk1.0-0`
- `libdbus-1-3`
- `libatspi2.0-0`
- `libxcomposite1`
- `libxdamage1`
- `libxfixes3`
- `libxrandr2`
- `libgbm1`
- `libxkbcommon0`
- `libasound2`

## One-shot fix script

A prepared fix script exists at:

`/home/node/OpenClawBox/deliveries/website-clone-runs/PLAYWRIGHT_FIX_COMMAND.sh`

It installs the required Debian packages and then reinstalls Chromium for the existing browser-lab workspace.

## After fixing

Re-run:

```bash
node /home/node/OpenClawBox/skills/openclaw-website-clone-kit/scripts/run-complete.js \
  --url "https://vercel.com/ai" \
  --slug vercel-ai-demo-browser
```

At that point the run should produce richer inspection artifacts, including screenshots.
