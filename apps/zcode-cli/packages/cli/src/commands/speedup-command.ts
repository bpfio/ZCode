import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runSpeedupCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const client = new CodingPlanClient();
  const subAction = args[0] ?? "draw";

  try {
    if (subAction === "draw" || subAction === "enable") {
      ctx.stdout.write("正在连接智谱专网并抽取/激活极速推理专网卡 (Highspeed Card)...\n");
      const res = await client.drawSpeedupCard();
      if (options.json) {
        ctx.stdout.write(formatJson({ status: "success", res }) + "\n");
        return 0;
      }
      ctx.stdout.write("🚀 极速推理专网加速已就绪！后续大模型请求将自动走专网通道，大幅降低 TTFT 延迟与排队等待。\n");
      return 0;
    }

    ctx.stdout.write("用法: zcode speedup [draw|enable] - 激活智谱大模型极速推理专网通道\n");
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`极速专网激活失败: ${err.message}\n`);
    }
    return 1;
  }
}
