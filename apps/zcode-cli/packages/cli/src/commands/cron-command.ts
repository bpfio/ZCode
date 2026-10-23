import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

interface CronJobItem {
  id: string;
  cron: string;
  prompt: string;
  createdAt: number;
  lastRun?: number;
}

export async function runCronCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const subAction = args[0] ?? "list";
  const cronStoreDir = join(homedir(), ".zcode", "cron");
  const cronStoreFile = join(cronStoreDir, "jobs.json");

  if (!existsSync(cronStoreDir)) {
    mkdirSync(cronStoreDir, { recursive: true });
  }

  let jobs: CronJobItem[] = [];
  if (existsSync(cronStoreFile)) {
    try {
      jobs = JSON.parse(readFileSync(cronStoreFile, "utf-8"));
    } catch {}
  }

  if (subAction === "list") {
    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", jobs }) + "\n");
      return 0;
    }
    ctx.stdout.write("=== ZCode 自动化定时任务列表 (Cron Jobs) ===\n");
    if (jobs.length === 0) {
      ctx.stdout.write("当前暂无活跃的定时任务。运行 'zcode cron add \"<cron>\" \"<prompt>\"' 创建新任务。\n");
      return 0;
    }
    for (const job of jobs) {
      const last = job.lastRun ? new Date(job.lastRun).toLocaleString() : "从未执行";
      ctx.stdout.write(`• [${job.id}] ${job.cron} -> "${job.prompt}" (上次执行: ${last})\n`);
    }
    return 0;
  }

  if (subAction === "add") {
    const cronExpr = args[1];
    const prompt = args.slice(2).join(" ");
    if (!cronExpr || !prompt) {
      ctx.stderr.write("用法: zcode cron add \"<5位cron表达式>\" \"<任务提示词>\"\n示例: zcode cron add \"0 2 * * *\" \"运行全量集成测试并生成报告\"\n");
      return 1;
    }
    const id = `job-${Date.now().toString(36)}`;
    jobs.push({ id, cron: cronExpr, prompt, createdAt: Date.now() });
    writeFileSync(cronStoreFile, JSON.stringify(jobs, null, 2), "utf-8");
    ctx.stdout.write(`✅ 定时任务创建成功 [${id}]！将在调度周期内自动唤醒 Agent 执行。\n`);
    return 0;
  }

  if (subAction === "remove" || subAction === "rm") {
    const id = args[1];
    if (!id) {
      ctx.stderr.write("请指定要删除的任务 ID: zcode cron remove <job_id>\n");
      return 1;
    }
    jobs = jobs.filter((j) => j.id !== id);
    writeFileSync(cronStoreFile, JSON.stringify(jobs, null, 2), "utf-8");
    ctx.stdout.write(`✅ 定时任务 [${id}] 已注销。\n`);
    return 0;
  }

  ctx.stdout.write("用法:\n  zcode cron list                     列出所有定时任务\n  zcode cron add \"<cron>\" \"<prompt>\"  添加新的自动化定时任务\n  zcode cron remove <ID>              删除指定定时任务\n");
  return 0;
}
