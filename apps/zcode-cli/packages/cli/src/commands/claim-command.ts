import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runClaimCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();
  const subAction = args[0] ?? "all";

  try {
    const preview = await client.getClaimPreview();
    const plans = preview?.data?.plans || preview?.data || [];

    if (subAction === "list") {
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", plans }) + "\n");
        return 0;
      }
      ctx.stdout.write("=== 可申领的智谱官方免费福利/积分活动 ===\n");
      if (!Array.isArray(plans) || plans.length === 0) {
        ctx.stdout.write("当前暂无可申领的免费活动或新手礼包。\n");
        return 0;
      }
      for (const p of plans) {
        ctx.stdout.write(`  • [${p.id || p.plan_id}] ${p.title || p.name}: ${p.description || "免费算力包"}\n`);
      }
      return 0;
    }

    // 默认执行一键全量申领
    ctx.stdout.write("正在检查并申领智谱官方赠送的免费活动积分与计划...\n");
    if (!Array.isArray(plans) || plans.length === 0) {
      ctx.stdout.write("当前暂无可申领的免费活动或新手礼包，您的账户处于最新状态。\n");
      return 0;
    }

    const claimedResults = [];
    for (const p of plans) {
      const planId = p.id || p.plan_id;
      try {
        ctx.stdout.write(`正在申领 [${p.title || p.name || planId}]... `);
        const res = await client.claimPlan(planId);
        ctx.stdout.write("✅ 成功！\n");
        claimedResults.push({ planId, success: true, res });
      } catch (e: any) {
        ctx.stdout.write(`⚠️ 跳过 (${e.message})\n`);
        claimedResults.push({ planId, success: false, error: e.message });
      }
    }

    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", claimedResults }) + "\n");
    } else {
      ctx.stdout.write("\n全部免费福利与活动计划申领处理完毕！\n");
    }
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`申领福利失败: ${err.message}\n`);
    }
    return 1;
  }
}
