import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { get } from "node:https";
import { spawn } from "node:child_process";

const PACKAGE_NAME = "@clid/zcode";
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;

declare const __CLI_VERSION__: string | undefined;

function fetchLatestVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const req = get(NPM_REGISTRY_URL, { timeout: 4000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      let rawData = "";
      res.on("data", (chunk) => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(typeof parsed.version === "string" ? parsed.version : null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

export async function runUpgradeCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const currentVersion = process.env.ZCODE_CLI_VERSION || (typeof __CLI_VERSION__ === "string" && !__CLI_VERSION__.startsWith("0.") ? __CLI_VERSION__ : "3.16.4");
  const checkOnly = args.includes("check") || args.includes("--check") || args.includes("status") || args.includes("-c");

  ctx.stdout.write("=== ZCode CLI 自动化版本与升级中心 ===\n");
  ctx.stdout.write(`当前本地版本: v${currentVersion}\n`);
  ctx.stdout.write("正在检查 NPM 官方注册表最新版本...\n");

  const latestVersion = await fetchLatestVersion();

  if (!latestVersion) {
    ctx.stdout.write("⚠️ 无法连接到 NPM 注册表或获取版本信息失败。请检查网络连接或稍后重试。\n");
    ctx.stdout.write(`您也可以手动执行命令更新: npm install -g ${PACKAGE_NAME}@latest\n`);
    return 0;
  }

  ctx.stdout.write(`远端最新版本: v${latestVersion}\n\n`);

  if (currentVersion === latestVersion) {
    ctx.stdout.write(`✔ 当前本地已是最新版本 (v${currentVersion})，无需升级。\n`);
    return 0;
  }

  if (checkOnly) {
    ctx.stdout.write(`💡 发现新版本: v${latestVersion} (当前: v${currentVersion})\n`);
    ctx.stdout.write("运行 'zcode upgrade' 即可执行自动更新。\n");
    return 0;
  }

  ctx.stdout.write(`🚀 正在通过 NPM 全局更新 ${PACKAGE_NAME} 至最新版本 (v${latestVersion})...\n`);

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["install", "-g", `${PACKAGE_NAME}@latest`], {
    stdio: "inherit",
    shell: true,
  });

  const exitCode = await new Promise<number>((resolve) => {
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", (err) => {
      ctx.stderr.write(`执行升级命令失败: ${err.message}\n`);
      resolve(1);
    });
  });

  if (exitCode === 0) {
    ctx.stdout.write(`\n🎉 ZCode CLI 已成功升级至 v${latestVersion}！\n`);
    ctx.stdout.write("请重新运行 'zcode --version' 验证。\n");
  } else {
    ctx.stdout.write(`\n⚠️ 自动升级过程中退出码为 ${exitCode}。如果权限不足，请尝试:\n`);
    ctx.stdout.write(`sudo npm install -g ${PACKAGE_NAME}@latest\n`);
  }

  return exitCode;
}
