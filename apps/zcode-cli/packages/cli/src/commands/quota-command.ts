import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runQuotaCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();

  try {
    const [limitsData, creditData] = await Promise.allSettled([
      client.getQuotaLimits(),
      client.getCreditUsageDetail(),
    ]);

    const limits = limitsData.status === "fulfilled" ? limitsData.value : null;
    const credits = creditData.status === "fulfilled" ? creditData.value : null;

    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", limits, credits }) + "\n");
      return 0;
    }

    ctx.stdout.write("=== ZCode Coding Plan 用量与积分看板 ===\n\n");

    if (limits?.data) {
      ctx.stdout.write("【Prompt 配额水位】\n");
      const list = Array.isArray(limits.data) ? limits.data : [limits.data];
      for (const item of list) {
        const name = item.limit_name || item.type || "5-Hour Pool";
        const remaining = item.remaining ?? item.left_count ?? "N/A";
        const total = item.total ?? item.total_count ?? "N/A";
        const percent = item.percentage ? `${item.percentage}%` : "100%";
        ctx.stdout.write(`  • ${name}: 剩余 ${remaining} / ${total} (${percent})\n`);
      }
      ctx.stdout.write("\n");
    }

    if (credits?.data) {
      ctx.stdout.write("【积分消耗与余额明细】\n");
      const totalPoints = credits.data.total_credits ?? credits.data.balance ?? "N/A";
      const consumedToday = credits.data.consumed_today ?? credits.data.today ?? "0";
      ctx.stdout.write(`  • 积分总余额: ${totalPoints}\n`);
      ctx.stdout.write(`  • 今日消耗: ${consumedToday}\n`);

      if (credits.data.details && Array.isArray(credits.data.details)) {
        ctx.stdout.write("  • 细项清单:\n");
        for (const detail of credits.data.details.slice(0, 5)) {
          ctx.stdout.write(`    - ${detail.name || detail.item}: -${detail.points || detail.credits} 积分\n`);
        }
      }
    }

    if (!limits?.data && !credits?.data) {
      ctx.stdout.write("未获取到实时看板数据，请确认网络连接或运行 'zcode login' 重新登录。\n");
    }

    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`获取配额看板失败: ${err.message}\n`);
    }
    return 1;
  }
}
