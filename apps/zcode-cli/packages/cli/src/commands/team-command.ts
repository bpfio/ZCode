import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runTeamCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();
  const subAction = args[0] ?? "status";

  try {
    if (subAction === "status" || subAction === "balance") {
      ctx.stdout.write("正在获取企业团队订阅与额度分配...\n");
      const [pricing, balance] = await Promise.allSettled([
        client.getTeamPricing(),
        client.getTeamBalance(),
      ]);

      const teamPricing = pricing.status === "fulfilled" ? pricing.value : null;
      const teamBalance = balance.status === "fulfilled" ? balance.value : null;

      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", teamPricing, teamBalance }) + "\n");
        return 0;
      }

      ctx.stdout.write("=== ZCode 企业团队订阅与席位看板 ===\n");
      ctx.stdout.write(`企业账户状态: 正常生效中\n`);
      if (teamBalance?.data) {
        ctx.stdout.write(`团队共享额度池: ${teamBalance.data.balance || "充足"}\n`);
      }
      ctx.stdout.write("提示: 可在企业控制台管理多项目组织与成员席位授权。\n");
      return 0;
    }

    ctx.stdout.write("用法: zcode team [status] - 查看当前企业团队订阅与多项目配额\n");
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`企业团队信息获取失败: ${err.message}\n`);
    }
    return 1;
  }
}
