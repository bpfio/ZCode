#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkgDir = path.resolve(root, "dist/npm-package/zcode");
const pkgJsonPath = path.join(pkgDir, "package.json");

if (!fs.existsSync(pkgJsonPath)) {
  throw new Error(`Package manifest not found: ${pkgJsonPath}`);
}

const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const nmDir = path.join(pkgDir, "node_modules");
const bundled = [];

if (fs.existsSync(nmDir)) {
  for (const item of fs.readdirSync(nmDir)) {
    if (item.startsWith(".")) continue;
    if (item.startsWith("@")) {
      const scopeDir = path.join(nmDir, item);
      for (const sub of fs.readdirSync(scopeDir)) {
        bundled.push(`${item}/${sub}`);
      }
    } else {
      bundled.push(item);
    }
  }
}

pkg.name = "@bpfio-yp/zcode";
pkg.version = "3.16.3";
pkg.private = false;
pkg.description = "Official full-featured ZCode AI Coding Workbench (TUI, Web & Agent Runtime)";
// npm 11+ 要求 bin 相对路径不能以 ./ 开头，否则会在 publish 阶段被自动剥离
pkg.bin = { zcode: "bin/zcode.mjs" };
pkg.main = "./bin/zcode.mjs";
pkg.bundleDependencies = bundled;
pkg.publishConfig = { access: "public" };

fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`[npm-prepare] updated ${pkgJsonPath} with ${bundled.length} bundled dependencies`);

const readmePath = path.join(pkgDir, "README.md");
fs.writeFileSync(
  readmePath,
  `# ZCode (@bpfio-yp/zcode)

Official full-featured distribution of ZCode AI Coding Workbench.

## Features

- **Interactive TUI**: Full-screen terminal interface with turn state, diff preview, and streaming responses.
- **Web Interface**: \`zcode --web\` starts a rich browser-based AI workspace.
- **Agent CLI**: Non-interactive command line prompt executions with MCP, skills, and tools.

## Installation

\`\`\`bash
npm install -g @bpfio-yp/zcode
\`\`\`

## Quick Start

\`\`\`bash
# Launch interactive TUI
zcode

# Launch browser web workspace
zcode --web

# Run headless prompt
zcode --prompt "Summarize recent commits" --mode yolo
\`\`\`
`,
);
console.log(`[npm-prepare] created README.md in ${pkgDir}`);

const binFile = path.join(pkgDir, "bin/zcode.mjs");
if (fs.existsSync(binFile)) {
  fs.chmodSync(binFile, 0o755);
  console.log(`[npm-prepare] ensured executable bit on ${binFile}`);
}
