#!/usr/bin/env node
const { execFileSync } = require('child_process');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

const url = arg('--url');
if (!url) {
  console.error('usage: run-complete.js --url <url> [--slug <slug>]');
  process.exit(1);
}
const slug = arg('--slug');

const args = ['/home/node/OpenClawBox/skills/openclaw-website-clone-kit/scripts/analyze-website.js', '--url', url];
if (slug) args.push('--slug', slug);
execFileSync('node', args, { stdio: 'inherit' });
