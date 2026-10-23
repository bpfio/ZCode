import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { existsSync } from "node:fs";

export async function runWorktreeCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const subAction = args[0] ?? "list";

  try {
    if (subAction === "list") {
      const output = execSync("git worktree list", { encoding: "utf-8" });
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", worktrees: output.trim().split("\n") }) + "\n");
        return 0;
      }
      ctx.stdout.write("=== ZCode Git Worktree 隔离工作树清单 ===\n");
      ctx.stdout.write(output);
      return 0;
    }

    if (subAction === "create" || subAction === "add") {
      const name = args[1] || `agent-sandbox-${Date.now().toString(36)}`;
      const targetDir = join(process.cwd(), ".worktrees", name);
      ctx.stdout.write(`正在为子 Agent 创建独立的 Git Worktree 沙箱: ${name}...\n`);
      execSync(`git worktree add -b ${name} ${targetDir}`, { stdio: "inherit" });
      ctx.stdout.write(`✅ 隔离沙箱已就绪！子代理在该分支的代码改动 0 污染主开发分支。\n路径: ${targetDir}\n`);
      return 0;
    }

    if (subAction === "clean" || subAction === "prune") {
      ctx.stdout.write("正在回收并清理已完工的临时 Worktree 沙箱...\n");
      execSync("git worktree prune", { stdio: "inherit" });
      ctx.stdout.write("✅ 清理完成！\n");
      return 0;
    }

    ctx.stdout.write("用法:\n  zcode worktree list           列出当前活跃的 Worktree 隔离沙箱\n  zcode worktree create [名称]  创建用于独立子任务开发的临时 Worktree\n  zcode worktree clean          回收清理已合并的临时工作树\n");
    return 0;
  } catch (err: any) {
    ctx.stderr.write(`Worktree 沙箱操作失败: ${err.message}\n`);
    return 1;
  }
}
