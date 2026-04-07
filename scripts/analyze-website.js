#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync } = require('child_process');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `site-${Date.now()}`;
}

function extractSections(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => s.length >= 3)
    .filter(s => s.length <= 120);

  const seen = new Set();
  const uniq = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(line);
    if (uniq.length >= 18) break;
  }
  return uniq;
}

function inferCandidate(finalUrl, text) {
  const lower = `${finalUrl}\n${text}`.toLowerCase();
  if (/dashboard|workspace|settings|billing|analytics|sign in|log in/.test(lower)) {
    return 'good candidate for partial reconstruction';
  }
  if (/pricing|features|testimonials|hero|contact|about|blog/.test(lower)) {
    return 'good candidate for local rebuild';
  }
  return 'learn-from-only, not ideal for direct cloning';
}

function inferStyleNotes(text) {
  const notes = [];
  const lower = String(text || '').toLowerCase();
  if (/ai|automation|agent/.test(lower)) notes.push('Likely modern SaaS/AI marketing style.');
  if (/pricing|enterprise|demo/.test(lower)) notes.push('Likely conversion-oriented landing page structure.');
  if (/blog|article|read more/.test(lower)) notes.push('May include editorial/content-driven sections.');
  if (!notes.length) notes.push('Requires screenshot review for stronger visual/style judgment.');
  return notes;
}

function fetchUrl(targetUrl, redirectCount = 0, insecure = false) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }
    const isHttps = targetUrl.startsWith('https:');
    const mod = isHttps ? https : http;
    const req = mod.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (OpenClaw Website Clone Kit)'
      },
      rejectUnauthorized: insecure ? false : true
    }, res => {
      const statusCode = res.statusCode || 0;
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        const redirected = new URL(res.headers.location, targetUrl).toString();
        res.resume();
        fetchUrl(redirected, redirectCount + 1, insecure).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ finalUrl: targetUrl, html: data, statusCode, insecure }));
    });
    req.on('error', reject);
  });
}

function curlFetch(targetUrl, insecure = false) {
  const args = ['-L', '--max-redirs', '5', '-A', 'Mozilla/5.0 (OpenClaw Website Clone Kit)', '-sS'];
  if (insecure) args.push('-k');
  args.push(targetUrl);
  const html = execFileSync('curl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return { finalUrl: targetUrl, html, statusCode: 200, insecure, via: 'curl' };
}

async function robustFetch(targetUrl) {
  try {
    return await fetchUrl(targetUrl, 0, false);
  } catch (e1) {
    try {
      return await fetchUrl(targetUrl, 0, true);
    } catch (e2) {
      try {
        return curlFetch(targetUrl, false);
      } catch (e3) {
        return curlFetch(targetUrl, true);
      }
    }
  }
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function extractTitle(html) {
  const m = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function createSpec({ url, meta, mode }) {
  const sections = extractSections(meta.textPreview || '');
  const verdict = inferCandidate(meta.finalUrl || url, meta.textPreview || '');
  const styleNotes = inferStyleNotes(meta.textPreview || '');
  const inspectedAt = new Date().toISOString();
  const screenshotLine = meta.screenshot || '(not available in fallback mode)';

  const spec = `# Website Rebuild Spec\n\n## Target\n- URL: ${url}\n- Final URL: ${meta.finalUrl || url}\n- Date inspected: ${inspectedAt}\n- Goal: Initial website clone analysis and rebuild planning\n- Fidelity target: Close visual reconstruction unless upgraded after deeper inspection\n- Capture mode: ${mode}\n\n## Summary\n- Page title: ${meta.title || '(unknown)'}\n- Initial verdict: ${verdict}\n- Screenshot: ${screenshotLine}\n- What the page appears to be: ${sections.slice(0, 3).join(' / ') || 'Needs deeper manual inspection'}\n\n## Section Inventory\n${sections.length ? sections.map((s, i) => `- Section ${i + 1}: ${s}`).join('\n') : '- No reliable section inventory extracted from text preview alone.'}\n\n## Style Notes\n${styleNotes.map(n => `- ${n}`).join('\n')}\n- Needs screenshot review for typography, palette, spacing, and motion specifics.\n\n## Assets\n- Screenshot captured locally: ${screenshotLine}\n- Further asset extraction not yet performed in this first pass.\n\n## Proposed Implementation\n- Suggested stack: Next.js or static HTML/CSS depending on requested depth\n- Suggested folder structure:\n  - inspection/\n  - spec/\n  - implementation/\n- First-pass components should follow visible homepage sections from the inventory above.\n\n## Risks / Gaps\n- This first-pass spec is based on one browser capture or fallback HTTP text extraction.\n- Interactions, responsive behavior, exact assets, and exact design tokens are not yet fully extracted.\n- Legal/brand reuse must still be judged separately if copying non-owned sites.\n\n## Recommended Next Step\n- Do deeper browser inspection if pixel-focused cloning is required.\n- Otherwise scaffold a local implementation and recreate the top-level layout first.\n`;

  return { spec, verdict };
}

async function main() {
  const url = arg('--url');
  if (!url) {
    console.error('usage: analyze-website.js --url <url> [--slug <slug>]');
    process.exit(1);
  }

  const slug = arg('--slug', slugify(url));
  const base = `/home/node/OpenClawBox/deliveries/website-clone-runs/${slug}`;
  const inspectionDir = path.join(base, 'inspection');
  const specDir = path.join(base, 'spec');
  const implementationDir = path.join(base, 'implementation');
  fs.mkdirSync(inspectionDir, { recursive: true });
  fs.mkdirSync(specDir, { recursive: true });
  fs.mkdirSync(implementationDir, { recursive: true });

  const browserScript = '/home/node/OpenClawBox/skills/docker-browser-operator/scripts/browse.js';
  const metaPath = path.join(inspectionDir, `${slug}.json`);

  let meta;
  let mode = 'browser';
  let browserError = null;

  try {
    execFileSync('node', [browserScript, '--url', url, '--slug', slug, '--out-dir', inspectionDir], { stdio: 'pipe' });
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (err) {
    mode = 'http-fallback';
    browserError = err && err.message ? err.message : String(err);
    const fetched = await robustFetch(url);
    meta = {
      url,
      finalUrl: fetched.finalUrl || url,
      title: extractTitle(fetched.html || ''),
      screenshot: null,
      textPreview: htmlToText(fetched.html || '').slice(0, 4000),
      fallback: true,
      statusCode: fetched.statusCode || 0,
      insecure: !!fetched.insecure,
      via: fetched.via || 'node-http',
      browserError
    };
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  }

  const { spec, verdict } = createSpec({ url, meta, mode });
  const specPath = path.join(specDir, 'website-rebuild-spec.md');
  const readmePath = path.join(base, 'README.md');
  fs.writeFileSync(specPath, spec);
  fs.writeFileSync(readmePath, `# Website Clone Run: ${slug}\n\n- URL: ${url}\n- Final URL: ${meta.finalUrl || url}\n- Title: ${meta.title || '(unknown)'}\n- Mode: ${mode}\n- Inspection JSON: ${metaPath}\n- Screenshot: ${meta.screenshot || '(not available in fallback mode)'}\n- Spec: ${specPath}\n`);

  let scaffolded = false;
  let scaffoldError = null;
  try {
    const scaffoldScript = '/home/node/OpenClawBox/skills/openclaw-website-clone-kit/scripts/scaffold-implementation.js';
    execFileSync('node', [scaffoldScript, '--run-dir', base], { stdio: 'pipe' });
    scaffolded = true;
  } catch (err) {
    scaffoldError = err && err.message ? err.message : String(err);
  }

  console.log(JSON.stringify({
    ok: true,
    slug,
    base,
    inspectionDir,
    screenshot: meta.screenshot || null,
    metaPath,
    specPath,
    readmePath,
    title: meta.title || null,
    finalUrl: meta.finalUrl || url,
    verdict,
    mode,
    browserError,
    fallbackTransport: meta.via || null,
    insecure: !!meta.insecure,
    scaffolded,
    scaffoldError
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error && error.stack ? error.stack : String(error) }, null, 2));
  process.exit(1);
});
