#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

function safeComponentName(text, index) {
  const base = String(text || `Section ${index + 1}`)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');
  return base ? `${base}Section` : `Section${index + 1}`;
}

function extractSectionsFromSpec(specText) {
  const lines = String(specText || '').split(/\r?\n/);
  const sections = [];
  let inSectionInventory = false;
  for (const line of lines) {
    if (/^## Section Inventory/.test(line)) {
      inSectionInventory = true;
      continue;
    }
    if (inSectionInventory && /^## /.test(line)) break;
    if (inSectionInventory) {
      const m = line.match(/^- Section \d+:\s*(.+)$/);
      if (m) sections.push(m[1].trim());
    }
  }
  return sections;
}

function splitTextPreview(textPreview, fallbackSections) {
  const lines = String(textPreview || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
  return fallbackSections.map((section, index) => ({
    title: section,
    body: lines[index + 1] || 'Replace with extracted copy and real layout details after deeper inspection.'
  }));
}

function main() {
  const runDir = arg('--run-dir');
  if (!runDir) {
    console.error('usage: scaffold-implementation.js --run-dir <run-dir>');
    process.exit(1);
  }

  const specPath = path.join(runDir, 'spec', 'website-rebuild-spec.md');
  const inspectionDir = path.join(runDir, 'inspection');
  const metaFiles = fs.existsSync(inspectionDir)
    ? fs.readdirSync(inspectionDir).filter(f => f.endsWith('.json'))
    : [];
  const metaPath = metaFiles.length ? path.join(inspectionDir, metaFiles[0]) : null;

  const specText = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf8') : '';
  const meta = metaPath && fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
  const sections = extractSectionsFromSpec(specText);
  const sectionData = splitTextPreview(meta.textPreview || '', sections);

  const implDir = path.join(runDir, 'implementation');
  const srcDir = path.join(implDir, 'src');
  const componentsDir = path.join(srcDir, 'components');
  const appDir = path.join(srcDir, 'app');
  const dataDir = path.join(srcDir, 'data');
  fs.mkdirSync(componentsDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const componentNames = sections.map((s, i) => safeComponentName(s, i));

  const sharedSection = `export type SectionContent = {\n  eyebrow: string;\n  title: string;\n  body: string;\n};\n\ntype GenericSectionProps = {\n  content: SectionContent;\n};\n\nexport function GenericSection({ content }: GenericSectionProps) {\n  return (\n    <section className=\"border-b border-neutral-200 px-6 py-12\">\n      <div className=\"mx-auto max-w-4xl\">\n        <p className=\"mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500\">{content.eyebrow}</p>\n        <h2 className=\"mb-4 text-3xl font-semibold text-neutral-900\">{content.title}</h2>\n        <p className=\"max-w-2xl text-base leading-7 text-neutral-600\">{content.body}</p>\n      </div>\n    </section>\n  );\n}\n`;
  fs.writeFileSync(path.join(componentsDir, 'GenericSection.tsx'), sharedSection);

  sections.forEach((section, i) => {
    const componentName = componentNames[i];
    const filePath = path.join(componentsDir, `${componentName}.tsx`);
    const content = `import { GenericSection, type SectionContent } from './GenericSection';\n\ntype ${componentName}Props = {\n  content: SectionContent;\n};\n\nexport function ${componentName}({ content }: ${componentName}Props) {\n  return <GenericSection content={content} />;\n}\n`;
    fs.writeFileSync(filePath, content);
  });

  const contentTs = `export const pageContent = ${JSON.stringify({
    title: meta.title || 'Website Clone Scaffold',
    sourceUrl: meta.finalUrl || '',
    sections: sectionData.map((item, i) => ({
      eyebrow: `Section ${i + 1}`,
      title: item.title,
      body: item.body
    }))
  }, null, 2)} as const;\n`;
  fs.writeFileSync(path.join(dataDir, 'page-content.ts'), contentTs);

  const imports = componentNames.map(name => `import { ${name} } from '../components/${name}';`).join('\n');
  const renderLines = componentNames.map((name, i) => `      <${name} content={pageContent.sections[${i}]} />`).join('\n');
  const pageTsx = `import React from 'react';\n${imports}\nimport { pageContent } from '../data/page-content';\n\nexport default function Page() {\n  return (\n    <main className=\"min-h-screen bg-white text-neutral-900\">\n      <section className=\"border-b border-neutral-200 px-6 py-20\">\n        <div className=\"mx-auto max-w-4xl\">\n          <p className=\"mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500\">First-pass clone scaffold</p>\n          <h1 className=\"mb-4 text-5xl font-semibold\">{pageContent.title}</h1>\n          <p className=\"max-w-2xl text-lg leading-8 text-neutral-600\">\n            Source: {pageContent.sourceUrl}\n          </p>\n        </div>\n      </section>\n${renderLines}\n    </main>\n  );\n}\n`;
  fs.writeFileSync(path.join(appDir, 'page.tsx'), pageTsx);

  const css = `@import "tailwindcss";\n\n:root {\n  color-scheme: light;\n}\n\nhtml, body {\n  margin: 0;\n  padding: 0;\n  font-family: Inter, ui-sans-serif, system-ui, sans-serif;\n  background: #ffffff;\n  color: #171717;\n}\n\n* {\n  box-sizing: border-box;\n}\n`; 
  fs.writeFileSync(path.join(appDir, 'globals.css'), css);

  const packageJson = {
    name: path.basename(runDir),
    private: true,
    version: '0.1.0',
    scripts: {
      dev: 'next dev',
      build: 'next build'
    },
    dependencies: {
      next: '^16.2.1',
      react: '^19.2.0',
      'react-dom': '^19.2.0'
    },
    devDependencies: {
      tailwindcss: '^4.1.0',
      typescript: '^5.0.0',
      '@types/react': '^19.0.0',
      '@types/node': '^24.0.0'
    }
  };
  fs.writeFileSync(path.join(implDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(path.join(implDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['dom', 'dom.iterable', 'es2022'],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }]
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
    exclude: ['node_modules']
  }, null, 2));
  fs.writeFileSync(path.join(implDir, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
  fs.writeFileSync(path.join(implDir, 'next.config.ts'), 'import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n');
  fs.writeFileSync(path.join(implDir, 'README.md'), `# Implementation Scaffold\n\nThis is a first-pass implementation scaffold generated from:\n- ${specPath}\n- ${metaPath || '(no inspection json found)'}\n\n## Generated sections\n${sections.map((s, i) => `- ${i + 1}. ${s}`).join('\n') || '- none'}\n\n## Notes\n- This scaffold is intentionally lightweight but now includes structured content data.\n- Replace placeholder layout/styling with extracted real design details after deeper inspection.\n- Browser capture is still preferred when available.\n`);

  console.log(JSON.stringify({
    ok: true,
    runDir,
    implementationDir: implDir,
    generatedSections: sections.length,
    files: [
      path.join(appDir, 'page.tsx'),
      path.join(appDir, 'globals.css'),
      path.join(dataDir, 'page-content.ts'),
      path.join(componentsDir, 'GenericSection.tsx'),
      path.join(implDir, 'package.json'),
      path.join(implDir, 'README.md')
    ]
  }, null, 2));
}

main();
