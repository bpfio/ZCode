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

// 动态版本号逻辑：
// 1. 如果环境变量指定了 ZCODE_RELEASE_VERSION，则以此为准；
// 2. 否则读取基础版本（默认 3.16.5）；
// 3. 校验 npm 线上版本：若该基础版本已存在于 npm，则自动自增 patch（例如 3.16.5 -> 3.16.6），
//    确保 CI 无人值守推送时永远具备发布能力，无需人工频繁手动改动代码。
let releaseVersion = process.env.ZCODE_RELEASE_VERSION;
if (!releaseVersion) {
  const baseVersion = "3.16.5";
  try {
    const { execSync } = await import("node:child_process");
    const published = execSync("npm view @clid/zcode version", {
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (published === baseVersion || (published && /^\d+\.\d+\.\d+$/.test(published))) {
      const parts = (published === baseVersion ? baseVersion : published).split(".").map(Number);
      parts[2] += 1;
      releaseVersion = parts.join(".");
    } else {
      releaseVersion = baseVersion;
    }
  } catch {
    releaseVersion = baseVersion;
  }
}

pkg.name = "@clid/zcode";
pkg.version = releaseVersion;
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
  `# ZCode (@clid/zcode)

Official full-featured distribution of ZCode AI Coding Workbench.

## Features

- **Interactive TUI**: Full-screen terminal interface with turn state, diff preview, and streaming responses.
- **Web Interface**: \`zcode --web\` starts a rich browser-based AI workspace.
- **Agent CLI**: Non-interactive command line prompt executions with MCP, skills, and tools.

## Installation

\`\`\`bash
npm install -g @clid/zcode
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
