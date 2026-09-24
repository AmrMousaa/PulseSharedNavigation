#!/usr/bin/env node
// One-command setup for Pulse Shared Navigation. Run from a Code App's root:
//   npx github:AmrMousaa/PulseSharedNavigation
// It installs the package and wraps <App /> in src/main.tsx with <PulseShell>.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE = 'github:AmrMousaa/PulseSharedNavigation';
const cwd = process.cwd();
const skipInstall = process.argv.includes('--skip-install');

const ok = (msg) => console.log(`\x1b[32m✔\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m!\x1b[0m ${msg}`);
const fail = (msg) => {
  console.error(`\x1b[31m✖\x1b[0m ${msg}`);
  process.exit(1);
};

console.log('\nPulse Shared Navigation — setup\n');

// 1. Must be run from the app root.
if (!existsSync(join(cwd, 'package.json'))) {
  fail('No package.json here. Run this from your Code App folder (where package.json is).');
}

// 2. The Dataverse connector must already be added (it generates this service).
const servicePath = join(cwd, 'src', 'generated', 'services', 'MicrosoftDataverseService.ts');
if (!existsSync(servicePath)) {
  fail(
    'Microsoft Dataverse connector not found (src/generated/services/MicrosoftDataverseService.ts).\n' +
      '  Add it first, then run this again:\n' +
      '    pac code add-data-source -a shared_commondataserviceforapps -c <your-dataverse-connection-id>'
  );
}
ok('Microsoft Dataverse connector found');

// 3. Read this app's Power Apps id so the sidebar can highlight it.
let powerAppId;
const powerConfigPath = join(cwd, 'power.config.json');
if (existsSync(powerConfigPath)) {
  try {
    powerAppId = JSON.parse(readFileSync(powerConfigPath, 'utf8')).appId || undefined;
  } catch {
    // Not fatal: the sidebar just won't highlight the current app.
  }
}
if (powerAppId) ok(`App id ${powerAppId} (from power.config.json)`);
else
  warn(
    'No appId in power.config.json yet — the sidebar works, but won\'t highlight this app.\n' +
      '  After your first `pac code push`, add powerAppId="<appId>" to <PulseShell> in main.tsx.'
  );

// 4. Install the package.
if (!skipInstall) {
  console.log(`\nInstalling ${PACKAGE} ...`);
  try {
    execSync(`npm install ${PACKAGE}`, { cwd, stdio: 'inherit' });
  } catch {
    fail('npm install failed. Check you have access to the GitHub repo, then try again.');
  }
  ok('Package installed');
}

// 5. Wrap <App /> in src/main.tsx.
const mainPath = ['src/main.tsx', 'src/main.jsx', 'src/index.tsx'].map((p) => join(cwd, p)).find(existsSync);
const appIdAttr = powerAppId ? ` powerAppId="${powerAppId}"` : '';
const snippet = `import { PulseShell } from 'pulse-shared-navigation';
import { MicrosoftDataverseService } from './generated/services/MicrosoftDataverseService';

<PulseShell dataverse={MicrosoftDataverseService}${appIdAttr}>
  <App />
</PulseShell>`;

function manual(reason) {
  warn(`${reason}\n  Add this yourself around your root component:\n\n${snippet.replace(/^/gm, '    ')}\n`);
  process.exit(0);
}

if (!mainPath) manual('Could not find src/main.tsx.');

let source = readFileSync(mainPath, 'utf8');
if (source.includes('PulseShell')) {
  ok('main.tsx already uses <PulseShell> — nothing to change');
  process.exit(0);
}

const appTag = /<App\s*\/>/;
if (!appTag.test(source)) manual('Could not find <App /> in main.tsx.');

const eol = source.includes('\r\n') ? '\r\n' : '\n';
const imports =
  `import { PulseShell } from 'pulse-shared-navigation';${eol}` +
  `import { MicrosoftDataverseService } from './generated/services/MicrosoftDataverseService';${eol}`;

// Insert the imports after the last top-level import statement (which may
// span several lines, e.g. `import {\n  a,\n} from 'x'`).
const importMatches = [...source.matchAll(/^import\b[\s\S]*?['"][^'"\r\n]+['"];?[ \t]*$/gm)];
if (importMatches.length) {
  const last = importMatches[importMatches.length - 1];
  const at = last.index + last[0].length;
  source = source.slice(0, at) + eol + imports.trimEnd() + source.slice(at);
} else {
  source = imports + source;
}

source = source.replace(appTag, `<PulseShell dataverse={MicrosoftDataverseService}${appIdAttr}><App /></PulseShell>`);
writeFileSync(mainPath, source);
ok(`Added <PulseShell> to ${mainPath.slice(cwd.length + 1)}`);

console.log('\nDone! Run your app (npm run dev) — the Pulse sidebar is on the left.\n');
