import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runOffersCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();
  const subAction = args[0] ?? "list";

  try {
    const data = await client.getOffers();
    const touches = data?.data?.touches || data?.data || [];

    if (subAction === "list") {
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", touches }) + "\n");
        return 0;
      }
      ctx.stdout.write("=== 智谱官方营销活动与限时空投福利 ===\n");
      if (!Array.isArray(touches) || touches.length === 0) {
        ctx.stdout.write("当前暂无限时空投活动，您已享受最新特权。\n");
        return 0;
      }
      for (const t of touches) {
        ctx.stdout.write(`  • [${t.id || t.touch_id}] ${t.title || "活动福利"}: ${t.description || t.reward || ""}\n`);
      }
      return 0;
    }

    if (subAction === "claim") {
      const id = args[1];
      if (!id) {
        ctx.stderr.write("请指定要领取的空投 ID: zcode offers claim <touch_id>\n");
        return 1;
      }
      ctx.stdout.write(`正在领取空投福利 [${id}]...\n`);
      const res = await client.claimOffer(id);
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", res }) + "\n");
        return 0;
      }
      ctx.stdout.write("🎉 恭喜！活动奖励/空投已成功存入您的账户！\n");
      return 0;
    }

    ctx.stdout.write("用法:\n  zcode offers [list]           查看当前全部限时活动与空投\n  zcode offers claim <ID>       领取指定空投礼包\n");
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`营销活动查询失败: ${err.message}\n`);
    }
    return 1;
  }
}
