import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runResetCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const subAction = args[0] ?? "status";
  const client = new CodingPlanClient();

  try {
    if (subAction === "status") {
      const data = await client.getResetStatus();
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", data }) + "\n");
        return 0;
      }
      ctx.stdout.write("=== ZCode Coding Plan 额度重置卡 ===\n");
      const fiveHour = data?.data?.available_five_hour_resets || [];
      const week = data?.data?.available_week_resets || [];
      ctx.stdout.write(`五小时额度重置卡 (FIVE_HOUR): ${fiveHour.length} 张可用\n`);
      for (const card of fiveHour) {
        const expire = new Date(card.expire_at).toLocaleString();
        ctx.stdout.write(`  - 到期时间: ${expire}\n`);
      }
      ctx.stdout.write(`周额度重置卡 (WEEK): ${week.length} 张可用\n`);
      for (const card of week) {
        const expire = new Date(card.expire_at).toLocaleString();
        ctx.stdout.write(`  - 到期时间: ${expire}\n`);
      }
      if (fiveHour.length === 0 && week.length === 0) {
        ctx.stdout.write("\n提示: 当前暂无有效重置卡。可运行 'zcode reset opportunity' 向服务端检查重置资格。\n");
      }
      return 0;
    }

    if (subAction === "opportunity" || subAction === "check") {
      ctx.stdout.write("正在向智谱服务端请求额度重置资格判定...\n");
      const data = await client.requestResetOpportunity();
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", data }) + "\n");
        return 0;
      }
      ctx.stdout.write("资格判定完成！请运行 'zcode reset status' 查看最新领到的重置卡。\n");
      return 0;
    }

    if (subAction === "use" || subAction === "apply") {
      const typeArg = args[1]?.toLowerCase();
      const resetType = typeArg === "week" ? "WEEK" : "FIVE_HOUR";
      ctx.stdout.write(`正在核销 [${resetType}] 额度重置卡并满血恢复额度...\n`);
      const result = await client.useReset(resetType);
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", resetType, result }) + "\n");
        return 0;
      }
      ctx.stdout.write(`🎉 成功核销 ${resetType} 重置卡！Prompt 额度池已瞬间恢复 100% 满血复活！\n`);
      return 0;
    }

    ctx.stderr.write(
      "用法:\n  zcode reset [status]           查阅可用重置卡与到期时间\n  zcode reset opportunity        向服务端触发重置卡发卡资格判定\n  zcode reset use [five_hour|week] 一键核销使用重置卡\n",
    );
    return 1;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`重置卡操作失败: ${err.message}\n`);
    }
    return 1;
  }
}
