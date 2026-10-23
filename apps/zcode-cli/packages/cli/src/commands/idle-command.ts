import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runIdleCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();
  const subAction = args[0] ?? "status";

  try {
    if (subAction === "status") {
      ctx.stdout.write("正在查询智谱低峰闲时免费算力余量与门票状态...\n");
      const status = await client.getOffPeakStatus();
      if (options.json) {
        ctx.stdout.write(formatJson({ result: "success", data: status }) + "\n");
        return 0;
      }
      ctx.stdout.write("=== 智谱闲时免费算力队列 ===\n");
      ctx.stdout.write(`当前排队状态: ${status?.data?.state || "可用 (Available)"}\n`);
      ctx.stdout.write(`免计费窗口: 每日夜间与低峰期\n`);
      ctx.stdout.write("提示: 使用 'zcode idle queue <prompt>' 可将批次任务提交至闲时队列，0 付费 Token 消耗。\n");
      return 0;
    }

    if (subAction === "queue") {
      const promptArg = args.slice(1).join(" ");
      ctx.stdout.write(`正在取号并向闲时队列投递长周期任务: "${promptArg || "默认自动化任务"}"...\n`);
      const ticket = await client.requestOffPeakTicket();
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", ticket }) + "\n");
        return 0;
      }
      ctx.stdout.write(`🎟️ 门票领取成功 [${ticket?.data?.ticket_id || "TICKET-AUTO"}]！任务已进入无人值守闲时调度，将在低峰期自动执行。\n`);
      return 0;
    }

    ctx.stdout.write("用法:\n  zcode idle status             查询闲时免费算力状态\n  zcode idle queue <任务描述>   投递无人值守闲时排队任务 (0 Token 消耗)\n");
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`闲时队列操作失败: ${err.message}\n`);
    }
    return 1;
  }
}
